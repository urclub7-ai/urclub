document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const enterOverlay = document.getElementById("enter-overlay");
  const bgVideo = document.getElementById("bg-video");
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
    const isMobile = (window.innerWidth <= 768);
    const videoUrl = isMobile
      ? (profile.mobileBackgroundVideo && profile.mobileBackgroundVideo.trim() ? profile.mobileBackgroundVideo.trim() : (profile.backgroundVideo ? profile.backgroundVideo.trim() : ""))
      : (profile.backgroundVideo && profile.backgroundVideo.trim() ? profile.backgroundVideo.trim() : (profile.mobileBackgroundVideo ? profile.mobileBackgroundVideo.trim() : ""));

    if (bgVideo) {
      if (videoUrl) {
        bgVideo.style.display = "block";
        let playableUrl = videoUrl;
        
        // Convert base64 data:video to Blob URL for instant HTML5 browser playback
        if (videoUrl.startsWith("data:video")) {
          try {
            const parts = videoUrl.split(",");
            const mime = parts[0].match(/:(.*?);/)[1] || "video/mp4";
            const byteCharacters = atob(parts[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mime });
            playableUrl = URL.createObjectURL(blob);
          } catch (e) {
            console.warn("Blob conversion error:", e);
          }
        }

        if (bgVideo.dataset.rawSrc !== videoUrl) {
          bgVideo.dataset.rawSrc = videoUrl;
          bgVideo.src = playableUrl;
          bgVideo.load();
          
          // Pre-buffer video in background (muted on page load for Safari compatibility)
          bgVideo.muted = (isPreview || !enterOverlay || !enterOverlay.classList.contains("hidden"));
          const initialPlay = bgVideo.play();
          if (initialPlay !== undefined) {
            initialPlay.catch(() => {
              bgVideo.muted = true;
              bgVideo.play().catch(() => {});
            });
          }
        }
      } else {
        bgVideo.style.display = "none";
        bgVideo.pause();
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

  // Handle Preview Mode (for Admin Panel Iframe) vs Full Page Click to Enter
  function unlockBio() {
    if (enterOverlay) {
      enterOverlay.classList.add("hidden");
    }
    if (bgVideo && bgVideo.style.display !== "none") {
      bgVideo.muted = false;
      bgVideo.volume = 0.8;
      const playPromise = bgVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio autoplay blocked on mobile, playing muted fallback:", err);
          bgVideo.muted = true;
          bgVideo.play().catch(() => {});
        });
      }
    }
  }

  if (isPreview) {
    if (enterOverlay) enterOverlay.classList.add("hidden");
    if (bgVideo && bgVideo.style.display !== "none") {
      bgVideo.muted = true;
      bgVideo.play().catch(() => {});
    }
  } else {
    if (enterOverlay) {
      enterOverlay.addEventListener("click", unlockBio);
      enterOverlay.addEventListener("touchstart", unlockBio, { passive: true });
    }
    document.addEventListener("click", unlockBio, { once: true });
    document.addEventListener("touchstart", unlockBio, { once: true, passive: true });
  }

  // Initial Load from Supabase Cloud Database
  async function loadAndRender() {
    try {
      const currentProfile = (typeof ProfileStore !== "undefined")
        ? await ProfileStore.getProfileAsync(userSlug)
        : null;

      if (currentProfile) {
        const baseViews = currentProfile.views || "0";
        renderProfile(currentProfile);

        // Real Unique Visitor View Counting (Prevent spamming on page refresh)
        const viewKey = "urclub_viewed_" + userSlug;
        const lastView = localStorage.getItem(viewKey);
        const now = Date.now();
        const TWELVE_HOURS = 12 * 60 * 60 * 1000;
        const isUniqueVisit = !lastView || (now - parseInt(lastView, 10)) > TWELVE_HOURS;

        if (currentProfile.autoIncrementViews !== false && !isPreview && isUniqueVisit) {
          localStorage.setItem(viewKey, now.toString());
          setTimeout(async () => {
            try {
              if (typeof ProfileStore !== "undefined") {
                const updatedViews = await ProfileStore.incrementViewsAsync(userSlug);
                renderViews(updatedViews, baseViews);
              }
            } catch (e) {
              console.warn("View increment failed:", e);
            }
          }, 1200);
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

  // Handle responsive resize between PC and Mobile
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (currentActiveProfile) {
        renderProfile(currentActiveProfile);
      }
    }, 250);
  });
});
