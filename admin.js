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
  const toggleRealViews = document.getElementById("toggle-real-views");

  // Socials Container
  const socialsInputsList = document.getElementById("socials-inputs-list");

  // Modal Elements
  const modalNewProfile = document.getElementById("modal-new-profile");
  const modalClose = document.getElementById("modal-close");
  const modalCancel = document.getElementById("modal-cancel");
  const modalConfirm = document.getElementById("modal-confirm");
  const newProfileName = document.getElementById("new-profile-name");
  const newProfileSlug = document.getElementById("new-profile-slug");

  // Sync Broadcast Channel for Instant Cross-Tab Updates
  const syncChannel = (typeof BroadcastChannel !== "undefined")
    ? new BroadcastChannel("guns_lol_profile_sync")
    : null;

  let currentProfileId = ProfileStore.getActiveId();

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
    Object.keys(profiles).forEach((id) => {
      const p = profiles[id];
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = `${p.name} (@${id})`;
      if (id === currentProfileId) {
        opt.selected = true;
      }
      profileSelect.appendChild(opt);
    });
  }

  // Load Profile Into Form
  async function loadProfile(id) {
    const profile = await ProfileStore.getProfileAsync(id);
    currentProfileId = id;
    ProfileStore.setActiveId(id);

    inputName.value = profile.name || "";
    inputSlug.value = profile.id || id;
    inputSubtitle.value = profile.subtitle || "";
    inputViews.value = profile.views || "7,841";

    // Avatars
    inputMainAvatar.value = profile.mainAvatar || "assets/avatar.jpg";
    previewMainAvatar.src = profile.mainAvatar || "assets/avatar.jpg";

    inputPresenceAvatar.value = profile.presenceAvatar || "assets/avatar.jpg";
    previewPresenceAvatar.src = profile.presenceAvatar || "assets/avatar.jpg";

    // Media
    inputBgVideo.value = profile.backgroundVideo || "assets/levi_background.mp4";

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
    if (toggleRealViews) toggleRealViews.checked = profile.autoIncrementViews !== false;

    // Socials
    SOCIAL_CATALOG.forEach((item) => {
      const input = document.getElementById(`social-${item.id}`);
      if (input) {
        input.value = (profile.socials && profile.socials[item.id]) ? profile.socials[item.id] : "";
      }
    });

    updatePublicLinks(id);
    previewIframe.src = `index.html?u=${id}&preview=1`;
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

    const profileSlug = (inputSlug.value.trim() || currentProfileId).toLowerCase().replace(/[^a-z0-9_-]/g, "");

    return {
      id: profileSlug,
      name: inputName.value.trim() || "Profile Name",
      username: inputPresenceHandle.value.trim() || profileSlug,
      subtitle: inputSubtitle.value.trim(),
      views: inputViews.value.trim() || "90",
      autoIncrementViews: toggleRealViews ? toggleRealViews.checked : true,
      showSparkles: toggleSparkles.checked,
      showDotMatrix: toggleDotmatrix.checked,
      mainAvatar: inputMainAvatar.value.trim() || "assets/avatar.jpg",
      presenceAvatar: inputPresenceAvatar.value.trim() || "assets/avatar.jpg",
      backgroundVideo: inputBgVideo.value.trim() || "assets/levi_background.mp4",
      presence: {
        handle: inputPresenceHandle.value.trim() || profileSlug,
        status: inputPresenceStatus.value.trim() || "online",
        statusColor: statusColor
      },
      socials: socialsData
    };
  }

  // Update Links for Public View
  function updatePublicLinks(slug) {
    const publicUrl = `index.html?u=${slug}`;
    btnViewPublic.href = publicUrl;
    previewOpenBtn.href = publicUrl;
  }

  // Auto-Save & Broadcast across all open pages/tabs in real-time
  async function autoSaveAndBroadcast() {
    const data = getFormData();
    await ProfileStore.saveProfileAsync(data.id, data);
    updatePublicLinks(data.id);

    if (syncChannel) {
      syncChannel.postMessage(data);
    }
  }

  // Save All Changes Button
  async function saveChanges() {
    const data = getFormData();
    const oldId = currentProfileId;
    const newId = data.id;

    if (oldId !== newId) {
      await ProfileStore.deleteProfileAsync(oldId);
      currentProfileId = newId;
    }

    await ProfileStore.saveProfileAsync(newId, data);
    await populateProfileDropdown();
    showToast(`Profile "${data.name}" saved & applied!`);
    
    if (syncChannel) {
      syncChannel.postMessage(data);
    }
  }

  // Show Toast
  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // File Upload Handlers (supports large 4K videos via FileReader DataURL & IndexedDB)
  function setupFileUpload(fileInput, textInput, previewImg) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      showToast("Loading media file...");
      const reader = new FileReader();
      reader.onload = async (event) => {
        textInput.value = event.target.result;
        if (previewImg) previewImg.src = event.target.result;
        await autoSaveAndBroadcast();
        showToast("Media updated and applied!");
      };
      reader.readAsDataURL(file);
    });
  }

  setupFileUpload(fileMainAvatar, inputMainAvatar, previewMainAvatar);
  setupFileUpload(filePresenceAvatar, inputPresenceAvatar, previewPresenceAvatar);
  setupFileUpload(fileBgVideo, inputBgVideo, null);

  // Avatar text change listeners
  inputMainAvatar.addEventListener("input", async (e) => {
    previewMainAvatar.src = e.target.value;
    await autoSaveAndBroadcast();
  });
  inputPresenceAvatar.addEventListener("input", async (e) => {
    previewPresenceAvatar.src = e.target.value;
    await autoSaveAndBroadcast();
  });

  // Attach live auto-save to every input element
  document.addEventListener("input", async (e) => {
    if (e.target.matches("input, textarea, select")) {
      await autoSaveAndBroadcast();
    }
  });

  document.addEventListener("change", async (e) => {
    if (e.target.matches("input, textarea, select")) {
      await autoSaveAndBroadcast();
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
    const profiles = await ProfileStore.getProfilesAsync();
    const keys = Object.keys(profiles);
    if (keys.length <= 1) {
      alert("You cannot delete the only existing profile.");
      return;
    }
    if (confirm(`Are you sure you want to delete profile "${currentProfileId}"?`)) {
      await ProfileStore.deleteProfileAsync(currentProfileId);
      currentProfileId = ProfileStore.getActiveId();
      await populateProfileDropdown();
      await loadProfile(currentProfileId);
      showToast("Profile deleted.");
    }
  });

  // Color picker sync
  inputCustomColor.addEventListener("input", async () => {
    colorRadios.forEach((r) => (r.checked = false));
    await autoSaveAndBroadcast();
  });
  colorRadios.forEach((r) => {
    r.addEventListener("change", autoSaveAndBroadcast);
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

    const profiles = await ProfileStore.getProfilesAsync();
    if (profiles[slug]) {
      alert("A profile with this slug already exists. Please pick another one.");
      return;
    }

    // Create fresh new profile
    const newProfile = {
      id: slug,
      name: name,
      username: slug,
      subtitle: "Content Creator",
      views: "1,000",
      showSparkles: true,
      showDotMatrix: true,
      mainAvatar: "assets/avatar.jpg",
      presenceAvatar: "assets/avatar.jpg",
      backgroundVideo: "assets/levi_background.mp4",
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
    showToast(`New profile "${name}" created!`);
    await autoSaveAndBroadcast();
  });

  // Init
  renderSocialInputs();
  await populateProfileDropdown();
  await loadProfile(currentProfileId);
});
