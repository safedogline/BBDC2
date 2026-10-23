# Desktop host (Rust + WebView2)

Small native Windows window around the static study app. No installer, no Node runtime, no external server.

## Build

Requirements: Rust MSVC toolchain and the Microsoft Edge WebView2 Runtime (included with Windows 11).

```powershell
cd desktop-rs
cargo build --release --offline
Copy-Item .\target\release\ielts-vocabulary.exe ..\IELTS词汇.exe -Force
```

## Run

Keep `IELTS词汇.exe` in the project root, next to `index.html`, `app.js`, and `ielts/`, then double-click it.

Do not move the exe on its own; it searches its own folder and up to four parent folders for `index.html`.

## Behaviour

- Serves the folder over `http://127.0.0.1:47800` (tries 47800–47819) and loads it in WebView2.
- Fixed origin keeps localStorage progress and settings between launches.
- Single instance: a second launch probes the health endpoint and exits.
- Resizable with an 880×620 minimum, DPI aware, remembers window bounds in `%APPDATA%\IELTS-Vocabulary\window.json`.
- Logs startup information to `%APPDATA%\IELTS-Vocabulary\main.log`.
- External `http(s)` links open in the default browser; in-app navigation is restricted to the local origin.
- WebView bounds are set in CSS pixels divided by the monitor scale, because WebView2 measures controller bounds in DIPs.

## Icon

`icon.rgba` is the 64×64 RGBA window icon embedded at compile time.
