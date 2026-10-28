# VocabLearn

一个自己用的雅思背单词工具。数据全在本地，不联网也能学。

做它的起因很简单：市面上的背单词 App 词库改不了、进度带不走、还得登录。干脆自己写一个——词书想换就换，数据在自己硬盘里，关掉网络照样背。

## 能干什么

- **按词书和主题背**：3674 词的雅思真经，22 个主题随便挑，也能从任意一个词开始
- **复习不靠碰运气**：按遗忘曲线排期，到期的词自动进队列
- **四种练法**：选择题、拼写、听音选义、自评（认识 / 模糊 / 不认识）
- **卡片信息足**：音标、发音、释义、例句、词组搭配、构词拆分、音节划分
- **词典随时查**：按单词、中文或例句搜索
- **自己的词库**：CSV / TSV / JSON 随便导
- **数据归你**：一键导出 JSON 备份，换电脑不丢
- **窗口大小随意**：从 1440 宽到 350 宽的窄条都能用

## 界面

### 首页

今天背了多少、还剩多少、当前这本书的进度，一眼看完。中间那栏「选择学习起点」可以指定从第几个词、哪个主题开始——不想从头背的时候很有用。

![首页](docs/screenshots/desktop-study.png)

### 学习卡片

点「开始学习」进入。卡片正面只有单词和音标，先自己想意思；想不起来按「看答案」。答完展开例句、词组搭配、构词分析和笔记。右下角的按钮跟着状态变，也可以直接用方向键：`←` 不认识、`↓` 模糊、`→` 认识 / 下一词。

词书浏览、词典、复习队列、随身听、听力这几个页面就不一一贴图了，装上自己点两下就明白。

### 窄窗口

拖到 350×450 也不会散架。侧栏自动收成一条图标带，四个选项统一高度，长释义自己换行。

![350×450 窄窗口](docs/screenshots/compact-study-350x450.png)

## 跑起来

最少只要一个静态文件服务器。

### 有 Node.js（推荐）

```bash
sudo apt update
sudo apt install -y nodejs npm     # 需要 Node 18+
```

然后：

```bash
./VocabLearn --start
```

第一次跑会由 `npx` 自动把 `http-server` 拉下来，不用手动装。想提前装好也行：

```bash
sudo npm install -g http-server
```

### 只有 Python

一行就够，啥都不用装：

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

然后打开 `http://127.0.0.1:4173`。

### 想要原生窗口（可选）

`desktop-rs/` 里是 Rust + WebView 的桌面壳，多一个本地窗口和 SQLite 存储。需要先装 Rust：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

Linux 还得补上窗口相关的库：

```bash
sudo apt install -y build-essential pkg-config \
  libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev
```

然后：

```bash
cd desktop-rs && cargo build --release
```

产物在 `desktop-rs/target/release/`。仓库里不放在任何编译好的二进制，`.exe`、`.msi`、`.AppImage` 都在忽略列表里。

## 日常命令

```bash
./VocabLearn --start                       # 起服务，默认 4173 端口
./VocabLearn --stop                        # 停服务
VOCABLEARN_PORT=4180 ./VocabLearn --start  # 端口被占了就换一个
```

日志在 `~/.local/state/vocablearn/server.log`。

**别直接双击 `index.html`。** 词库是按 ES 模块加载的，`file://` 协议下浏览器会拦掉，页面能开但没词。必须走 HTTP。

要是脚本报缺依赖，它会把对应的安装命令直接打出来，照着敲就行。

## 目录

```
index.html      页面骨架
app.js          学习流程、词库加载、记录、备份
styles.css      主题和响应式布局
VocabLearn      启停脚本
ielts/          词库、音标、听力、阅读、写作数据
desktop-rs/     桌面壳（Rust）
docs/           截图
```

## 数据存在哪

浏览器里用 `localStorage` 存进度和设置，IndexedDB 存一份镜像备份——万一把浏览器数据清了，重开还能从 IndexedDB 找回来。桌面版还会写一份到本地 SQLite。

想换电脑或者留个底，首页「导出备份」导成 JSON。

## 导入自己的词书

UTF-8 编码的 CSV、TSV、JSON 都认。最常用的几个字段：

```text
word,meaning,example,translation,phonetic,audio
```

JSON 可以是纯数组，也可以是带 `name` 和 `words` 的对象。除了上面这些，还能带上 `exampleTranslation`（例句译文）、`syllables`（音节划分）、`category`（主题分类）。

## 改代码之后

```bash
node --check app.js
git diff --check
```

## 说明

词库素材来自公开的雅思词汇资料，发音音频仅供个人学习使用，没有随仓库分发——`ielts/public/vocabulary/audio/` 已被忽略，需要的话自己按词表补一份。