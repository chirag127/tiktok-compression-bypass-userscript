---
type: Script
title: TikTok Compression Bypass
description: Swaps the re-encoded stream for the highest-bitrate source TikTok already shipped to the page.
repo: https://github.com/chirag127/tiktok-compression-bypass-userscript
install: https://github.com/chirag127/tiktok-compression-bypass-userscript/raw/main/tiktok-compression-bypass-userscript.user.js
version: "1.0.0"
tags: [userscript, tiktok]
timestamp: 2026-11-09T00:00:00Z
---

# TikTok Compression Bypass

Swaps the re-encoded stream for the highest-bitrate source TikTok already shipped to the page.

## Method

Reads `__UNIVERSAL_DATA_FOR_REHYDRATION__` / `SIGI_STATE`, collects `bitrateInfo[].PlayAddr.UrlList`, sorts by bitrate and sets `video.src`.

## Limits

- Only offers encodes the page already received
- Switching restarts the buffer
- Live streams usually expose one source
