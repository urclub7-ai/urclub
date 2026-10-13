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

  // Initial Language Selection & Floating Dock Elements
  const langSelectionOverlay = document.getElementById("lang-selection-overlay");
  const btnChooseEn = document.getElementById("btn-choose-en");
  const btnChooseFa = document.getElementById("btn-choose-fa");

  const btnToggleLang = document.getElementById("btn-toggle-lang");
  const dockLangLabel = document.getElementById("dock-lang-label");
  const btnOpenOrder = document.getElementById("btn-open-order-modal");
  const dockOrderLabel = document.getElementById("dock-order-label");
  const btnToggleSound = document.getElementById("btn-toggle-sound");
  const soundIcon = document.getElementById("sound-icon");
  const soundLabel = document.getElementById("sound-label");

  const enterText = document.getElementById("enter-text");
  let currentLang = document.documentElement.lang === "fa" ? "fa" : "en";

  const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a855f7'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

  // Read Profile Slug from URL Query (Default to "main" for the root website!)
  const urlParams = new URLSearchParams(window.location.search);
  const userSlug = urlParams.get("u") || "main";
  const isPreview = urlParams.get("preview") === "1";

  // Render Views Number with Animated Rolling Effect (Guaranteed minimum of 10)
  function renderViews(countStr, animateFrom) {
    if (!viewsCount) return;
    let safeNum = parseInt(String(countStr || "10").replace(/[^0-9]/g, ""), 10);
    if (isNaN(safeNum) || safeNum < 10) safeNum = 10;
    const finalStr = safeNum.toLocaleString();

    let fromStr = "";
    if (animateFrom !== undefined && animateFrom !== null) {
      let fromNum = parseInt(String(animateFrom).replace(/[^0-9]/g, ""), 10);
      if (!isNaN(fromNum) && fromNum >= 10) fromStr = fromNum.toLocaleString();
    }

    if (fromStr && fromStr !== finalStr) {
      viewsCount.innerHTML = `<span class="views-digit-box rolling">${finalStr}</span>`;
      if (viewsPill) {
        viewsPill.classList.remove("pulse");
        void viewsPill.offsetWidth;
        viewsPill.classList.add("pulse");
      }
    } else {
      viewsCount.innerHTML = `<span class="views-digit-box">${finalStr}</span>`;
    }
  }

  let currentActiveProfile = null;

  // Reactive Profile Renderer
  function renderProfile(profile) {
    if (!profile) return;
    currentActiveProfile = profile;
    document.title = (userSlug === "main") ? "urclub" : (profile.name ? `${profile.name} • urclub` : "urclub");

    const isFa = (document.documentElement.lang === "fa");
    const faData = profile.persian || {};

    const displayName = isFa ? (faData.name || profile.name || "LEVI") : (profile.name || "LEVI");
    const displaySubtitle = isFa ? (faData.subtitle || profile.subtitle || "") : (profile.subtitle || "");
    const displayEnter = isFa ? (faData.enterText || "[ برای ورود به وبسایت کلیک کنید ]") : "[ click anywhere to enter ]";
    const orderBtnText = isFa ? (faData.orderBtnText || "سفارش") : "Order";
    const rawPresenceStatus = (profile.presence && profile.presence.status) ? profile.presence.status.trim() : "";
    const rawFaStatus = (faData && faData.presenceStatus) ? faData.presenceStatus.trim() : "";
    const displayStatus = isFa
      ? (rawFaStatus || rawPresenceStatus || "آنلاین")
      : (rawPresenceStatus || rawFaStatus || "online");

    // 1. Text & Titles
    if (nameText) nameText.textContent = displayName;
    if (profileSubtitle) {
      profileSubtitle.textContent = displaySubtitle;
      profileSubtitle.style.display = displaySubtitle ? "block" : "none";
    }
    const enterTextElem = document.getElementById("enter-text");
    if (enterTextElem) enterTextElem.textContent = displayEnter;
    const orderBtnSpan = document.querySelector("#btn-open-order-modal span");
    if (orderBtnSpan) orderBtnSpan.textContent = orderBtnText;

    const profileViews = profile.views || profile.baseViews || "10";
    renderViews(profileViews);

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

    // 3. Presence Widget (Username removed completely, online status only)
    if (presenceHandle) {
      presenceHandle.style.display = "none";
      presenceHandle.textContent = "";
    }
    if (presenceStatus) {
      presenceStatus.textContent = displayStatus;
    }
    if (presenceStatusRing) {
      presenceStatusRing.style.backgroundColor = (profile.presence && profile.presence.statusColor) ? profile.presence.statusColor : "#22c55e";
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
            a.className = `social-icon-btn social-${cat.id}`;
            a.dataset.social = cat.id;
            a.title = cat.name;
            a.innerHTML = `<i class="${cat.icon}"></i>`;
            socialsRow.appendChild(a);
          }
        });
      }
    }
  }

  // Razor-sharp Vector Audio SVGs
  const SOUND_ON_SVG = `<svg class="dock-svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  const SOUND_OFF_SVG = `<svg class="dock-svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`;

  // Sound UI State
  function updateSoundUI() {
    if (!bgVideo) return;
    const isMuted = bgVideo.muted;
    if (btnToggleSound) {
      if (soundIcon) {
        soundIcon.innerHTML = isMuted ? SOUND_OFF_SVG : SOUND_ON_SVG;
      }
      if (isMuted) {
        btnToggleSound.classList.add("is-muted");
        if (soundLabel) soundLabel.textContent = (currentLang === "fa" ? "بی‌صدا" : "Muted");
      } else {
        btnToggleSound.classList.remove("is-muted");
        if (soundLabel) soundLabel.textContent = (currentLang === "fa" ? "صدا" : "Sound");
      }
    }
  }

  let userMutedAudio = false;

  function toggleSound() {
    if (!bgVideo) return;
    bgVideo.muted = !bgVideo.muted;
    userMutedAudio = bgVideo.muted;
    if (!bgVideo.muted && bgVideo.paused) {
      bgVideo.play().catch(() => {});
    }
    updateSoundUI();
  }

  if (btnToggleSound) {
    btnToggleSound.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSound();
    });
  }

  // Language Engine
  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === "fa" ? "rtl" : "ltr");

    // Dock
    if (dockLangLabel) dockLangLabel.textContent = (lang === "fa" ? "EN" : "FA");
    const faData = currentActiveProfile?.persian || {};
    if (dockOrderLabel) {
      dockOrderLabel.textContent = (lang === "fa" ? (faData.orderBtnText || "سفارش") : "Order");
    }
    updateSoundUI();

    // Enter prompt
    if (enterText) {
      enterText.textContent = (lang === "fa"
        ? (faData.enterText || "[ برای ورود به وبسایت کلیک کنید ]")
        : "[ click anywhere to enter ]");
    }

    // Profile Texts
    if (currentActiveProfile) {
      if (nameText) nameText.textContent = (lang === "fa" ? (faData.name || currentActiveProfile.name || "LEVI") : (currentActiveProfile.name || "LEVI"));
      if (profileSubtitle) {
        const sub = (lang === "fa" ? (faData.subtitle || currentActiveProfile.subtitle || "") : (currentActiveProfile.subtitle || ""));
        profileSubtitle.textContent = sub;
        profileSubtitle.style.display = sub ? "block" : "none";
      }
      if (presenceHandle) {
        presenceHandle.style.display = "none";
        presenceHandle.textContent = "";
      }
      if (presenceStatus) {
        const pStatus = (currentActiveProfile?.presence?.status || "").trim();
        const fStatus = (faData?.presenceStatus || "").trim();
        if (lang === "fa") {
          presenceStatus.textContent = fStatus || pStatus || "آنلاین";
        } else {
          presenceStatus.textContent = pStatus || fStatus || "online";
        }
      }
    }

    // Order gate modal texts
    const orderModalTitle = document.getElementById("order-modal-title");
    const orderModalDesc = document.getElementById("order-modal-desc");
    const btnVerifyText = document.getElementById("btn-verify-text");
    const btnNoCode = document.getElementById("btn-no-code");
    const adminContactText = document.getElementById("admin-contact-text");
    const adminContactWaLink = document.getElementById("admin-contact-wa-link");

    if (lang === "fa") {
      if (orderModalTitle) orderModalTitle.textContent = "ورود به بخش ثبت سفارش";
      if (orderModalDesc) orderModalDesc.textContent = "برای دسترسی به فرم و ثبت مشخصات پروژه کد خود را وارد کنید";
      if (btnVerifyText) btnVerifyText.innerHTML = '<i class="fa-solid fa-arrow-left"></i> تایید و ورود به فرم';
      if (btnNoCode) btnNoCode.textContent = "کد ندارم";
      if (adminContactText) adminContactText.textContent = "برای دریافت کد سفارش خود را ثبت کنید.";
      if (adminContactWaLink) adminContactWaLink.href = "https://wa.me/491624212685?text=%D8%B3%D9%84%D8%A7%D9%85%D8%8C%20%D8%A8%D8%B1%D8%A7%DB%8C%20%D8%AF%D8%B1%DB%8C%D8%A7%D9%81%D8%AA%20%DA%A9%D8%AF%20%D8%B3%D9%81%D8%A7%D8%B1%D8%B4%20%D8%AE%D9%88%D8%AF%20%D8%B1%D8%A7%20%D8%AB%D8%A8%D8%AA%20%DA%A9%D9%86%D9%85.";
    } else {
      if (orderModalTitle) orderModalTitle.textContent = "Enter Order Code";
      if (orderModalDesc) orderModalDesc.textContent = "Enter your code to access the project submission form";
      if (btnVerifyText) btnVerifyText.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Verify & Proceed';
      if (btnNoCode) btnNoCode.textContent = "I don't have a code";
      if (adminContactText) adminContactText.textContent = "To receive an access code, register your order with admin.";
      if (adminContactWaLink) adminContactWaLink.href = "https://wa.me/491624212685?text=Hello%2C%20I%20would%20like%20to%20register%20my%20order%20to%20receive%20an%20order%20form%20code.";
    }

    // Footer button & copyright labels
    const btnFooterPrivacy = document.getElementById("btn-footer-privacy");
    const btnFooterHow = document.getElementById("btn-footer-how");
    const btnFooterTerms = document.getElementById("btn-footer-terms");
    const btnFooterHelp = document.getElementById("btn-footer-help");
    const footerCopyright = document.getElementById("footer-copyright");

    if (btnFooterPrivacy) btnFooterPrivacy.textContent = (lang === "fa") ? "حریم خصوصی" : "Privacy";
    if (btnFooterHow) btnFooterHow.textContent = (lang === "fa") ? "روش کار ما" : "How We Work";
    if (btnFooterTerms) btnFooterTerms.textContent = (lang === "fa") ? "قوانین و شرایط" : "Terms";
    if (btnFooterHelp) btnFooterHelp.textContent = (lang === "fa") ? "پشتیبانی" : "Help";
    if (footerCopyright) footerCopyright.textContent = (lang === "fa") ? "© ۲۰۲۶ تمامی حقوق برای URCLUB محفوظ است" : "© 2026 URCLUB • All Rights Reserved";

    if (typeof updateActiveInfoModalLang === "function") {
      updateActiveInfoModalLang(lang);
    }
  }

  let isLanguageTransitioning = false;

  if (btnToggleLang) {
    btnToggleLang.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isLanguageTransitioning) return;
      const nextLang = (currentLang === "fa" ? "en" : "fa");

      if (!isPreview && enterOverlay) {
        isLanguageTransitioning = true;
        isUnlocked = false;
        if (bgVideo) {
          bgVideo.muted = true;
          bgVideo.pause();
          try {
            bgVideo.currentTime = 0;
          } catch (e) {}
        }

        // 1. Immediately drop the pitch-black curtain without changing any content
        enterOverlay.style.transition = "opacity 0.25s ease";
        if (enterText) enterText.style.visibility = "hidden";
        enterOverlay.classList.remove("hidden");

        // 2. ONLY AFTER screen is 100% black (260ms), apply language behind the curtain!
        setTimeout(() => {
          applyLanguage(nextLang);
          if (enterText) {
            enterText.style.visibility = "visible";
          }
          enterOverlay.style.transition = ""; // Restore standard 0.8s unlock fade
          isLanguageTransitioning = false;
        }, 260);
      } else {
        applyLanguage(nextLang);
      }
    });
  }

  // Initial Language Selection Modal Events
  if (btnChooseEn) {
    btnChooseEn.addEventListener("click", (e) => {
      e.stopPropagation();
      applyLanguage("en");
      if (langSelectionOverlay) langSelectionOverlay.classList.add("hidden");
    });
  }

  if (btnChooseFa) {
    btnChooseFa.addEventListener("click", (e) => {
      e.stopPropagation();
      applyLanguage("fa");
      if (langSelectionOverlay) langSelectionOverlay.classList.add("hidden");
    });
  }

  // Handle Preview Mode vs Full Page Click/Tap to Enter
  let isUnlocked = false;
  function unlockBio() {
    if (isUnlocked || isLanguageTransitioning) return;
    if (langSelectionOverlay && !langSelectionOverlay.classList.contains("hidden") && langSelectionOverlay.style.display !== "none") {
      return;
    }
    isUnlocked = true;

    if (enterOverlay) {
      enterOverlay.classList.add("hidden");
    }

    if (bgVideo && bgVideo.src) {
      try {
        bgVideo.currentTime = 0; // Restart video from the very beginning!
      } catch (e) {}
      if (userMutedAudio) {
        bgVideo.muted = true;
      } else {
        bgVideo.muted = false;
        bgVideo.volume = 0.8;
      }
      const playPromise = bgVideo.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          bgVideo.classList.add("playing");
          updateSoundUI();
        }).catch((err) => {
          console.warn("Unmuted autoplay restricted on mobile, keeping muted playback:", err);
          bgVideo.muted = true;
          bgVideo.play().then(() => {
            bgVideo.classList.add("playing");
            updateSoundUI();
          }).catch(() => {});
        });
      }
    }
    updateSoundUI();
  }

  if (isPreview) {
    if (langSelectionOverlay) langSelectionOverlay.classList.add("hidden");
    if (enterOverlay) enterOverlay.classList.add("hidden");
    if (bgVideo && bgVideo.src) {
      bgVideo.muted = true;
      bgVideo.play().then(() => bgVideo.classList.add("playing")).catch(() => {});
      updateSoundUI();
    }
  } else {
    if (enterOverlay) {
      enterOverlay.addEventListener("click", unlockBio);
      enterOverlay.addEventListener("touchend", unlockBio);
    }
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

  // ==========================================================================
  // FLOATING ORDER GATE MODAL HANDLERS
  // ==========================================================================
  const modalOrderGate = document.getElementById("modal-order-gate");
  const btnCloseOrder = document.getElementById("btn-close-order-modal");
  const orderCodeForm = document.getElementById("order-code-form");
  const orderCodeInput = document.getElementById("order-code-input");
  const orderCodeError = document.getElementById("order-code-error");
  const btnVerify = document.getElementById("btn-verify-order-code");
  const btnVerifyText = btnVerify ? btnVerify.querySelector(".btn-verify-text") : null;
  const btnVerifySpinner = btnVerify ? btnVerify.querySelector(".btn-verify-spinner") : null;

  function openOrderModal() {
    if (!modalOrderGate) return;
    modalOrderGate.style.display = "flex";
    if (orderCodeError) orderCodeError.style.display = "none";
    if (orderCodeInput) {
      orderCodeInput.value = "";
      setTimeout(() => orderCodeInput.focus(), 150);
    }
  }

  function closeOrderModal() {
    if (!modalOrderGate) return;
    modalOrderGate.style.display = "none";
  }

  if (btnOpenOrder) {
    btnOpenOrder.addEventListener("click", (e) => {
      e.stopPropagation();
      openOrderModal();
    });
  }

  if (btnCloseOrder) {
    btnCloseOrder.addEventListener("click", (e) => {
      e.stopPropagation();
      closeOrderModal();
    });
  }

  const btnNoCode = document.getElementById("btn-no-code");
  const modalAdminContact = document.getElementById("modal-admin-contact");
  const btnCloseAdminContact = document.getElementById("btn-close-admin-contact");
  const adminContactAvatar = document.getElementById("admin-contact-avatar");

  function openAdminContactModal() {
    closeOrderModal();
    if (!modalAdminContact) return;
    if (adminContactAvatar && profileAvatar) {
      adminContactAvatar.src = profileAvatar.src || "assets/logo.png";
    }
    modalAdminContact.style.display = "flex";
  }

  function closeAdminContactModal() {
    if (!modalAdminContact) return;
    modalAdminContact.style.display = "none";
  }

  if (btnNoCode) {
    btnNoCode.addEventListener("click", (e) => {
      e.stopPropagation();
      openAdminContactModal();
    });
  }

  if (btnCloseAdminContact) {
    btnCloseAdminContact.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAdminContactModal();
    });
  }

  if (modalAdminContact) {
    modalAdminContact.addEventListener("click", (e) => {
      if (e.target === modalAdminContact) {
        closeAdminContactModal();
      }
    });
  }

  // Format code input while typing (uppercase and auto-hyphen if 8 chars)
  if (orderCodeInput) {
    orderCodeInput.addEventListener("input", (e) => {
      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
      e.target.value = val;
      if (orderCodeError) orderCodeError.style.display = "none";
    });
  }

  // Verify Code Form Submit
  if (orderCodeForm) {
    orderCodeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rawCode = orderCodeInput ? orderCodeInput.value.trim() : "";
      if (!rawCode) return;

      // Loading UI
      if (btnVerify) btnVerify.disabled = true;
      if (btnVerifyText) btnVerifyText.style.display = "none";
      if (btnVerifySpinner) btnVerifySpinner.style.display = "inline-flex";
      if (orderCodeError) orderCodeError.style.display = "none";

      try {
        if (typeof OrderCodeStore !== "undefined") {
          const result = await OrderCodeStore.verifyCodeAsync(rawCode);
          if (result.valid) {
            const formattedCode = result.codeObj.code;
            try {
              sessionStorage.setItem("urclub_order_code", formattedCode);
            } catch (err) {}
            // Redirect to form with code
            window.location.href = `form.html?code=${encodeURIComponent(formattedCode)}`;
            return;
          } else {
            let errorMsg = "کد وارد شده معتبر نمی‌باشد. لطفاً مجدداً بررسی فرمایید.";
            if (result.reason === "alreadyUsed") {
              errorMsg = "این کد قبلاً استفاده شده و سفارش آن ثبت گردیده است. جهت ثبت سفارش جدید، کد دیگری از واتساپ دریافت فرمایید.";
            } else if (result.reason === "revoked") {
              errorMsg = "این کد توسط مدیریت غیرفعال شده است. لطفاً با پشتیبانی در تماس باشید.";
            }
            if (orderCodeError) {
              orderCodeError.textContent = errorMsg;
              orderCodeError.style.display = "block";
            }
          }
        } else {
          // Fallback redirect if offline
          window.location.href = `form.html?code=${encodeURIComponent(rawCode)}`;
        }
      } catch (err) {
        console.error("Code verification error:", err);
        if (orderCodeError) {
          orderCodeError.textContent = "خطا در برقراری ارتباط با سرور. لطفاً مجدداً تلاش کنید.";
          orderCodeError.style.display = "block";
        }
      } finally {
        if (btnVerify) btnVerify.disabled = false;
        if (btnVerifyText) btnVerifyText.style.display = "inline-flex";
        if (btnVerifySpinner) btnVerifySpinner.style.display = "none";
      }
    });
  }

  // ==========================================================================
  // SITE INFORMATION MODAL (Privacy, How We Work, Terms, Help)
  // ==========================================================================
  const modalSiteInfo = document.getElementById("modal-site-info");
  const infoModalCard = document.getElementById("info-modal-card");
  const infoModalClose = document.getElementById("btn-close-info-modal");
  const infoModalIcon = document.getElementById("info-modal-icon");
  const infoModalTitle = document.getElementById("info-modal-title");
  const infoModalTag = document.getElementById("info-modal-tag");
  const infoModalBody = document.getElementById("info-modal-body");

  let currentInfoModalType = null;

  function renderInfoModalContent(type, lang) {
    if (!infoModalBody || !infoModalTitle || !infoModalIcon || !infoModalTag) return;
    const isFa = (lang === "fa");
    if (infoModalCard) {
      if (isFa) {
        infoModalCard.classList.add("fa-dir");
      } else {
        infoModalCard.classList.remove("fa-dir");
      }
    }

    if (type === "privacy") {
      infoModalIcon.innerHTML = '<i class="fa-solid fa-shield-halved"></i>';
      infoModalTag.textContent = isFa ? "امنیت و محرمانگی تضمین‌شده" : "CONFIDENTIAL & SECURE";
      infoModalTitle.textContent = isFa ? "سیاست حفظ حریم خصوصی" : "Privacy Policy";

      if (isFa) {
        infoModalBody.innerHTML = `
          <p class="info-intro">
            در استودیو URCLUB، حفظ امنیت اطلاعات، هویت کاربری و محرمانگی تمام پروژه‌های شما اولویت مطلق ماست. ما متعهد به شفافیت و حفاظت کامل از دارایی‌های دیجیتال شما هستیم.
          </p>
          <ul class="info-list">
            <li class="info-list-item">
              <i class="fa-solid fa-lock"></i>
              <div>
                <strong>محرمانگی فایل‌ها و رسانه‌ها:</strong>
                <span>تمام عکس‌ها، ویدیوها، کدهای اختصاصی و محتواهای ارسالی شما در سرورهای امن نگهداری شده و هرگز در اختیار شخص ثالث قرار نمی‌گیرند.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-user-shield"></i>
              <div>
                <strong>مالکیت ۱۰۰ درصدی پروژه:</strong>
                <span>تمامی فایل‌های نهایی و کدهای اختصاصی ایجاد شده پس از تحویل، منحصراً متعلق به شخص سفارش‌دهنده است.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-fingerprint"></i>
              <div>
                <strong>ارتباط مستقیم و کدهای اعتباری:</strong>
                <span>کدهای دسترسی به فرم به صورت منحصر‌به‌فرد و یک‌بار مصرف تنها از طریق پشتیبانی مستقیم ارسال می‌شوند تا از ثبت اطلاعات ناخواسته جلوگیری شود.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-ban"></i>
              <div>
                <strong>عدم ردیابی تبلیغاتی:</strong>
                <span>هیچ‌گونه ردیابی شخص ثالث یا فروش داده‌های کاربری به وب‌سایت‌های دیگر در اکوسیستم URCLUB وجود ندارد.</span>
              </div>
            </li>
          </ul>
        `;
      } else {
        infoModalBody.innerHTML = `
          <p class="info-intro">
            At URCLUB Studio, your privacy, creative branding, and personal identity are protected with industry-grade confidentiality standards. We never compromise on your data safety.
          </p>
          <ul class="info-list">
            <li class="info-list-item">
              <i class="fa-solid fa-lock"></i>
              <div>
                <strong>Zero Public Leaks & Encrypted Storage:</strong>
                <span>All multimedia assets, custom branding materials, and profile information you provide remain strictly confidential.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-user-shield"></i>
              <div>
                <strong>Full Client Ownership:</strong>
                <span>Upon project completion, you retain 100% intellectual property ownership of your personalized digital biolink page.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-fingerprint"></i>
              <div>
                <strong>Secure One-Time Access Codes:</strong>
                <span>Order submission is protected by unique studio-generated access codes issued directly via private channels.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-ban"></i>
              <div>
                <strong>No Third-Party Tracking or Ads:</strong>
                <span>We never sell or distribute your data to external data brokers, marketers, or analytics networks.</span>
              </div>
            </li>
          </ul>
        `;
      }
    } else if (type === "how") {
      infoModalIcon.innerHTML = '<i class="fa-solid fa-route"></i>';
      infoModalTag.textContent = isFa ? "مراحل ۴ گانه تحویل سریع" : "4-STEP WORKFLOW";
      infoModalTitle.textContent = isFa ? "روش کار و نحوه سفارش" : "How We Work";

      if (isFa) {
        infoModalBody.innerHTML = `
          <p class="info-intro">
            فرآیند ساخت و طراحی بایولینک اختصاصی در URCLUB ساده، سریع و تضمین‌شده است:
          </p>
          <div class="how-steps-container">
            <div class="how-step-card">
              <div class="how-step-num">۱</div>
              <div class="how-step-content">
                <h4>ارتباط و ثبت سفارش در واتس‌اپ</h4>
                <p>در ابتدا از طریق دکمه ثبت سفارش یا مستقیماً در واتس‌اپ به ما پیام می‌دهید و پلن یا طرح مدنظر خود را مشخص می‌کنید.</p>
              </div>
            </div>
            <div class="how-step-card">
              <div class="how-step-num">۲</div>
              <div class="how-step-content">
                <h4>دریافت کد اختصاصی سفارش</h4>
                <p>تیم پشتیبانی ما یک کد تایید و دسترسی منحصر‌به‌فرد (Order Access Code) به صورت خصوصی برای شما ارسال می‌کند.</p>
              </div>
            </div>
            <div class="how-step-card">
              <div class="how-step-num">۳</div>
              <div class="how-step-content">
                <h4>باز شدن فرم و ارسال مشخصات</h4>
                <p>کد را در پنجره سفارش وارد می‌کنید تا فرم اختصاصی پروژه باز شود. اطلاعات، نام، شبکه‌های اجتماعی و ویدیوها را ثبت و ارسال می‌کنید.</p>
              </div>
            </div>
            <div class="how-step-card highlight">
              <span class="how-step-badge">تضمین سرعت</span>
              <div class="how-step-num">۴</div>
              <div class="how-step-content">
                <h4>تحویل نمونه اول در ۲۴ ساعت اول</h4>
                <p>طراحان ما کار را بلافاصله آغاز کرده و نمونه اولیه و تعاملی پروژه شما را در ۲۴ ساعت اول برایتان ارسال می‌کنند تا پس از تایید نهایی شود.</p>
              </div>
            </div>
          </div>
        `;
      } else {
        infoModalBody.innerHTML = `
          <p class="info-intro">
            Our streamlined 4-step workflow ensures rapid turnaround, premium aesthetics, and complete transparency:
          </p>
          <div class="how-steps-container">
            <div class="how-step-card">
              <div class="how-step-num">1</div>
              <div class="how-step-content">
                <h4>Reach Out on WhatsApp</h4>
                <p>Click order or message us directly on WhatsApp to choose your style and confirm project requirements.</p>
              </div>
            </div>
            <div class="how-step-card">
              <div class="how-step-num">2</div>
              <div class="how-step-content">
                <h4>Receive Your Unique Access Code</h4>
                <p>Our studio team issues a verified Order Access Code directly to your private chat.</p>
              </div>
            </div>
            <div class="how-step-card">
              <div class="how-step-num">3</div>
              <div class="how-step-content">
                <h4>Unlock & Submit Order Form</h4>
                <p>Enter your code to unlock the project submission form (urclub.vercel.app/form), provide your handles, theme assets, and submit.</p>
              </div>
            </div>
            <div class="how-step-card highlight">
              <span class="how-step-badge">Speed Guarantee</span>
              <div class="how-step-num">4</div>
              <div class="how-step-content">
                <h4>First Sample within 24 Hours</h4>
                <p>Our creative team develops your custom biolink and delivers the interactive first prototype within the first 24 hours.</p>
              </div>
            </div>
          </div>
        `;
      }
    } else if (type === "terms") {
      infoModalIcon.innerHTML = '<i class="fa-solid fa-file-contract"></i>';
      infoModalTag.textContent = isFa ? "مقررات و تضمین کیفیت" : "CLIENT AGREEMENT";
      infoModalTitle.textContent = isFa ? "قوانین و شرایط کاری" : "Terms & Conditions";

      if (isFa) {
        infoModalBody.innerHTML = `
          <p class="info-intro">
            تمامی خدمات ارائه شده توسط استودیو URCLUB تحت شرایط شفاف زیر جهت تضمین رضایت ۱۰۰ درصدی شما اجرا می‌گردد:
          </p>
          <ul class="info-list">
            <li class="info-list-item">
              <i class="fa-solid fa-clock"></i>
              <div>
                <strong>تعهد تحویل سریع (۲۴ ساعت):</strong>
                <span>اولین نمونه پیش‌نمایش در ۲۴ ساعت اولیه پس از ارسال فرم تحویل داده خواهد شد.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-pen-ruler"></i>
              <div>
                <strong>ویرایش و بازبینی رایگان:</strong>
                <span>شما تا حصول رضایت کامل حق اعمال اصلاحات و تنظیمات متنی/بصری روی نمونه اولیه را خواهید داشت.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-key"></i>
              <div>
                <strong>اعتبار کد سفارش:</strong>
                <span>هر کد اختصاصی برای ثبت یک پروژه فعال صادر می‌شود و انتقال آن به دیگران مجاز نمی‌باشد.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-copyright"></i>
              <div>
                <strong>کپی‌رایت و مالکیت:</strong>
                <span>تمامی حقوق متعلق به سال ۲۰۲۶ محفوظ بوده و استفاده تجاری یا کپی‌برداری غیرمجاز از سورس استودیو ممنوع است.</span>
              </div>
            </li>
          </ul>
        `;
      } else {
        infoModalBody.innerHTML = `
          <p class="info-intro">
            All design and engineering services provided by URCLUB Studio adhere to transparent quality guarantees:
          </p>
          <ul class="info-list">
            <li class="info-list-item">
              <i class="fa-solid fa-clock"></i>
              <div>
                <strong>24-Hour Delivery Guarantee:</strong>
                <span>The first working prototype is delivered within the initial 24 hours following form submission.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-pen-ruler"></i>
              <div>
                <strong>Complimentary Revisions:</strong>
                <span>We refine typography, media sync, and color effects until you are completely satisfied with the result.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-key"></i>
              <div>
                <strong>Single-Use Order Verification:</strong>
                <span>Access codes are uniquely mapped to your order to protect queue priority and project integrity.</span>
              </div>
            </li>
            <li class="info-list-item">
              <i class="fa-solid fa-copyright"></i>
              <div>
                <strong>Copyright Protection (2026):</strong>
                <span>All brand identities and assets are protected. Unauthorized reselling of core templates is prohibited.</span>
              </div>
            </li>
          </ul>
        `;
      }
    } else if (type === "help") {
      infoModalIcon.innerHTML = '<i class="fa-solid fa-headset"></i>';
      infoModalTag.textContent = isFa ? "پشتیبانی و راهنمایی" : "DIRECT ASSISTANCE";
      infoModalTitle.textContent = isFa ? "مرکز پشتیبانی URCLUB" : "Help & Support";

      if (isFa) {
        infoModalBody.innerHTML = `
          <p class="info-intro">
            سوالی درباره دریافت کد سفارش دارید یا نیاز به راهنمایی در ثبت فرم دارید؟ تیم پشتیبانی ما به صورت مستقیم پاسخگوی شماست.
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 18px;">
            <a href="https://wa.me/491624212685?text=%D8%B3%D9%84%D8%A7%D9%85%D8%8C%20%D9%86%DB%8C%D8%A7%D8%B2%20%D8%A8%D9%87%20%D8%B1%D8%A7%D9%87%D9%86%D9%85%D8%A7%DB%8C%DB%8C%20%D9%88%20%D9%BE%D8%B4%D8%AA%DB%8C%D8%A8%D8%A7%D9%86%DB%8C%20%D8%AF%D8%A7%D8%B1%D9%85." target="_blank" rel="noopener noreferrer" class="help-action-btn">
              <i class="fa-brands fa-whatsapp" style="font-size: 1.35rem; color: #25d366;"></i>
              <span>پشتیبانی مستقیم در واتس‌اپ (پاسخگویی سریع)</span>
            </a>
            <a href="https://t.me/urclub" target="_blank" rel="noopener noreferrer" class="help-action-btn">
              <i class="fa-brands fa-telegram" style="font-size: 1.35rem; color: #229ed9;"></i>
              <span>کانال و پشتیبانی تلگرام (@urclub)</span>
            </a>
          </div>
        `;
      } else {
        infoModalBody.innerHTML = `
          <p class="info-intro">
            Have questions about ordering, need code assistance, or want to track your project progress? Our team is available 24/7.
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 18px;">
            <a href="https://wa.me/491624212685?text=Hello%2C%20I%20need%20assistance%20with%20my%20URCLUB%20order." target="_blank" rel="noopener noreferrer" class="help-action-btn">
              <i class="fa-brands fa-whatsapp" style="font-size: 1.35rem; color: #25d366;"></i>
              <span>Direct WhatsApp Support (Instant Reply)</span>
            </a>
            <a href="https://t.me/urclub" target="_blank" rel="noopener noreferrer" class="help-action-btn">
              <i class="fa-brands fa-telegram" style="font-size: 1.35rem; color: #229ed9;"></i>
              <span>Telegram Channel & Support (@urclub)</span>
            </a>
          </div>
        `;
      }
    }
  }

  function openInfoModal(type) {
    if (!modalSiteInfo) return;
    currentInfoModalType = type;
    renderInfoModalContent(type, currentLang);
    modalSiteInfo.style.display = "flex";
  }

  function closeInfoModal() {
    if (!modalSiteInfo) return;
    modalSiteInfo.style.display = "none";
    currentInfoModalType = null;
  }

  window.updateActiveInfoModalLang = function(lang) {
    if (currentInfoModalType && modalSiteInfo && modalSiteInfo.style.display === "flex") {
      renderInfoModalContent(currentInfoModalType, lang);
    }
  };

  const btnFooterPrivacy = document.getElementById("btn-footer-privacy");
  const btnFooterHow = document.getElementById("btn-footer-how");
  const btnFooterTerms = document.getElementById("btn-footer-terms");
  const btnFooterHelp = document.getElementById("btn-footer-help");

  if (btnFooterPrivacy) {
    btnFooterPrivacy.addEventListener("click", (e) => {
      e.stopPropagation();
      openInfoModal("privacy");
    });
  }

  if (btnFooterHow) {
    btnFooterHow.addEventListener("click", (e) => {
      e.stopPropagation();
      openInfoModal("how");
    });
  }

  if (btnFooterTerms) {
    btnFooterTerms.addEventListener("click", (e) => {
      e.stopPropagation();
      openInfoModal("terms");
    });
  }

  if (btnFooterHelp) {
    btnFooterHelp.addEventListener("click", (e) => {
      e.stopPropagation();
      openInfoModal("help");
    });
  }

  if (infoModalClose) {
    infoModalClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeInfoModal();
    });
  }

  if (modalSiteInfo) {
    modalSiteInfo.addEventListener("click", (e) => {
      if (e.target === modalSiteInfo) {
        closeInfoModal();
      }
    });
  }
});
