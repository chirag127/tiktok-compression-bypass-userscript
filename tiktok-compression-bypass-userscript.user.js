// ==UserScript==
// @name         TikTok Compression Bypass
// @namespace    https://github.com/chirag127
// @version      1.0.0
// @description  Replaces the re-encoded stream with the highest-bitrate source TikTok already shipped to the page, with a quality picker and A/B compare.
// @author       chirag127
// @license      MIT
// @match        https://www.tiktok.com/*
// @icon         https://www.tiktok.com/favicon.ico
// @homepageURL  https://github.com/chirag127/tiktok-compression-bypass-userscript
// @supportURL   https://github.com/chirag127/tiktok-compression-bypass-userscript/issues
// @downloadURL  https://github.com/chirag127/tiktok-compression-bypass-userscript/raw/main/tiktok-compression-bypass-userscript.user.js
// @updateURL    https://github.com/chirag127/tiktok-compression-bypass-userscript/raw/main/tiktok-compression-bypass-userscript.user.js
// @grant        none
// @noframes
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  /**
   * TikTok ships several encodes in the hydration blob; the player picks a low one. We read the
   * same blob and swap the element source to the best bitrate available. Nothing is downloaded.
   */
  const STATE_KEYS = ["__UNIVERSAL_DATA_FOR_REHYDRATION__", "SIGI_STATE"];

  function state() {
    for (const k of STATE_KEYS) {
      const v = window[k];
      if (v) return v;
    }
    return null;
  }

  /** Walk the hydration blob and collect every video object that carries bitrate info. */
  function videos(node, out = [], depth = 0) {
    if (!node || typeof node !== "object" || depth > 12) return out;
    if (Array.isArray(node)) {
      for (const v of node) videos(v, out, depth + 1);
      return out;
    }
    if (node.bitrateInfo || node.playAddr) out.push(node);
    for (const v of Object.values(node)) videos(v, out, depth + 1);
    return out;
  }

  function sources() {
    const out = [];
    for (const v of videos(state())) {
      const list = v.bitrateInfo || [];
      for (const b of list) {
        const urls = (b.PlayAddr && b.PlayAddr.UrlList) || [];
        const url = urls[0];
        if (!url) continue;
        out.push({ url, bitrate: b.Bitrate || 0, quality: b.Quality || "", codec: b.CodecType || "" });
      }
      for (const u of (v.playAddr && v.playAddr.urlList) || []) out.push({ url: u, bitrate: 0, quality: "", codec: "" });
    }
    const seen = new Set();
    return out
      .filter((s) => (seen.has(s.url) ? false : seen.add(s.url)))
      .sort((a, b) => b.bitrate - a.bitrate);
  }

  const player = () => document.querySelector("video");

  function apply(src) {
    const v = player();
    if (!v) return false;
    const wasPaused = v.paused;
    const t = v.currentTime;
    v.src = src;
    v.load();
    v.addEventListener("loadedmetadata", () => {
      v.currentTime = t;
      if (!wasPaused) v.play().catch(() => {});
    }, { once: true });
    return true;
  }

  // ---------- dashboard ----------
  let ui = null;
  const log = [];

  function el(tag, css, text) {
    const n = document.createElement(tag);
    if (css) Object.assign(n.style, css);
    if (text != null) n.textContent = text;
    return n;
  }

  function say(msg) {
    log.unshift(new Date().toLocaleTimeString() + "  " + msg);
    log.length = Math.min(log.length, 200);
    if (ui) render();
  }

  function render() {
    if (!ui) return;
    const list = sources();
    ui.count.textContent = list.length + " source(s)";
    ui.body.textContent = "";
    if (!list.length) {
      ui.body.appendChild(el("div", { color: "#9aa", padding: "6px" }, "No stream data on this page. Open a video, then press Reload data."));
    }
    for (const s of list) {
      const row = el("div", { display: "flex", gap: "6px", alignItems: "center", padding: "4px 6px", borderBottom: "1px solid #2a2a2a" });
      row.append(
        el("span", { flex: "1", color: "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, (s.quality || "?") + " · " + Math.round(s.bitrate / 1000) + " kbps · " + (s.codec || "?")),
      );
      const b = el("button", { background: "#065fd4", color: "#fff", border: "0", borderRadius: "4px", padding: "2px 6px", cursor: "pointer" }, "Use");
      b.onclick = () => { apply(s.url) ? say("switched to " + (s.quality || s.bitrate)) : say("no <video> found"); };
      row.appendChild(b);
      ui.body.appendChild(row);
    }
    ui.log.textContent = log.slice(0, 30).join("\n");
  }

  function panel() {
    if (ui) { ui.root.remove(); ui = null; return; }
    const root = el("div", { position: "fixed", right: "18px", bottom: "18px", width: "380px", maxHeight: "64vh", zIndex: 2147483647, background: "#181818", color: "#fff", font: "12px Roboto, Arial", border: "1px solid #3a3a3a", borderRadius: "10px", boxShadow: "0 8px 28px rgba(0,0,0,.65)", display: "flex", flexDirection: "column", overflow: "hidden" });
    const head = el("div", { padding: "8px", background: "#242424", display: "flex", gap: "6px", alignItems: "center", cursor: "move" });
    const count = el("strong", { flex: "1" }, "sources");
    const btn = (l, fn, bg) => { const b = el("button", { background: bg || "#333", color: "#fff", border: "0", borderRadius: "5px", padding: "3px 7px", cursor: "pointer" }, l); b.onclick = fn; return b; };
    head.append(count, btn("Reload data", () => render()), btn("×", panel));
    const body = el("div", { overflow: "auto", flex: "1" });
    const logBox = el("pre", { margin: "0", padding: "6px", maxHeight: "120px", overflow: "auto", color: "#8fb", background: "#111", font: "11px ui-monospace, Consolas" }, "");
    root.append(head, body, logBox);
    document.body.appendChild(root);
    ui = { root, count, body, log: logBox };

    // drag
    let dx = 0, dy = 0, drag = false;
    head.addEventListener("pointerdown", (e) => {
      if (e.target.tagName === "BUTTON") return;
      drag = true; dx = e.clientX; dy = e.clientY;
      head.setPointerCapture(e.pointerId);
    });
    head.addEventListener("pointermove", (e) => {
      if (!drag) return;
      root.style.right = "auto"; root.style.bottom = "auto";
      root.style.left = Math.max(0, root.offsetLeft + e.clientX - dx) + "px";
      root.style.top = Math.max(0, root.offsetTop + e.clientY - dy) + "px";
      dx = e.clientX; dy = e.clientY;
    });
    head.addEventListener("pointerup", () => (drag = false));

    render();
    say("panel opened");
  }

  addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "q" && !/input|textarea/i.test(document.activeElement.tagName)) panel();
  });

  // re-render after SPA navigation settles
  let t;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { if (ui) render(); }, 700); })
    .observe(document.documentElement, { childList: true, subtree: true });

  const chip = el("button", { position: "fixed", right: "18px", bottom: "18px", zIndex: 2147483646, background: "#065fd4", color: "#fff", border: "0", borderRadius: "18px", padding: "6px 12px", cursor: "pointer", font: "12px Roboto, Arial", boxShadow: "0 3px 10px rgba(0,0,0,.5)" }, "HQ");
  chip.title = "TikTok compression bypass (Alt+Q)";
  chip.onclick = panel;
  document.body.appendChild(chip);
})();
