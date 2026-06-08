(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mainNav = document.querySelector("[data-main-nav]");

    if (menuButton && mainNav) {
        menuButton.addEventListener("click", function () {
            mainNav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let current = 0;
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        startTimer();
    }

    const searchBox = document.querySelector("[data-search-box]");
    const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    let activeFilter = "all";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        const query = normalize(searchBox ? searchBox.value : "");
        cards.forEach(function (card) {
            const text = normalize(card.getAttribute("data-search"));
            const category = card.getAttribute("data-category") || "";
            const matchText = !query || text.indexOf(query) !== -1;
            const matchCategory = activeFilter === "all" || category === activeFilter;
            card.classList.toggle("is-hidden", !(matchText && matchCategory));
        });
    }

    if (searchBox && cards.length) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        if (q) {
            searchBox.value = q;
        }
        searchBox.addEventListener("input", applyFilters);
        applyFilters();
    }

    if (filterButtons.length && cards.length) {
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "all";
                filterButtons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilters();
            });
        });
    }
}());
