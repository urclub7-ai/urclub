document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const enterOverlay = document.getElementById("enter-overlay");
  const bgVideo = document.getElementById("bg-video");
  const videoSource = document.getElementById("video-source");
  const bgDotMatrix = document.getElementById("bg-dot-matrix");
  
  const customCursor = document.getElementById("custom-cursor");
  const cursorDot = document.getElementById("cursor-dot");
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

  // Reactive Profile Renderer
  function renderProfile(profile) {
    if (!profile) return;
    document.title = profile.name || "LEVI";

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
    const mainImg = profile.mainAvatar || "assets/avatar.jpg";
    const presenceImg = profile.presenceAvatar || mainImg || "assets/avatar.jpg";

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

    // 4. Background Video
    const videoUrl = profile.backgroundVideo || "assets/levi_background.mp4";

    if (bgVideo && videoUrl) {
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
        if (videoSource) videoSource.src = playableUrl;
        bgVideo.load();
        if (isPreview || enterOverlay.classList.contains("hidden")) {
          bgVideo.play().catch(() => {});
        }
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

    setupHoverEffects();
  }

  // Initial Load from Supabase Cloud Database
  async function loadAndRender() {
    const currentProfile = (typeof ProfileStore !== "undefined")
      ? await ProfileStore.getProfileAsync(userSlug)
      : null;

    if (currentProfile) {
      const baseViews = currentProfile.views || "0";
      renderProfile(currentProfile);

      // Auto-Increment Real Views on Visit with Animation
      if (currentProfile.autoIncrementViews !== false && !isPreview) {
        setTimeout(async () => {
          if (typeof ProfileStore !== "undefined") {
            const updatedViews = await ProfileStore.incrementViewsAsync(userSlug);
            renderViews(updatedViews, baseViews);
          }
        }, 900);
      }
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

  // Handle Preview Mode (for Admin Panel Iframe) vs Full Page
  if (isPreview) {
    if (enterOverlay) enterOverlay.classList.add("hidden");
    if (bgVideo) {
      bgVideo.muted = true;
      bgVideo.play().catch(() => {});
    }
  } else {
    // Click to Enter Handler: Unmutes and plays video audio directly!
    if (enterOverlay) {
      enterOverlay.addEventListener("click", () => {
        enterOverlay.classList.add("hidden");
        
        if (bgVideo) {
          bgVideo.muted = false;
          bgVideo.volume = 0.8;
          bgVideo.play().catch(() => {});
        }
      });
    }
  }

  // Custom Cursor Movement
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }

    addTrailParticle(mouseX, mouseY);
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;

    if (customCursor) {
      customCursor.style.left = `${cursorX}px`;
      customCursor.style.top = `${cursorY}px`;
    }

    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover Effect for Cursor
  function setupHoverEffects() {
    const interactiveEls = document.querySelectorAll("a, button, .profile-avatar, .presence-widget, .views-pill");
    interactiveEls.forEach((el) => {
      el.addEventListener("mouseenter", () => customCursor && customCursor.classList.add("hovering"));
      el.addEventListener("mouseleave", () => customCursor && customCursor.classList.remove("hovering"));
    });
  }

  // Canvas Sparkle / Dot Trail Particle System
  const canvas = document.getElementById("trail-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function addTrailParticle(x, y) {
      if (Math.random() > 0.3) {
        particles.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          size: Math.random() * 2.5 + 1,
          speedX: (Math.random() - 0.5) * 1.2,
          speedY: (Math.random() - 0.5) * 1.2 - 0.5,
          opacity: 1,
          decay: Math.random() * 0.02 + 0.015,
          color: Math.random() > 0.5 ? "#ffffff" : "#d4d4d8"
        });
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity -= p.decay;

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }
});
