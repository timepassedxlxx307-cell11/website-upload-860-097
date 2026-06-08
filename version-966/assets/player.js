function initMoviePlayer(source) {
    var video = document.getElementById('main-video');
    var cover = document.getElementById('player-cover');
    var ready = false;
    var hlsInstance = null;

    if (!video || !cover || !source) {
        return;
    }

    function hideCover() {
        cover.classList.add('is-hidden');
    }

    function playVideo() {
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
        }
    }

    function start() {
        hideCover();

        if (!ready) {
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
            } else {
                video.src = source;
            }
        }

        playVideo();
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (!ready) {
            start();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
