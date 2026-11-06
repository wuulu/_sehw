(function () {
  "use strict";

  const STORAGE_KEY = "lucky-draw-v1";
  const MAX_HISTORY = 50;
  const MAX_COUNT = 50;

  const DEMO_NAMES = [
    "林小美",
    "陳阿宏",
    "張怡君",
    "李冠宇",
    "王雅婷",
    "黃柏翰",
    "吳品妤",
    "劉子維",
    "蔡雨潔",
    "許志豪",
    "鄭家豪",
    "周欣怡",
  ];

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (id) => document.getElementById(id);

  const els = {
    namesInput: el("namesInput"),
    poolCount: el("poolCount"),
    availableCount: el("availableCount"),
    wonCount: el("wonCount"),
    drawCountMeta: el("drawCountMeta"),
    demoBtn: el("demoBtn"),
    clearNamesBtn: el("clearNamesBtn"),
    stage: el("stage"),
    stageLabel: el("stageLabel"),
    rolling: el("rolling"),
    rollingName: el("rollingName"),
    winnerGrid: el("winnerGrid"),
    drawCount: el("drawCount"),
    minusBtn: el("minusBtn"),
    plusBtn: el("plusBtn"),
    allowRepeat: el("allowRepeat"),
    drawBtn: el("drawBtn"),
    drawBtnText: el("drawBtnText"),
    notice: el("notice"),
    historyList: el("historyList"),
    undoBtn: el("undoBtn"),
    exportBtn: el("exportBtn"),
    clearHistoryBtn: el("clearHistoryBtn"),
    confetti: el("confetti"),
  };

  let state = loadState();
  let spinning = false;
  let rollTimer = null;
  let noticeTimer = null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function uniqueNames(list) {
    const seen = new Set();
    const result = [];
    list.forEach((raw) => {
      const name = String(raw).trim().replace(/\s+/g, " ");
      if (name && !seen.has(name)) {
        seen.add(name);
        result.push(name);
      }
    });
    return result;
  }

  function parseNames(text) {
    return uniqueNames(text.split(/[\n\r,，、;；|]+/));
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const names = Array.isArray(data.names) ? uniqueNames(data.names) : [];
        const history = Array.isArray(data.history)
          ? data.history
              .filter((item) => item && Array.isArray(item.winners))
              .map((item) => ({
                id: String(item.id || createId()),
                at: Number(item.at) || Date.now(),
                winners: uniqueNames(item.winners),
                poolSize: Number(item.poolSize) || 0,
              }))
              .filter((item) => item.winners.length > 0)
              .slice(0, MAX_HISTORY)
          : [];
        return {
          names,
          history,
          allowRepeat: Boolean(data.allowRepeat),
          drawCount: clamp(Number(data.drawCount) || 1, 1, MAX_COUNT),
        };
      }
    } catch (error) {
      // Ignore unreadable storage and fall back to defaults.
    }

    return {
      names: uniqueNames(DEMO_NAMES),
      history: [],
      allowRepeat: false,
      drawCount: 1,
    };
  }

  function persist() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          names: state.names,
          history: state.history,
          allowRepeat: state.allowRepeat,
          drawCount: state.drawCount,
        }),
      );
    } catch (error) {
      // Storage can be unavailable in private mode; the app still works in memory.
    }
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function randomInt(max) {
    if (max <= 0) return 0;
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      const values = new Uint32Array(1);
      const limit = Math.floor(0xffffffff / max) * max;
      do {
        window.crypto.getRandomValues(values);
      } while (values[0] >= limit);
      return values[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function sample(list, count) {
    const pool = list.slice();
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = randomInt(i + 1);
      const temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }
    return pool.slice(0, count);
  }

  function wonNameSet() {
    const set = new Set();
    state.history.forEach((entry) => {
      entry.winners.forEach((name) => set.add(name));
    });
    return set;
  }

  function availableNames() {
    if (state.allowRepeat) return state.names.slice();
    const won = wonNameSet();
    return state.names.filter((name) => !won.has(name));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "—";
    const pad = (value) => String(value).padStart(2, "0");
    return (
      date.getFullYear() +
      "/" +
      pad(date.getMonth() + 1) +
      "/" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  }

  function setNotice(message, tone) {
    window.clearTimeout(noticeTimer);
    els.notice.textContent = message || "";
    if (tone) {
      els.notice.dataset.tone = tone;
    } else {
      delete els.notice.dataset.tone;
    }
    if (message) {
      noticeTimer = window.setTimeout(() => {
        els.notice.textContent = "";
        delete els.notice.dataset.tone;
      }, 5000);
    }
  }

  function shakeStage() {
    els.stage.classList.remove("shake");
    void els.stage.offsetWidth;
    els.stage.classList.add("shake");
    window.setTimeout(() => els.stage.classList.remove("shake"), 500);
  }

  function setBusy(busy) {
    spinning = busy;
    els.drawBtn.disabled = busy;
    els.drawBtn.classList.toggle("is-busy", busy);
    els.drawBtnText.textContent = busy ? "抽籤中…" : "開始抽籤";
    [els.namesInput, els.drawCount, els.minusBtn, els.plusBtn, els.allowRepeat].forEach(
      (node) => {
        node.disabled = busy;
      },
    );
    els.demoBtn.disabled = busy;
    els.clearNamesBtn.disabled = busy;
    els.undoBtn.disabled = busy || state.history.length === 0;
    els.clearHistoryBtn.disabled = busy || state.history.length === 0;
    els.exportBtn.disabled = busy || state.history.length === 0;
  }

  function updateDrawLimit() {
    const available = availableNames().length;
    const max = Math.max(1, Math.min(MAX_COUNT, available || 1));
    els.drawCount.max = String(max);
    if (Number(els.drawCount.value) > max) {
      els.drawCount.value = String(max);
      state.drawCount = max;
      persist();
    }
    els.minusBtn.disabled = spinning || Number(els.drawCount.value) <= 1;
    els.plusBtn.disabled = spinning || Number(els.drawCount.value) >= max;
    els.drawCountMeta.textContent = String(state.drawCount);
  }

  function renderPool() {
    const available = availableNames().length;
    const won = wonNameSet().size;
    els.poolCount.textContent = state.names.length + " 人";
    els.availableCount.textContent = String(available);
    els.wonCount.textContent = String(won);
    els.drawCountMeta.textContent = String(state.drawCount);
  }

  function renderHistory() {
    if (!state.history.length) {
      els.historyList.innerHTML =
        '<div class="empty-state">還沒有抽籤紀錄。輸入名單後，按下「開始抽籤」試試手氣。</div>';
      els.undoBtn.disabled = true;
      els.exportBtn.disabled = true;
      els.clearHistoryBtn.disabled = true;
      return;
    }

    els.undoBtn.disabled = spinning;
    els.exportBtn.disabled = spinning;
    els.clearHistoryBtn.disabled = spinning;

    els.historyList.innerHTML = state.history
      .map(
        (entry) =>
          '<article class="history-item">' +
          '<div class="history-meta">' +
          '<span class="history-time">' +
          escapeHtml(formatTime(entry.at)) +
          "</span>" +
          '<span class="history-count">抽出 ' +
          entry.winners.length +
          " 人 · 籤筒 " +
          entry.poolSize +
          " 人</span>" +
          "</div>" +
          '<div class="winner-chips">' +
          entry.winners
            .map((name) => '<span class="winner-chip">' + escapeHtml(name) + "</span>")
            .join("") +
          "</div>" +
          "</article>",
      )
      .join("");
  }

  function renderWinners(winners, animate) {
    els.stage.classList.add("reveal");
    els.winnerGrid.classList.toggle("single", winners.length === 1);
    els.winnerGrid.innerHTML = winners
      .map(
        (name, index) =>
          '<div class="winner-card" style="--i:' +
          index +
          '"><span class="rank">' +
          String(index + 1).padStart(2, "0") +
          "</span><strong>" +
          escapeHtml(name) +
          "</strong></div>",
      )
      .join("");

    const cards = Array.from(els.winnerGrid.querySelectorAll(".winner-card"));
    if (animate) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          cards.forEach((card) => card.classList.add("show"));
        });
      });
    } else {
      cards.forEach((card) => card.classList.add("show"));
    }
  }

  function renderIdleStage() {
    if (spinning) return;
    if (state.history.length) {
      els.stageLabel.textContent = "上一次抽籤結果";
      renderWinners(state.history[0].winners, false);
    } else {
      els.stage.classList.remove("reveal");
      els.rolling.classList.remove("is-rolling");
      els.rollingName.textContent = "?";
      els.stageLabel.textContent = "準備好了嗎？";
      els.winnerGrid.innerHTML = "";
    }
  }

  function syncTextarea() {
    els.namesInput.value = state.names.join("\n");
  }

  async function runDraw() {
    if (spinning) return;

    if (!state.names.length) {
      setNotice("籤筒是空的，先輸入一些名字吧。", "error");
      shakeStage();
      return;
    }

    const available = availableNames();
    if (!available.length) {
      setNotice("所有人都中獎過了。清除紀錄，或開啟「允許重複中獎」。", "error");
      shakeStage();
      return;
    }

    let count = clamp(Number(els.drawCount.value) || 1, 1, MAX_COUNT);
    if (count > available.length) {
      count = available.length;
      els.drawCount.value = String(count);
      state.drawCount = count;
      persist();
      setNotice("可抽人數不足，已自動調整為 " + count + " 人。", "error");
    } else {
      setNotice("");
    }

    const winners = sample(available, count);
    const rollPool = available.length ? available : state.names;

    setBusy(true);
    els.stage.classList.remove("reveal");
    els.stage.classList.add("is-rolling");
    els.rolling.classList.add("is-rolling");
    els.winnerGrid.innerHTML = "";
    els.stageLabel.textContent = count > 1 ? "正在抽出 " + count + " 位…" : "正在抽出…";
    els.rollingName.textContent = rollPool[randomInt(rollPool.length)];

    const duration = prefersReducedMotion ? 280 : 1500 + randomInt(500);

    if (rollTimer) window.clearInterval(rollTimer);
    rollTimer = window.setInterval(() => {
      els.rollingName.textContent = rollPool[randomInt(rollPool.length)];
    }, 68);

    await new Promise((resolve) => window.setTimeout(resolve, duration));

    window.clearInterval(rollTimer);
    rollTimer = null;
    els.rolling.classList.remove("is-rolling");
    els.stage.classList.remove("is-rolling");

    const entry = {
      id: createId(),
      at: Date.now(),
      winners,
      poolSize: available.length,
    };

    state.history.unshift(entry);
    state.history = state.history.slice(0, MAX_HISTORY);
    persist();

    els.stageLabel.textContent = count === 1 ? "幸運得主是" : "恭喜這 " + count + " 位";
    renderWinners(winners, true);
    renderPool();
    renderHistory();
    setBusy(false);
    updateDrawLimit();
    confettiBurst();
  }

  function undoLastDraw() {
    if (spinning || !state.history.length) return;
    state.history.shift();
    persist();
    renderPool();
    renderHistory();
    updateDrawLimit();
    renderIdleStage();
    setNotice("已撤回上一次抽籤。", "ok");
  }

  function exportCsv() {
    if (!state.history.length) {
      setNotice("目前沒有紀錄可以匯出。", "error");
      return;
    }

    const rows = [["時間", "中獎者", "抽出人數", "籤筒人數"]];
    state.history
      .slice()
      .reverse()
      .forEach((entry) => {
        rows.push([
          formatTime(entry.at),
          entry.winners.join("、"),
          String(entry.winners.length),
          String(entry.poolSize),
        ]);
      });

    const csv = rows
      .map((row) =>
        row
          .map((cell) => '"' + String(cell).replace(/"/g, '""') + '"')
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lucky-draw-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("已開始下載 CSV。", "ok");
  }

  function applyNames(names, message) {
    state.names = uniqueNames(names);
    syncTextarea();
    persist();
    renderPool();
    updateDrawLimit();
    if (message) setNotice(message, "ok");
  }

  function bindEvents() {
    els.namesInput.addEventListener("input", () => {
      state.names = parseNames(els.namesInput.value);
      persist();
      renderPool();
      updateDrawLimit();
    });

    els.demoBtn.addEventListener("click", () => {
      if (spinning) return;
      applyNames(DEMO_NAMES, "已載入 12 位示範名單。");
    });

    els.clearNamesBtn.addEventListener("click", () => {
      if (spinning || !state.names.length) return;
      if (!window.confirm("確定要清空籤筒名單嗎？（抽籤紀錄不會被刪除）")) return;
      applyNames([], "籤筒已清空。");
      renderIdleStage();
    });

    els.minusBtn.addEventListener("click", () => {
      const next = clamp((Number(els.drawCount.value) || 1) - 1, 1, MAX_COUNT);
      els.drawCount.value = String(next);
      state.drawCount = next;
      persist();
      renderPool();
      updateDrawLimit();
    });

    els.plusBtn.addEventListener("click", () => {
      const max = Number(els.drawCount.max) || 1;
      const next = clamp((Number(els.drawCount.value) || 1) + 1, 1, max);
      els.drawCount.value = String(next);
      state.drawCount = next;
      persist();
      renderPool();
      updateDrawLimit();
    });

    els.drawCount.addEventListener("change", () => {
      const max = Number(els.drawCount.max) || 1;
      const next = clamp(Number(els.drawCount.value) || 1, 1, max);
      els.drawCount.value = String(next);
      state.drawCount = next;
      persist();
      renderPool();
      updateDrawLimit();
    });

    els.allowRepeat.addEventListener("change", () => {
      state.allowRepeat = els.allowRepeat.checked;
      persist();
      renderPool();
      updateDrawLimit();
      setNotice(
        state.allowRepeat ? "已允許重複中獎。" : "已開啟不重複中獎。",
        "ok",
      );
    });

    els.drawBtn.addEventListener("click", runDraw);
    els.undoBtn.addEventListener("click", undoLastDraw);
    els.exportBtn.addEventListener("click", exportCsv);

    els.clearHistoryBtn.addEventListener("click", () => {
      if (spinning || !state.history.length) return;
      if (!window.confirm("確定要清除所有抽籤紀錄嗎？此動作無法復原。")) return;
      state.history = [];
      persist();
      renderPool();
      renderHistory();
      updateDrawLimit();
      renderIdleStage();
      setNotice("抽籤紀錄已清除。", "ok");
    });

    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        runDraw();
      }
    });
  }

  /* ---------- Confetti ---------- */

  const canvas = els.confetti;
  const ctx = canvas ? canvas.getContext("2d") : null;
  let particles = [];
  let confettiFrame = null;
  let pixelRatio = 1;

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * pixelRatio);
    canvas.height = Math.floor(window.innerHeight * pixelRatio);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function confettiBurst() {
    if (!ctx || prefersReducedMotion) return;

    const colors = ["#f5c66b", "#ffe3a1", "#e29a3f", "#8b5cf6", "#2dd4bf", "#f472b6"];
    const width = window.innerWidth;
    const originX = width / 2;
    const originY = window.innerHeight * 0.3;

    for (let i = 0; i < 150; i += 1) {
      particles.push({
        x: originX + (Math.random() - 0.5) * width * 0.35,
        y: originY + (Math.random() - 0.5) * 70,
        vx: (Math.random() - 0.5) * 13,
        vy: Math.random() * -14 - 2,
        size: 5 + Math.random() * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.3,
        life: 1,
        decay: 0.006 + Math.random() * 0.006,
        shape: Math.random() > 0.55 ? "circle" : "rect",
      });
    }

    if (!confettiFrame) confettiFrame = window.requestAnimationFrame(animateConfetti);
  }

  function animateConfetti() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle) => {
      particle.vy += 0.34;
      particle.vx *= 0.994;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.spin;
      particle.life -= particle.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;
      if (particle.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
      }
      ctx.restore();
    });

    particles = particles.filter(
      (particle) => particle.life > 0 && particle.y < window.innerHeight + 80,
    );

    if (particles.length) {
      confettiFrame = window.requestAnimationFrame(animateConfetti);
    } else {
      confettiFrame = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  /* ---------- Init ---------- */

  function init() {
    syncTextarea();
    els.allowRepeat.checked = state.allowRepeat;
    els.drawCount.value = String(state.drawCount);
    renderPool();
    renderHistory();
    updateDrawLimit();
    renderIdleStage();
    bindEvents();

    if (canvas && ctx) {
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
    }
  }

  init();
})();
