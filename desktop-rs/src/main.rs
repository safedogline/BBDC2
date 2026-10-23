#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use tao::dpi::{LogicalSize, PhysicalPosition, PhysicalSize};
use tao::event::{Event, WindowEvent};
use tao::event_loop::{ControlFlow, EventLoop};
use tao::window::WindowBuilder;
use tiny_http::{Header, Response, Server};
use wry::{NewWindowResponse, WebViewBuilder};
use rusqlite::{params, Connection};

#[cfg(windows)]
#[link(name = "user32")]
extern "system" {
    fn SetProcessDpiAwarenessContext(context: isize) -> i32;
    fn SetProcessDPIAware() -> i32;
    fn ShowWindow(hwnd: isize, command: i32) -> i32;
}

#[cfg(windows)]
#[link(name = "dwmapi")]
extern "system" {
    fn DwmSetWindowAttribute(hwnd: isize, attribute: u32, value: *const i32, size: u32) -> i32;
}

const APP_TITLE: &str = "IELTS 词汇";
const MIN_WIDTH: f64 = 880.0;
const MIN_HEIGHT: f64 = 620.0;

#[derive(Serialize, Deserialize, Clone, Copy)]
struct Bounds {
    width: u32,
    height: u32,
    x: i32,
    y: i32,
}

fn log(message: &str) {
    if let Some(path) = config_dir().map(|dir| dir.join("main.log")) {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
            let stamp = SystemTime::now().duration_since(UNIX_EPOCH).map(|value| value.as_secs()).unwrap_or(0);
            let _ = writeln!(file, "[{stamp}] {message}");
        }
    }
}

fn config_dir() -> Option<PathBuf> {
    std::env::var_os("APPDATA").map(|base| PathBuf::from(base).join("IELTS-Vocabulary"))
}

fn bounds_path() -> Option<PathBuf> {
    config_dir().map(|dir| dir.join("window.json"))
}

fn database_path() -> Option<PathBuf> {
    config_dir().map(|dir| dir.join("study.sqlite"))
}

fn open_database(path: &Path) -> rusqlite::Result<Connection> {
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let connection = Connection::open(path)?;
    connection.execute_batch("CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), state_json TEXT NOT NULL, updated_at INTEGER NOT NULL);")?;
    Ok(connection)
}

fn load_database_state(path: &Path) -> Option<String> {
    let connection = open_database(path).ok()?;
    connection.query_row("SELECT state_json FROM app_state WHERE id = 1", [], |row| row.get(0)).ok()
}

fn save_database_state(path: &Path, state: &str) -> rusqlite::Result<()> {
    let connection = open_database(path)?;
    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).map(|value| value.as_secs() as i64).unwrap_or(0);
    connection.execute("INSERT INTO app_state (id, state_json, updated_at) VALUES (1, ?1, ?2) ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at", params![state, timestamp])?;
    Ok(())
}

fn load_bounds() -> Option<Bounds> {
    let text = fs::read_to_string(bounds_path()?).ok()?;
    let bounds: Bounds = serde_json::from_str(&text).ok()?;
    if bounds.width < MIN_WIDTH as u32 || bounds.height < MIN_HEIGHT as u32 {
        return None;
    }
    Some(bounds)
}

fn save_bounds(bounds: Bounds) {
    if let Some(path) = bounds_path() {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if let Ok(text) = serde_json::to_string(&bounds) {
            let _ = fs::write(path, text);
        }
    }
}

fn find_root() -> Option<PathBuf> {
    let exe = std::env::current_exe().ok()?;
    let mut dir = exe.parent()?.to_path_buf();
    for _ in 0..5 {
        if dir.join("index.html").is_file() && dir.join("app.js").is_file() {
            return Some(dir);
        }
        dir = dir.parent()?.to_path_buf();
    }
    let cwd = std::env::current_dir().ok()?;
    if cwd.join("index.html").is_file() && cwd.join("app.js").is_file() {
        return Some(cwd);
    }
    None
}

fn mime_for(path: &Path) -> &'static str {
    match path.extension().and_then(|value| value.to_str()).unwrap_or("").to_ascii_lowercase().as_str() {
        "html" => "text/html; charset=utf-8",
        "js" | "mjs" => "text/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "json" => "application/json; charset=utf-8",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "ico" => "image/x-icon",
        "mp3" => "audio/mpeg",
        "wav" => "audio/wav",
        "mp4" => "video/mp4",
        "pdf" => "application/pdf",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ttf" => "font/ttf",
        "xml" => "application/xml",
        "md" => "text/markdown; charset=utf-8",
        "txt" => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    }
}

fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut output = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'%' && index + 2 < bytes.len() {
            let high = (bytes[index + 1] as char).to_digit(16);
            let low = (bytes[index + 2] as char).to_digit(16);
            if let (Some(high), Some(low)) = (high, low) {
                output.push(((high << 4) | low) as u8);
                index += 3;
                continue;
            }
        }
        output.push(bytes[index]);
        index += 1;
    }
    String::from_utf8_lossy(&output).into_owned()
}

fn header(name: &str, value: &str) -> Header {
    Header::from_bytes(name.as_bytes(), value.as_bytes()).expect("valid header")
}

fn start_server(root: PathBuf, database: Option<PathBuf>) -> std::io::Result<u16> {
    let mut last_error = String::from("no free local port");
    for port in 47800u16..47820 {
        match Server::http(("127.0.0.1", port)) {
            Ok(server) => {
                serve_in_background(server, root, database);
                return Ok(port);
            }
            Err(error) => last_error = error.to_string(),
        }
    }
    Err(std::io::Error::new(std::io::ErrorKind::AddrInUse, last_error))
}

fn serve_in_background(server: Server, root: PathBuf, database: Option<PathBuf>) {
    let canonical_root = root.canonicalize().unwrap_or_else(|_| root.clone());
    thread::spawn(move || {
        for mut request in server.incoming_requests() {
            let raw_path = request.url().split('?').next().unwrap_or("/");
            let decoded = percent_decode(raw_path);
            let relative = if decoded == "/" { "/index.html".to_string() } else { decoded };
            if relative == "/__ielts_health" {
                let response = Response::from_data(b"ielts-vocab-health".to_vec())
                    .with_header(header("Content-Type", "text/plain"));
                let _ = request.respond(response);
                continue;
            }
            if relative == "/__ielts_state" {
                let Some(path) = database.as_ref() else {
                    let _ = request.respond(Response::from_data(b"Not found".to_vec()).with_status_code(404));
                    continue;
                };
                match request.method().as_str() {
                    "GET" => {
                        let response = match load_database_state(path) {
                            Some(state) => Response::from_string(state).with_header(header("Content-Type", "application/json; charset=utf-8")),
                            None => Response::from_data(Vec::new()).with_status_code(204),
                        };
                        let _ = request.respond(response);
                    }
                    "PUT" => {
                        let mut body = String::new();
                        let result = request.as_reader().read_to_string(&mut body).and_then(|_| save_database_state(path, &body).map_err(|error| std::io::Error::new(std::io::ErrorKind::Other, error)));
                        let response = match result {
                            Ok(()) => Response::from_data(b"ok".to_vec()).with_header(header("Content-Type", "text/plain")),
                            Err(error) => {
                                log(&format!("database save error: {error}"));
                                Response::from_data(b"database error".to_vec()).with_status_code(500)
                            }
                        };
                        let _ = request.respond(response);
                    }
                    _ => { let _ = request.respond(Response::from_data(b"Method not allowed".to_vec()).with_status_code(405)); }
                }
                continue;
            }
            let candidate = root.join(relative.trim_start_matches('/'));
            let resolved = candidate.canonicalize();
            let file_path = match resolved {
                Ok(path) if path.starts_with(&canonical_root) && path.is_file() => path,
                _ => {
                    let body = b"Not found".to_vec();
                    let response = Response::from_data(body)
                        .with_status_code(404)
                        .with_header(header("Content-Type", "text/plain; charset=utf-8"));
                    let _ = request.respond(response);
                    continue;
                }
            };
            let content_type = mime_for(&file_path);
            let is_head = request.method().as_str().eq_ignore_ascii_case("HEAD");
            if is_head {
                let size = fs::metadata(&file_path).map(|meta| meta.len()).unwrap_or(0);
                let response = Response::empty(200)
                    .with_header(header("Content-Type", content_type))
                    .with_header(header("Content-Length", &size.to_string()))
                    .with_header(header("Cache-Control", "no-cache"));
                let _ = request.respond(response);
                continue;
            }
            match File::open(&file_path) {
                Ok(file) => {
                    let response = Response::from_file(file)
                        .with_header(header("Content-Type", content_type))
                        .with_header(header("Cache-Control", "no-cache"));
                    let _ = request.respond(response);
                }
                Err(error) => {
                    log(&format!("open error {}: {}", file_path.display(), error));
                    let _ = request.respond(Response::from_data(b"Not found".to_vec()).with_status_code(404));
                }
            }
        }
    });
}

fn app_already_running() -> bool {
    (47800u16..47820).any(probe_instance)
}

fn probe_instance(port: u16) -> bool {
    use std::io::{Read, Write};
    use std::net::{SocketAddr, TcpStream};
    use std::time::Duration;
    let address: SocketAddr = match format!("127.0.0.1:{port}").parse() {
        Ok(address) => address,
        Err(_) => return false,
    };
    if let Ok(mut stream) = TcpStream::connect_timeout(&address, Duration::from_millis(200)) {
        let _ = stream.set_read_timeout(Some(Duration::from_millis(700)));
        let _ = stream.set_write_timeout(Some(Duration::from_millis(700)));
        let request = b"GET /__ielts_health HTTP/1.0\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n";
        if stream.write_all(request).is_ok() {
            let mut received = Vec::new();
            let mut buffer = [0u8; 256];
            loop {
                match stream.read(&mut buffer) {
                    Ok(0) => break,
                    Ok(size) => {
                        received.extend_from_slice(&buffer[..size]);
                        if received.windows(18).any(|window| window == b"ielts-vocab-health") {
                            return true;
                        }
                        if received.len() > 4096 {
                            break;
                        }
                    }
                    Err(_) => break,
                }
            }
        }
    }
    false
}

fn open_external(url: &str) {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        let _ = Command::new("cmd")
            .args(["/C", "start", "", url])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn();
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = url;
    }
}

fn error_page(message: &str) -> String {
    format!(
        "<!doctype html><meta charset=\"utf-8\"><title>{title}</title><body style=\"margin:0;background:#12141c;color:#e9ebf2;font:14px/1.8 'Microsoft YaHei',sans-serif;display:grid;place-items:center;height:100vh\"><div style=\"max-width:560px;padding:32px;border:1px solid #2e3446;border-radius:16px;background:#1e2230\"><h1 style=\"font-size:20px;margin:0 0 12px\">{title}</h1><p style=\"color:#98a0b3;margin:0\">{message}</p></div></body>",
        title = APP_TITLE,
        message = message
    )
}

fn default_window_size(event_loop: &EventLoop<()>) -> PhysicalSize<u32> {
    if let Some(monitor) = event_loop.primary_monitor() {
        let size = monitor.size();
        let width = (size.width as f64 * 0.82) as u32;
        let height = (size.height as f64 * 0.82) as u32;
        return PhysicalSize::new(width.max(MIN_WIDTH as u32), height.max(MIN_HEIGHT as u32));
    }
    PhysicalSize::new(1280, 860)
}

fn sync_webview_bounds(webview: &wry::WebView, width: u32, height: u32, scale: f64) {
    let _ = scale;
    let _ = webview.set_bounds(wry::Rect {
        position: wry::dpi::Position::Physical(wry::dpi::PhysicalPosition::new(0, 0)),
        size: wry::dpi::Size::Physical(wry::dpi::PhysicalSize::new(width.max(1), height.max(1))),
    });
}

fn main() -> wry::Result<()> {
    #[cfg(windows)]
    unsafe {
        const PER_MONITOR_AWARE_V2: isize = -4;
        if SetProcessDpiAwarenessContext(PER_MONITOR_AWARE_V2) == 0 {
            SetProcessDPIAware();
        }
    }
    std::env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", "--force-device-scale-factor=1");
    if app_already_running() {
        return Ok(());
    }
    let event_loop = EventLoop::new();
    let bounds = load_bounds();
    let mut window_builder = WindowBuilder::new()
        .with_title(APP_TITLE)
        .with_resizable(true)
        .with_min_inner_size(LogicalSize::new(MIN_WIDTH, MIN_HEIGHT));
    if let Ok(icon) = tao::window::Icon::from_rgba(include_bytes!("../icon.rgba").to_vec(), 64, 64) {
        window_builder = window_builder.with_window_icon(Some(icon));
    }
    window_builder = match bounds {
        Some(saved) => window_builder
            .with_inner_size(PhysicalSize::new(saved.width.max(MIN_WIDTH as u32), saved.height.max(MIN_HEIGHT as u32)))
            .with_position(PhysicalPosition::new(saved.x, saved.y)),
        None => window_builder.with_inner_size(default_window_size(&event_loop)),
    };
    let window = window_builder.build(&event_loop).expect("failed to create window");

    let webview = if let Some(root) = find_root() {
        match start_server(root.clone(), database_path()) {
            Ok(port) => {
                let origin = format!("http://127.0.0.1:{port}");
                log(&format!("root={} port={port}", root.display()));
                let url = format!("{origin}/index.html");
                let origin_for_nav = origin.clone();
                WebViewBuilder::new()
                    .with_url(&url)
                    .with_background_color((18, 20, 28, 255))
                    .with_navigation_handler(move |target| {
                        if target.starts_with(&origin_for_nav) {
                            true
                        } else {
                            if target.starts_with("http://") || target.starts_with("https://") {
                                open_external(&target);
                            }
                            false
                        }
                    })
                    .with_new_window_req_handler(move |target, _features| {
                        if target.starts_with("http://") || target.starts_with("https://") {
                            open_external(&target);
                        }
                        NewWindowResponse::Deny
                    })
                    .build(&window)?
            }
            Err(error) => {
                log(&format!("server error: {error}"));
                WebViewBuilder::new()
                    .with_html(error_page("本地服务启动失败，请重新打开程序。"))
                    .build(&window)?
            }
        }
    } else {
        log("web root not found");
        WebViewBuilder::new()
            .with_html(error_page(
                "未找到学习资料。请把本程序放在包含 index.html、app.js 和 ielts 文件夹的目录中，不要单独移动 exe。",
            ))
            .build(&window)?
    };

    let initial_size = window.inner_size();
    sync_webview_bounds(&webview, initial_size.width, initial_size.height, window.scale_factor());

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;
        match event {
            Event::WindowEvent { event: WindowEvent::CloseRequested, .. } => {
                let size = window.inner_size();
                let position = window.outer_position().unwrap_or(PhysicalPosition::new(0, 0));
                save_bounds(Bounds { width: size.width, height: size.height, x: position.x, y: position.y });
                *control_flow = ControlFlow::Exit;
            }
            Event::WindowEvent { event: WindowEvent::Resized(size), .. } => {
                sync_webview_bounds(&webview, size.width, size.height, window.scale_factor());
            }
            Event::WindowEvent { event: WindowEvent::ScaleFactorChanged { .. }, .. } => {
                let size = window.inner_size();
                sync_webview_bounds(&webview, size.width, size.height, window.scale_factor());
            }
            _ => {}
        }
    });
}
