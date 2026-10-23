# BBDC Session Handoff

Date: 2026-10-22
Workspace: `/home/dog/BBDC`

## What We Are Building

This project is an independent desktop/browser implementation of the learning workflow of the Android vocabulary app known as `不背单词` / package `cn.com.langeasy.LangEasyLexis`. The purpose is educational: understand the app's architecture and build a useful local-first vocabulary learner, not bypass payment controls or use it commercially.

The current desktop app uses the existing local IELTS vocabulary project under `ielts/`. It is a static browser application and is not yet a native Windows/Linux package.

## User's Main Goal

Understand the APK deeply enough to reproduce the useful memory workflow, especially:

- New-word learning and review state transitions.
- The three feedback choices: `认识`, `模糊`, `不认识`.
- Test modes such as recognition, answer reveal, and spelling.
- Review scheduling and Leitner-like level changes.
- Rich learning content: examples, mnemonics, word roots, derivatives, and confusion analysis.
- Local persistence and optional account synchronization behavior.

## Current Project Files

- `index.html`: desktop app entry point.
- `app.js`: application state, IELTS loading, learning/review flow, local storage, scheduling.
- `styles.css`: UI styles.
- `BBDC`: command wrapper implementing `BBDC -S` and `BBDC -D`.
- `README.md`: run instructions and known scope.
- `SOURCES.md`: vocabulary source and licensing notes.
- `APK_ANALYSIS.md`: current APK static-analysis report.
- `is_cool_lexis_5_11_7_1791969587289.apk`: APK under analysis, SHA-256:
  `f3fa7491e51659a095362b1e74f88cead5fd8bab2f4538f7c625e03997ec46b8`.
- `ielts/src/pages/vocabulary/vocabulary.js`: 3,674 IELTS entries, 22 topics.
- `ielts/public/vocabulary/audio/`: local pronunciation audio.

## Desktop App Status

Implemented:

- Local-first static browser app.
- Automatic loading of the local IELTS vocabulary when served from the workspace root.
- New-word learning and review sessions.
- Three feedback ratings: known, unsure, unknown.
- Two-stage interaction: answer/recollection first, then reveal content and press continue.
- Simple/rich learning modes.
- Meaning, example, extra notes, variants, topic group order, and audio.
- Explicit unavailable states for splitting mnemonics and confusion analysis when the source vocabulary lacks those fields.
- Local progress, review queue, search/filter, word-book import, backup/restore.
- `BBDC -S` starts the static server in the background on port `4173`.
- `BBDC -D` stops the server using a PID/process group file.

Verified:

- `node --check app.js` passes.
- `BBDC -S` starts and returns HTTP 200 at `http://127.0.0.1:4173`.
- Running `BBDC -S` twice does not create a second server.
- `BBDC -D` stops the service.
- Browser flow tested for new-word feedback, reveal/continue, and due-word review completion.

Known limitations:

- Review intervals are an independent approximation. They are not proven to match the APK.
- The IELTS source has no separate splitting-mnemonic or confusion-analysis fields.
- No native installer has been built; Rust was unavailable in the original environment.
- Browser progress is stored in localStorage.

## APK Static Analysis Findings

APK facts:

- Package: `cn.com.langeasy.LangEasyLexis`.
- Version observed: 5.11.7.
- Three DEX files: `classes.dex`, `classes2.dex`, `classes3.dex`.
- The APK uses the Ijiami/BangBang protection chain. Visible shell classes load encrypted/delayed payloads through native libraries.
- Important native/protected components include `libexec.so`, `libexecmain.so`, `libijmDataEncryption*.so`, and `libsqlcipher.so`.
- Packaged encrypted resource databases include `bbdb.db`, `simple.db`, `wordroot.db`, and `xyjc.db`.
- These resource DB files do not begin with the normal SQLite magic and cannot be read directly as plain SQLite.

Readable entry points:

- JADX source: `/tmp/opencode/jadx-out/sources/cn/com/langeasy/LangEasyLexis/activity/MainActivity.java`.
- JADX source: `/tmp/opencode/jadx-out/sources/cn/com/langeasy/LangEasyLexis/activity/NewLearnActivity.java`.
- Apktool smali: `/tmp/opencode/apktool-smali-full/smali_classes2/`.
- JADX output: `/tmp/opencode/jadx-out/`.
- Apktool raw decode: `/tmp/opencode/apktool-smali-full/`.

The important visible architecture is:

```text
Application shell
  -> protected/delayed business payload
  -> MainActivity
       -> login gate / book selection / sync / dashboard
       -> NewLearnActivity or old LearnActivity
            -> BBCoreEngineInMemory
            -> LeitnerCardInMemoryImp
            -> BBWordProcess
            -> LearnDataHelper
            -> local persistence / upload
```

Confirmed from readable `NewLearnActivity` and strings:

- `nextWord()` gets the next `BBWordProcess` from the in-memory engine.
- Word level and maximum level determine test mode.
- Level 1 commonly uses a choice/recognition test.
- Other levels can use ordinary recognition; a maximum level of 3 can expose another advanced test mode.
- `iReallyKnow()` is used for the known path.
- `iDontKnow()` is used for the unknown/answer path.
- `restoreCurWordToInitState()` supports correction/backtracking behavior.
- Some paths reveal the answer and then require an explicit next/continue action.
- Strings state that a word may require 3 or 4 consecutive correct answers depending on configuration.
- Review strings distinguish instant recall (`认识`) from recall after thinking (`模糊`).
- Product strings confirm learning modes and content panels for examples, roots, derivatives, splitting mnemonics, and confusion analysis.

Important unknowns:

- Exact implementation of `BBCoreEngineInMemory` and `LeitnerCardInMemoryImp`.
- Exact review interval formula and queue ordering.
- Exact state fields in `BBWordProcess` and persistence tables.
- Actual database encryption key/derivation.
- Whether mnemonic/root/derivative/confusion data is local, downloaded, or both.
- Exact API endpoints and sync payloads.

## Why ADB Is Needed

Static analysis is blocked by the protected payload. A real Android device or an Android emulator with hardware acceleration is needed to observe the runtime behavior. ADB is not a security bypass; it requires explicit USB debugging and RSA authorization on the user's phone.

On another PC with Android platform tools installed:

```bash
adb devices -l
adb install -r is_cool_lexis_5_11_7_1791969587289.apk
adb logcat -c
adb shell monkey -p cn.com.langeasy.LangEasyLexis 1
adb logcat > lexis-logcat.txt
```

`run-as` may fail because the release APK is probably not debuggable. Without root, useful dynamic work still includes UI flow, Activity routing, logcat, screenshots, permissions, and observable network requests. Reading `/data/data/...` and copying SQLCipher DB files normally requires a debuggable build, root, or an app-supported export.

The current cloud environment cannot run this reliably because:

- No `adb` executable/device is connected.
- No Android SDK/system image is installed.
- `/dev/kvm` is absent and CPU virtualization flags were not exposed.
- Software-only emulator execution would be slow and unreliable for this APK.

## Recommended Next Steps On A PC With A Phone

1. Install Android Platform Tools.
2. Enable Developer Options and USB debugging on the phone.
3. Connect by USB, unlock the phone, accept the RSA debugging prompt.
4. Confirm `adb devices -l` shows `device`, not `unauthorized`.
5. Install and launch the APK.
6. Capture a clean logcat while performing one controlled flow at a time.
7. Record UI hierarchy and screenshots for new-word learning and review.
8. Compare each action with the visible `NewLearnActivity` code and smali.
9. If possible, obtain the upstream open-source repository; source code is more reliable than protected APK reconstruction.
10. Update `APK_ANALYSIS.md` with evidence, separating confirmed observations from hypotheses.

## Useful Commands

Start/stop desktop app:

```bash
BBDC -S
BBDC -D
```

Check service:

```bash
curl -I http://127.0.0.1:4173
```

APK tools already used in the cloud workspace:

```bash
java -jar /tmp/opencode/apktool.jar d -f -r is_cool_lexis_5_11_7_1791969587289.apk -o /tmp/opencode/apktool-smali-full
/tmp/opencode/jadx/bin/jadx is_cool_lexis_5_11_7_1791969587289.apk -d /tmp/opencode/jadx-out
```

## Handoff Instruction For Another AI

Read this file first, then read `README.md`, `APK_ANALYSIS.md`, `SOURCES.md`, `app.js`, and `NewLearnActivity.java` if the JADX output has been copied. Do not claim the APK's exact algorithm is known until runtime evidence or upstream source confirms it. The immediate highest-value task is dynamic Android analysis with an authorized phone, followed by implementing evidence-backed state transitions in the desktop app.
