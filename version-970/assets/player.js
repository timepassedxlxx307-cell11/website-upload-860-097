var SitePlayer = (function () {
    function init(streamUrl) {
        var video = document.getElementById('movieVideo');
        var overlay = document.getElementById('playOverlay');
        var loaded = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function bindStream() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function playVideo() {
            bindStream();

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var action = video.play();

            if (action && typeof action.catch === 'function') {
                action.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (video.currentTime === 0 && overlay) {
                overlay.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    return {
        init: init
    };
})();
