# Conversation Summary

## Chronology

1. Built a local-first browser vocabulary learner in `/home/dog/BBDC`.
2. Connected the existing IELTS vocabulary source: 3,674 words across 22 topics, with local pronunciation audio.
3. Added learning/review cards, local progress, import/export, search, simple/rich modes, group order, examples, variants, and three feedback choices.
4. Changed the interaction to answer first, then reveal details, then press continue.
5. Investigated the APK `is_cool_lexis_5_11_7_1791969587289.apk` using JADX, Apktool, resource strings, DEX inspection, and smali.
6. Found that the APK's visible page code calls protected core classes. The central engine and DAO implementations are not present as ordinary readable classes.
7. Confirmed visible calls and concepts including `BBCoreEngineInMemory`, `LeitnerCardInMemoryImp`, `BBWordProcess`, `iReallyKnow()`, `iDontKnow()`, `nextWord()`, answer reveal, test modes, and review strings.
8. Added the `BBDC` command so `BBDC -S` starts the local web server in the background and `BBDC -D` stops it. The service uses port 4173 and a PID/process group file.
9. Verified `BBDC -S`, duplicate start behavior, HTTP 200, and `BBDC -D`.
10. User clarified that the APK is open-source/free and the goal is educational architecture study and reconstruction, not commercial cloning or payment bypass.
11. Considered an Android emulator. Current cloud host has no `/dev/kvm`, no Android SDK/device, and no exposed virtualization flags, so a real authorized Android phone is the practical next step.

## Important Conclusions

- The current browser scheduler is an independent approximation and must not be described as the original algorithm.
- The APK's encrypted/protected payload prevents complete static recovery from the current APK alone.
- Runtime evidence from an authorized Android phone, or the upstream source repository, is needed to recover exact state transitions, review intervals, database schema, and content loading paths.
- ADB requires explicit USB debugging and RSA authorization on the user's phone. It is not a bypass of Android security boundaries.

## Immediate Next Action

On another PC with an authorized Android phone:

```bash
adb devices -l
adb install -r is_cool_lexis_5_11_7_1791969587289.apk
adb logcat -c
adb shell monkey -p cn.com.langeasy.LangEasyLexis 1
adb logcat > lexis-logcat.txt
```

Then perform one controlled learning/review flow at a time and record the UI, logcat, Activity transitions, and any observable persistence/network behavior. Feed those observations back into `APK_ANALYSIS.md` and `app.js`.
