(function () {
    var navButton = document.querySelector('.nav-toggle');

    if (navButton) {
        navButton.addEventListener('click', function () {
            var isOpen = document.body.classList.toggle('nav-open');
            navButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });

            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));

    lists.forEach(function (list) {
        var container = list.closest('.section') || document;
        var search = container.querySelector('[data-card-search]');
        var buttons = Array.prototype.slice.call(container.querySelectorAll('[data-quick-filter]'));
        var cards = Array.prototype.slice.call(list.children);
        var quickValue = '';

        function normalize(value) {
            return String(value || '').toLowerCase().replace(/\s+/g, '');
        }

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category'),
                card.textContent
            ].join(' '));
        }

        function apply() {
            var query = normalize(search ? search.value : '');
            var quick = normalize(quickValue);

            cards.forEach(function (card) {
                var text = cardText(card);
                var matched = (!query || text.indexOf(query) !== -1) && (!quick || text.indexOf(quick) !== -1);
                card.classList.toggle('is-hidden-card', !matched);
            });
        }

        if (search) {
            search.addEventListener('input', apply);

            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q');

            if (initial) {
                search.value = initial;
                apply();
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                quickValue = button.getAttribute('data-quick-filter') || '';

                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });

                apply();
            });
        });
    });
})();
