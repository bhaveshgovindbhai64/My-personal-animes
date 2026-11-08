/**
 * ANIMEVERSE — Cinematic Video Scrollytelling Choreography (GSAP + ScrollTrigger)
 * Synchronizes the user-provided PixVerse video featuring Eren Yeager and Thorfinn
 * frame-by-frame with user scroll position.
 */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.error("GSAP or ScrollTrigger not loaded.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Initialize Canvas Particle Engine
  const particleEngine = new ParticleEngine("cinematic-particles");

  // DOM Elements
  const pinnedSection = document.getElementById("cinematic-pinned");
  const scrollWrapper = document.getElementById("cinematic-experience");
  const cameraViewport = document.getElementById("camera-viewport");
  const video = document.getElementById("cinematic-video");

  // Atmospheric Layers & FX
  const crimsonGlow = document.getElementById("crimson-glow");
  const dawnOverlay = document.getElementById("dawn-overlay");
  const transformAtmosphere = document.getElementById("transform-atmosphere");
  const handshakeSpark = document.getElementById("handshake-spark");
  const handshakeShockwave = document.getElementById("handshake-shockwave");

  // Text Scenes
  const quoteDarkness = document.getElementById("quote-darkness");
  const quoteLight = document.getElementById("quote-light");
  const quoteHandshake = document.getElementById("quote-handshake");
  const quoteTransform = document.getElementById("quote-transform");
  const scrollIndicator = document.getElementById("scroll-indicator");

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    if (video) {
      video.currentTime = 3.0;
      video.pause();
    }
    if (quoteHandshake) quoteHandshake.style.opacity = "1";
    if (quoteTransform) quoteTransform.style.opacity = "1";
    if (transformAtmosphere) transformAtmosphere.style.opacity = "0.7";
    return;
  }

  // Smooth Video Seeking Controller via requestAnimationFrame
  let targetTime = 0.001;
  let isSeeking = false;
  let seekTimeout = null;
  let videoDuration = 5.0; // Duration from video metadata (default ~5s)

  const performSeek = () => {
    if (!video || video.readyState < 1) return;
    if (isSeeking) return;

    const diff = Math.abs(targetTime - video.currentTime);
    if (diff > 0.02) {
      isSeeking = true;
      try {
        video.currentTime = targetTime;
      } catch (err) {
        isSeeking = false;
      }

      clearTimeout(seekTimeout);
      seekTimeout = setTimeout(() => {
        isSeeking = false;
      }, 80);
    }
  };

  const onSeeked = () => {
    isSeeking = false;
    clearTimeout(seekTimeout);
    const diff = Math.abs(targetTime - video.currentTime);
    if (diff > 0.02) {
      performSeek();
    }
  };

  if (video) {
    video.addEventListener("seeked", onSeeked);

    video.addEventListener("error", (e) => {
      console.warn("Video loading error:", e);
    });

    // Ensure video is muted and paused for scroll scrub control
    video.muted = true;
    video.pause();

    // Render first frame immediately
    const onReady = () => {
      try {
        video.currentTime = 0.001;
      } catch (e) {}
    };

    if (video.readyState >= 1) {
      onReady();
    } else {
      video.addEventListener("loadedmetadata", onReady, { once: true });
    }
  }

  let masterTL_initialized = false;

  // Initialize Timeline after Video Metadata is Available
  const initTimeline = () => {
    if (masterTL_initialized) return;
    masterTL_initialized = true;

    if (video && video.duration && !isNaN(video.duration) && video.duration > 0) {
      videoDuration = video.duration;
    }

    // Continuous RAF loop for responsive frame-seeking
    const rafLoop = () => {
      performSeek();
      requestAnimationFrame(rafLoop);
    };
    requestAnimationFrame(rafLoop);

    // Master Timeline tied to ScrollTrigger (300vh scrub space)
    const masterTL = gsap.timeline({
      scrollTrigger: {
        trigger: scrollWrapper,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        pin: pinnedSection,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;

          // Target video playback time mapped directly to scroll progress
          targetTime = Math.max(0.001, Math.min(progress * (videoDuration - 0.02), videoDuration - 0.02));
          performSeek();

          // Update Particle Engine
          if (particleEngine) {
            particleEngine.setScrollProgress(progress);
          }

          // Update Procedural Audio Tone
          if (window.cinematicAudio) {
            window.cinematicAudio.updateScrollTone(progress);
          }

          // Handshake trigger detection around progress 0.50 - 0.74
          if (progress >= 0.50 && progress <= 0.74) {
            if (!pinnedSection.classList.contains("handshake-active")) {
              pinnedSection.classList.add("handshake-active");
              if (particleEngine) {
                const rect = handshakeSpark ? handshakeSpark.getBoundingClientRect() : null;
                const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
                const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
                particleEngine.triggerHandshakeBurst(cx, cy);
              }
              if (window.cinematicAudio) {
                window.cinematicAudio.triggerImpact();
              }
            }
          } else {
            pinnedSection.classList.remove("handshake-active");
          }
        }
      }
    });

    // ==========================================
    // SCENE 1: THE WORLD OF DARKNESS (0.0 -> 0.24)
    // ==========================================
    masterTL.to(scrollIndicator, { opacity: 0, y: -20, duration: 0.08, ease: "power1.out" }, 0.02);

    masterTL.to(crimsonGlow, {
      opacity: 0.85,
      duration: 0.20,
      ease: "power1.inOut"
    }, 0);

    masterTL.to(quoteDarkness, {
      opacity: 1,
      y: 0,
      duration: 0.09,
      ease: "power2.out"
    }, 0.02);

    masterTL.to(quoteDarkness, {
      opacity: 0,
      y: -35,
      duration: 0.09,
      ease: "power2.in"
    }, 0.17);

    // ==========================================
    // SCENE 2: THE ARRIVAL OF LIGHT (0.24 -> 0.48)
    // ==========================================
    masterTL.to(dawnOverlay, {
      opacity: 0.85,
      duration: 0.20,
      ease: "power1.inOut"
    }, 0.24);

    masterTL.to(quoteLight, {
      opacity: 1,
      y: 0,
      duration: 0.09,
      ease: "power2.out"
    }, 0.26);

    masterTL.to(quoteLight, {
      opacity: 0,
      y: -35,
      duration: 0.09,
      ease: "power2.in"
    }, 0.42);

    // ==========================================
    // SCENE 3: THE MEETING & HANDSHAKE (0.48 -> 0.76)
    // ==========================================
    // Camera gently tracks forward towards joined hands
    masterTL.to(cameraViewport, {
      scale: 1.05,
      duration: 0.24,
      ease: "sine.inOut"
    }, 0.48);

    // Flash collision spark & shockwave at contact
    masterTL.fromTo(handshakeSpark, {
      opacity: 0,
      scale: 0.3
    }, {
      opacity: 1,
      scale: 1.8,
      duration: 0.08,
      ease: "power2.out"
    }, 0.50);

    masterTL.to(handshakeSpark, {
      opacity: 0.4,
      scale: 1.2,
      duration: 0.10,
      ease: "power1.in"
    }, 0.60);

    masterTL.fromTo(handshakeShockwave, {
      opacity: 0.9,
      scale: 0.2
    }, {
      opacity: 0,
      scale: 3.0,
      duration: 0.12,
      ease: "power1.out"
    }, 0.50);

    // Reveal Monumental Quote: "I HAVE NO ENEMIES."
    masterTL.to(quoteHandshake, {
      opacity: 1,
      y: 0,
      duration: 0.10,
      ease: "power2.out"
    }, 0.52);

    // Hold quote through 0.74
    masterTL.to(quoteHandshake, {
      opacity: 0,
      y: -25,
      duration: 0.08,
      ease: "power2.in"
    }, 0.74);

    // ==========================================
    // SCENE 4: THE WORLD TRANSFORMS (0.76 -> 1.0)
    // ==========================================
    masterTL.to(transformAtmosphere, {
      opacity: 1,
      duration: 0.20,
      ease: "power2.inOut"
    }, 0.76);

    masterTL.to(cameraViewport, {
      scale: 1.0,
      duration: 0.18,
      ease: "sine.out"
    }, 0.78);

    masterTL.to(quoteTransform, {
      opacity: 1,
      y: 0,
      duration: 0.15,
      ease: "power2.out"
    }, 0.82);

    // Smooth scroll for CTA button
    const exploreBtn = document.getElementById("explore-btn");
    if (exploreBtn) {
      exploreBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById("collection-section");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  };

  // Check if video metadata is already loaded or wait for it
  if (video) {
    if (video.readyState >= 1) {
      initTimeline();
    } else {
      video.addEventListener("loadedmetadata", initTimeline, { once: true });
      setTimeout(() => {
        if (!masterTL_initialized) {
          initTimeline();
        }
      }, 500);
    }
  } else {
    initTimeline();
  }

  window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
  }, { passive: true });
});
