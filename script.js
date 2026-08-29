(function () {
  "use strict";

  const types = window.SD_TYPES;
  const cases = window.SD_CASES;
  const QUESTIONS_PER_ROUND = 8;
  const QUESTIONS_PER_TYPE = QUESTIONS_PER_ROUND / types.length;
  const $ = (selector) => document.querySelector(selector);

  const screens = {
    cover: $("#screen-cover"),
    case: $("#screen-case"),
    report: $("#screen-report")
  };

  const elements = {
    clock: $("#clock"),
    soundButton: $("#soundBtn"),
    soundOn: $("#iconSoundOn"),
    soundOff: $("#iconSoundOff"),
    playButton: $("#playBtn"),
    againButton: $("#againBtn"),
    caseTag: $("#caseTag"),
    caseCode: $("#caseCode"),
    evidenceCode: $("#evidenceCode"),
    caseTitle: $("#caseTitle"),
    caseModel: $("#caseModel"),
    graphWrap: $("#graphWrap"),
    stampGrid: $("#stampGrid"),
    verdict: $("#verdict"),
    verdictStamp: $("#verdictStamp"),
    verdictText: $("#verdictText"),
    nextButton: $("#nextBtn"),
    reportRank: $("#reportRank"),
    reportScore: $("#reportScore"),
    reportTime: $("#reportTime"),
    reportList: $("#reportList"),
    live: $("#srLive")
  };

  const state = {
    order: [],
    index: 0,
    score: 0,
    answers: [],
    startedAt: 0,
    elapsed: 0,
    timer: null,
    locked: false,
    muted: readMutePreference()
  };

  let audioContext = null;

  function readMutePreference() {
    try {
      return window.localStorage.getItem("sd-mute") === "1";
    } catch (error) {
      return false;
    }
  }

  function saveMutePreference(value) {
    try {
      window.localStorage.setItem("sd-mute", value ? "1" : "0");
    } catch (error) {
      return undefined;
    }
  }

  function ensureAudio() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return null;
      }
      try {
        audioContext = new AudioContextClass();
      } catch (error) {
        return null;
      }
    }
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => undefined);
    }
    return audioContext;
  }

  function tone(context, options) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + (options.delay || 0);
    const duration = options.duration || 0.15;
    const finishFrequency = options.finishFrequency || options.frequency;

    oscillator.type = options.wave || "sine";
    oscillator.frequency.setValueAtTime(options.frequency, start);
    if (finishFrequency !== options.frequency) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, finishFrequency), start + duration);
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(options.gain || 0.12, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.025);
  }

  function noise(context, options) {
    const duration = options.duration || 0.18;
    const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * duration)), context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const start = context.currentTime + (options.delay || 0);
    source.buffer = buffer;
    filter.type = options.filter || "bandpass";
    filter.Q.value = options.q || 0.8;
    filter.frequency.setValueAtTime(options.from || 700, start);
    filter.frequency.exponentialRampToValueAtTime(options.to || 1800, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(options.gain || 0.1, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(start);
    source.stop(start + duration + 0.025);
  }

  function playSound(name) {
    if (state.muted) {
      return;
    }
    const context = ensureAudio();
    if (!context) {
      return;
    }
    if (name === "tap") {
      tone(context, { frequency: 520, finishFrequency: 300, duration: 0.06, wave: "square", gain: 0.055 });
    }
    if (name === "open") {
      noise(context, { duration: 0.25, from: 500, to: 2400, gain: 0.1 });
      tone(context, { frequency: 180, finishFrequency: 120, duration: 0.12, wave: "triangle", gain: 0.045, delay: 0.02 });
    }
    if (name === "stamp") {
      tone(context, { frequency: 110, finishFrequency: 55, duration: 0.14, gain: 0.24 });
      noise(context, { duration: 0.05, from: 1800, to: 900, gain: 0.08, delay: 0.005, filter: "highpass" });
    }
    if (name === "correct") {
      tone(context, { frequency: 659, duration: 0.1, wave: "triangle", gain: 0.12 });
      tone(context, { frequency: 880, duration: 0.16, wave: "triangle", gain: 0.12, delay: 0.09 });
    }
    if (name === "incorrect") {
      tone(context, { frequency: 200, finishFrequency: 110, duration: 0.26, wave: "sawtooth", gain: 0.1 });
    }
    if (name === "close") {
      tone(context, { frequency: 110, finishFrequency: 60, duration: 0.1, gain: 0.18 });
      tone(context, { frequency: 110, finishFrequency: 60, duration: 0.1, gain: 0.18, delay: 0.12 });
      noise(context, { duration: 0.04, from: 2000, to: 1000, gain: 0.07, delay: 0.004, filter: "highpass" });
      noise(context, { duration: 0.04, from: 2000, to: 1000, gain: 0.07, delay: 0.124, filter: "highpass" });
    }
    if (name === "final") {
      [523, 659, 784, 1047].forEach((frequency, index) => {
        tone(context, { frequency, duration: 0.18, wave: "triangle", gain: 0.1, delay: index * 0.11 });
      });
    }
  }

  function updateSoundButton() {
    elements.soundButton.setAttribute("aria-pressed", String(state.muted));
    elements.soundButton.setAttribute("aria-label", state.muted ? "Activar sonido" : "Silenciar sonido");
    elements.soundOn.hidden = state.muted;
    elements.soundOff.hidden = !state.muted;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function makeOrder() {
    const selected = [];
    types.forEach((type) => {
      const choices = cases.filter((item) => item.type === type.key);
      selected.push(...shuffle(choices).slice(0, QUESTIONS_PER_TYPE));
    });
    return shuffle(selected);
  }

  function showScreen(screenName) {
    Object.keys(screens).forEach((key) => {
      screens[key].hidden = key !== screenName;
    });
    window.scrollTo(0, 0);
    const activeScreen = screens[screenName];
    activeScreen.classList.remove("screen-refresh");
    window.requestAnimationFrame(() => activeScreen.classList.add("screen-refresh"));
  }

  function formatTime(totalSeconds) {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function updateTimer() {
    if (!state.startedAt) {
      elements.clock.textContent = "0:00";
      return;
    }
    state.elapsed = (performance.now() - state.startedAt) / 1000;
    const formatted = formatTime(state.elapsed);
    elements.clock.textContent = formatted;
    elements.clock.setAttribute("aria-label", `Tiempo de investigación: ${formatted}`);
  }

  function startTimer() {
    stopTimer();
    state.startedAt = performance.now();
    state.elapsed = 0;
    updateTimer();
    state.timer = window.setInterval(updateTimer, 500);
  }

  function stopTimer() {
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }
  }

  function typeByKey(key) {
    return types.find((type) => type.key === key) || types[0];
  }

  function buildStampButtons() {
    elements.stampGrid.innerHTML = types.map((type) => `
      <button class="stamp stamp--${type.className}" type="button" data-type="${type.key}" aria-pressed="false">
        <span>${type.label}</span>
      </button>
    `).join("");
  }

  function renderModel(model) {
    elements.caseModel.textContent = [model.objective, "s. a.", ...model.constraints].join("\n");
  }

  function renderCase() {
    const current = state.order[state.index];
    state.locked = false;
    elements.caseTag.textContent = `CASO ${state.index + 1}/${state.order.length}`;
    elements.caseCode.textContent = current.code;
    elements.evidenceCode.textContent = current.source;
    elements.caseTitle.textContent = current.title;
    renderModel(current.model);
    elements.graphWrap.innerHTML = renderGraph(current, false);
    elements.stampGrid.classList.remove("is-locked");
    elements.stampGrid.querySelectorAll("button").forEach((button) => {
      button.disabled = false;
      button.setAttribute("aria-pressed", "false");
      button.classList.remove("is-picked");
    });
    elements.verdict.hidden = true;
    elements.verdictStamp.className = "verdict-stamp";
    elements.verdictStamp.textContent = "";
    elements.verdictText.textContent = "";
    elements.nextButton.textContent = state.index === state.order.length - 1 ? "CERRAR EXPEDIENTE" : "SIGUIENTE CASO";
    elements.live.textContent = `Caso ${state.index + 1} de ${state.order.length}. ${current.title}.`;
    showScreen("case");
  }

  function renderFeedback(lines) {
    elements.verdictText.innerHTML = lines.map((line) => `<span>${escapeHtml(line)}</span>`).join("<br>");
  }

  function answer(typeKey) {
    if (state.locked) {
      return;
    }
    const current = state.order[state.index];
    const picked = typeByKey(typeKey);
    const correct = current.type === typeKey;
    state.locked = true;
    if (correct) {
      state.score += 1;
    }
    state.answers.push({ caseData: current, picked, correct });
    elements.stampGrid.classList.add("is-locked");
    elements.stampGrid.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
      button.setAttribute("aria-pressed", String(button.dataset.type === typeKey));
      if (button.dataset.type === typeKey) {
        button.classList.add("is-picked");
      }
    });
    playSound("stamp");
    window.setTimeout(() => playSound(correct ? "correct" : "incorrect"), 90);
    elements.verdictStamp.textContent = correct ? "CORRECTO" : "INCORRECTO";
    elements.verdictStamp.className = `verdict-stamp verdict-stamp--${correct ? "ok" : "bad"}`;
    renderFeedback(current.feedback[correct ? "correct" : "incorrect"]);
    elements.verdict.hidden = false;
    elements.live.textContent = `${correct ? "Correcto" : "Incorrecto"}. ${current.feedback[correct ? "correct" : "incorrect"].join(" ")}`;
    elements.nextButton.focus();
  }

  function nextCase() {
    if (!state.locked) {
      return;
    }
    if (state.index === state.order.length - 1) {
      finishGame();
      return;
    }
    state.index += 1;
    playSound("open");
    renderCase();
    const firstButton = elements.stampGrid.querySelector("button");
    if (firstButton) {
      firstButton.focus();
    }
  }

  function finishGame() {
    stopTimer();
    updateTimer();
    state.elapsed = Math.max(1, Math.round(state.elapsed));
    renderReport();
    showScreen("report");
    playSound("close");
    window.setTimeout(() => playSound("final"), 260);
  }

  function rankForScore(score) {
    const total = state.order.length || QUESTIONS_PER_ROUND;
    if (score === total) {
      return "DETECTIVE ESTELAR";
    }
    if (score >= Math.ceil(total * 0.75)) {
      return "DETECTIVE EXPERTO";
    }
    if (score >= Math.ceil(total * 0.5)) {
      return "DETECTIVE EN PRÁCTICAS";
    }
    return "ARCHIVO POR REVISAR";
  }

  function renderReport() {
    elements.reportRank.textContent = rankForScore(state.score);
    elements.reportScore.textContent = `${state.score} / ${state.order.length} sellos correctos`;
    elements.reportTime.textContent = `Tiempo: ${formatTime(state.elapsed)} de investigación`;
    elements.reportList.innerHTML = state.answers.map((answer) => {
      const expected = typeByKey(answer.caseData.type);
      const pickedLabel = answer.picked.label;
      return `
        <li class="report-item">
          <div class="report-thumb">${renderGraph(answer.caseData, true)}</div>
          <div>
            <p class="report-item-name">${escapeHtml(answer.caseData.title)}</p>
            <span class="report-item-tag">${escapeHtml(answer.caseData.source)}</span>
            <span class="report-item-verdict report-item-verdict--${answer.correct ? "ok" : "bad"}">${answer.correct ? "CORRECTO" : `TU SELLO: ${escapeHtml(pickedLabel)}`} <small>· era ${escapeHtml(expected.label)}</small></span>
          </div>
        </li>
      `;
    }).join("");
    elements.live.textContent = `Expediente cerrado. ${state.score} de ${state.order.length} respuestas correctas. ${rankForScore(state.score)}.`;
  }

  function startGame() {
    ensureAudio();
    playSound("open");
    state.order = makeOrder();
    state.index = 0;
    state.score = 0;
    state.answers = [];
    state.locked = false;
    startTimer();
    renderCase();
    const firstButton = elements.stampGrid.querySelector("button");
    if (firstButton) {
      firstButton.focus();
    }
  }

  function number(value) {
    return Number(value.toFixed(3));
  }

  function formatNumber(value) {
    if (Math.abs(value - Math.round(value)) < 0.001) {
      return String(Math.round(value));
    }
    return String(number(value)).replace(".", ",");
  }

  function pointString(points, project) {
    return points.map((point) => `${number(project.x(point[0]))},${number(project.y(point[1]))}`).join(" ");
  }

  function starPath(cx, cy, radius) {
    const points = [];
    for (let index = 0; index < 10; index += 1) {
      const angle = -Math.PI / 2 + (index * Math.PI) / 5;
      const distance = index % 2 === 0 ? radius : radius * 0.46;
      points.push(`${number(cx + Math.cos(angle) * distance)},${number(cy + Math.sin(angle) * distance)}`);
    }
    return points.join(" ");
  }

  function renderGraph(caseData, mini) {
    const graph = caseData.graph;
    const view = graph.view;
    const width = 360;
    const left = 39;
    const right = 13;
    const top = 15;
    const bottom = 29;
    const plotWidth = width - left - right;
    const naturalHeight = Math.round(plotWidth * (view.y[1] - view.y[0]) / (view.x[1] - view.x[0]));
    const plotHeight = Math.max(205, Math.min(282, naturalHeight));
    const height = plotHeight + top + bottom;
    const project = {
      x: (value) => left + ((value - view.x[0]) / (view.x[1] - view.x[0])) * plotWidth,
      y: (value) => top + ((view.y[1] - value) / (view.y[1] - view.y[0])) * plotHeight
    };
    const safeId = `graph-${caseData.id.replace(/[^a-z0-9]/gi, "-")}-${mini ? "mini" : "full"}`;
    const inkText = "#314057";
    const paper = "#fdfcf8";
    const labelSize = mini ? 8 : 10;
    const tickSize = mini ? 0 : 9;
    const parts = [];
    const grid = [];
    const gridStep = graph.step >= 2 ? graph.step / 2 : graph.step;
    const gridStartX = Math.ceil(view.x[0] / gridStep - 0.00001);
    const gridEndX = Math.floor(view.x[1] / gridStep + 0.00001);
    const gridStartY = Math.ceil(view.y[0] / gridStep - 0.00001);
    const gridEndY = Math.floor(view.y[1] / gridStep + 0.00001);

    for (let index = gridStartX; index <= gridEndX; index += 1) {
      const value = index * gridStep;
      const major = Math.abs(value / graph.step - Math.round(value / graph.step)) < 0.001;
      grid.push(`<line x1="${number(project.x(value))}" y1="${top}" x2="${number(project.x(value))}" y2="${number(top + plotHeight)}" stroke="${major ? "#ccd9e9" : "#e7eef7"}" stroke-width="${major ? 1.05 : 0.75}"/>`);
    }
    for (let index = gridStartY; index <= gridEndY; index += 1) {
      const value = index * gridStep;
      const major = Math.abs(value / graph.step - Math.round(value / graph.step)) < 0.001;
      grid.push(`<line x1="${left}" y1="${number(project.y(value))}" x2="${number(left + plotWidth)}" y2="${number(project.y(value))}" stroke="${major ? "#ccd9e9" : "#e7eef7"}" stroke-width="${major ? 1.05 : 0.75}"/>`);
    }

    const axis = [];
    if (view.x[0] <= 0 && view.x[1] >= 0) {
      axis.push(`<line x1="${number(project.x(0))}" y1="${number(top + plotHeight)}" x2="${number(project.x(0))}" y2="${top}" stroke="#3f4e67" stroke-width="1.5" marker-end="url(#${safeId}-axis)"/>`);
    }
    if (view.y[0] <= 0 && view.y[1] >= 0) {
      axis.push(`<line x1="${left}" y1="${number(project.y(0))}" x2="${number(left + plotWidth)}" y2="${number(project.y(0))}" stroke="#3f4e67" stroke-width="1.5" marker-end="url(#${safeId}-axis)"/>`);
    }

    const ticks = [];
    if (!mini && view.y[0] <= 0 && view.y[1] >= 0) {
      (graph.xTicks || []).forEach((value) => {
        if (value > view.x[0] && value < view.x[1]) {
          const x = project.x(value);
          const y = project.y(0);
          ticks.push(`<line x1="${number(x)}" y1="${number(y - 3)}" x2="${number(x)}" y2="${number(y + 3)}" stroke="#3f4e67" stroke-width="1"/>`);
          ticks.push(`<text x="${number(x)}" y="${number(y + 14)}" text-anchor="middle" font-size="${tickSize}" fill="${inkText}">${escapeHtml(formatNumber(value))}</text>`);
        }
      });
    }
    if (!mini && view.x[0] <= 0 && view.x[1] >= 0) {
      (graph.yTicks || []).forEach((value) => {
        if (value > view.y[0] && value < view.y[1]) {
          const x = project.x(0);
          const y = project.y(value);
          ticks.push(`<line x1="${number(x - 3)}" y1="${number(y)}" x2="${number(x + 3)}" y2="${number(y)}" stroke="#3f4e67" stroke-width="1"/>`);
          ticks.push(`<text x="${number(x - 7)}" y="${number(y + 3)}" text-anchor="end" font-size="${tickSize}" fill="${inkText}">${escapeHtml(formatNumber(value))}</text>`);
        }
      });
    }

    const regionShapes = [];
    const openEdges = [];
    (graph.regions || []).forEach((region) => {
      regionShapes.push(`<polygon points="${pointString(region.points, project)}" fill="#e2574c" fill-opacity=".28" stroke="#c0392b" stroke-width="1.45"/>`);
      (region.openEdges || []).forEach((edge) => openEdges.push(edge));
    });
    openEdges.forEach((edge) => {
      regionShapes.push(`<line x1="${number(project.x(edge[0][0]))}" y1="${number(project.y(edge[0][1]))}" x2="${number(project.x(edge[1][0]))}" y2="${number(project.y(edge[1][1]))}" stroke="#c0392b" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#${safeId}-red)"/>`);
    });

    const constraintLines = [];
    const constraintLabels = [];
    (graph.lines || []).forEach((line) => {
      constraintLines.push(`<line x1="${number(project.x(line.points[0][0]))}" y1="${number(project.y(line.points[0][1]))}" x2="${number(project.x(line.points[1][0]))}" y2="${number(project.y(line.points[1][1]))}" stroke="#1d5fbf" stroke-width="2.15"/>`);
      if (!mini && line.label) {
        const labelPoint = line.labelAt || line.points[1];
        constraintLabels.push(`<text x="${number(project.x(labelPoint[0]))}" y="${number(project.y(labelPoint[1]))}" font-family="ui-monospace, monospace" font-size="${labelSize}" font-weight="800" fill="#174a8c" paint-order="stroke" stroke="${paper}" stroke-width="3" stroke-linejoin="round">${escapeHtml(line.label)}</text>`);
      }
    });

    const isoLines = [];
    const isoLabels = [];
    (graph.isoLines || []).forEach((line) => {
      isoLines.push(`<line x1="${number(project.x(line.points[0][0]))}" y1="${number(project.y(line.points[0][1]))}" x2="${number(project.x(line.points[1][0]))}" y2="${number(project.y(line.points[1][1]))}" stroke="#d64545" stroke-width="${line.overlap ? 2.35 : 1.8}" stroke-dasharray="7 5" opacity=".92"/>`);
      if (!mini && line.label) {
        const labelPoint = line.labelAt || line.points[1];
        isoLabels.push(`<text x="${number(project.x(labelPoint[0]))}" y="${number(project.y(labelPoint[1]))}" font-family="ui-monospace, monospace" font-size="${labelSize}" font-weight="800" font-style="italic" fill="#b8332a" paint-order="stroke" stroke="${paper}" stroke-width="3" stroke-linejoin="round">${escapeHtml(line.label)}</text>`);
      }
    });

    const rayShapes = [];
    (graph.rays || []).forEach((ray) => {
      const first = ray.points[0];
      const last = ray.points[1];
      const stroke = ray.kind === "feasible" ? "#d64545" : "#b8332a";
      rayShapes.push(`<line x1="${number(project.x(first[0]))}" y1="${number(project.y(first[1]))}" x2="${number(project.x(last[0]))}" y2="${number(project.y(last[1]))}" stroke="${paper}" stroke-width="8" stroke-linecap="round"/>`);
      rayShapes.push(`<line x1="${number(project.x(first[0]))}" y1="${number(project.y(first[1]))}" x2="${number(project.x(last[0]))}" y2="${number(project.y(last[1]))}" stroke="${stroke}" stroke-width="4.2" stroke-linecap="round" marker-end="url(#${safeId}-red)"/>`);
    });

    const segmentShapes = [];
    (graph.segments || []).forEach((segment) => {
      const first = segment.points[0];
      const last = segment.points[1];
      segmentShapes.push(`<line x1="${number(project.x(first[0]))}" y1="${number(project.y(first[1]))}" x2="${number(project.x(last[0]))}" y2="${number(project.y(last[1]))}" stroke="${paper}" stroke-width="8" stroke-linecap="round"/>`);
      segmentShapes.push(`<line x1="${number(project.x(first[0]))}" y1="${number(project.y(first[1]))}" x2="${number(project.x(last[0]))}" y2="${number(project.y(last[1]))}" stroke="#f2b01e" stroke-width="4.8" stroke-linecap="round"/>`);
      segmentShapes.push(`<circle cx="${number(project.x(first[0]))}" cy="${number(project.y(first[1]))}" r="3.7" fill="#f2b01e" stroke="#7a4b12" stroke-width="1.1"/>`);
      segmentShapes.push(`<circle cx="${number(project.x(last[0]))}" cy="${number(project.y(last[1]))}" r="3.7" fill="#f2b01e" stroke="#7a4b12" stroke-width="1.1"/>`);
    });

    const pointShapes = [];
    const pointLabels = [];
    (graph.points || []).forEach((point) => {
      const cx = project.x(point.x);
      const cy = project.y(point.y);
      if (point.kind === "star") {
        pointShapes.push(`<polygon points="${starPath(cx, cy, 9)}" fill="#f2b01e" stroke="#7a4b12" stroke-width="1.2"/>`);
      } else if (point.kind === "dot") {
        pointShapes.push(`<circle cx="${number(cx)}" cy="${number(cy)}" r="3.3" fill="#d64545" stroke="#fff" stroke-width="1.3"/>`);
      } else {
        pointShapes.push(`<circle cx="${number(cx)}" cy="${number(cy)}" r="3.8" fill="#f2b01e" stroke="#7a4b12" stroke-width="1.1"/>`);
      }
      if (!mini && point.label) {
        const dx = point.dx || 0.15;
        const dy = point.dy || -0.3;
        pointLabels.push(`<text x="${number(project.x(point.x + dx))}" y="${number(project.y(point.y + dy))}" font-family="ui-monospace, monospace" font-size="${labelSize}" font-weight="800" fill="#7a4b12" paint-order="stroke" stroke="${paper}" stroke-width="3.5" stroke-linejoin="round">${escapeHtml(point.label)}</text>`);
      }
    });

    if (graph.watermark && !mini) {
      const watermark = graph.watermark;
      pointLabels.push(`<text x="${number(project.x(watermark.x))}" y="${number(project.y(watermark.y))}" text-anchor="middle" font-family="Impact, sans-serif" font-size="${watermark.size || 28}" fill="#b8332a" fill-opacity=".85" paint-order="stroke" stroke="${paper}" stroke-width="3">${escapeHtml(watermark.text)}</text>`);
    }

    const axisLabels = [];
    if (!mini && view.y[0] <= 0 && view.y[1] >= 0) {
      axisLabels.push(`<text x="${number(left + plotWidth - 3)}" y="${number(project.y(0) - 7)}" text-anchor="end" font-family="ui-monospace, monospace" font-size="10" font-weight="800" fill="#314057">x₁</text>`);
    }
    if (!mini && view.x[0] <= 0 && view.x[1] >= 0) {
      axisLabels.push(`<text x="${number(project.x(0) + 6)}" y="${number(top + 10)}" font-family="ui-monospace, monospace" font-size="10" font-weight="800" fill="#314057">x₂</text>`);
    }

    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Mini gráfica del caso ${escapeHtml(caseData.title)}" preserveAspectRatio="xMidYMid meet">`);
    parts.push(`<title>Mini gráfica del caso ${escapeHtml(caseData.title)}</title>`);
    parts.push(`<defs><marker id="${safeId}-axis" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#3f4e67"/></marker><marker id="${safeId}-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#c0392b"/></marker><clipPath id="${safeId}-clip"><rect x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" rx="2"/></clipPath></defs>`);
    parts.push(`<rect x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" fill="${paper}"/>`);
    parts.push(`<g aria-hidden="true">${grid.join("")}</g>`);
    parts.push(`<g clip-path="url(#${safeId}-clip)">${regionShapes.join("")}${constraintLines.join("")}${isoLines.join("")}${rayShapes.join("")}${segmentShapes.join("")}${pointShapes.join("")}</g>`);
    parts.push(`<g aria-hidden="true">${axis.join("")}${ticks.join("")}${constraintLabels.join("")}${isoLabels.join("")}${pointLabels.join("")}${axisLabels.join("")}</g>`);
    parts.push(`<rect x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" fill="none" stroke="#b7c5d8" stroke-width="1.2" rx="2"/>`);
    parts.push("</svg>");
    return parts.join("");
  }

  elements.soundButton.addEventListener("click", () => {
    state.muted = !state.muted;
    saveMutePreference(state.muted);
    updateSoundButton();
    if (!state.muted) {
      ensureAudio();
      playSound("tap");
    }
  });

  elements.playButton.addEventListener("click", startGame);
  elements.againButton.addEventListener("click", startGame);
  elements.nextButton.addEventListener("click", nextCase);
  elements.stampGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-type]");
    if (button) {
      playSound("tap");
      answer(button.dataset.type);
    }
  });

  buildStampButtons();
  updateSoundButton();
  showScreen("cover");
}());
