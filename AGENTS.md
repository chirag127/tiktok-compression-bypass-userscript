# AGENTS.md - tiktok-compression-bypass-userscript

Single-file userscript. $(System.Collections.Hashtable.n).user.js at repo root IS the product. No build, no deps.

## Method

Reads `__UNIVERSAL_DATA_FOR_REHYDRATION__` / `SIGI_STATE`, collects `bitrateInfo[].PlayAddr.UrlList`, sorts by bitrate and sets `video.src`.

## Rules

- One file. Bump @version, keep @updateURL/@downloadURL on raw main.
- API first, DOM fallback. Dry run, then one confirm, then run.
- 3 concurrent workers with 150-400 ms jitter. Floating panel, Alt hotkey, never fire while typing.

## Install docs

https://github.com/chirag127/userscript-install-guide - link it, never duplicate install steps.

## Test

sctl install ./tiktok-compression-bypass-userscript.user.js, open the target page, run the dry run, then sctl debug console --level error.

<!-- okf-requirement -->
## 📚 Documentation lives in ONE place (mandatory)

All documentation for every repository in this workspace is **single-sourced** in the
umbrella repository:

```
c:\ws\docs\okf├── bundle.md            collection overview
├── index.md             catalogue of every concept and script note
├── concepts/            shared knowledge (architecture, testing, metadata, …)
└── scripts/             one note per userscript repository
```

### Rules

1. **Never create an `okf/` folder in this repository.** It is not duplicated here, by
   design. There was once a copy in every repo: 278 files describing 42 unique documents,
   with `concepts/architecture.md` physically present 32 times. Every edit had to be
   propagated to 30 repositories and drift was unavoidable.
2. **Never hand-edit a copy.** There are no copies. Edit the canonical file under
   `c:\ws\docs\okf\`.
3. **This repository's note is** `c:\ws\docs\okf\scripts\<repo-name>.md`. If it does not
   exist, add it before adding the script.
4. **Link, do not paste.** In `README.md`, link to the canonical note with a relative path
   from the workspace, e.g. `[documentation](../../../../../docs/okf/scripts/<repo-name>.md)`.
5. **Verify** with `node c:\ws\scripts\check-okf.mjs` — it exits `0` only when nothing is
   duplicated and every repository is linked and documented.
6. When adding a new script: create the repo, add `docs/okf/scripts/<repo-name>.md`, add it
   to the tables in `docs/okf/bundle.md` and `docs/okf/index.md`, then run the checker.

Full detail: `c:\ws\docs\okf\concepts\okf-requirement.md`.
