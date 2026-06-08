import { H as Hls } from "./hls.js";

var configElement = document.getElementById("player-config");
var video = document.getElementById("movie-player");
var cover = document.querySelector("[data-play-cover]");

if (configElement && video && cover) {
  var config = JSON.parse(configElement.textContent || "{}");
  var streamUrl = config.src || "";
  var attached = false;
  var hlsInstance = null;

  var attach = function () {
    if (attached || !streamUrl) {
      return;
    }

    attached = true;

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    }
  };

  var start = function () {
    attach();
    cover.classList.add("is-hidden");
    video.controls = true;

    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        cover.classList.remove("is-hidden");
      });
    }
  };

  cover.addEventListener("click", start);

  video.addEventListener("click", function () {
    if (!attached) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
