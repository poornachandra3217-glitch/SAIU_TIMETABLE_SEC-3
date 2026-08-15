/**
 * ============================================================
 *  SaiUOS TIMETABLE — DATA FILE (Section 3 only)
 * ============================================================
 *  This is the ONLY file you need to edit to update the
 *  timetable, section info or announcements. Everything else
 *  (script.js / style.css) reads from the objects below.
 *  Push this file to GitHub and your live site updates
 *  automatically — no rebuild step needed.
 *
 *  This build of the app is scoped to a single cohort —
 *  Section 3 — so there is no section switcher anymore.
 *
 *  HOW TO EDIT THE TIMETABLE
 *  --------------------------
 *  1. label        -> shown near the logo (e.g. "Section 3")
 *  2. cohortLabel  -> text shown under the logo
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
 *
 *  HOW TO EDIT ANNOUNCEMENTS
 *  --------------------------
 *  Add/remove objects from the ANNOUNCEMENTS array below.
 *  Newest first is recommended, but the app sorts by date anyway.
 * ============================================================
 */

const TIMETABLE = {
  label: "Section 3",
  cohortLabel: "Year 2 · SCDS · Section 3",
  dayWindow: { start: "09:00", end: "17:00" },
  timetable: {
    mon: [
      { type: "lecture", subject: "Linear Algebra",        faculty: "Prof. Dr. Tamilarasi",     room: "AB2 - 202", start: "09:15", end: "10:10" },
      { type: "lecture", subject: "Linear Algebra",    faculty: "Prof. Dr. Tamilarasi",  room: "AB2 - 202", start: "10:15", end: "11:10" },
      { type: "lab",     subject: "Design and Analysis of Algorithms Lab",      faculty: "Prof. Nitish",        room: "AB1 - Computer Lab", start: "11:15", end: "12:10" },
      { type: "lab",     subject: "Design and Analysis of Algorithms Lab",      faculty: "Prof. Nitish",        room: "AB1 - Computer Lab", start: "12:15", end: "13:10" },
      { type: "break",   label: "Lunch break",                                                 start: "13:10", end: "14:00" },
      { type: "lecture", subject: "Web Technology", faculty: "Prof. Rupam Sah",  room: "AB1 - Moot Court Hall", start: "14:00", end: "14:55" },
      
    ],
    tue: [
      { type: "lecture", subject: "Foundations of Data Engineering Lab",          faculty: "Prof. Dr. Mariya",  room: "AB1-Computer Lab", start: "9:15", end: "10:10" },
      { type: "lecture", subject: "Foundations of Data Engineering Lab",           faculty: "Prof. Dr. Mariya",        room: "AB1-Computer Lab", start: "10:15", end: "11:10" },
      { type: "lecture", subject: "Design and analysis of algorithms",          faculty: "Prof. David",      room: "AB2 - 202", start: "11:15", end: "12:10" },
      { type: "lab",     subject: "Design and analysis of algorithms",       faculty: "Prof. David",      room: "AB2 - 202", start: "12:15", end: "13:10" },
    ],
    wed: [
      { type: "lecture", subject: "Foundation of Data Engineering",    faculty: "Prof. Mariya",       room: "AB2 - 203", start: "09:15", end: "10:10" },
      { type: "lecture", subject: "Linear Algebra", faculty: "Prof. Dr.Tamilarasi",   room: "AB1 - Moot Court Hall", start: "11:15", end: "12:10" },
      { type: "break",   label: "Lunch break",                                                  start: "12:10", end: "14:00" },
      { type: "lecture", subject: "Web Technology",             faculty: "Prof. Roopam",  room: "AB2 - 101", start: "14:00", end: "14:55" },
    ],
    thu: [
      { type: "lecture", subject: "Web Technology",            faculty: "Prof. Rupam Sah",        room: "AB1 - Moot Court Hall", start: "10:15", end: "11:10" },
      { type: "break",   label: "Lunch break",                                                   start: "11:10", end: "13:00" },
      { type: "lecture", subject: "Foundation of Data Engineering",            faculty: "Prof. Mariya",     room: "AB2 - 203", start: "13:00", end: "13:55" },
      { type: "lecture", subject: "Foundation of Data Engineering",        faculty: "Prof. Mariya", room: "AB2 - 203", start: "14:00", end: "14:55" },
      
    ],
    fri: [
      { type: "lecture", subject: "Web Technology",            faculty: "Prof. Rupam Sah",        room: "AB2 - 202", start: "10:15", end: "11:10" },
      { type: "lecture", subject: "Linear Algebra",              faculty: "Prof. Dr. Tamilarasi", room: "AB2 - 203", start: "11:15", end: "12:10" },
      { type: "break",   label: "Lunch break",                                                   start: "12:10", end: "14:00" },
      { type: "lecture", subject: "Linear Algebra",              faculty: "Prof. Dr. Tamilarasi", room: "AB2 - 202", start: "14:00", end: "14:55" },
    ],
  },
};

// ------------------------------------------------------------
// ANNOUNCEMENTS — shown in the sidebar, newest first.
// "date" uses "YYYY-MM-DD" so the app can sort them correctly.
// ------------------------------------------------------------
const ANNOUNCEMENTS = [
  {
    title: "Welcome to the new Section 3 timetable app",
    body: "This app now shows only Section 3's schedule, with attendance tracking and announcements built in.",
    date: "2026-08-15",
  },
  
  {
    title: "Mid-semester exams schedule out soon",
    body: "The exam cell will publish the mid-semester timetable by the end of this month. Keep an eye on this space.",
    date: "2026-08-10",
  },
];
