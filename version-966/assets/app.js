(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-main-nav]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function attachGlobalSearch(input) {
        var panel = input.closest('.search-panel');
        var results = panel ? panel.querySelector('[data-search-results]') : null;

        if (!results || typeof searchItems === 'undefined') {
            return;
        }

        input.addEventListener('input', function () {
            var keyword = normalize(input.value);
            results.innerHTML = '';

            if (!keyword) {
                results.classList.remove('is-open');
                return;
            }

            var matches = searchItems.filter(function (item) {
                return normalize(item.title + item.region + item.year + item.genre + item.tags).indexOf(keyword) !== -1;
            }).slice(0, 12);

            if (!matches.length) {
                var empty = document.createElement('span');
                empty.textContent = '暂无匹配影片';
                results.appendChild(empty);
                results.classList.add('is-open');
                return;
            }

            matches.forEach(function (item) {
                var link = document.createElement('a');
                var title = document.createElement('strong');
                var meta = document.createElement('em');
                title.textContent = item.title;
                meta.textContent = item.region + ' · ' + item.year + ' · ' + item.genre;
                link.href = item.link;
                link.appendChild(title);
                link.appendChild(meta);
                results.appendChild(link);
            });

            results.classList.add('is-open');
        });

        document.addEventListener('click', function (event) {
            if (!panel.contains(event.target)) {
                results.classList.remove('is-open');
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-global-search]')).forEach(attachGlobalSearch);

    Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]')).forEach(function (input) {
        var scope = input.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));

        input.addEventListener('input', function () {
            var keyword = normalize(input.value);
            cards.forEach(function (card) {
                var haystack = normalize((card.getAttribute('data-title') || '') + (card.getAttribute('data-meta') || ''));
                card.hidden = keyword && haystack.indexOf(keyword) === -1;
            });
        });
    });
}());
