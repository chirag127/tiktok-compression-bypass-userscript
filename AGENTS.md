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
## OKF documentation requirement (mandatory)

Every repository in this collection MUST ship an Open Knowledge Format bundle in `okf/`.

- Canonical bundle: `repos/own/public/userscripts/okf/` in the `c:\ws` monorepo. Never hand-edit a repo's `okf/` copy.
- After changing the canonical bundle run `node okf/sync-okf.mjs`; verify with `node okf/sync-okf.mjs --check` (must exit 0).
- `README.md` must link to `okf/`.
