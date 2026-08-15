/**
 * ============================================================
 *  SaiUOS TIMETABLE — DATA FILE
 * ============================================================
 *  This is the ONLY file you need to edit to update the
 *  timetable. Everything else (script.js / style.css) reads
 *  from the objects below. Push this file to GitHub and your
 *  live site updates automatically — no rebuild step needed.
 *
 *  HOW TO EDIT
 *  -----------
 *  There are 7 sections below, shown to students as
 *  "Section 1" through "Section 7" (internal keys A-G — don't
 *  rename the keys, only the "label"/"cohortLabel" text if needed).
 *  Each section is fully independent — its own label, its own
 *  day window, its own timetable. Students pick their section
 *  from the dropdown in the header, or by creating a Student
 *  Account in the Account tab; the app remembers their choice
 *  (per device) so they don't have to pick it every time.
 *
 *  For each section:
 *  1. label        -> shown in the section dropdown (e.g. "Section A")
 *  2. cohortLabel  -> text shown under the logo (e.g. "Year 2 · SCDS · Sec A")
 *  3. dayWindow    -> earliest/latest time shown in Week view
 *  4. timetable    -> one array per weekday ("mon".."fri")
 *
 *  Each entry in a day's array is one of:
 *
 *  { type: "lecture", subject, faculty, room, start, end }
 *  { type: "lab",     subject, faculty, room, start, end }
 *  { type: "break",   label, start, end }               // e.g. Lunch
 *
 *  - start / end use 24-hour "HH:MM" strings, e.g. "10:15", "14:00".
 *  - Leave a gap between two entries and it will automatically show
 *    up as a "Free period" in Day view / Week view.
 *  - Order entries within a day chronologically (earliest first).
 *  - Need more or fewer than 7 sections? Just add/remove keys from
 *    the SECTIONS object below — the dropdown updates automatically.
 * ============================================================
 */

const SECTIONS = {

  A: {
    label: "Section 1",
    cohortLabel: "Year 2 · SCDS · Section 1",
    dayWindow: { start: "09:00", end: "17:00" },
    timetable: {
      mon: [
        { type: "lecture", subject: "Data Structures",        faculty: "Prof. Ananya Iyer",     room: "AB2 - 201", start: "09:00", end: "09:55" },
        { type: "lecture", subject: "Discrete Mathematics",    faculty: "Prof. Dr. Tamilarasi",  room: "AB2 - 203", start: "10:00", end: "10:55" },
        { type: "lab",     subject: "Web Technology Lab",      faculty: "Prof. Rupam Sah",        room: "Lab 4 - CS", start: "11:05", end: "12:45" },
        { type: "break",   label: "Lunch break",                                                 start: "12:45", end: "13:40" },
        { type: "lecture", subject: "Object Oriented Programming", faculty: "Prof. Karan Mehta",  room: "AB2 - 202", start: "13:40", end: "14:35" },
        { type: "lecture", subject: "Computer Organization",   faculty: "Prof. Divya Nair",       room: "AB2 - 202", start: "14:40", end: "15:35" },
      ],
      tue: [
        { type: "lecture", subject: "Linear Algebra",          faculty: "Prof. Dr. Tamilarasi",  room: "AB2 - 203", start: "09:00", end: "09:55" },
        { type: "lecture", subject: "Web Technology",           faculty: "Prof. Rupam Sah",        room: "AB2 - 202", start: "10:00", end: "10:55" },
        { type: "lecture", subject: "Data Structures",          faculty: "Prof. Ananya Iyer",      room: "AB2 - 201", start: "11:05", end: "12:00" },
        { type: "break",   label: "Lunch break",                                                  start: "12:00", end: "13:00" },
        { type: "lab",     subject: "Data Structures Lab",       faculty: "Prof. Ananya Iyer",      room: "Lab 2 - CS", start: "13:00", end: "14:40" },
        { type: "lecture", subject: "Discrete Mathematics",      faculty: "Prof. Dr. Tamilarasi",  room: "AB2 - 203", start: "14:45", end: "15:40" },
      ],
      wed: [
        { type: "lecture", subject: "Computer Organization",    faculty: "Prof. Divya Nair",       room: "AB2 - 202", start: "09:00", end: "09:55" },
        { type: "lecture", subject: "Object Oriented Programming", faculty: "Prof. Karan Mehta",   room: "AB2 - 202", start: "10:00", end: "10:55" },
        { type: "break",   label: "Short break",                                                  start: "10:55", end: "11:10" },
        { type: "lab",     subject: "OOP Lab",                    faculty: "Prof. Karan Mehta",     room: "Lab 1 - CS", start: "11:10", end: "12:50" },
        { type: "break",   label: "Lunch break",                                                  start: "12:50", end: "13:50" },
        { type: "lecture", subject: "Linear Algebra",             faculty: "Prof. Dr. Tamilarasi",  room: "AB2 - 203", start: "13:50", end: "14:45" },
      ],
      thu: [
        { type: "lecture", subject: "Web Technology",            faculty: "Prof. Rupam Sah",        room: "AB2 - 202", start: "09:00", end: "09:55" },
        { type: "lecture", subject: "Data Structures",            faculty: "Prof. Ananya Iyer",     room: "AB2 - 201", start: "10:00", end: "10:55" },
        { type: "lecture", subject: "Discrete Mathematics",        faculty: "Prof. Dr. Tamilarasi", room: "AB2 - 203", start: "11:05", end: "12:00" },
        { type: "break",   label: "Lunch break",                                                   start: "12:00", end: "13:00" },
        { type: "lab",     subject: "Computer Organization Lab",   faculty: "Prof. Divya Nair",      room: "Lab 3 - CS", start: "13:00", end: "14:40" },
      ],
      fri: [
        { type: "lecture", subject: "Web Technology",            faculty: "Prof. Rupam Sah",        room: "AB2 - 202", start: "10:15", end: "11:10" },
        { type: "lecture", subject: "Linear Algebra",              faculty: "Prof. Dr. Tamilarasi", room: "AB2 - 203", start: "11:15", end: "12:10" },
        { type: "break",   label: "Lunch break",                                                   start: "12:10", end: "14:00" },
        { type: "lecture", subject: "Linear Algebra",              faculty: "Prof. Dr. Tamilarasi", room: "AB2 - 202", start: "14:00", end: "14:55" },
      ],
    },
  },

  // ------------------------------------------------------------
  // SAMPLE DATA — replace subjects/faculty/rooms/times for each
  // section below with the real timetable. Keep the same shape.
  // ------------------------------------------------------------
  B: {
    label: "Section 2",
    cohortLabel: "Year 2 · SCDS · Section 2",
    dayWindow: { start: "09:00", end: "17:00" },
    timetable: {
      mon: [
        { type: "lecture", subject: "Data Structures",        faculty: "Faculty TBD", room: "TBD", start: "09:00", end: "09:55" },
        { type: "break",   label: "Lunch break",                                     start: "12:45", end: "13:40" },
      ],
      tue: [], wed: [], thu: [], fri: [],
    },
  },
  C: {
    label: "Section 3",
    cohortLabel: "Year 2 · SCDS · Section 3",
    dayWindow: { start: "09:00", end: "17:00" },
    timetable: { mon: [], tue: [], wed: [], thu: [], fri: [] },
  },
  D: {
    label: "Section 4",
    cohortLabel: "Year 2 · SCDS · Section 4",
    dayWindow: { start: "09:00", end: "17:00" },
    timetable: { mon: [], tue: [], wed: [], thu: [], fri: [] },
  },
  E: {
    label: "Section 5",
    cohortLabel: "Year 2 · SCDS · Section 5",
    dayWindow: { start: "09:00", end: "17:00" },
    timetable: { mon: [], tue: [], wed: [], thu: [], fri: [] },
  },
  F: {
    label: "Section 6",
    cohortLabel: "Year 2 · SCDS · Section 6",
    dayWindow: { start: "09:00", end: "17:00" },
    timetable: { mon: [], tue: [], wed: [], thu: [], fri: [] },
  },
  G: {
    label: "Section 7",
    cohortLabel: "Year 2 · SCDS · Section 7",
    dayWindow: { start: "09:00", end: "17:00" },
    timetable: { mon: [], tue: [], wed: [], thu: [], fri: [] },
  },

};

// Which section loads the very first time a visitor opens the site
// (before they've picked one / before it's saved on their device).
const DEFAULT_SECTION = "A";
