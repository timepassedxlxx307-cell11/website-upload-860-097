(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function bindHero() {
    var wrap = document.querySelector('[data-hero-carousel]');
    if (!wrap) {
      return;
    }
    var slides = Array.prototype.slice.call(wrap.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(wrap.querySelectorAll('[data-hero-dot]'));
    var prev = wrap.querySelector('[data-hero-prev]');
    var next = wrap.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function start() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    wrap.addEventListener('mouseenter', stop);
    wrap.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindGlobalSearch() {
    var input = document.querySelector('[data-site-search]');
    var box = document.querySelector('[data-search-results]');
    var items = window.SEARCH_ITEMS || [];
    if (!input || !box || !items.length) {
      return;
    }
    function render(results) {
      if (!results.length) {
        box.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
        box.classList.add('is-open');
        return;
      }
      box.innerHTML = results.slice(0, 24).map(function (item) {
        return '<a class="search-result" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong>' +
          '<em>' + escapeHtml(item.year + ' · ' + item.type + ' · ' + item.category) + '</em></span>' +
          '</a>';
      }).join('');
      box.classList.add('is-open');
    }
    input.addEventListener('input', function () {
      var query = normalize(input.value);
      if (!query) {
        box.innerHTML = '';
        box.classList.remove('is-open');
        return;
      }
      var results = items.filter(function (item) {
        var haystack = normalize([item.title, item.year, item.type, item.region, item.genre, item.category, item.oneLine].join(' '));
        return haystack.indexOf(query) !== -1;
      });
      render(results);
    });
  }

  function bindCardFilters() {
    var search = document.querySelector('[data-card-filter]');
    var type = document.querySelector('[data-type-filter]');
    var year = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-targets .movie-card'));
    var empty = document.querySelector('[data-empty-state]');
    if (!cards.length) {
      return;
    }
    function apply() {
      var query = normalize(search && search.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([card.dataset.title, card.dataset.type, card.dataset.year, card.dataset.region, card.dataset.category].join(' '));
        var ok = true;
        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (typeValue && normalize(card.dataset.type) !== typeValue) {
          ok = false;
        }
        if (yearValue && normalize(card.dataset.year) !== yearValue) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [search, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  ready(function () {
    bindMobileNav();
    bindHero();
    bindGlobalSearch();
    bindCardFilters();
  });
})();
