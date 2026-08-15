/**
 * ============================================================
 *  SaiUOS TIMETABLE — APP LOGIC (Section 3 build)
 *  You shouldn't need to edit this file. Edit data.js instead.
 * ============================================================
 */

(function () {
  "use strict";

  const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri"];
  const DAY_LABELS = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday" };
  const JS_DAY_TO_KEY = { 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri" }; // 0=Sun,6=Sat unmapped

  const ACCOUNT_STORAGE_KEY = "saiuos-timetable-account";
  const THEME_STORAGE_KEY = "saiuos-timetable-theme";
  const ATTENDANCE_STORAGE_PREFIX = "saiuos-timetable-attendance::";

  // how long after a class ends a student can still mark themselves present
  const ATTENDANCE_WINDOW_MIN = 180; // 3 hours

  // ---------- validation ----------
  const ROLL_PATTERN = /^CDS\/2025\/\d{4}$/;
  const EMAIL_LOCAL_PATTERN = /^[a-z]+(\.[a-z]+)*-\d{1,4}$/i;
  const EMAIL_DOMAIN = "scds.saiuniversity.edu.in";

  // ---------- state ----------
  let currentNav = "home";        // "home" | "timetable" | "announcements" | "resources" | "profile"
  let currentView = "day";        // "day" | "week"  (inside timetable)
  let selectedDay = todayKey() || "mon";
  let currentAccount = loadAccount();
  let currentTheme = loadTheme();
  let attendanceRecords = loadAttendance();

  // ---------- timetable helpers ----------
  function activeTimetable() { return TIMETABLE.timetable; }
  function activeDayWindow() { return TIMETABLE.dayWindow; }

  function allSubjects() {
    const set = new Set();
    DAY_KEYS.forEach((k) => {
      (activeTimetable()[k] || []).forEach((item) => {
        if (item.type !== "break") set.add(item.subject);
      });
    });
    return Array.from(set);
  }

  // ---------- student account helpers ----------
  function loadAccount() {
    try {
      const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* localStorage unavailable or bad JSON */ }
    return null;
  }
  function saveAccountToStorage(data) {
    try { window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }
  function clearAccountFromStorage() {
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
    } catch (e) { /* ignore */ }
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
  }
  function saveTheme(theme) {
    try { window.localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (e) { /* ignore */ }
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const label = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
    document.querySelectorAll(".theme-toggle").forEach((btn) => btn.setAttribute("aria-label", label));
    const dl = document.getElementById("themeToggleLabel");
    if (dl) dl.textContent = theme === "light" ? "Light mode" : "Dark mode";
  }

  // ---------- attendance helpers (namespaced per signed-in student) ----------
  function attendanceStorageKey() {
    const roll = (currentAccount && currentAccount.roll) ? currentAccount.roll : "guest";
    return ATTENDANCE_STORAGE_PREFIX + roll;
  }
  function loadAttendance() {
    try {
      const raw = window.localStorage.getItem(attendanceStorageKey());
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return {};
  }
  function saveAttendance() {
    try { window.localStorage.setItem(attendanceStorageKey(), JSON.stringify(attendanceRecords)); } catch (e) { /* ignore */ }
  }
  function dateISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function attendanceKey(dISO, dayKey, item) {
    return `${dISO}|${dayKey}|${item.start}|${item.subject}`;
  }
  function subjectFromKey(key) {
    const parts = key.split("|");
    return parts.slice(3).join("|");
  }
  function getAttendance(key) { return attendanceRecords[key] || null; }
  function setAttendance(key, status) { attendanceRecords[key] = status; saveAttendance(); }

  function resolveExpiredAttendance() {
    const tKey = todayKey();
    if (!tKey) return; // weekend
    const now = nowMinutes();
    const dISO = dateISO(new Date());
    let changed = false;

    (activeTimetable()[tKey] || []).forEach((item) => {
      if (item.type === "break") return;
      const endMin = toMinutes(item.end);
      if (now < endMin + ATTENDANCE_WINDOW_MIN) return;
      const key = attendanceKey(dISO, tKey, item);
      if (!getAttendance(key)) { attendanceRecords[key] = "absent"; changed = true; }
    });

    if (changed) saveAttendance();
  }

  function computeAttendanceStats() {
    const values = Object.values(attendanceRecords);
    const total = values.length;
    const present = values.filter((v) => v === "present").length;
    const percent = total === 0 ? null : Math.round((present / total) * 100);
    return { total, present, percent };
  }

  function computeSubjectStats() {
    const bySubject = {};
    allSubjects().forEach((s) => { bySubject[s] = { present: 0, total: 0 }; });
    Object.keys(attendanceRecords).forEach((key) => {
      const subject = subjectFromKey(key);
      if (!bySubject[subject]) bySubject[subject] = { present: 0, total: 0 };
      bySubject[subject].total += 1;
      if (attendanceRecords[key] === "present") bySubject[subject].present += 1;
    });
    return bySubject;
  }

  // ---------- generic helpers ----------
  function todayKey() { return JS_DAY_TO_KEY[new Date().getDay()] || null; }
  function toMinutes(hhmm) { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
  function nowMinutes() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function formatClock(date) { return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
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
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  };

  // ---------- build a flat, time-sorted set of "rows" for a given day ----------
  function buildDayRows(dayKey) {
    const items = (activeTimetable()[dayKey] || []).slice().sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    const rows = [];
    let cursor = null;
    items.forEach((item) => {
      const startMin = toMinutes(item.start);
      if (cursor !== null && startMin - cursor >= 20) {
        rows.push({ type: "free", start: minutesToHHMM(cursor), startMin: cursor, end: item.start, endMin: startMin });
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
    const titleEl = document.getElementById("dayViewTitle");
    if (titleEl) titleEl.textContent = isToday ? "Today\u2019s Schedule" : `${DAY_LABELS[selectedDay]}\u2019s Schedule`;

    const rows = buildDayRows(selectedDay);
    const classCount = rows.filter((r) => r.type !== "break" && r.type !== "free").length;
    const countEl = document.getElementById("dayViewCount");
    if (countEl) countEl.textContent = `${classCount} class${classCount === 1 ? "" : "es"}`;

    const list = document.getElementById("scheduleList");
    const emptyState = document.getElementById("dayEmptyState");
    if (!list) return;
    list.innerHTML = "";

    if (rows.length === 0) { if (emptyState) emptyState.hidden = false; return; }
    if (emptyState) emptyState.hidden = true;

    let nextIndex = -1;
    if (isToday) {
      const now = nowMinutes();
      rows.forEach((r, i) => {
        if ((r.type === "lecture" || r.type === "lab") && toMinutes(r.start) > now && nextIndex === -1) nextIndex = i;
      });
    }

    rows.forEach((row, i) => {
      if (row.type === "break") { list.appendChild(renderBreakRow(row, isToday)); return; }
      if (row.type === "free") { list.appendChild(renderFreeRow(row)); return; }
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

    let attendanceLine = "";
    if (isToday && status === "past") {
      const key = attendanceKey(dateISO(new Date()), selectedDay, item);
      const record = getAttendance(key);
      const windowOpen = nowMinutes() < endMin + ATTENDANCE_WINDOW_MIN;

      if (record === "present") {
        attendanceLine = `<div class="attendance-tag tag-present">${ICONS.check}<span>Attendance marked</span></div>`;
      } else if (record === "absent") {
        attendanceLine = `<div class="attendance-tag tag-absent"><span>Not marked \u00b7 window closed</span></div>`;
      } else if (windowOpen) {
        li.classList.add("is-attendance-pending");
        li.dataset.attendanceKey = key;
        li.tabIndex = 0;
        li.setAttribute("role", "button");
        li.setAttribute("aria-label", `Mark yourself present for ${item.subject}`);
        const mins = Math.max(0, endMin + ATTENDANCE_WINDOW_MIN - nowMinutes());
        attendanceLine = `<div class="attendance-tag tag-pending"><span>Tap to mark present \u00b7 closes in ${durationLabel(0, mins)}</span></div>`;
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
        ${attendanceLine}
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
    if (!grid) return;
    grid.innerHTML = "";

    const winStart = toMinutes(activeDayWindow().start);
    const winEnd = toMinutes(activeDayWindow().end);
    const totalMin = winEnd - winStart;
    const gridHeight = totalMin * PX_PER_MIN;
    const today = todayKey();

    const corner = document.createElement("div");
    corner.className = "time-axis-head";
    grid.appendChild(corner);

    DAY_KEYS.forEach((key) => {
      const head = document.createElement("div");
      head.className = "week-col-head" + (key === today ? " is-today" : "");
      head.innerHTML = `${DAY_LABELS[key]}${key === today ? '<span class="head-date">Today</span>' : ""}`;
      grid.appendChild(head);
    });

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

  // ---------- next class (shared by Home + Timetable rightbar) ----------
  function findNextClass() {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    for (let offset = 0; offset < 8; offset++) {
      const d = new Date(now);
      d.setDate(now.getDate() + offset);
      const dayKey = JS_DAY_TO_KEY[d.getDay()];
      if (!dayKey) continue;

      const items = (activeTimetable()[dayKey] || [])
        .filter((it) => it.type !== "break")
        .slice()
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

      for (const item of items) {
        if (offset === 0 && toMinutes(item.start) <= nowMin) continue;
        return { item, dayKey, offset, date: d };
      }
    }
    return null;
  }

  function nextClassHTML() {
    const next = findNextClass();
    if (!next) return `<p class="sidebar-empty">No upcoming classes found.</p>`;

    const { item, dayKey, offset } = next;
    let whenLabel;
    if (offset === 0) whenLabel = "Today";
    else if (offset === 1) whenLabel = "Tomorrow";
    else whenLabel = DAY_LABELS[dayKey] || "";

    let countdown = "";
    if (offset === 0) {
      const mins = Math.max(0, toMinutes(item.start) - nowMinutes());
      countdown = `<span class="next-class-countdown">Starts in ${durationLabel(0, mins)}</span>`;
    }

    return `
      <div class="next-class-top">
        <span class="type-tag type-${item.type}">${item.type}</span>
        <span class="next-class-when">${whenLabel} \u00b7 ${formatTime12(item.start)}</span>
      </div>
      <p class="next-class-subject">${item.subject}</p>
      <p class="next-class-meta">${item.faculty}</p>
      <p class="next-class-room">${ICONS.pin}${item.room}</p>
      ${countdown}
    `;
  }

  function renderNextClassCard() {
    const html = nextClassHTML();
    ["nextClassBody", "nextClassBody2"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    });
  }

  // ---------- announcements ----------
  function sortedAnnouncements() {
    return (typeof ANNOUNCEMENTS !== "undefined" ? ANNOUNCEMENTS : []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  function announcementItemHTML(a) {
    const dateLabel = new Date(a.date + "T00:00:00").toLocaleDateString([], { month: "short", day: "numeric" });
    return `
      <li class="announce-item">
        ${ICONS.bell}
        <div>
          <p class="announce-title">${a.title}</p>
          <p class="announce-body">${a.body}</p>
          <p class="announce-date">${dateLabel}</p>
        </div>
      </li>
    `;
  }

  function renderAnnouncementsInto(id, limit) {
    const list = document.getElementById(id);
    if (!list) return;
    let sorted = sortedAnnouncements();
    if (limit) sorted = sorted.slice(0, limit);

    if (sorted.length === 0) {
      list.innerHTML = `<li class="sidebar-empty">No announcements yet.</li>`;
      return;
    }
    list.innerHTML = sorted.map(announcementItemHTML).join("");
  }

  function renderAllAnnouncementLists() {
    renderAnnouncementsInto("homeAnnounceList", 3);
    renderAnnouncementsInto("announceListSide", 4);
    renderAnnouncementsInto("announceListFull", null);
    const countEl = document.getElementById("announcementsCount");
    if (countEl) {
      const n = sortedAnnouncements().length;
      countEl.textContent = `${n} update${n === 1 ? "" : "s"}`;
    }
  }

  // ---------- attendance sidebar card (Timetable rightbar) ----------
  function renderAttendanceCard() {
    resolveExpiredAttendance();
    const stats = computeAttendanceStats();

    const percentEl = document.getElementById("attendancePercent");
    const fillEl = document.getElementById("attendanceFill");
    const hintEl = document.getElementById("attendanceHint");
    if (percentEl && fillEl) {
      if (stats.percent === null) {
        percentEl.textContent = "--%";
        fillEl.style.width = "0%";
        fillEl.classList.remove("is-low", "is-mid");
        if (hintEl) hintEl.textContent = "Tap a finished class to mark yourself present.";
      } else {
        percentEl.textContent = `${stats.percent}%`;
        fillEl.style.width = `${stats.percent}%`;
        fillEl.classList.toggle("is-low", stats.percent < 75);
        fillEl.classList.toggle("is-mid", stats.percent >= 75 && stats.percent < 90);
        if (hintEl) hintEl.textContent = `${stats.present} of ${stats.total} classes marked present`;
      }
    }
    return stats;
  }

  // ---------- HOME VIEW ----------
  function greetingForNow() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  function renderHome() {
    const greetEl = document.getElementById("homeGreeting");
    const nameEl = document.getElementById("homeName");
    const subEl = document.getElementById("homeSubline");
    if (greetEl) greetEl.textContent = greetingForNow();
    if (nameEl) nameEl.textContent = (currentAccount && currentAccount.name) ? currentAccount.name.split(" ")[0] : TIMETABLE.label;
    if (subEl) {
      const tKey = todayKey();
      const count = tKey ? (activeTimetable()[tKey] || []).filter((i) => i.type !== "break").length : 0;
      subEl.textContent = tKey ? `You have ${count} class${count === 1 ? "" : "es"} today.` : "No classes today — enjoy your weekend.";
    }

    const stats = computeAttendanceStats();
    const ringFill = document.getElementById("homeRingFill");
    const ringPercent = document.getElementById("homeRingPercent");
    if (ringFill && ringPercent) {
      const CIRC = 226;
      if (stats.percent === null) {
        ringFill.style.strokeDashoffset = CIRC;
        ringPercent.textContent = "--%";
      } else {
        ringFill.style.strokeDashoffset = String(CIRC - (CIRC * stats.percent) / 100);
        ringPercent.textContent = `${stats.percent}%`;
      }
    }

    const miniList = document.getElementById("homeMiniSchedule");
    if (miniList) {
      const tKey = todayKey();
      const items = tKey ? (activeTimetable()[tKey] || []).filter((i) => i.type !== "break") : [];
      if (items.length === 0) {
        miniList.innerHTML = `<li class="sidebar-empty">No classes scheduled today.</li>`;
      } else {
        miniList.innerHTML = items.map((item) => `
          <li>
            <span class="mini-time">${formatTime12(item.start)}</span>
            <span class="mini-subject">${item.subject}</span>
            <span class="mini-tag">${item.type}</span>
          </li>
        `).join("");
      }
    }
  }

  // ---------- rerender everything that depends on "now" ----------
  function renderAll() {
    if (currentNav === "home") renderHome();
    if (currentNav === "timetable") {
      if (currentView === "day") renderDayView();
      else renderWeekView();
      renderAttendanceCard();
    }
    renderNextClassCard();
    renderAllAnnouncementLists();
    if (currentNav === "profile") renderSubjectAttendance();
  }

  // ---------- nav wiring ----------
  function setActiveDayChip() {
    document.querySelectorAll(".day-chip").forEach((btn) => {
      const key = btn.dataset.day;
      btn.classList.toggle("is-active", key === selectedDay);
      btn.classList.toggle("is-today", key === todayKey());
    });
  }

  function setActiveTimetableViewBtn() {
    document.querySelectorAll(".view-btn").forEach((btn) => {
      const active = btn.dataset.view === currentView;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    const dayView = document.getElementById("dayView");
    const weekView = document.getElementById("weekView");
    if (dayView) dayView.hidden = currentView !== "day";
    if (weekView) weekView.hidden = currentView !== "week";
  }

  function setActiveNav() {
    document.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.nav === currentNav);
    });
    ["homeView", "timetableView", "announcementsView", "resourcesView", "profileView"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.hidden = id !== `${currentNav}View`;
    });
  }

  function goToNav(nav) {
    currentNav = nav;
    setActiveNav();
    renderAll();
    const content = document.getElementById("appContent");
    if (content) content.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyCohortLabel() {
    const label = (currentAccount && currentAccount.name)
      ? `${currentAccount.name} \u00b7 ${TIMETABLE.label}`
      : TIMETABLE.cohortLabel;
    const el = document.getElementById("cohortLabel");
    if (el) el.textContent = label;
  }

  // ---------- student account view ----------
  function normalizeRollInput(el) {
    const start = el.selectionStart, end = el.selectionEnd;
    el.value = el.value.toUpperCase();
    try { el.setSelectionRange(start, end); } catch (e) { /* ignore */ }
  }

  function setFieldState(fieldId, errorId, message) {
    const field = document.getElementById(fieldId).closest(".field");
    const errorEl = document.getElementById(errorId);
    if (message) {
      field.classList.add("has-error");
      field.classList.remove("is-valid");
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      field.classList.remove("has-error");
      field.classList.add("is-valid");
      errorEl.hidden = true;
    }
  }

  function validateName() {
    const val = document.getElementById("accountName").value.trim();
    if (!val) { setFieldState("accountName", "accountNameError", "Enter your full name."); return null; }
    if (val.split(/\s+/).length < 2) { setFieldState("accountName", "accountNameError", "Enter your full name (first and last)."); return null; }
    setFieldState("accountName", "accountNameError", null);
    return val;
  }

  function validateRoll() {
    const el = document.getElementById("accountRoll");
    const val = el.value.trim().toUpperCase();
    el.value = val;
    if (!val) { setFieldState("accountRoll", "accountRollError", "Enter your roll / register number."); return null; }
    if (!ROLL_PATTERN.test(val)) {
      setFieldState("accountRoll", "accountRollError", "Format must be exactly CDS/2025/#### (4 digits, no other letters).");
      return null;
    }
    setFieldState("accountRoll", "accountRollError", null);
    return val;
  }

  function validateEmail() {
    const el = document.getElementById("accountEmail");
    const val = el.value.trim().toLowerCase();
    el.value = val;
    if (!val) { setFieldState("accountEmail", "accountEmailError", "Enter your full college email."); return null; }
    const atIndex = val.indexOf("@");
    if (atIndex === -1) { setFieldState("accountEmail", "accountEmailError", "Enter your full email address."); return null; }
    const local = val.slice(0, atIndex);
    const domain = val.slice(atIndex + 1);
    if (domain !== EMAIL_DOMAIN) {
      setFieldState("accountEmail", "accountEmailError", `Email must end with @${EMAIL_DOMAIN}`);
      return null;
    }
    if (!EMAIL_LOCAL_PATTERN.test(local)) {
      setFieldState("accountEmail", "accountEmailError", "Type your full email, e.g. firstname.initial-29@" + EMAIL_DOMAIN + " — not just the number.");
      return null;
    }
    setFieldState("accountEmail", "accountEmailError", null);
    return val;
  }

  function updateAccountUI() {
    const nameInput = document.getElementById("accountName");
    const rollInput = document.getElementById("accountRoll");
    const emailInput = document.getElementById("accountEmail");
    const avatar = document.getElementById("accountAvatar");
    const pill = document.getElementById("accountStatusPill");
    const hint = document.getElementById("accountSavedHint");

    if (currentAccount && currentAccount.name) {
      nameInput.value = currentAccount.name;
      rollInput.value = currentAccount.roll || "";
      emailInput.value = currentAccount.email || "";
      avatar.textContent = initials(currentAccount.name);
      pill.textContent = "Signed in";
      hint.hidden = false;
    } else {
      avatar.textContent = "S";
      pill.textContent = "Not signed in";
      hint.hidden = true;
    }
  }

  function renderSubjectAttendance() {
    resolveExpiredAttendance();
    const stats = computeAttendanceStats();
    const overallEl = document.getElementById("profileOverallPercent");
    if (overallEl) overallEl.textContent = stats.percent === null ? "--%" : `${stats.percent}%`;

    const bySubject = computeSubjectStats();
    const list = document.getElementById("subjectAttendanceList");
    const emptyEl = document.getElementById("subjectAttendanceEmpty");
    if (!list) return;

    const subjects = Object.keys(bySubject).filter((s) => bySubject[s].total > 0);
    if (subjects.length === 0) {
      list.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;

    list.innerHTML = subjects.sort().map((subject) => {
      const { present, total } = bySubject[subject];
      const pct = Math.round((present / total) * 100);
      const cls = pct < 75 ? "is-low" : (pct < 90 ? "is-mid" : "");
      return `
        <li>
          <div class="subj-row-top">
            <span class="subj-name">${subject}</span>
            <span class="subj-frac">${present}/${total} \u00b7 ${pct}%</span>
          </div>
          <div class="attendance-bar"><div class="attendance-fill ${cls}" style="width:${pct}%"></div></div>
        </li>
      `;
    }).join("");
  }

  function initAccountForm() {
    updateAccountUI();

    const nameInput = document.getElementById("accountName");
    const rollInput = document.getElementById("accountRoll");
    const emailInput = document.getElementById("accountEmail");

    rollInput.addEventListener("input", () => normalizeRollInput(rollInput));
    nameInput.addEventListener("blur", validateName);
    rollInput.addEventListener("blur", validateRoll);
    emailInput.addEventListener("blur", validateEmail);

    document.getElementById("accountForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = validateName();
      const roll = validateRoll();
      const email = validateEmail();

      if (!name) { nameInput.focus(); return; }
      if (!roll) { rollInput.focus(); return; }
      if (!email) { emailInput.focus(); return; }

      currentAccount = { name, roll, email };
      saveAccountToStorage(currentAccount);
      attendanceRecords = loadAttendance(); // switch to this student's attendance bucket

      applyCohortLabel();
      updateAccountUI();
      renderAll();
    });

    document.getElementById("accountResetBtn").addEventListener("click", () => {
      currentAccount = null;
      clearAccountFromStorage();
      document.getElementById("accountForm").reset();
      ["accountName", "accountRoll", "accountEmail"].forEach((id) => {
        document.getElementById(id).closest(".field").classList.remove("has-error", "is-valid");
      });
      attendanceRecords = loadAttendance(); // back to guest bucket
      applyCohortLabel();
      updateAccountUI();
      renderAll();
    });
  }

  // ---------- theme toggle ----------
  function initThemeToggle() {
    applyTheme(currentTheme);
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentTheme = currentTheme === "light" ? "dark" : "light";
        applyTheme(currentTheme);
        saveTheme(currentTheme);
      });
    });
  }

  // ---------- attendance click handling (event delegation) ----------
  function initAttendanceClicks() {
    const list = document.getElementById("scheduleList");
    if (!list) return;

    function handle(e) {
      const card = e.target.closest(".is-attendance-pending");
      if (!card || !list.contains(card)) return;
      const key = card.dataset.attendanceKey;
      if (!key) return;
      setAttendance(key, "present");
      renderAll();
    }

    list.addEventListener("click", handle);
    list.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const card = e.target.closest(".is-attendance-pending");
        if (card) { e.preventDefault(); handle(e); }
      }
    });
  }

  // ---------- live clock ----------
  function tickClock() {
    const now = new Date();
    const timeEl = document.getElementById("liveTime");
    const dateEl = document.getElementById("liveDate");
    if (timeEl) timeEl.textContent = formatClock(now);
    if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  }

  // ---------- navigation wiring ----------
  function initNav() {
    document.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => goToNav(btn.dataset.nav));
    });
  }

  function initTimetableControls() {
    document.querySelectorAll(".day-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedDay = btn.dataset.day;
        setActiveDayChip();
        renderAll();
      });
    });

    const todayBtn = document.getElementById("todayBtn");
    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        selectedDay = todayKey() || "mon";
        setActiveDayChip();
        renderAll();
      });
    }

    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentView = btn.dataset.view;
        setActiveTimetableViewBtn();
        renderAll();
      });
    });
  }

  // ---------- loading animation ----------
  function hideLoader() {
    const overlay = document.getElementById("loaderOverlay");
    if (!overlay) return;
    overlay.classList.add("is-hidden");
    overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 800);
  }

  function init() {
    initThemeToggle();
    applyCohortLabel();
    initAccountForm();
    initAttendanceClicks();
    initNav();
    initTimetableControls();

    setActiveDayChip();
    setActiveTimetableViewBtn();
    setActiveNav();
    tickClock();
    renderAll();

    setInterval(tickClock, 1000 * 30);
    setInterval(renderAll, 1000 * 60);

    setTimeout(hideLoader, 900);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
