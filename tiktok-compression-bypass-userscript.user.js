// ==UserScript==
// @name         TikTok Compression Bypass
// @namespace    https://github.com/chirag127
// @version      1.1.0
// @description  Lists every stream TikTok actually requested for the current video and lets you switch to the highest-bitrate one, capturing new variants as the player fetches them.
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
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  /**
   * TikTok no longer hydrates `__UNIVERSAL_DATA_FOR_REHYDRATION__` on watch pages, so there is no
   * bitrate table to read. What it does do is request `/aweme/v1/play/?...&file_id=...` once per
   * quality. We record those requests (live hook + performance buffer) and let the user switch
   * between the recorded variants.
   */
  const seen = new Map();
  const PLAY = "/aweme/v1/play/";

  function record(url) {
    if (!url || !url.includes(PLAY)) return;
    const abs = new URL(url, location.href).href;
    const id = new URL(abs).searchParams.get("file_id") || abs;
    if (seen.has(id)) return;
    seen.set(id, { url: abs, id, at: Date.now() });
    if (ui) render();
  }

  function seed() {
    for (const e of performance.getEntriesByType("resource")) record(e.name);
    const v = document.querySelector("video");
    if (v && v.currentSrc) record(v.currentSrc);
  }

  // live capture: TikTok fetches each quality through these two paths
  const nativeFetch = window.fetch;
  window.fetch = function (input) {
    try { record(typeof input === "string" ? input : input && input.url); } catch (_) {}
    return nativeFetch.apply(this, arguments);
  };
  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    try { record(url); } catch (_) {}
    return nativeOpen.apply(this, arguments);
  };

  const player = () => document.querySelector("video");

  /**
   * TikTok's player keeps control of its <video>; assigning `src` on it leaves the element in
   * NETWORK_NO_SOURCE. A separate overlay element loads the same URL fine, so we lay one exactly
   * over the original instead of fighting it.
   */
  function overlay() {
    let ov = document.getElementById("ttcb-ov");
    if (ov) return ov;
    ov = document.createElement("video");
    ov.id = "ttcb-ov";
    ov.controls = true;
    ov.playsInline = true;
    Object.assign(ov.style, {
      position: "fixed", zIndex: 2147483646, background: "#000",
      objectFit: "contain", borderRadius: "8px",
    });
    document.body.appendChild(ov);
    const sync = () => {
      const o = player();
      if (!o || !ov.isConnected) return;
      const r = o.getBoundingClientRect();
      Object.assign(ov.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    };
    addEventListener("scroll", sync, true);
    addEventListener("resize", sync);
    ov.dataset.sync = "1";
    return ov;
  }

  function apply(url) {
    const o = player();
    if (!o) return false;
    const ov = overlay();
    const r = o.getBoundingClientRect();
    Object.assign(ov.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    ov.muted = o.muted;
    ov.volume = o.volume;
    ov.src = url;
    ov.currentTime = o.currentTime;
    ov.play().catch(() => {});
    o.style.visibility = "hidden";
    return true;
  }

  function restore() {
    const ov = document.getElementById("ttcb-ov");
    if (ov) ov.remove();
    const o = player();
    if (o) o.style.visibility = "";
  }

  // ---------- panel ----------
  let ui = null;
  const log = [];
  const el = (tag, css, text) => {
    const n = document.createElement(tag);
    if (css) Object.assign(n.style, css);
    if (text != null) n.textContent = text;
    return n;
  };
  function say(m) {
    log.unshift(new Date().toLocaleTimeString() + "  " + m);
    log.length = Math.min(log.length, 100);
    if (ui) render();
  }

  function label(entry) {
    const size = new URL(entry.url).searchParams.get("ratio") || "";
    return (size ? size + " · " : "") + entry.id.slice(-10);
  }

  function render() {
    if (!ui) return;
    const list = [...seen.values()].reverse();
    ui.count.textContent = list.length + " variant(s)";
    ui.body.textContent = "";
    if (!list.length) {
      ui.body.appendChild(el("div", { color: "#9aa", padding: "6px" }, "Nothing captured yet. Press play and change quality in TikTok's own menu, or reload the video."));
    }
    for (const s of list) {
      const row = el("div", { display: "flex", gap: "6px", alignItems: "center", padding: "4px 6px", borderBottom: "1px solid #2a2a2a" });
      row.append(el("span", { flex: "1", color: "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, label(s)));
      const b = el("button", { background: "#065fd4", color: "#fff", border: "0", borderRadius: "4px", padding: "2px 6px", cursor: "pointer" }, "Use");
      b.onclick = () => (apply(s.url) ? say("switched to " + label(s)) : say("no <video> found"));
      row.append(b);
      ui.body.appendChild(row);
    }
    ui.log.textContent = log.slice(0, 25).join("\n");
  }

  function panel() {
    if (ui) { ui.root.remove(); ui = null; return; }
    seed();
    const root = el("div", { position: "fixed", left: "18px", bottom: "18px", width: "360px", maxHeight: "60vh", zIndex: 2147483647, background: "#181818", color: "#fff", font: "12px Roboto, Arial", border: "1px solid #3a3a3a", borderRadius: "10px", boxShadow: "0 8px 28px rgba(0,0,0,.65)", display: "flex", flexDirection: "column", overflow: "hidden" });
    const head = el("div", { padding: "8px", background: "#242424", display: "flex", gap: "6px", alignItems: "center", cursor: "move" });
    const count = el("strong", { flex: "1" }, "variants");
    const btn = (l, fn, bg) => { const b = el("button", { background: bg || "#333", color: "#fff", border: "0", borderRadius: "5px", padding: "3px 7px", cursor: "pointer" }, l); b.onclick = fn; return b; };
    head.append(count, btn("Rescan", () => { seed(); render(); }), btn("Restore", () => { restore(); say("original player restored"); }), btn("×", panel));
    const body = el("div", { overflow: "auto", flex: "1" });
    const logBox = el("pre", { margin: "0", padding: "6px", maxHeight: "110px", overflow: "auto", color: "#8fb", background: "#111", font: "11px ui-monospace, Consolas" }, "");
    root.append(head, body, logBox);
    document.body.appendChild(root);
    ui = { root, count, body, log: logBox };

    let dx = 0, dy = 0, drag = false;
    head.addEventListener("pointerdown", (e) => { if (e.target.tagName === "BUTTON") return; drag = true; dx = e.clientX; dy = e.clientY; head.setPointerCapture(e.pointerId); });
    head.addEventListener("pointermove", (e) => {
      if (!drag) return;
      root.style.left = Math.max(0, root.offsetLeft + e.clientX - dx) + "px";
      root.style.bottom = "auto";
      root.style.top = Math.max(0, root.offsetTop + e.clientY - dy) + "px";
      dx = e.clientX; dy = e.clientY;
    });
    head.addEventListener("pointerup", () => (drag = false));
    render();
    say("panel opened");
  }

  addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "q" && !/input|textarea/i.test(document.activeElement.tagName)) panel();
  }, true);

  // ---------- chip (left side: TikTok's own buttons own the right edge) ----------
  function chip() {
    if (document.getElementById("ttcb-chip")) return;
    const b = el("button", { position: "fixed", left: "18px", bottom: "120px", zIndex: 2147483647, background: "#065fd4", color: "#fff", border: "0", borderRadius: "18px", padding: "6px 12px", cursor: "pointer", font: "12px Roboto, Arial", boxShadow: "0 3px 10px rgba(0,0,0,.5)" }, "HQ");
    b.id = "ttcb-chip";
    b.title = "TikTok compression bypass (Alt+Q)";
    b.onclick = panel;
    document.body.appendChild(b);
  }
  if (document.body) chip(); else addEventListener("DOMContentLoaded", chip);
})();
