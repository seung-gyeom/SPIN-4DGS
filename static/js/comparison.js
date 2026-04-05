var COMPARISON_SHOWCASE = [
  {
    scene: "Basketball",
    dataset: "CMU Panoptic",
    summary: "Fast player motion and ball tracking",
    note: "Large body motion and rapid ball movement make temporal consistency especially difficult.",
    comparisons: [
      {
        baseline: "Realtime-4DGS",
        baselineSrc: "./static/videos/CMU/basketball/Realtime-4DGS.mp4",
        oursSrc: "./static/videos/CMU/basketball/Ours.mp4"
      },
      {
        baseline: "4DGaussian",
        baselineSrc: "./static/videos/CMU/basketball/4DGaussians.mp4",
        oursSrc: "./static/videos/CMU/basketball/Ours.mp4"
      },
      {
        baseline: "D3DGS",
        baselineSrc: "./static/videos/CMU/basketball/D3DGS.mp4",
        oursSrc: "./static/videos/CMU/basketball/Ours.mp4"
      }
    ]
  },
  {
    scene: "Tennis",
    dataset: "CMU Panoptic",
    summary: "Thin structures and fast swing dynamics",
    note: "Thin structures and fast racket swings expose blur and disappearing-object artifacts.",
    comparisons: [
      {
        baseline: "Realtime-4DGS",
        baselineSrc: "./static/videos/CMU/tennis/Realtime-4DGS.mp4",
        oursSrc: "./static/videos/CMU/tennis/Ours.mp4"
      },
      {
        baseline: "4DGaussian",
        baselineSrc: "./static/videos/CMU/tennis/4DGaussians.mp4",
        oursSrc: "./static/videos/CMU/tennis/Ours.mp4"
      },
      {
        baseline: "D3DGS",
        baselineSrc: "./static/videos/CMU/tennis/D3DGS.mp4",
        oursSrc: "./static/videos/CMU/tennis/Ours.mp4"
      }
    ]
  },
  {
    scene: "Softball",
    dataset: "CMU Panoptic",
    summary: "Large pitching and batting displacement",
    note: "Rapid pitching and batting produce strong inter-frame displacement throughout the sequence.",
    comparisons: [
      {
        baseline: "Realtime-4DGS",
        baselineSrc: "./static/videos/CMU/softball/Realtime-4DGS.mp4",
        oursSrc: "./static/videos/CMU/softball/Ours.mp4"
      },
      {
        baseline: "4DGaussian",
        baselineSrc: "./static/videos/CMU/softball/4DGaussians.mp4",
        oursSrc: "./static/videos/CMU/softball/Ours.mp4"
      },
      {
        baseline: "D3DGS",
        baselineSrc: "./static/videos/CMU/softball/D3DGS.mp4",
        oursSrc: "./static/videos/CMU/softball/Ours.mp4"
      }
    ]
  }
];

var comparisonShowcaseState = {
  activeSceneIndex: 0,
  cleanup: null
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderComparisonTabs() {
  return COMPARISON_SHOWCASE.map(function (scene, index) {
    return [
      '<button class="comparison-tab" type="button" role="tab" aria-selected="false" data-comparison-tab="' + index + '">',
      '  <span class="comparison-tab-label">' + escapeHtml(scene.dataset) + '</span>',
      '  <span class="comparison-tab-title">' + escapeHtml(scene.scene) + '</span>',
      '  <span class="comparison-tab-meta">' + escapeHtml(scene.summary) + '</span>',
      "</button>"
    ].join("");
  }).join("");
}

function renderComparisonScene(scene) {
  return [
    '<section class="comparison-scene-panel">',
    '  <div class="comparison-scene-header">',
    '    <div class="comparison-scene-copy">',
    '      <p class="comparison-scene-kicker">' + escapeHtml(scene.dataset) + "</p>",
    '      <h3 class="title is-4 comparison-scene-title">' + escapeHtml(scene.scene) + "</h3>",
    "    </div>",
    '    <p class="comparison-scene-note">' + escapeHtml(scene.note) + "</p>",
    "  </div>",
    '  <div class="comparison-grid">',
    scene.comparisons.map(function (item) {
      return [
        '    <article class="comparison-item">',
        '      <div class="comparison-card">',
        '        <div class="comparison-container" aria-label="' + escapeHtml(scene.scene + " comparison between SPIN-4DGS and " + item.baseline) + '">',
        '          <div class="comparison-image baseline-image">',
        '            <video class="comparison-video baseline-video" muted playsinline webkit-playsinline loop preload="none">',
        '              <source data-src="' + escapeHtml(item.baselineSrc) + '" type="video/mp4">',
        "            </video>",
        "          </div>",
        '          <div class="comparison-image ours-image">',
        '            <video class="comparison-video ours-video" muted playsinline webkit-playsinline loop preload="none">',
        '              <source data-src="' + escapeHtml(item.oursSrc) + '" type="video/mp4">',
        "            </video>",
        "          </div>",
        '          <div class="comparison-overlay comparison-overlay-left">SPIN-4DGS</div>',
        '          <div class="comparison-overlay comparison-overlay-right">' + escapeHtml(item.baseline) + "</div>",
        '          <div class="comparison-slider"></div>',
        "        </div>",
        "      </div>",
        "    </article>"
      ].join("");
    }).join(""),
    "  </div>",
    "</section>"
  ].join("");
}

function unloadVideo(video) {
  if (!video) {
    return;
  }

  try {
    video.pause();
  } catch (error) {}

  var source = video.querySelector("source[data-src]");
  if (source) {
    source.removeAttribute("src");
  }

  video.removeAttribute("src");
  delete video.dataset.sourceLoaded;

  try {
    video.load();
  } catch (error) {}
}

function mountComparisonInteractions(root) {
  var containers = Array.prototype.slice.call(root.querySelectorAll(".comparison-container"));
  if (!containers.length) {
    return function () {};
  }

  var allVideos = [];
  var listeners = [];
  function addListener(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    listeners.push({ target: target, type: type, handler: handler, options: options });
  }

  function pausePair(v1, v2) {
    if (v1 && !v1.paused) v1.pause();
    if (v2 && !v2.paused) v2.pause();
  }

  function syncPair(v1, v2) {
    if (!v1 || !v2 || v1.readyState < 2 || v2.readyState < 2) {
      return;
    }

    if (Math.abs(v1.currentTime - v2.currentTime) <= 0.08) {
      return;
    }

    var targetTime = Math.min(v1.currentTime, v2.currentTime);

    try {
      v1.currentTime = targetTime;
      v2.currentTime = targetTime;
    } catch (error) {}
  }

  function tryPlayPair(v1, v2) {
    syncPair(v1, v2);
    if (v1) v1.play().catch(function () {});
    if (v2) v2.play().catch(function () {});
  }

  function isPairPaused(v1, v2) {
    var p1 = !v1 || v1.paused;
    var p2 = !v2 || v2.paused;
    return p1 && p2;
  }

  function loadVideo(video) {
    if (!video || video.dataset.sourceLoaded === "true") {
      return;
    }

    var source = video.querySelector("source[data-src]");
    if (!source) {
      video.dataset.sourceLoaded = "true";
      return;
    }

    source.src = source.dataset.src;
    video.load();
    video.dataset.sourceLoaded = "true";
  }

  function loadPairSources(container) {
    loadVideo(container.querySelector(".baseline-video"));
    loadVideo(container.querySelector(".ours-video"));
  }

  function clearUnloadTimer(container) {
    if (!container || !container._comparisonUnloadTimer) {
      return;
    }

    window.clearTimeout(container._comparisonUnloadTimer);
    container._comparisonUnloadTimer = null;
  }

  function schedulePairUnload(container) {
    if (!container) {
      return;
    }

    clearUnloadTimer(container);

    container._comparisonUnloadTimer = window.setTimeout(function () {
      if (container.dataset.inView === "true") {
        return;
      }

      unloadVideo(container.querySelector(".baseline-video"));
      unloadVideo(container.querySelector(".ours-video"));
      container._comparisonUnloadTimer = null;
    }, 1800);
  }

  var preloadObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) {
        return;
      }

      loadPairSources(entry.target);
      preloadObserver.unobserve(entry.target);
    });
  }, { rootMargin: "160px 0px" });

  var playbackObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var container = entry.target;
      var baselineVideo = container.querySelector(".baseline-video");
      var oursVideo = container.querySelector(".ours-video");

      if (!baselineVideo || !oursVideo) {
        return;
      }

      if (entry.isIntersecting && !document.hidden) {
        clearUnloadTimer(container);
        container.dataset.inView = "true";
        loadPairSources(container);

        if (container.dataset.userPaused === "true") {
          pausePair(baselineVideo, oursVideo);
          return;
        }

        tryPlayPair(baselineVideo, oursVideo);
      } else {
        container.dataset.inView = "false";
        pausePair(baselineVideo, oursVideo);
        schedulePairUnload(container);
      }
    });
  }, { threshold: 0.4 });

  containers.forEach(function (container) {
    container.dataset.userPaused = "false";
    container.dataset.inView = "false";

    var isDragging = false;
    var dragMoved = false;
    var dragStartX = 0;
    var oursLayer = container.querySelector(".ours-image");
    var slider = container.querySelector(".comparison-slider");
    var oursVideo = container.querySelector(".ours-video");
    var baselineVideo = container.querySelector(".baseline-video");

    function updateByClientX(clientX) {
      var rect = container.getBoundingClientRect();
      var x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      var percentage = (x / rect.width) * 100;

      oursLayer.style.clipPath = "polygon(0 0, " + percentage + "% 0, " + percentage + "% 100%, 0 100%)";
      slider.style.left = percentage + "%";
    }

    function stopDragging(pointerId) {
      isDragging = false;

      if (
        typeof pointerId === "number" &&
        container.hasPointerCapture &&
        container.hasPointerCapture(pointerId)
      ) {
        container.releasePointerCapture(pointerId);
      }
    }

    function handlePointerDown(event) {
      isDragging = true;
      dragMoved = false;
      dragStartX = event.clientX;

      if (container.setPointerCapture) {
        container.setPointerCapture(event.pointerId);
      }

      updateByClientX(event.clientX);
    }

    function handlePointerMove(event) {
      if (!isDragging) {
        return;
      }

      if (Math.abs(event.clientX - dragStartX) > 3) {
        dragMoved = true;
      }

      updateByClientX(event.clientX);
    }

    function handlePointerUp(event) {
      stopDragging(event.pointerId);
    }

    function handleClick() {
      if (dragMoved) {
        dragMoved = false;
        return;
      }

      loadPairSources(container);

      if (isPairPaused(baselineVideo, oursVideo)) {
        container.dataset.userPaused = "false";
        tryPlayPair(baselineVideo, oursVideo);
      } else {
        container.dataset.userPaused = "true";
        pausePair(baselineVideo, oursVideo);
      }
    }

    function handleLoadedData() {
      if (
        container.dataset.inView === "true" &&
        container.dataset.userPaused !== "true" &&
        !document.hidden
      ) {
        tryPlayPair(baselineVideo, oursVideo);
      }
    }

    if (baselineVideo && oursVideo) {
      baselineVideo.muted = true;
      oursVideo.muted = true;
      allVideos.push(baselineVideo, oursVideo);

      addListener(baselineVideo, "loadeddata", handleLoadedData);
      addListener(oursVideo, "loadeddata", handleLoadedData);
    }

    oursLayer.style.clipPath = "polygon(0 0, 50% 0, 50% 100%, 0 100%)";
    slider.style.left = "50%";

    addListener(container, "pointerdown", handlePointerDown);
    addListener(container, "pointermove", handlePointerMove);
    addListener(container, "pointerup", handlePointerUp);
    addListener(container, "pointercancel", handlePointerUp);
    addListener(container, "click", handleClick);

    preloadObserver.observe(container);
    playbackObserver.observe(container);
  });

  function handleVisibilityChange() {
    if (document.hidden) {
      allVideos.forEach(function (video) {
        if (!video.paused) video.pause();
      });
      return;
    }

    containers.forEach(function (container) {
      if (container.dataset.inView !== "true" || container.dataset.userPaused === "true") {
        return;
      }

      var baselineVideo = container.querySelector(".baseline-video");
      var oursVideo = container.querySelector(".ours-video");
      loadPairSources(container);
      tryPlayPair(baselineVideo, oursVideo);
    });
  }

  addListener(document, "visibilitychange", handleVisibilityChange);

  return function cleanup() {
    preloadObserver.disconnect();
    playbackObserver.disconnect();
    containers.forEach(clearUnloadTimer);

    listeners.forEach(function (entry) {
      entry.target.removeEventListener(entry.type, entry.handler, entry.options);
    });

    allVideos.forEach(unloadVideo);
  };
}

function setActiveComparisonScene(index) {
  var mountPoint = document.querySelector("[data-comparison-showcase]");
  if (!mountPoint) {
    return;
  }

  var stage = mountPoint.querySelector("[data-comparison-stage]");
  if (!stage || !COMPARISON_SHOWCASE[index]) {
    return;
  }

  if (comparisonShowcaseState.cleanup) {
    comparisonShowcaseState.cleanup();
    comparisonShowcaseState.cleanup = null;
  }

  comparisonShowcaseState.activeSceneIndex = index;

  mountPoint.querySelectorAll("[data-comparison-tab]").forEach(function (button) {
    var isActive = Number(button.dataset.comparisonTab) === index;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  stage.innerHTML = renderComparisonScene(COMPARISON_SHOWCASE[index]);
  comparisonShowcaseState.cleanup = mountComparisonInteractions(stage);
}

function renderComparisonShowcase() {
  var mountPoint = document.querySelector("[data-comparison-showcase]");
  if (!mountPoint) {
    return;
  }

  if (mountPoint.dataset.rendered !== "true") {
    mountPoint.dataset.rendered = "true";
    mountPoint.innerHTML = [
      '<div class="comparison-toolbar" role="tablist" aria-label="Comparison scenes">',
      renderComparisonTabs(),
      "</div>",
      '<div class="comparison-stage" role="tabpanel" data-comparison-stage></div>'
    ].join("");

    mountPoint.addEventListener("click", function (event) {
      var button = event.target.closest("[data-comparison-tab]");
      if (!button) {
        return;
      }

      setActiveComparisonScene(Number(button.dataset.comparisonTab));
    });
  }

  setActiveComparisonScene(comparisonShowcaseState.activeSceneIndex);
}

function initializeComparisons() {
  renderComparisonShowcase();
}
