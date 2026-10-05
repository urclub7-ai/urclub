document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const enterOverlay = document.getElementById("enter-overlay");
  const bgVideo = document.getElementById("bg-video");
  const bgCanvas = document.getElementById("bg-canvas");
  const bgCanvasCtx = bgCanvas ? bgCanvas.getContext("2d") : null;
  const videoSource = document.getElementById("video-source");
  const bgDotMatrix = document.getElementById("bg-dot-matrix");
  const socialsRow = document.getElementById("socials-row");

  const profileAvatar = document.getElementById("profile-avatar");
  const nameText = document.getElementById("name-text");
  const profileSubtitle = document.getElementById("profile-subtitle");
  const presenceHandle = document.getElementById("presence-handle");
  const presenceStatus = document.getElementById("presence-status");
  const presenceMiniAvatar = document.getElementById("presence-mini-avatar");
  const presenceStatusRing = document.getElementById("presence-status-ring");
  const viewsCount = document.getElementById("views-count");
  const viewsPill = document.querySelector(".views-pill");

  const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a855f7'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

  // Read Profile Slug from URL Query (Default to "main" for the root website!)
  const urlParams = new URLSearchParams(window.location.search);
  const userSlug = urlParams.get("u") || "main";
  const isPreview = urlParams.get("preview") === "1";

  // Render Views Number with Animated Rolling Effect
  function renderViews(countStr, animateFrom) {
    if (!viewsCount) return;
    if (animateFrom && animateFrom !== countStr) {
      viewsCount.innerHTML = `<span class="views-digit-box rolling">${countStr}</span>`;
      if (viewsPill) {
        viewsPill.classList.remove("pulse");
        void viewsPill.offsetWidth;
        viewsPill.classList.add("pulse");
      }
    } else {
      viewsCount.innerHTML = `<span class="views-digit-box">${countStr}</span>`;
    }
  }

  let currentActiveProfile = null;

  // Reactive Profile Renderer
  function renderProfile(profile) {
    if (!profile) return;
    currentActiveProfile = profile;
    document.title = (userSlug === "main") ? "urclub" : (profile.name ? `${profile.name} • urclub` : "urclub");

    // 1. Text & Titles
    if (nameText) nameText.textContent = profile.name || "LEVI";
    if (profileSubtitle) {
      profileSubtitle.textContent = profile.subtitle || "";
      profileSubtitle.style.display = profile.subtitle ? "block" : "none";
    }
    renderViews(profile.views || "0");

    // Sparkles Toggle
    const sparkles = document.querySelectorAll(".sparkle");
    sparkles.forEach((s) => {
      s.style.display = (profile.showSparkles === false) ? "none" : "inline-block";
    });

    // Dot Matrix Toggle
    if (bgDotMatrix) {
      bgDotMatrix.style.display = (profile.showDotMatrix === false) ? "none" : "block";
    }

    // 2. Avatars (Main & Presence Mini)
    const mainImg = profile.mainAvatar && profile.mainAvatar.trim() ? profile.mainAvatar : DEFAULT_AVATAR;
    const presenceImg = profile.presenceAvatar && profile.presenceAvatar.trim() ? profile.presenceAvatar : mainImg;

    if (profileAvatar) profileAvatar.src = mainImg;
    if (presenceMiniAvatar) presenceMiniAvatar.src = presenceImg;

    // 3. Presence Widget
    if (profile.presence) {
      if (presenceHandle) presenceHandle.textContent = profile.presence.handle || profile.username || "user";
      if (presenceStatus) presenceStatus.textContent = profile.presence.status || "online";
      if (presenceStatusRing) {
        presenceStatusRing.style.backgroundColor = profile.presence.statusColor || "#22c55e";
      }
    } else {
      if (presenceHandle) presenceHandle.textContent = profile.username || "user";
      if (presenceStatus) presenceStatus.textContent = "online";
    }

    // 4. Background Video (Smart Device Selection: PC vs Mobile)
    const isMobileDevice = (window.innerWidth <= 768) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const rawMobileVideo = (profile.mobileBackgroundVideo && profile.mobileBackgroundVideo.trim()) || "";
    const rawDesktopVideo = (profile.backgroundVideo && profile.backgroundVideo.trim()) || "";

    const primaryVideoUrl = isMobileDevice
      ? (rawMobileVideo || rawDesktopVideo)
      : (rawDesktopVideo || rawMobileVideo);

    const fallbackVideoUrl = isMobileDevice ? rawDesktopVideo : rawMobileVideo;

    function toPlayableUrl(url) {
      if (!url) return "";
      if (url.startsWith("data:video")) {
        try {
          const parts = url.split(",");
          const mime = parts[0].match(/:(.*?);/)?.[1] || "video/mp4";
          const byteCharacters = atob(parts[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mime });
          return URL.createObjectURL(blob);
        } catch (e) {
          console.warn("Blob conversion error:", e);
        }
      }
      return url;
    }

    if (bgVideo) {
      if (primaryVideoUrl) {
        let currentTargetUrl = primaryVideoUrl;
        let triedFallback = false;

        const applySource = (srcUrl) => {
          currentTargetUrl = srcUrl;
          bgVideo.dataset.rawSrc = srcUrl;
          bgVideo.muted = true;
          bgVideo.defaultMuted = true;
          bgVideo.playsInline = true;
          bgVideo.crossOrigin = "anonymous";
          bgVideo.setAttribute('playsinline', '');
          bgVideo.setAttribute('webkit-playsinline', '');
          bgVideo.setAttribute('x5-playsinline', '');
          bgVideo.setAttribute('crossorigin', 'anonymous');
          bgVideo.autoplay = true;
          bgVideo.loop = true;
          bgVideo.src = toPlayableUrl(srcUrl);
          bgVideo.load();

          const initPlay = bgVideo.play();
          if (initPlay !== undefined) {
            initPlay.then(() => {
              bgVideo.classList.add("playing");
            }).catch((err) => {
              console.log("Waiting for user tap to unmute/play:", err);
            });
          }
        };

        bgVideo.onplaying = () => {
          bgVideo.classList.add("playing");
        };

        // Seamless zero-gap looping engine
        if (!bgVideo.dataset.loopSetup) {
          bgVideo.dataset.loopSetup = "true";
          let isLoopSeeking = false;

          bgVideo.addEventListener("timeupdate", () => {
            // 1. Constantly capture video frames to the background canvas so screen NEVER flashes black or blue
            if (bgCanvasCtx && bgVideo.videoWidth > 0 && bgVideo.currentTime > 0.2) {
              if (bgCanvas.width !== bgVideo.videoWidth || bgCanvas.height !== bgVideo.videoHeight) {
                bgCanvas.width = bgVideo.videoWidth;
                bgCanvas.height = bgVideo.videoHeight;
              }
              try {
                bgCanvasCtx.drawImage(bgVideo, 0, 0, bgCanvas.width, bgCanvas.height);
              } catch (e) {}
            }

            // 2. Pre-roll loop ~0.15s before EOF to prevent mobile Safari decoder pipeline flush and pause
            if (bgVideo.duration && bgVideo.currentTime >= (bgVideo.duration - 0.2)) {
              if (!isLoopSeeking) {
                isLoopSeeking = true;
                bgVideo.currentTime = 0;
                const p = bgVideo.play();
                if (p !== undefined) p.catch(() => {});
                setTimeout(() => {
                  isLoopSeeking = false;
                }, 350);
              }
            }
          });

          // Fallback if ended event triggers
          bgVideo.addEventListener("ended", () => {
            bgVideo.currentTime = 0;
            const p = bgVideo.play();
            if (p !== undefined) p.catch(() => {});
          });
        }

        bgVideo.onerror = () => {
          console.warn("Video failed:", currentTargetUrl);
          if (!triedFallback && fallbackVideoUrl && fallbackVideoUrl !== currentTargetUrl) {
            console.log("Switching to fallback video:", fallbackVideoUrl);
            triedFallback = true;
            applySource(fallbackVideoUrl);
          }
        };

        if (bgVideo.dataset.rawSrc !== primaryVideoUrl) {
          applySource(primaryVideoUrl);
        }
      } else {
        bgVideo.classList.remove("playing");
        bgVideo.removeAttribute("src");
        bgVideo.load();
      }
    }

    // 5. Render Only Configured Social Media Icons
    if (socialsRow) {
      socialsRow.innerHTML = "";
      
      if (typeof SOCIAL_CATALOG !== "undefined" && profile.socials) {
        SOCIAL_CATALOG.forEach((cat) => {
          const link = profile.socials[cat.id];
          if (link && link.trim() !== "") {
            const a = document.createElement("a");
            a.href = link;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.className = "social-icon-btn";
            a.title = cat.name;
            a.innerHTML = `<i class="${cat.icon}"></i>`;
            socialsRow.appendChild(a);
          }
        });
      }
    }
  }

  const enterText = document.getElementById("enter-text");

  // Customize prompt for mobile/touch screens: "tap" instead of "click"
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
  if (isTouchDevice && enterText) {
    enterText.textContent = "[ tap anywhere to enter ]";
  }

  // Handle Preview Mode vs Full Page Click/Tap to Enter
  let isUnlocked = false;
  function unlockBio() {
    if (isUnlocked) return;
    isUnlocked = true;

    if (enterOverlay) {
      enterOverlay.classList.add("hidden");
    }

    if (bgVideo && bgVideo.src) {
      bgVideo.muted = false;
      bgVideo.volume = 0.8;
      const playPromise = bgVideo.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          bgVideo.classList.add("playing");
        }).catch((err) => {
          console.warn("Unmuted autoplay restricted on mobile, keeping muted playback:", err);
          bgVideo.muted = true;
          bgVideo.play().then(() => {
            bgVideo.classList.add("playing");
          }).catch(() => {});
        });
      }
    }
  }

  if (isPreview) {
    if (enterOverlay) enterOverlay.classList.add("hidden");
    if (bgVideo && bgVideo.src) {
      bgVideo.muted = true;
      bgVideo.play().then(() => bgVideo.classList.add("playing")).catch(() => {});
    }
  } else {
    if (enterOverlay) {
      enterOverlay.addEventListener("click", unlockBio);
      enterOverlay.addEventListener("touchend", unlockBio);
    }
    document.addEventListener("click", unlockBio, { once: true });
    document.addEventListener("touchend", unlockBio, { once: true });
  }

  // Initial Load from Supabase Cloud Database
  async function loadAndRender() {
    // Instant cache pre-render: Never flicker '0' while waiting for network
    try {
      const cached = localStorage.getItem("urclub_cached_profile_" + userSlug);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed) renderProfile(parsed);
      }
    } catch (e) {}

    try {
      const currentProfile = (typeof ProfileStore !== "undefined")
        ? await ProfileStore.getProfileAsync(userSlug)
        : null;

      if (currentProfile) {
        try {
          localStorage.setItem("urclub_cached_profile_" + userSlug, JSON.stringify(currentProfile));
        } catch (e) {}

        const baseViews = currentProfile.views || "10";
        renderProfile(currentProfile);

        // Real Unique Visitor View Counting (Guarantees refresh NEVER increments!)
        const sessionKey = "urclub_session_" + userSlug;
        const deviceKey = "urclub_device_" + userSlug;

        // 1. Session check: Refreshing the tab/browser never increments
        const isSessionViewed = sessionStorage.getItem(sessionKey);

        // 2. Device check: Same device within 24 hours does not spam
        const lastDeviceView = localStorage.getItem(deviceKey);
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        const isDeviceFresh = !lastDeviceView || (now - parseInt(lastDeviceView, 10)) > TWENTY_FOUR_HOURS;

        const isRealUniqueVisit = !isSessionViewed && isDeviceFresh;

        // Mark session immediately so refresh never increments
        sessionStorage.setItem(sessionKey, "1");

        if (currentProfile.autoIncrementViews !== false && !isPreview && isRealUniqueVisit) {
          localStorage.setItem(deviceKey, now.toString());
          setTimeout(async () => {
            try {
              if (typeof ProfileStore !== "undefined") {
                const updatedViews = await ProfileStore.incrementViewsAsync(userSlug);
                renderViews(updatedViews, baseViews);
              }
            } catch (e) {
              console.warn("View increment failed:", e);
            }
          }, 1000);
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }

  await loadAndRender();

  // Listen for Live PostMessage Preview updates from Admin Panel
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "PREVIEW_UPDATE" && event.data.profile) {
      renderProfile(event.data.profile);
    }
  });

  // Supabase Realtime Cloud Sync (Pushes saved changes to all devices worldwide)
  if (typeof ProfileStore !== "undefined") {
    const sb = ProfileStore.getSupabase();
    if (sb) {
      sb.channel("public:bio_profiles")
        .on("postgres_changes", { event: "*", schema: "public", table: "bio_profiles" }, (payload) => {
          if (payload && payload.new && payload.new.data) {
            const updatedProfile = payload.new.data;
            if (updatedProfile.id === userSlug) {
              renderProfile(updatedProfile);
            }
          }
        })
        .subscribe();
    }
  }

  // Handle responsive resize between PC and Mobile (avoid triggering on mobile URL bar scroll)
  let resizeTimer = null;
  let lastDeviceModeIsMobile = (window.innerWidth <= 768) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const currentModeIsMobile = (window.innerWidth <= 768) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (currentModeIsMobile !== lastDeviceModeIsMobile && currentActiveProfile) {
        lastDeviceModeIsMobile = currentModeIsMobile;
        renderProfile(currentActiveProfile);
      }
    }, 250);
  });
});
