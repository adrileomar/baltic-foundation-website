/* ============================================================================
   pieredze.js — category filter for the Pieredze / Experience case grid.
   Only loaded on pieredze.html; no-ops safely if the markup isn't present.
   ========================================================================== */
(function () {
  'use strict';

  var pills = document.querySelectorAll('.filters .pill');
  var cases = document.querySelectorAll('.cases .case');
  var empty = document.getElementById('cases-empty');
  if (!pills.length || !cases.length) return;

  var FADE_MS = 220;

  function applyFilter(filter) {
    var visible = 0;

    cases.forEach(function (card) {
      var match = filter === 'all' || card.getAttribute('data-category') === filter;

      if (match) {
        visible++;
        if (!card.hasAttribute('hidden')) return; // already shown
        card.removeAttribute('hidden');
        card.classList.add('case--enter');
        // force a layout flush so the enter class transitions instead of
        // applying instantly on the same frame it was added
        void card.offsetWidth;
        requestAnimationFrame(function () { card.classList.remove('case--enter'); });
      } else {
        if (card.hasAttribute('hidden')) return; // already hidden
        card.classList.add('case--leave');
        window.setTimeout(function () {
          card.setAttribute('hidden', '');
          card.classList.remove('case--leave');
        }, FADE_MS);
      }
    });

    if (empty) empty.hidden = visible !== 0;
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      if (pill.classList.contains('is-active')) return;

      pills.forEach(function (p) {
        p.classList.remove('is-active');
        p.setAttribute('aria-pressed', 'false');
      });
      pill.classList.add('is-active');
      pill.setAttribute('aria-pressed', 'true');

      applyFilter(pill.getAttribute('data-filter'));
    });
  });

})();
