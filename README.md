# BBDC2 — IELTS 词汇桌面学习器

以「不背单词」(`cn.com.langeasy.LangEasyLexis`) 的学习流程为参考，独立实现的本地优先 (local-first) 雅思词汇学习应用。纯静态网页 + Rust/WebView2 原生窗口外壳，无需 Node 运行时、无外部服务器。

## 运行

**方式一：浏览器静态服务**

```bash
./BBDC -S      # 后台启动，监听 http://127.0.0.1:4173
./BBDC -D      # 停止
```

**方式二：原生窗口（Windows）**

```powershell
cd desktop-rs
cargo build --release --offline
Copy-Item .\target\release\ielts-vocabulary.exe ..\IELTS词汇.exe -Force
```

把 `IELTS词汇.exe` 放在项目根目录（与 `index.html`、`app.js`、`ielts/` 同级）后双击运行。它会在 `http://127.0.0.1:47800` 起一个本地服务并加载页面，固定 origin 以保证 localStorage 进度不丢。

## 功能

- 新词学习 / 复习会话，三档反馈：`认识` / `模糊` / `不认识`
- 两段式交互：先回忆作答，再揭示内容并继续
- 简体 / 丰富两种学习模式（释义、例句、补充笔记、变体、主题词序、发音）
- 词库导入、搜索筛选、本地进度与复习队列、备份/恢复
- 多来源词库：词汇 3,674 条（22 主题）、阅读 538 词 376 条、听力 179 组、写作 100 句

## 项目结构

```
index.html          # 应用入口
app.js              # 状态管理、词库加载、学习/复习流程、localStorage、排程
styles.css          # UI 样式
BBDC                # 启停脚本 (-S / -D)
desktop-rs/         # Rust + WebView2 原生外壳
ielts/              # IELTS 词库与素材子项目
  src/pages/vocabulary/vocabulary.js   # 3,674 条词汇，22 主题
  reading/ listening/ writing/ grammar/
  phonetics.json    # 由 ipa-dict (MIT) 生成的美/英音标
SOURCES.md          # 词库来源与授权说明（重要，请先阅读）
APK_ANALYSIS.md     # 原 APK 静态分析报告
SESSION_HANDOFF.md  # 会话交接记录
```

## 内容授权说明

本项目**不包含**任何商业出版物的词表或音频再分发授权。`SOURCES.md` 中有完整说明：词汇内容源自用户本地的个人学习资料，音频来自用户自己的 `my-ielts-master` 目录；这些内容仅用于个人学习，未获准对外分发。

因此本仓库**默认不提交** `ielts/public/vocabulary/audio/`（约 472MB / 3718 个 mp3）。如需本地发音，请自备音频文件放到该目录下。

`ielts/phonetics.json` 由 [ipa-dict](https://github.com/open-dict-data/ipa-dict) 生成，MIT License, Copyright (c) 2016 dohliam。

## 免责声明

本项目仅用于学习与研究，目的是理解该应用的记忆流程并构建实用的本地词汇学习工具，不绕过任何付费机制，不用于商业用途。
