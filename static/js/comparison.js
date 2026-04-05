// ===== Comparison Slider Functionality =====
function initializeComparisons() {
  if (window.__comparisonGlobalInitialized) {
    return;
  }
  window.__comparisonGlobalInitialized = true;

  var allVideos = [];

  function pausePair(v1, v2) {
    if (v1 && !v1.paused) v1.pause();
    if (v2 && !v2.paused) v2.pause();
  }

  function tryPlayPair(v1, v2) {
    if (v1) v1.play().catch(function () {});
    if (v2) v2.play().catch(function () {});
  }

  function isPairPaused(v1, v2) {
    var p1 = !v1 || v1.paused;
    var p2 = !v2 || v2.paused;
    return p1 && p2;
  }

  document.querySelectorAll('.comparison-container').forEach(function (container) {
    if (container.dataset.comparisonInit === 'true') {
      return;
    }
    container.dataset.comparisonInit = 'true';

    var isDragging = false;
    var dragMoved = false;
    var userPaused = false;
    var oursLayer = container.querySelector('.ours-image');
    var slider = container.querySelector('.comparison-slider');
    var oursVideo = container.querySelector('.ours-video');
    var baselineVideo = container.querySelector('.baseline-video');
    container.dataset.userPaused = 'false';

    function updateByClientX(clientX) {
      var rect = container.getBoundingClientRect();
      var x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      var percentage = (x / rect.width) * 100;

      oursLayer.style.clipPath = 'polygon(0 0, ' + percentage + '% 0, ' + percentage + '% 100%, 0 100%)';
      slider.style.left = percentage + '%';
    }

    container.addEventListener('mousedown', function (e) {
      isDragging = true;
      dragMoved = false;
      updateByClientX(e.clientX);
    });

    container.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      dragMoved = true;
      updateByClientX(e.clientX);
    });

    window.addEventListener('mouseup', function () {
      isDragging = false;
    });

    container.addEventListener('mouseleave', function () {
      isDragging = false;
    });

    container.addEventListener('touchstart', function (e) {
      isDragging = true;
      dragMoved = false;
      updateByClientX(e.touches[0].clientX);
    }, { passive: true });

    container.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      dragMoved = true;
      updateByClientX(e.touches[0].clientX);
    }, { passive: true });

    container.addEventListener('touchend', function () {
      if (baselineVideo && oursVideo && !dragMoved) {
        if (isPairPaused(baselineVideo, oursVideo)) {
          userPaused = false;
          container.dataset.userPaused = 'false';
          tryPlayPair(baselineVideo, oursVideo);
        } else {
          userPaused = true;
          container.dataset.userPaused = 'true';
          pausePair(baselineVideo, oursVideo);
        }
      }
      isDragging = false;
      dragMoved = false;
    });

    if (baselineVideo && oursVideo) {
      baselineVideo.muted = true;
      oursVideo.muted = true;
      baselineVideo.preload = 'metadata';
      oursVideo.preload = 'metadata';

      allVideos.push(baselineVideo, oursVideo);

      baselineVideo.addEventListener('loadeddata', function () {
        if (!document.hidden && !userPaused) {
          tryPlayPair(baselineVideo, oursVideo);
        }
      });

      oursVideo.addEventListener('loadeddata', function () {
        if (!document.hidden && !userPaused) {
          tryPlayPair(baselineVideo, oursVideo);
        }
      });

      container.addEventListener('click', function () {
        if (dragMoved) {
          dragMoved = false;
          return;
        }

        if (isPairPaused(baselineVideo, oursVideo)) {
          userPaused = false;
          container.dataset.userPaused = 'false';
          tryPlayPair(baselineVideo, oursVideo);
        } else {
          userPaused = true;
          container.dataset.userPaused = 'true';
          pausePair(baselineVideo, oursVideo);
        }
      });

      tryPlayPair(baselineVideo, oursVideo);
    }

    oursLayer.style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)';
    slider.style.left = '50%';
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var container = entry.target;
      var baselineVideo = container.querySelector('.baseline-video');
      var oursVideo = container.querySelector('.ours-video');

      if (!baselineVideo || !oursVideo) {
        return;
      }

      if (entry.isIntersecting && !document.hidden) {
        if (container.dataset.userPaused === 'true') {
          pausePair(baselineVideo, oursVideo);
          return;
        }
        tryPlayPair(baselineVideo, oursVideo);
      } else {
        pausePair(baselineVideo, oursVideo);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.comparison-container').forEach(function (container) {
    observer.observe(container);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      allVideos.forEach(function (video) {
        if (!video.paused) video.pause();
      });
      return;
    }

    document.querySelectorAll('.comparison-container').forEach(function (container) {
      var rect = container.getBoundingClientRect();
      var inView = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!inView) return;

      var baselineVideo = container.querySelector('.baseline-video');
      var oursVideo = container.querySelector('.ours-video');
      if (container.dataset.userPaused === 'true') return;
      tryPlayPair(baselineVideo, oursVideo);
    });
  });
}
