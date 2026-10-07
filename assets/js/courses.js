/* ============================================================================
   courses.js — session generation, formatting and rendering for the
   Erasmus+ course pages (product page, calendar, registration).
   Depends on: assets/js/courses-data.js (global COURSES), assets/js/content.js
   ========================================================================== */
(function () {
  'use strict';

  var MONTH_LV = ['janvāris', 'februāris', 'marts', 'aprīlis', 'maijs', 'jūnijs',
    'jūlijs', 'augusts', 'septembris', 'oktobris', 'novembris', 'decembris'];
  var MONTH_EN = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var MONTH_EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTH_LV_SHORT = ['janv', 'febr', 'marts', 'apr', 'maijs', 'jūn', 'jūl', 'aug', 'sept', 'okt', 'nov', 'dec'];

  function pad(n) { return String(n).length < 2 ? '0' + n : String(n); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(d, n) { var r = new Date(d.getTime()); r.setDate(r.getDate() + n); return r; }

  // All Mondays whose calendar date falls within the given "YYYY-MM" month.
  function mondaysInMonth(yyyyMM) {
    var parts = yyyyMM.split('-');
    var year = parseInt(parts[0], 10), month = parseInt(parts[1], 10) - 1;
    var d = new Date(year, month, 1);
    var mondays = [];
    while (d.getMonth() === month) {
      if (d.getDay() === 1) mondays.push(new Date(d.getTime()));
      d = addDays(d, 1);
    }
    return mondays;
  }

  // Build every session for a course from its activeMonths + blockedSessions config.
  function generateSessions(course) {
    var sessions = [];
    var seen = {};
    (course.activeMonths || []).forEach(function (yyyyMM) {
      mondaysInMonth(yyyyMM).forEach(function (monday) {
        var startIso = iso(monday);
        if (seen[startIso]) return; // a session starting in one month is never duplicated by an adjacent active month
        seen[startIso] = true;
        var end = addDays(monday, course.durationDays - 1);
        var blocked = (course.blockedSessions || []).indexOf(startIso) !== -1;
        sessions.push({
          courseId: course.id,
          start: monday,
          end: end,
          startIso: startIso,
          endIso: iso(end),
          status: blocked ? 'closed' : 'open'
        });
      });
    });
    sessions.sort(function (a, b) { return a.start - b.start; });
    return sessions;
  }

  function formatRange(start, end, lang) {
    var months = lang === 'lv' ? MONTH_LV : MONTH_EN;
    var sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    if (lang === 'lv') {
      if (sameMonth) {
        return start.getDate() + '.–' + end.getDate() + '. ' + months[start.getMonth()] + ' ' + end.getFullYear() + '.';
      }
      var sameYear = start.getFullYear() === end.getFullYear();
      return start.getDate() + '. ' + months[start.getMonth()] + (sameYear ? '' : ' ' + start.getFullYear()) +
        ' – ' + end.getDate() + '. ' + months[end.getMonth()] + ' ' + end.getFullYear();
    }
    // English
    if (sameMonth) {
      return start.getDate() + '–' + end.getDate() + ' ' + months[start.getMonth()] + ' ' + end.getFullYear();
    }
    var sameYearEn = start.getFullYear() === end.getFullYear();
    return start.getDate() + ' ' + months[start.getMonth()] + (sameYearEn ? '' : ' ' + start.getFullYear()) +
      ' – ' + end.getDate() + ' ' + months[end.getMonth()] + ' ' + end.getFullYear();
  }

  function formatChip(start, end, lang) {
    var months = lang === 'lv' ? MONTH_LV_SHORT : MONTH_EN_SHORT;
    var sameMonth = start.getMonth() === end.getMonth();
    if (lang === 'lv') {
      return sameMonth
        ? start.getDate() + '–' + end.getDate() + ' ' + months[start.getMonth()]
        : start.getDate() + ' ' + months[start.getMonth()] + '–' + end.getDate() + ' ' + months[end.getMonth()];
    }
    return sameMonth
      ? start.getDate() + '–' + end.getDate() + ' ' + months[start.getMonth()]
      : start.getDate() + ' ' + months[start.getMonth()] + '–' + end.getDate() + ' ' + months[end.getMonth()];
  }

  function monthLabel(yyyyMM, lang) {
    var parts = yyyyMM.split('-');
    var months = lang === 'lv' ? MONTH_LV : MONTH_EN;
    var name = months[parseInt(parts[1], 10) - 1];
    return (lang === 'lv' ? capitalize(name) : name) + ' ' + parts[0];
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function todayIso() {
    var d = new Date();
    return iso(d);
  }

  function groupByMonth(sessions) {
    var groups = [], index = {};
    sessions.forEach(function (s) {
      var key = s.start.getFullYear() + '-' + pad(s.start.getMonth() + 1);
      if (!index[key]) { index[key] = { key: key, sessions: [] }; groups.push(index[key]); }
      index[key].sessions.push(s);
    });
    return groups;
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function sessionId(s) { return s.courseId + '-' + s.startIso; }

  function registerUrl(course, s) {
    var p = new URLSearchParams();
    p.set('course', course.id);
    p.set('start', s.startIso);
    p.set('end', s.endIso);
    p.set('location', course.location.id);
    p.set('price', course.fee);
    return 'register.html?' + p.toString();
  }

  var STATUS_LABEL = {
    lv: { open: 'Pieejama reģistrācija', closed: 'Nav pieejams' },
    en: { open: 'Open for enrolment', closed: 'Not available' }
  };
  var T = {
    lv: { days: 'dienas', viewAll: 'Skatīt visus datumus →', choose: 'Izvēlēties šo sesiju', perParticipant: '/ dalībnieks' },
    en: { days: 'days', viewAll: 'View all dates →', choose: 'Choose this session', perParticipant: '/ participant' }
  };

  // Renders up to `limit` upcoming (today-or-later, open-first) sessions into
  // `container`, plus a "view all" link to the calendar scoped to this course.
  function renderUpcoming(container, course, lang, limit) {
    limit = limit || 6;
    var today = todayIso();
    var all = generateSessions(course).filter(function (s) { return s.endIso >= today; });
    var shown = all.slice(0, limit);
    var t = T[lang], statusLabel = STATUS_LABEL[lang];
    var loc = course.location[lang];

    container.innerHTML = shown.map(function (s) {
      var closed = s.status === 'closed';
      return '<div class="session-card' + (closed ? ' session-card--closed' : '') + '" id="' + sessionId(s) + '">' +
        '<span class="session-card__date">' + esc(formatRange(s.start, s.end, lang)) + '</span>' +
        '<span class="session-card__meta">' +
          '<span>' + esc(loc) + '</span><span>·</span>' +
          '<span>' + course.durationDays + ' ' + t.days + '</span><span>·</span>' +
          '<span>' + course.currency + course.fee + ' ' + t.perParticipant + '</span><span>·</span>' +
          '<span>' + statusLabel[s.status] + '</span>' +
        '</span>' +
        '<span class="session-card__cta">' +
          (closed ? '' : '<a class="btn btn--navy btn--sm" href="' + registerUrl(course, s) + '">' + t.choose + '</a>') +
        '</span>' +
      '</div>';
    }).join('');

    // Find-or-create: avoids appending a duplicate link every time this
    // re-renders (language toggle, etc). A static fallback link already in
    // the HTML (for no-JS visitors) is reused rather than duplicated.
    var link = container.parentNode.querySelector('.view-all-link');
    if (all.length > limit) {
      if (!link) {
        link = document.createElement('a');
        link.className = 'view-all-link';
        container.parentNode.appendChild(link);
      }
      link.href = 'course-calendar.html?course=' + course.id;
      link.textContent = t.viewAll;
    } else if (link) {
      link.remove();
    }
  }

  // Full calendar: week-picker chips grouped by month, filter bar, and the
  // complete session list. `opts.courseFilter` pre-selects a course (e.g.
  // arriving from a product page's "view all dates" link).
  function renderCalendar(root, lang, opts) {
    opts = opts || {};
    var t = T[lang], statusLabel = STATUS_LABEL[lang];
    var courseIds = Object.keys(COURSES);

    // Flatten all sessions across all courses, tagged with their course.
    var allSessions = [];
    courseIds.forEach(function (id) {
      generateSessions(COURSES[id]).forEach(function (s) { allSessions.push(s); });
    });
    allSessions.sort(function (a, b) { return a.start - b.start; });

    var monthKeys = [];
    allSessions.forEach(function (s) {
      var key = s.start.getFullYear() + '-' + pad(s.start.getMonth() + 1);
      if (monthKeys.indexOf(key) === -1) monthKeys.push(key);
    });

    var pickerEl = root.querySelector('[data-course-calendar-picker]');
    var filtersEl = root.querySelector('[data-course-calendar-filters]');
    var listEl = root.querySelector('[data-course-calendar-list]');

    // Week-picker strip, grouped by month.
    if (pickerEl) {
      pickerEl.innerHTML = monthKeys.map(function (key) {
        var monthSessions = allSessions.filter(function (s) {
          return (s.start.getFullYear() + '-' + pad(s.start.getMonth() + 1)) === key;
        });
        var chips = monthSessions.map(function (s) {
          var closed = s.status === 'closed';
          return '<a class="week-chip' + (closed ? ' week-chip--closed' : '') + '" href="#' + sessionId(s) + '">' +
            esc(formatChip(s.start, s.end, lang)) + '</a>';
        }).join('');
        return '<div class="week-picker__month"><h3>' + esc(monthLabel(key, lang)) + '</h3>' +
          '<div class="week-picker__chips">' + chips + '</div></div>';
      }).join('');
    }

    // Filters (month / course / location / status) — populated from the data,
    // so adding a course or city just works without touching this markup.
    var state = { month: '', course: opts.courseFilter || '', location: '', status: '' };

    function uniq(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); }

    function renderFilters() {
      if (!filtersEl) return;
      var locations = uniq(courseIds.map(function (id) { return COURSES[id].location.id; }));
      filtersEl.innerHTML =
        '<select data-f="month"><option value="">' + (lang === 'lv' ? 'Visi mēneši' : 'All months') + '</option>' +
          monthKeys.map(function (k) { return '<option value="' + k + '"' + (state.month === k ? ' selected' : '') + '>' + esc(monthLabel(k, lang)) + '</option>'; }).join('') +
        '</select>' +
        '<select data-f="course"><option value="">' + (lang === 'lv' ? 'Visi kursi' : 'All courses') + '</option>' +
          courseIds.map(function (id) { return '<option value="' + id + '"' + (state.course === id ? ' selected' : '') + '>' + esc(COURSES[id].title) + '</option>'; }).join('') +
        '</select>' +
        '<select data-f="location"><option value="">' + (lang === 'lv' ? 'Visas vietas' : 'All locations') + '</option>' +
          locations.map(function (id) {
            var sample = courseIds.map(function (cid) { return COURSES[cid]; }).filter(function (c) { return c.location.id === id; })[0];
            return '<option value="' + id + '"' + (state.location === id ? ' selected' : '') + '>' + esc(sample.location[lang]) + '</option>';
          }).join('') +
        '</select>' +
        '<select data-f="status"><option value="">' + (lang === 'lv' ? 'Viss statuss' : 'All statuses') + '</option>' +
          '<option value="open"' + (state.status === 'open' ? ' selected' : '') + '>' + statusLabel.open + '</option>' +
          '<option value="closed"' + (state.status === 'closed' ? ' selected' : '') + '>' + statusLabel.closed + '</option>' +
        '</select>';
      filtersEl.querySelectorAll('select').forEach(function (sel) {
        sel.addEventListener('change', function () {
          state[sel.getAttribute('data-f')] = sel.value;
          renderList();
        });
      });
    }

    function renderList() {
      if (!listEl) return;
      var filtered = allSessions.filter(function (s) {
        var key = s.start.getFullYear() + '-' + pad(s.start.getMonth() + 1);
        if (state.month && key !== state.month) return false;
        if (state.course && s.courseId !== state.course) return false;
        if (state.location && COURSES[s.courseId].location.id !== state.location) return false;
        if (state.status && s.status !== state.status) return false;
        return true;
      });
      listEl.innerHTML = filtered.map(function (s) {
        var course = COURSES[s.courseId];
        var closed = s.status === 'closed';
        return '<div class="session-card' + (closed ? ' session-card--closed' : '') + '" id="' + sessionId(s) + '">' +
          '<span class="session-card__date">' + esc(formatRange(s.start, s.end, lang)) + '</span>' +
          '<span class="session-card__meta">' +
            '<span>' + esc(course.title) + '</span><span>·</span>' +
            '<span>' + esc(course.location[lang]) + '</span><span>·</span>' +
            '<span>' + course.durationDays + ' ' + t.days + '</span><span>·</span>' +
            '<span>' + course.currency + course.fee + '</span><span>·</span>' +
            '<span>' + statusLabel[s.status] + '</span>' +
          '</span>' +
          '<span class="session-card__cta">' +
            (closed ? '' : '<a class="btn btn--navy btn--sm" href="' + registerUrl(course, s) + '">' + t.choose + '</a>') +
          '</span>' +
        '</div>';
      }).join('');
    }

    renderFilters();
    renderList();

    // Deep-link highlight: #sessionId from a week-chip or "view all" link.
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) {
        target.classList.add('is-highlighted');
        setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 60);
      }
    }
  }

  // Registration page: reads course/start/end/location/price from the URL
  // and renders the "selected session" summary card.
  function renderRegistrationSummary(container, lang) {
    var p = new URLSearchParams(location.search);
    var courseId = p.get('course');
    var course = COURSES[courseId];
    if (!course) return null;
    var startIso = p.get('start'), endIso = p.get('end');
    var start = startIso ? new Date(startIso + 'T00:00:00') : null;
    var end = endIso ? new Date(endIso + 'T00:00:00') : null;
    var loc = course.location[lang];
    var price = p.get('price') || course.fee;
    var rangeLabel = (start && end) ? formatRange(start, end, lang) : '';

    container.innerHTML =
      '<div class="reg-summary__course">' + esc(course.title) + '</div>' +
      '<div class="reg-summary__meta">' + esc(loc) + (rangeLabel ? ' · ' + esc(rangeLabel) : '') + '</div>' +
      '<div class="reg-summary__meta reg-summary__price">' + course.currency + price + ' ' + T[lang].perParticipant + '</div>' +
      '<a class="reg-summary__change" href="course-calendar.html?course=' + esc(courseId) + '">' +
        (lang === 'lv' ? 'Mainīt sesiju' : 'Change session') + '</a>';

    return { course: course, startIso: startIso, endIso: endIso, rangeLabel: rangeLabel, price: price };
  }

  window.BFFECourses = {
    generateSessions: generateSessions,
    formatRange: formatRange,
    formatChip: formatChip,
    monthLabel: monthLabel,
    groupByMonth: groupByMonth,
    todayIso: todayIso,
    iso: iso,
    renderUpcoming: renderUpcoming,
    renderCalendar: renderCalendar,
    renderRegistrationSummary: renderRegistrationSummary
  };
})();
