(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

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

    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var search = panel.querySelector('[data-search-input]');
    var type = panel.querySelector('[data-filter-type]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var empty = scope.querySelector('[data-no-results]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(search && search.value);
      var typeValue = type ? type.value : '';
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title'));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          matched = false;
        }
        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          matched = false;
        }
        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [search, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (search) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        search.value = q;
      }
    }

    apply();
  });
})();

var hlsScriptElement = null;

function loadHlsLibrary(callback) {
  if (window.Hls) {
    callback();
    return;
  }

  if (hlsScriptElement) {
    hlsScriptElement.addEventListener('load', callback, { once: true });
    hlsScriptElement.addEventListener('error', callback, { once: true });
    return;
  }

  hlsScriptElement = document.createElement('script');
  hlsScriptElement.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
  hlsScriptElement.async = true;
  hlsScriptElement.addEventListener('load', callback, { once: true });
  hlsScriptElement.addEventListener('error', callback, { once: true });
  document.head.appendChild(hlsScriptElement);
}

function initMoviePlayer(source) {
  var video = document.getElementById('movieVideo');
  var button = document.getElementById('playerStart');
  var attached = false;
  var hls = null;

  if (!video || !button || !source) {
    return;
  }

  function attach(callback) {
    if (attached) {
      callback();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      attached = true;
      callback();
      return;
    }

    loadHlsLibrary(function () {
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          attached = true;
          callback();
        });
        hls.on(window.Hls.Events.ERROR, function () {
          if (!attached) {
            video.src = source;
            attached = true;
            callback();
          }
        });
      } else {
        video.src = source;
        attached = true;
        callback();
      }
    });
  }

  function play() {
    attach(function () {
      button.classList.add('is-hidden');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    });
  }

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
