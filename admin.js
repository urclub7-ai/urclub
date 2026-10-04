document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const profileSelect = document.getElementById("profile-select");
  const btnAddProfile = document.getElementById("btn-add-profile");
  const btnDeleteProfile = document.getElementById("btn-delete-profile");
  const btnViewPublic = document.getElementById("btn-view-public");
  const btnSaveAll = document.getElementById("btn-save-all");
  const previewIframe = document.getElementById("preview-iframe");
  const previewOpenBtn = document.getElementById("preview-open-btn");
  const toast = document.getElementById("admin-toast");
  const toastMsg = document.getElementById("toast-msg");

  // Form Fields
  const inputName = document.getElementById("input-name");
  const inputSlug = document.getElementById("input-slug");
  const inputSubtitle = document.getElementById("input-subtitle");
  const inputViews = document.getElementById("input-views");
  const toggleRealViews = document.getElementById("toggle-real-views");

  // Avatars
  const inputMainAvatar = document.getElementById("input-main-avatar");
  const fileMainAvatar = document.getElementById("file-main-avatar");
  const previewMainAvatar = document.getElementById("preview-main-avatar");

  const inputPresenceAvatar = document.getElementById("input-presence-avatar");
  const filePresenceAvatar = document.getElementById("file-presence-avatar");
  const previewPresenceAvatar = document.getElementById("preview-presence-avatar");

  // Media
  const inputBgVideo = document.getElementById("input-bg-video");
  const fileBgVideo = document.getElementById("file-bg-video");

  // Presence
  const inputPresenceHandle = document.getElementById("input-presence-handle");
  const inputPresenceStatus = document.getElementById("input-presence-status");
  const colorRadios = document.querySelectorAll('input[name="presence-color"]');
  const inputCustomColor = document.getElementById("input-custom-color");

  // Switches
  const toggleSparkles = document.getElementById("toggle-sparkles");
  const toggleDotmatrix = document.getElementById("toggle-dotmatrix");

  // Socials Container
  const socialsInputsList = document.getElementById("socials-inputs-list");

  // Modal Elements
  const modalNewProfile = document.getElementById("modal-new-profile");
  const modalClose = document.getElementById("modal-close");
  const modalCancel = document.getElementById("modal-cancel");
  const modalConfirm = document.getElementById("modal-confirm");
  const newProfileName = document.getElementById("new-profile-name");
  const newProfileSlug = document.getElementById("new-profile-slug");

  let currentProfileId = "main";

  // Render Social Inputs Catalog
  function renderSocialInputs() {
    socialsInputsList.innerHTML = "";
    SOCIAL_CATALOG.forEach((item) => {
      const row = document.createElement("div");
      row.className = "social-input-item";
      row.innerHTML = `
        <div class="social-icon-badge" style="color: ${item.color};">
          <i class="${item.icon}"></i>
        </div>
        <span class="social-name-tag">${item.name}</span>
        <input type="text" id="social-${item.id}" data-social-id="${item.id}" placeholder="${item.placeholder}" />
      `;
      socialsInputsList.appendChild(row);
    });
  }

  // Populate Profiles Dropdown
  async function populateProfileDropdown() {
    const profiles = await ProfileStore.getProfilesAsync();
    profileSelect.innerHTML = "";

    // Main Owner Profile first
    const mainOpt = document.createElement("option");
    mainOpt.value = "main";
    const mainName = (profiles["main"] && profiles["main"].name) ? profiles["main"].name : "LEVI";
    mainOpt.textContent = `👑 ${mainName} (Main Root Page)`;
    if (currentProfileId === "main") mainOpt.selected = true;
    profileSelect.appendChild(mainOpt);

    // Other User Profiles
    Object.keys(profiles).forEach((id) => {
      if (id === "main") return;
      const p = profiles[id];
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = `👤 ${p.name} (?u=${id})`;
      if (id === currentProfileId) opt.selected = true;
      profileSelect.appendChild(opt);
    });
  }

  // Load Profile Into Form
  async function loadProfile(id) {
    const profile = await ProfileStore.getProfileAsync(id);
    currentProfileId = id || "main";

    inputName.value = profile.name || "";
    inputSlug.value = profile.id || id;
    inputSubtitle.value = profile.subtitle || "";
    inputViews.value = profile.views || "0";
    if (toggleRealViews) toggleRealViews.checked = profile.autoIncrementViews !== false;

    // Lock slug editing for main profile
    if (currentProfileId === "main") {
      inputSlug.disabled = true;
      inputSlug.value = "main (Root Page)";
      btnDeleteProfile.style.display = "none";
    } else {
      inputSlug.disabled = false;
      inputSlug.value = currentProfileId;
      btnDeleteProfile.style.display = "inline-flex";
    }

    // Avatars
    inputMainAvatar.value = profile.mainAvatar || "";
    previewMainAvatar.src = profile.mainAvatar || "assets/avatar.jpg";

    inputPresenceAvatar.value = profile.presenceAvatar || "";
    previewPresenceAvatar.src = profile.presenceAvatar || "assets/avatar.jpg";

    // Media
    inputBgVideo.value = profile.backgroundVideo || "";

    // Presence
    if (profile.presence) {
      inputPresenceHandle.value = profile.presence.handle || "";
      inputPresenceStatus.value = profile.presence.status || "";
      const statusColor = profile.presence.statusColor || "#22c55e";
      inputCustomColor.value = statusColor;
      
      let matchedRadio = false;
      colorRadios.forEach((r) => {
        if (r.value === statusColor) {
          r.checked = true;
          matchedRadio = true;
        } else {
          r.checked = false;
        }
      });
      if (!matchedRadio) {
        inputCustomColor.checked = true;
      }
    }

    // Switches
    toggleSparkles.checked = profile.showSparkles !== false;
    toggleDotmatrix.checked = profile.showDotMatrix !== false;

    // Socials
    SOCIAL_CATALOG.forEach((item) => {
      const input = document.getElementById(`social-${item.id}`);
      if (input) {
        input.value = (profile.socials && profile.socials[item.id]) ? profile.socials[item.id] : "";
      }
    });

    updatePublicLinks(id);
    updatePreviewFrame();
  }

  // Collect Current Form Data
  function getFormData() {
    let statusColor = inputCustomColor.value;
    colorRadios.forEach((r) => {
      if (r.checked) statusColor = r.value;
    });

    const socialsData = {};
    SOCIAL_CATALOG.forEach((item) => {
      const input = document.getElementById(`social-${item.id}`);
      if (input && input.value.trim() !== "") {
        socialsData[item.id] = input.value.trim();
      }
    });

    let slug = (currentProfileId === "main")
      ? "main"
      : (inputSlug.value.trim() || currentProfileId).toLowerCase().replace(/[^a-z0-9_-]/g, "");

    return {
      id: slug,
      name: inputName.value.trim() || "Profile Name",
      username: inputPresenceHandle.value.trim() || slug,
      subtitle: inputSubtitle.value.trim(),
      views: inputViews.value.trim() || "0",
      autoIncrementViews: toggleRealViews ? toggleRealViews.checked : true,
      showSparkles: toggleSparkles.checked,
      showDotMatrix: toggleDotmatrix.checked,
      mainAvatar: inputMainAvatar.value.trim(),
      presenceAvatar: inputPresenceAvatar.value.trim(),
      backgroundVideo: inputBgVideo.value.trim(),
      presence: {
        handle: inputPresenceHandle.value.trim() || slug,
        status: inputPresenceStatus.value.trim() || "online",
        statusColor: statusColor
      },
      socials: socialsData
    };
  }

  // Update Public Links
  function updatePublicLinks(slug) {
    const publicUrl = (slug === "main") ? "index.html" : `index.html?u=${slug}`;
    btnViewPublic.href = publicUrl;
    previewOpenBtn.href = publicUrl;
  }

  // Update Preview Frame (Sends data directly to iframe without saving to cloud)
  function updatePreviewFrame() {
    const data = getFormData();
    const targetUrl = (currentProfileId === "main") ? "index.html?preview=1" : `index.html?u=${currentProfileId}&preview=1`;
    
    if (previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage({ type: "PREVIEW_UPDATE", profile: data }, "*");
    }
  }

  // Explicit Save Changes Button (Only saves to Supabase when clicked)
  async function saveChanges() {
    const originalBtnHtml = btnSaveAll.innerHTML;
    btnSaveAll.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving to Cloud...`;
    btnSaveAll.disabled = true;

    try {
      const data = getFormData();
      const oldId = currentProfileId;
      const newId = data.id;

      if (oldId !== "main" && oldId !== newId) {
        await ProfileStore.deleteProfileAsync(oldId);
        currentProfileId = newId;
      }

      await ProfileStore.saveProfileAsync(newId, data);
      await populateProfileDropdown();
      updatePublicLinks(newId);

      btnSaveAll.innerHTML = `<i class="fa-solid fa-circle-check"></i> Saved!`;
      btnSaveAll.style.background = "#10b981";
      showToast(`Profile "${data.name}" saved & applied to all devices worldwide!`);

      setTimeout(() => {
        btnSaveAll.innerHTML = originalBtnHtml;
        btnSaveAll.style.background = "";
        btnSaveAll.disabled = false;
      }, 2000);

      // Refresh preview iframe with fresh cloud data
      previewIframe.src = (newId === "main") ? `index.html?preview=1&t=${Date.now()}` : `index.html?u=${newId}&preview=1&t=${Date.now()}`;
    } catch (e) {
      console.error("Save error:", e);
      btnSaveAll.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Error`;
      btnSaveAll.style.background = "#ef4444";
      showToast("Save failed. Please check internet connection.");
      setTimeout(() => {
        btnSaveAll.innerHTML = originalBtnHtml;
        btnSaveAll.style.background = "";
        btnSaveAll.disabled = false;
      }, 2500);
    }
  }

  // Show Toast
  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }

  // File Upload Handlers
  function setupFileUpload(fileInput, textInput, previewImg) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      showToast("Loading media...");
      const reader = new FileReader();
      reader.onload = (event) => {
        textInput.value = event.target.result;
        if (previewImg) previewImg.src = event.target.result;
        updatePreviewFrame();
        showToast("Media loaded in preview! Click 'Save Changes' to publish.");
      };
      reader.readAsDataURL(file);
    });
  }

  setupFileUpload(fileMainAvatar, inputMainAvatar, previewMainAvatar);
  setupFileUpload(filePresenceAvatar, inputPresenceAvatar, previewPresenceAvatar);
  setupFileUpload(fileBgVideo, inputBgVideo, null);

  // Avatar text change listeners
  inputMainAvatar.addEventListener("input", (e) => {
    previewMainAvatar.src = e.target.value || "assets/avatar.jpg";
    updatePreviewFrame();
  });
  inputPresenceAvatar.addEventListener("input", (e) => {
    previewPresenceAvatar.src = e.target.value || "assets/avatar.jpg";
    updatePreviewFrame();
  });

  // Attach live preview updates (WITHOUT saving to cloud)
  document.addEventListener("input", (e) => {
    if (e.target.matches("input, textarea, select")) {
      updatePreviewFrame();
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.matches("input, textarea, select")) {
      updatePreviewFrame();
    }
  });

  // Profile Switcher
  profileSelect.addEventListener("change", (e) => {
    loadProfile(e.target.value);
  });

  // Save Button
  btnSaveAll.addEventListener("click", saveChanges);

  // Delete Profile
  btnDeleteProfile.addEventListener("click", async () => {
    if (currentProfileId === "main") {
      alert("You cannot delete the Main Owner profile.");
      return;
    }
    if (confirm(`Are you sure you want to delete profile "${currentProfileId}"?`)) {
      await ProfileStore.deleteProfileAsync(currentProfileId);
      currentProfileId = "main";
      await populateProfileDropdown();
      await loadProfile("main");
      showToast("Profile deleted.");
    }
  });

  // Color picker sync
  inputCustomColor.addEventListener("input", () => {
    colorRadios.forEach((r) => (r.checked = false));
    updatePreviewFrame();
  });

  // New Profile Modal
  btnAddProfile.addEventListener("click", () => {
    modalNewProfile.classList.add("active");
    newProfileName.value = "";
    newProfileSlug.value = "";
    newProfileName.focus();
  });

  modalClose.addEventListener("click", () => modalNewProfile.classList.remove("active"));
  modalCancel.addEventListener("click", () => modalNewProfile.classList.remove("active"));

  modalConfirm.addEventListener("click", async () => {
    const name = newProfileName.value.trim();
    let slug = newProfileSlug.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

    if (!name || !slug) {
      alert("Please provide both a Display Name and a Unique Slug.");
      return;
    }

    if (slug === "main" || slug === "admin") {
      alert("This slug is reserved. Please pick another one (e.g. kayhan, alex).");
      return;
    }

    const profiles = await ProfileStore.getProfilesAsync();
    if (profiles[slug]) {
      alert("A profile with this slug already exists.");
      return;
    }

    // Create fresh new profile
    const newProfile = {
      id: slug,
      name: name,
      username: slug,
      subtitle: "",
      views: "0",
      autoIncrementViews: true,
      showSparkles: true,
      showDotMatrix: true,
      mainAvatar: "",
      presenceAvatar: "",
      backgroundVideo: "",
      presence: {
        handle: slug,
        status: "online",
        statusColor: "#22c55e"
      },
      socials: {}
    };

    await ProfileStore.saveProfileAsync(slug, newProfile);
    currentProfileId = slug;
    await populateProfileDropdown();
    await loadProfile(slug);
    modalNewProfile.classList.remove("active");
    showToast(`New profile "${name}" created! Link: ?u=${slug}`);
  });

  // Init
  renderSocialInputs();
  await populateProfileDropdown();
  await loadProfile("main");
});
