---
type: Index
title: Userscripts collection — index
description: Catalogue of every concept in this Open Knowledge Format bundle.
tags: [index, catalog]
timestamp: 2026-06-15T00:00:00Z
---

# Index

Entry point for the bundle. Start at [bundle.md](bundle.md) for the overview, then follow
the concepts below.

## Concepts — how the collection works

| Concept | Note | One-line summary |
|---------|------|------------------|
| **OKF requirement** | **[concepts/okf-requirement.md](concepts/okf-requirement.md)** | **Every repository MUST ship an OKF bundle** |
| Architecture | [concepts/architecture.md](concepts/architecture.md) | One repo per script, wired as a git submodule |
| Userscript metadata | [concepts/userscript-metadata.md](concepts/userscript-metadata.md) | The `==UserScript==` block and auto-update |
| ScriptCat & sctl | [concepts/scriptcat-and-sctl.md](concepts/scriptcat-and-sctl.md) | Manager choice and CLI automation |
| Testing rules | [concepts/testing.md](concepts/testing.md) | Trusted keypresses, screenshots over measurements |
| YouTube DOM notes | [concepts/youtube-dom.md](concepts/youtube-dom.md) | Fragile selectors and their verified shapes |

## Scripts

| Script | Note | Key facts |
|--------|------|-----------|
| `yt-hotkey-like-userscript` | scripts/yt-hotkey-like-userscript.md | Key `a`, v1.0.4 |
| `yt-hotkey-dislike-userscript` | scripts/yt-hotkey-dislike-userscript.md | Key `d`, v1.0.4 |
| `yt-hotkey-next-userscript` | scripts/yt-hotkey-next-userscript.md | Key `n`, v1.0.4 |
| `yt-hotkey-prev-userscript` | scripts/yt-hotkey-prev-userscript.md | Key `p`, v1.0.4 |
| `yt-multiselect-userscript` | scripts/yt-multiselect-userscript.md | InnerTube API, v2.3.0 |
| `greasyfork-plus-userscript` | scripts/greasyfork-plus-userscript.md | Read-only enhancer, v1.0.0 |
| `tiktok-compression-bypass-userscript` | [scripts/tiktok-compression-bypass-userscript.md](scripts/tiktok-compression-bypass-userscript.md) | Highest-bitrate swap, v1.0.0 |
| `tiktok-seek-controls-userscript` | scripts/tiktok-seek-controls-userscript.md | Keys + speed, v1.0.0 |
| `tiktok-live-chat-userscript` | scripts/tiktok-live-chat-userscript.md | Chat log + export, v1.0.0 |
| `tiktok-india-unlock-userscript` | scripts/tiktok-india-unlock-userscript.md | Mirror handoff, v1.0.0 |
| `li-connection-export-userscript` | scripts/li-connection-export-userscript.md | Voyager export, v1.0.0 |
| `li-withdraw-invites-userscript` | scripts/li-withdraw-invites-userscript.md | Bulk withdraw, v1.0.0 |
| `li-viewed-capture-userscript` | scripts/li-viewed-capture-userscript.md | Viewer capture, v1.0.0 |
| `engagement-automation` | scripts/engagement-automation.md | InnerTube engagement queue, v1.0.0 |
| `account-multiplexing` | scripts/account-multiplexing.md | Cookie/storage identity switching, v1.0.0 |
| `rate-limit-dance` | scripts/rate-limit-dance.md | fetch/XHR pacing layer, v1.0.0 |
| `scriptcat-inventory` | scripts/scriptcat-inventory.md | Read-only install drift report, v1.0.0 |

## Supporting repos

| Repo | Role |
|------|------|
| `youtube-hotkeys-userscripts` | Human-facing hub for the four hotkeys |
| `userscript-install-guide` | The single source of install instructions |
