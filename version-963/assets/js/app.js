(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });

    function setupMenu() {
        var header = document.querySelector('.site-header');
        var button = document.querySelector('.nav-toggle');
        if (!header || !button) {
            return;
        }
        button.addEventListener('click', function () {
            header.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var backgrounds = Array.prototype.slice.call(hero.querySelectorAll('.hero-bg'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var index = 0;

        function go(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            backgrounds.forEach(function (bg, i) {
                bg.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                go(Number(dot.getAttribute('data-go') || 0));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                go(index + 1);
            }, 5200);
        }
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('.filter-scope'));
        if (!scopes.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get('q') || '';
        var textInput = document.querySelector('.js-filter');
        var yearSelect = document.querySelector('.js-year-filter');
        var categorySelect = document.querySelector('.js-category-filter');

        if (textInput && queryFromUrl) {
            textInput.value = queryFromUrl;
        }

        function apply() {
            var words = textInput ? textInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean) : [];
            var year = yearSelect ? yearSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            scopes.forEach(function (scope) {
                var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardCategory = card.getAttribute('data-category') || '';
                    var matchedText = words.every(function (word) {
                        return haystack.indexOf(word) !== -1;
                    });
                    var matchedYear = !year || cardYear === year;
                    var matchedCategory = !category || cardCategory === category;
                    card.classList.toggle('is-hidden', !(matchedText && matchedYear && matchedCategory));
                });
            });
        }

        [textInput, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var cover = shell.querySelector('.player-cover');
            if (!video) {
                return;
            }
            var streamUrl = video.getAttribute('data-stream');
            var loaded = false;
            var hlsInstance = null;

            function loadAndPlay() {
                if (!streamUrl) {
                    return;
                }
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                if (!loaded) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = streamUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(streamUrl);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = streamUrl;
                    }
                    loaded = true;
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener('click', loadAndPlay);
            }
            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    loadAndPlay();
                }
            });
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }
}());
