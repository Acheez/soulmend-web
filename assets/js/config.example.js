/* Local copy of the site settings.
   1. Copy this file to assets/js/config.js (that file is ignored by Git).
   2. Paste your Google Calendar appointment schedule link below.
   On GitHub, config.js is written at deploy time from the BOOKING_URL repository variable
   (see .github/workflows/pages.yml), so the real link never needs to be committed. */
window.SOULMEND_CONFIG = {
  // Long link: https://calendar.google.com/calendar/appointments/schedules/…  (also embeds the calendar)
  // Short link: https://calendar.app.google/…  (buttons only — Google blocks embedding it)
  bookingUrl: '',
  // Optional, paid Google plans only: a separate booking page per card, so Google records which massage it is.
  // Leave empty on a free account (the shared bookingUrl is used, and WhatsApp carries the massage name).
  bookingUrls: { relax: '', therapeutic: '', sports: '', body: '', facial: '' }
};
