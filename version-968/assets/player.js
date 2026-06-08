function initMoviePlayer(source) {
  var shell = document.querySelector('[data-player-shell]');
  var video = document.querySelector('[data-player-video]');
  var trigger = document.querySelector('[data-player-trigger]');
  if (!shell || !video || !trigger || !source) {
    return;
  }
  var started = false;
  var hlsInstance = null;
  function attach() {
    if (started) {
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }
  function play() {
    attach();
    shell.classList.add('is-playing');
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        shell.classList.remove('is-playing');
      });
    }
  }
  trigger.addEventListener('click', play);
  shell.addEventListener('click', function (event) {
    if (event.target === trigger || trigger.contains(event.target)) {
      return;
    }
    if (!started || video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0) {
      shell.classList.remove('is-playing');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
