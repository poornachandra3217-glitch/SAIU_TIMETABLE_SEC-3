/**
 * ============================================================
 *  SaiUOS TIMETABLE — APP LOGIC
 *  You shouldn't need to edit this file. Edit data.js instead.
 * ============================================================
 */

(function () {
  "use strict";

  const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri"];
  const DAY_LABELS = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday" };
  const JS_DAY_TO_KEY = { 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri" }; // 0=Sun,6=Sat unmapped
  const SECTION_STORAGE_KEY = "saiuos-timetable-section";
  const ACCOUNT_STORAGE_KEY = "saiuos-timetable-account";
  const THEME_STORAGE_KEY = "saiuos-timetable-theme";

  // ---------- state ----------
  let currentView = "day";     // "day" | "week" | "account"
  let selectedDay = todayKey() || "mon";
  let currentSection = loadSavedSection();
  let currentAccount = loadAccount();
  let currentTheme = loadTheme();

  // ---------- section helpers ----------
  function loadSavedSection() {
    try {
      const saved = window.localStorage.getItem(SECTION_STORAGE_KEY);
      if (saved && SECTIONS[saved]) return saved;
    } catch (e) { /* localStorage unavailable — fall back below */ }
    return SECTIONS[DEFAULT_SECTION] ? DEFAULT_SECTION : Object.keys(SECTIONS)[0];
  }

  function saveSection(key) {
    try { window.localStorage.setItem(SECTION_STORAGE_KEY, key); } catch (e) { /* ignore */ }
  }

  function activeSection() {
    return SECTIONS[currentSection];
  }

  function activeTimetable() {
    return activeSection().timetable;
  }

  function activeDayWindow() {
    return activeSection().dayWindow;
  }

  // ---------- student account helpers ----------
  function loadAccount() {
    try {
      const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* localStorage unavailable or bad JSON — fall back below */ }
    return null;
  }

  function saveAccount(data) {
    try { window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  function clearAccount() {
    try { window.localStorage.removeItem(ACCOUNT_STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  function initials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "S";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // ---------- theme helpers ----------
  function loadTheme() {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) { /* localStorage unavailable — fall back below */ }
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
  }

  function saveTheme(theme) {
    try { window.localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (e) { /* ignore */ }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("themeToggle");
    if (btn) btn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
  }

  // ---------- helpers ----------
  function todayKey() {
    return JS_DAY_TO_KEY[new Date().getDay()] || null;
  }

  function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  function nowMinutes() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function formatClock(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatTime12(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  }

  function durationLabel(startMin, endMin) {
    const mins = endMin - startMin;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  }

  function minutesToClock(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  }

  const ICONS = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22z"/><circle cx="12" cy="9.5" r="2.4"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>',
    coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3c0 1-1 1-1 2M12 3c0 1-1 1-1 2"/></svg>',
    hourglass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12M6 22h12"/><path d="M6 2v5.5a4 4 0 0 0 1.5 3.1L12 14l4.5-3.4A4 4 0 0 0 18 7.5V2"/><path d="M6 22v-5.5a4 4 0 0 1 1.5-3.1L12 10l4.5 3.4a4 4 0 0 1 1.5 3.1V22"/></svg>',
  };

  // ---------- build a flat, time-sorted set of "rows" for a given day ----------
  // includes free-period gaps so the whole day is legible at a glance
  function buildDayRows(dayKey) {
    const items = (activeTimetable()[dayKey] || []).slice().sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    const rows = [];
    let cursor = null;

    items.forEach((item) => {
      const startMin = toMinutes(item.start);
      if (cursor !== null && startMin - cursor >= 20) {
        rows.push({ type: "free", start: minutesToClock(cursor), startMin: cursor, end: item.start, endMin: startMin });
      }
      rows.push(item);
      cursor = toMinutes(item.end);
    });

    return rows;
  }

  function classify(item) {
    const start = toMinutes(item.start);
    const end = toMinutes(item.end);
    const now = nowMinutes();
    if (now >= start && now < end) return "current";
    if (now < start) return "future";
    return "past";
  }

  // ---------- DAY VIEW ----------
  function renderDayView() {
    const isToday = selectedDay === todayKey();
    document.getElementById("dayViewTitle").textContent = isToday ? "Today\u2019s Schedule" : `${DAY_LABELS[selectedDay]}\u2019s Schedule`;

    const rows = buildDayRows(selectedDay);
    const classCount = rows.filter((r) => r.type !== "break" && r.type !== "free").length;
    document.getElementById("dayViewCount").textContent = `${classCount} class${classCount === 1 ? "" : "es"}`;

    const list = document.getElementById("scheduleList");
    const emptyState = document.getElementById("dayEmptyState");
    list.innerHTML = "";

    if (rows.length === 0) {
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    // find the id of the "next" upcoming class (only meaningful for today)
    let nextIndex = -1;
    if (isToday) {
      const now = nowMinutes();
      rows.forEach((r, i) => {
        if ((r.type === "lecture" || r.type === "lab") && toMinutes(r.start) > now && nextIndex === -1) {
          nextIndex = i;
        }
      });
    }

    rows.forEach((row, i) => {
      if (row.type === "break") {
        list.appendChild(renderBreakRow(row, isToday));
        return;
      }
      if (row.type === "free") {
        list.appendChild(renderFreeRow(row));
        return;
      }
      list.appendChild(renderClassCard(row, i === nextIndex, isToday));
    });
  }

  function renderBreakRow(row, isToday) {
    const li = document.createElement("li");
    const startMin = toMinutes(row.start);
    const endMin = toMinutes(row.end);
    const now = nowMinutes();
    const isActive = isToday && now >= startMin && now < endMin;

    if (isActive) {
      // Break is happening right now — swap the static duration for a
      // live "time remaining" readout so it's obviously different at a glance.
      li.className = "break-row is-current";
      li.innerHTML = `${ICONS.hourglass}<span>${row.label} \u00b7 in progress</span><span class="break-remaining">${durationLabel(now, endMin)} left</span>`;
    } else {
      li.className = "break-row";
      li.innerHTML = `${ICONS.coffee}<span>${row.label} \u00b7 ${durationLabel(startMin, endMin)}</span><span class="break-line"></span>`;
    }
    return li;
  }

  function renderFreeRow(row) {
    const li = document.createElement("li");
    li.className = "free-row";
    li.textContent = `Free period \u00b7 ${formatTime12(row.start)} \u2013 ${formatTime12(row.end)}`;
    return li;
  }

  function renderClassCard(item, isNext, isToday) {
    const li = document.createElement("li");
    const status = isToday ? classify(item) : "future";
    const startMin = toMinutes(item.start);
    const endMin = toMinutes(item.end);

    li.className = `class-card type-${item.type}` +
      (status === "current" ? " is-current" : "") +
      (status === "past" ? " is-past" : "");

    let badge = "";
    if (status === "current") badge = `<span class="status-badge badge-live">In session</span>`;
    else if (isNext) badge = `<span class="status-badge badge-next">Next</span>`;
    else if (status === "past") badge = `<span class="status-badge badge-done">Done</span>`;
    else badge = `<span class="status-badge badge-upcoming">Upcoming</span>`;

    let statusLine = "";
    if (isToday) {
      const now = nowMinutes();
      if (status === "current") {
        statusLine = `<div class="class-status is-live">${ICONS.hourglass}<span>${durationLabel(now, endMin)} remaining</span></div>`;
      } else if (status === "future" && startMin - now <= 60) {
        statusLine = `<div class="class-status">${ICONS.clock}<span>Starts in ${durationLabel(now, startMin)}</span></div>`;
      }
    }

    li.innerHTML = `
      <div class="card-left">
        <div class="card-top">
          <span class="type-tag type-${item.type}">${item.type}</span>
        </div>
        <p class="subject-name">${item.subject}</p>
        <p class="class-meta">${item.faculty}</p>
        <p class="class-room">${ICONS.pin}${item.room}</p>
        ${statusLine}
      </div>
      <div class="card-right">
        ${badge}
        <span class="time-range">${formatTime12(item.start)} \u2013 ${formatTime12(item.end)}</span>
        <span class="duration-pill">${durationLabel(startMin, endMin)}</span>
      </div>
    `;
    return li;
  }

  // ---------- WEEK VIEW ----------
  const PX_PER_MIN = 1.15;

  function renderWeekView() {
    const grid = document.getElementById("weekGrid");
    grid.innerHTML = "";

    const winStart = toMinutes(activeDayWindow().start);
    const winEnd = toMinutes(activeDayWindow().end);
    const totalMin = winEnd - winStart;
    const gridHeight = totalMin * PX_PER_MIN;
    const today = todayKey();

    // top-left corner cell
    const corner = document.createElement("div");
    corner.className = "time-axis-head";
    grid.appendChild(corner);

    // day column headers
    DAY_KEYS.forEach((key) => {
      const head = document.createElement("div");
      head.className = "week-col-head" + (key === today ? " is-today" : "");
      head.innerHTML = `${DAY_LABELS[key]}${key === today ? '<span class="head-date">Today</span>' : ""}`;
      grid.appendChild(head);
    });

    // time axis column
    const axis = document.createElement("div");
    axis.className = "time-axis";
    axis.style.height = gridHeight + "px";
    for (let t = winStart; t <= winEnd; t += 60) {
      const label = document.createElement("span");
      label.className = "time-label";
      label.style.top = (t - winStart) * PX_PER_MIN + "px";
      label.textContent = minutesToClock(t).replace(":00", "");
      axis.appendChild(label);
    }
    grid.appendChild(axis);

    // day columns
    DAY_KEYS.forEach((key) => {
      const col = document.createElement("div");
      col.className = "day-column" + (key === today ? " is-today" : "");
      col.style.height = gridHeight + "px";

      (activeTimetable()[key] || []).forEach((item) => {
        const s = Math.max(toMinutes(item.start), winStart);
        const e = Math.min(toMinutes(item.end), winEnd);
        if (e <= s) return;

        const block = document.createElement("div");
        const isCurrent = key === today && item.type !== "break" && classify(item) === "current";
        block.className = `week-block type-${item.type}` + (isCurrent ? " is-current" : "");
        block.style.top = (s - winStart) * PX_PER_MIN + "px";
        block.style.height = (e - s) * PX_PER_MIN + "px";
        if ((e - s) * PX_PER_MIN < 34) block.classList.add("is-compact");

        const title = item.type === "break" ? item.label : item.subject;
        const meta = item.type === "break"
          ? `${formatTime12(item.start)}\u2013${formatTime12(item.end)}`
          : `${item.room} \u00b7 ${formatTime12(item.start)}`;

        block.innerHTML = `<div class="wb-title">${title}</div><div class="wb-meta">${meta}</div>`;
        col.appendChild(block);
      });

      // live "now" line, only on today's column, only within the visible window
      if (key === today) {
        const now = nowMinutes();
        if (now >= winStart && now <= winEnd) {
          const line = document.createElement("div");
          line.className = "now-line";
          line.style.top = (now - winStart) * PX_PER_MIN + "px";
          line.dataset.time = formatClock(new Date());
          col.appendChild(line);
        }
      }

      grid.appendChild(col);
    });
  }

  // ---------- live clock ----------
  function tickClock() {
    const now = new Date();
    document.getElementById("liveTime").textContent = formatClock(now);
    document.getElementById("liveDate").textContent = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  }

  // ---------- rerender everything that depends on "now" ----------
  function renderAll() {
    if (currentView === "day") renderDayView();
    else if (currentView === "week") renderWeekView();
    // "account" view is static once populated — nothing time-dependent to refresh
  }

  // ---------- nav wiring ----------
  function setActiveDayChip() {
    document.querySelectorAll(".day-chip").forEach((btn) => {
      const key = btn.dataset.day;
      btn.classList.toggle("is-active", key === selectedDay);
      btn.classList.toggle("is-today", key === todayKey());
    });
  }

  function setActiveViewBtn() {
    document.querySelectorAll(".view-btn").forEach((btn) => {
      const active = btn.dataset.view === currentView;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    document.getElementById("dayView").hidden = currentView !== "day";
    document.getElementById("weekView").hidden = currentView !== "week";
    document.getElementById("accountView").hidden = currentView !== "account";
    document.querySelector(".day-nav").hidden = currentView === "account";
  }

  function applyCohortLabel() {
    const label = (currentAccount && currentAccount.name)
      ? `${currentAccount.name} \u00b7 ${activeSection().label}`
      : activeSection().cohortLabel;
    document.getElementById("cohortLabel").textContent = label;
  }

  function populateSectionSelect() {
    const select = document.getElementById("sectionSelect");
    select.innerHTML = "";
    Object.keys(SECTIONS).forEach((key) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = SECTIONS[key].label;
      select.appendChild(opt);
    });
    select.value = currentSection;

    select.addEventListener("change", () => {
      currentSection = select.value;
      saveSection(currentSection);
      applyCohortLabel();
      updateAccountUI();
      renderAll();
    });
  }

  // ---------- student account view ----------
  function populateAccountSectionSelect() {
    const select = document.getElementById("accountSection");
    select.innerHTML = "";
    Object.keys(SECTIONS).forEach((key) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = SECTIONS[key].label;
      select.appendChild(opt);
    });
  }

  function updateAccountUI() {
    const nameInput = document.getElementById("accountName");
    const rollInput = document.getElementById("accountRoll");
    const sectionSelect = document.getElementById("accountSection");
    const avatar = document.getElementById("accountAvatar");
    const pill = document.getElementById("accountStatusPill");
    const hint = document.getElementById("accountSavedHint");

    if (currentAccount && currentAccount.name) {
      nameInput.value = currentAccount.name;
      rollInput.value = currentAccount.roll || "";
      sectionSelect.value = SECTIONS[currentAccount.section] ? currentAccount.section : currentSection;
      avatar.textContent = initials(currentAccount.name);
      pill.textContent = "Signed in";
      hint.hidden = false;
    } else {
      sectionSelect.value = currentSection;
      avatar.textContent = "S";
      pill.textContent = "Not signed in";
      hint.hidden = true;
    }
  }

  function initAccountForm() {
    populateAccountSectionSelect();
    updateAccountUI();

    document.getElementById("accountForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("accountName").value.trim();
      const roll = document.getElementById("accountRoll").value.trim();
      const section = document.getElementById("accountSection").value;

      if (!name) {
        document.getElementById("accountName").focus();
        return;
      }

      currentAccount = { name, roll, section };
      saveAccount(currentAccount);

      // keep the header's section dropdown / active timetable in sync
      currentSection = section;
      saveSection(currentSection);
      document.getElementById("sectionSelect").value = currentSection;

      applyCohortLabel();
      updateAccountUI();
      renderAll();
    });

    document.getElementById("accountResetBtn").addEventListener("click", () => {
      currentAccount = null;
      clearAccount();
      document.getElementById("accountForm").reset();
      applyCohortLabel();
      updateAccountUI();
    });
  }

  // ---------- theme toggle ----------
  function initThemeToggle() {
    applyTheme(currentTheme);
    document.getElementById("themeToggle").addEventListener("click", () => {
      currentTheme = currentTheme === "light" ? "dark" : "light";
      applyTheme(currentTheme);
      saveTheme(currentTheme);
    });
  }

  // ---------- loading animation ----------
  function hideLoader() {
    const overlay = document.getElementById("loaderOverlay");
    if (!overlay) return;
    overlay.classList.add("is-hidden");
    overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    // safety net in case transitionend never fires (e.g. reduced motion)
    setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 700);
  }

  function init() {
    initThemeToggle();
    populateSectionSelect();
    applyCohortLabel();
    initAccountForm();

    document.querySelectorAll(".day-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedDay = btn.dataset.day;
        setActiveDayChip();
        renderAll();
      });
    });

    document.getElementById("todayBtn").addEventListener("click", () => {
      selectedDay = todayKey() || "mon";
      setActiveDayChip();
      renderAll();
    });

    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentView = btn.dataset.view;
        setActiveViewBtn();
        renderAll();
      });
    });

    setActiveDayChip();
    setActiveViewBtn();
    tickClock();
    renderAll();

    // keep the live clock, "now" line and current/next class states fresh
    setInterval(tickClock, 1000 * 30);
    setInterval(renderAll, 1000 * 60);

    // brief, deliberate loading animation on first paint
    setTimeout(hideLoader, 550);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
