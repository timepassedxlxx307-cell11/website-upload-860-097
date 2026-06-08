(function () {
    'use strict';

    var root = document.body ? (document.body.getAttribute('data-site-root') || '') : '';

    function resolveUrl(url) {
        if (!url) {
            return '#';
        }
        if (/^(https?:)?\/\//.test(url) || url.charAt(0) === '#') {
            return url;
        }
        return root + url;
    }

    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = selectAll('[data-hero-slide]');
        var dots = selectAll('[data-hero-dot]');
        var thumbs = selectAll('[data-hero-thumb]');
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function setActive(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('active', thumbIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                setActive(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setActive(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('mouseenter', function () {
                setActive(Number(thumb.getAttribute('data-hero-thumb')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                setActive(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setActive(current + 1);
                restart();
            });
        }

        restart();
    }

    function setupGlobalSearch() {
        var input = document.getElementById('global-search');
        var panel = document.getElementById('global-search-results');
        var index = window.MOVIE_SEARCH_INDEX || [];
        if (!input || !panel || !index.length) {
            return;
        }

        function render(items) {
            if (!items.length) {
                panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
                panel.hidden = false;
                return;
            }
            panel.innerHTML = items.slice(0, 12).map(function (item) {
                return [
                    '<a class="search-result-item" href="' + resolveUrl(item.url) + '">',
                    '    <img src="' + resolveUrl(item.cover) + '" alt="' + escapeHtml(item.title) + '" onerror="this.style.display=\'none\'">',
                    '    <span>',
                    '        <strong>' + escapeHtml(item.title) + '</strong>',
                    '        <small>' + escapeHtml([item.region, item.year, item.genre].filter(Boolean).join(' · ')) + '</small>',
                    '    </span>',
                    '</a>'
                ].join('');
            }).join('');
            panel.hidden = false;
        }

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            if (!keyword) {
                panel.hidden = true;
                panel.innerHTML = '';
                return;
            }
            var matches = index.filter(function (item) {
                return item.searchText.indexOf(keyword) !== -1;
            });
            render(matches);
        });

        document.addEventListener('click', function (event) {
            if (!panel.contains(event.target) && event.target !== input) {
                panel.hidden = true;
            }
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupPageSearch() {
        var input = document.querySelector('[data-page-search]');
        var clear = document.querySelector('[data-clear-page-search]');
        var cards = selectAll('[data-movie-card]');
        if (!input || !cards.length) {
            return;
        }

        function apply() {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                card.hidden = keyword && text.indexOf(keyword) === -1;
            });
        }

        input.addEventListener('input', apply);
        if (clear) {
            clear.addEventListener('click', function () {
                input.value = '';
                apply();
                input.focus();
            });
        }
    }

    function setupFilters() {
        var scope = document.querySelector('[data-filter-scope]');
        var results = document.querySelector('[data-filter-results]');
        if (!scope || !results) {
            return;
        }
        var keywordInput = scope.querySelector('[data-filter-keyword]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var typeSelect = scope.querySelector('[data-filter-type]');
        var reset = scope.querySelector('[data-filter-reset]');
        var empty = document.querySelector('[data-filter-empty]');
        var cards = selectAll('[data-movie-card]', results);

        function apply() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;
                var matchType = !type || card.getAttribute('data-type') === type;
                var show = matchKeyword && matchYear && matchType;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                apply();
            });
        }
    }

    function loadHlsLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback);
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback);
        document.head.appendChild(script);
    }

    function initPlayer(options) {
        var video = document.querySelector(options.videoSelector);
        var button = document.querySelector(options.buttonSelector);
        var status = document.querySelector('[data-player-status]');
        var source = options.source || (button ? button.getAttribute('data-hls-src') : '');
        var hlsInstance = null;
        var attached = false;

        if (!video || !button || !source) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function attachNative() {
            video.src = source;
            attached = true;
            setStatus('播放源已加载，正在开始播放。');
            playVideo();
        }

        function attachWithHls() {
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    attached = true;
                    setStatus('播放源已解析，正在开始播放。');
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus('网络加载异常，正在重试。');
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('媒体解码异常，正在恢复。');
                        hlsInstance.recoverMediaError();
                    } else {
                        setStatus('播放器暂时无法加载该视频源。');
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                attachNative();
            } else {
                setStatus('当前浏览器不支持 HLS 播放。');
            }
        }

        function playVideo() {
            button.classList.add('hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setStatus('播放源已加载，请再次点击播放器开始播放。');
                });
            }
        }

        button.addEventListener('click', function () {
            if (attached) {
                playVideo();
                return;
            }
            setStatus('正在初始化 HLS 播放器。');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                attachNative();
                return;
            }
            loadHlsLibrary(attachWithHls);
        });

        video.addEventListener('click', function () {
            if (!attached) {
                button.click();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    function setupYear() {
        selectAll('[data-current-year]').forEach(function (node) {
            node.textContent = String(new Date().getFullYear());
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupGlobalSearch();
        setupPageSearch();
        setupFilters();
        setupYear();
    });

    window.MovieSite = {
        initPlayer: initPlayer
    };
}());
