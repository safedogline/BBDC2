# IELTS vocabulary book sources

These are candidate content sources and study references, not bundled datasets. Book titles and publisher descriptions identify what to support in the importer; they do not grant permission to copy or redistribute the books.

| Resource | Why it is useful | Data status for this app |
|---|---|---|
| *雅思词汇真经* (Liu Hongbo) | IELTS-focused thematic word groups and a well-known preparation resource | Candidate for user-local import. The `hefengxian/my-ielts` repository README identifies this title, but the repository has no declared license and says non-commercial use only. No redistribution permission verified. |
| *Cambridge Vocabulary for IELTS* | IELTS-oriented vocabulary in exam contexts; published by Cambridge University Press & Assessment | Study recommendation only. Commercial book; no text bundled. |
| *Collins Vocabulary for IELTS* | IELTS-focused vocabulary and practice | Study recommendation only. Commercial book; no text bundled. |
| *English Vocabulary in Use: Upper-Intermediate* | Broad, practical vocabulary coverage suitable for IELTS preparation | Study recommendation only. Commercial book; no text bundled. |
| *Oxford Word Skills: Intermediate* | Topic-based general vocabulary useful for IELTS learners | Study recommendation only. Commercial book; no text bundled. |

## Public-repository lead

Repository: <https://github.com/hefengxian/my-ielts>

The README describes an IELTS vocabulary area for “雅思词汇真经（刘洪波橙色的那本）”, core IELTS vocabulary, logical word groups, and original audio. The GitHub repository API reports `license: null`; there is no `LICENSE` file at the repository root, and the README states “禁止将本项目用于任何商业目的”. This confirms that the repository contains or presents this resource, but it does not establish that the author owns rights to the book/audio or that either may be redistributed. The local copy described below exists only because the user explicitly asked to copy their own project into this workspace for personal study.

## Workspace IELTS subproject

The `ielts/` folder contains:

- `src/pages/vocabulary/vocabulary.js` and `vocabulary.txt` — 22 topical categories, 3,674 entries.
- `public/vocabulary/audio/` — 3,717 pronunciation files (472 MB) copied from the user's `D:\my-ielts-master` project. The single missing entry (`chef.mp3`) was generated locally with Windows TTS.
- `listening/listening179.json` and `listening/179_audios/` — 179 listening test words, synonyms, and audio files.
- `reading/reading538words.js` and `reading/538keyword.md` — 3 groups, 376 reading test words with synonyms.
- `writing/100sentences.js` — 100 writing sentences with translations.
- `grammar/` — grammar PDF and SVG.
- `materials.json` — file list used by the 资料 page.

No separate content license was found in the `ielts/` folder. Its presence in the user's workspace permits local integration for this requested personal workflow; it does not establish permission to redistribute the content outside that context. The app does not upload or sync this content.

## Open data direction

There is not yet a verified, complete, IELTS-specific open dataset with definitions, examples, and audio identified for bundling. Generic frequency lists may be used only after checking their dataset-specific provenance and license; a list of common words alone is not equivalent to a curated IELTS book. Until a dataset passes a license review, use user-imported local files and independently authored demonstration content.

## Pronunciation data

`ielts/phonetics.json` is generated from [ipa-dict](https://github.com/open-dict-data/ipa-dict) (`en_US` and `en_UK` maps). ipa-dict is MIT licensed, Copyright (c) 2016 dohliam. The generated file covers 3,951 keys across the IELTS vocabulary, reading 538 set, listening 179 phrases, and the starter book; 8 entries without dictionary coverage were given manually checked IPA. The map is used only for local IPA display and is not uploaded.