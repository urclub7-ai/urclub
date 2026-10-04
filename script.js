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

  // Read Profile from URL Query or Store
  const urlParams = new URLSearchParams(window.location.search);
  let userSlug = urlParams.get("u");
  const isPreview = urlParams.get("preview") === "1";

  // Reactive Profile Renderer
  function renderProfile(profile) {
    if (!profile) return;
    document.title = profile.name || "LEVI";

    // 1. Text & Titles
    if (nameText) nameText.textContent = profile.name || "LEVI";
    if (profileSubtitle) profileSubtitle.textContent = profile.subtitle || "";
    if (viewsCount) viewsCount.textContent = profile.views || "1,337";

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
    const mainImg = profile.mainAvatar || profile.avatar || "assets/avatar.jpg";
    const presenceImg = profile.presenceAvatar || profile.avatar || "assets/avatar.jpg";

    if (profileAvatar && profileAvatar.src !== mainImg) profileAvatar.src = mainImg;
    if (presenceMiniAvatar && presenceMiniAvatar.src !== presenceImg) presenceMiniAvatar.src = presenceImg;

    // 3. Presence Widget
    if (profile.presence) {
      if (presenceHandle) presenceHandle.textContent = profile.presence.handle || profile.username || "user";
      if (presenceStatus) presenceStatus.textContent = profile.presence.status || "online";
      if (presenceStatusRing) {
        presenceStatusRing.style.backgroundColor = profile.presence.statusColor || "#22c55e";
      }
    } else {
      if (presenceHandle) presenceHandle.textContent = profile.username || "user";
      if (presenceStatus) presenceStatus.textContent = profile.presenceStatus || "online";
    }

    // 4. Background Video (Video + its own Audio)
    const videoUrl = profile.backgroundVideo || "assets/levi_background.mp4";

    if (bgVideo && videoUrl) {
      const currentSrc = bgVideo.currentSrc || bgVideo.src || (videoSource ? videoSource.src : "");
      if (!currentSrc.includes(videoUrl) && bgVideo.src !== videoUrl) {
        bgVideo.src = videoUrl;
        if (videoSource) videoSource.src = videoUrl;
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

  // Initial Load from IndexedDB
  async function loadAndRender() {
    const currentProfile = (typeof ProfileStore !== "undefined")
      ? await ProfileStore.getProfileAsync(userSlug)
      : (typeof CONFIG !== "undefined" ? CONFIG : null);
    renderProfile(currentProfile);
  }

  await loadAndRender();

  // Listen for Real-Time Sync from Admin Panel (Cross-tab and inside Iframe)
  if (typeof BroadcastChannel !== "undefined") {
    const syncChannel = new BroadcastChannel("guns_lol_profile_sync");
    syncChannel.onmessage = (event) => {
      const data = event.data;
      if (data && (!userSlug || data.id === userSlug || data.id === ProfileStore.getActiveId())) {
        renderProfile(data);
      }
    };
  }

  // Handle Preview Mode (for Admin Panel Iframe) vs Full Page
  if (isPreview) {
    if (enterOverlay) enterOverlay.classList.add("hidden");
    if (bgVideo) {
      bgVideo.muted = true; // Mute inside admin preview frame
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
