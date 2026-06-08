(function () {
  function pagePrefix() {
    return location.pathname.indexOf('/movie/') !== -1 ? '../' : './';
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
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
      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }
      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          restart();
        });
      });
      restart();
    }

    var pageFilters = Array.prototype.slice.call(document.querySelectorAll('[data-page-filter]'));
    pageFilters.forEach(function (input) {
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        cards.forEach(function (card) {
          var hay = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent).toLowerCase();
          card.classList.toggle('is-hidden-by-filter', keyword && hay.indexOf(keyword) === -1);
        });
      });
    });

    var searchRoots = Array.prototype.slice.call(document.querySelectorAll('[data-search-root]'));
    searchRoots.forEach(function (root) {
      var input = root.querySelector('[data-global-search]');
      var panel = root.querySelector('[data-search-panel]');
      if (!input || !panel || !window.SITE_MOVIES) {
        return;
      }
      function hidePanel() {
        panel.classList.remove('is-open');
      }
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        if (!keyword) {
          panel.innerHTML = '';
          hidePanel();
          return;
        }
        var prefix = pagePrefix();
        var results = window.SITE_MOVIES.filter(function (item) {
          return (item.meta || '').toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 12);
        panel.innerHTML = results.map(function (item) {
          return '<a href="' + prefix + item.url + '"><img src="' + prefix + item.cover + '" alt="' + escapeHtml(item.title) + '"><span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</span></span></a>';
        }).join('');
        panel.classList.toggle('is-open', results.length > 0);
      });
      document.addEventListener('click', function (event) {
        if (!root.contains(event.target)) {
          hidePanel();
        }
      });
    });

    var player = document.querySelector('[data-player]');
    if (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play]');
      var stream = player.getAttribute('data-stream');
      var started = false;
      var instance = null;
      function startVideo() {
        if (!video || !stream) {
          return;
        }
        player.classList.add('is-playing');
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({ enableWorker: true });
          instance.loadSource(stream);
          instance.attachMedia(video);
          instance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      }
      if (button) {
        button.addEventListener('click', startVideo);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started || video.paused) {
            startVideo();
          } else {
            video.pause();
          }
        });
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (instance) {
          instance.destroy();
        }
      });
    }
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
})();
