/* ============================================================================
   courses-data.js — source of truth for Erasmus+ course scheduling.
   ----------------------------------------------------------------------------
   Sessions are NOT hand-entered. For every month listed in `activeMonths`,
   the system finds every Monday that falls in that month and generates a
   6-day (Mon–Sat) session starting on it. To open a new month for bookings,
   add it to `activeMonths` — nothing else needs to change.

   To take a specific week off sale (holidays, trainer unavailability, fully
   booked), add that week's Monday (ISO "YYYY-MM-DD") to `blockedSessions`.
   The session still appears everywhere (course page, calendar) but shows as
   unavailable instead of being deleted from the schedule.
   ========================================================================== */

const COURSES = {
  'argument-as-a-method': {
    id: 'argument-as-a-method',
    title: 'Argument as a Method',
    pageUrl: 'course-argument-as-a-method.html',
    durationDays: 6, // Monday through Saturday
    fee: 480,
    currency: '€',
    location: { id: 'riga', lv: 'Rīga, Latvija', en: 'Riga, Latvia' },

    // Months open for booking. Format: "YYYY-MM". Add a month here to
    // publish it — every Monday in that month becomes a session automatically.
    activeMonths: ['2027-11', '2027-12'],

    // Monday start-dates (ISO) to mark as unavailable without deleting them.
    blockedSessions: [],
  },
};
