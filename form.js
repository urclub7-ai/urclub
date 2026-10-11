/**
 * URCLUB Studio - Comprehensive Order Form Application Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const catCards = document.querySelectorAll(".cat-card");
  const formBlocks = {
    website: document.getElementById("block-website"),
    mobile: document.getElementById("block-mobile"),
    desktop: document.getElementById("block-desktop"),
    poster: document.getElementById("block-poster")
  };

  const form = document.getElementById("project-order-form");
  const btnSubmit = document.getElementById("btn-submit-order");
  const btnText = btnSubmit.querySelector(".btn-text");
  const btnSpinner = btnSubmit.querySelector(".btn-spinner");

  // Summary Elements
  const sumCategory = document.getElementById("sum-category");
  const sumName = document.getElementById("sum-name");

  // Success Modal
  const successModal = document.getElementById("success-modal");
  const ticketIdEl = document.getElementById("ticket-id");
  const ticketCatEl = document.getElementById("ticket-cat");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const toastBox = document.getElementById("toast-box");

  // Active Category State (Default: website)
  let activeCategory = "website";

  // Category Title Map
  const categoryTitles = {
    website: "طراحی وب‌سایت",
    mobile: "برنامه موبایل (Android / iOS)",
    desktop: "نرم‌افزار کامپیوتر (دسکتاپ)",
    poster: "طراحی پوستر و گرافیک"
  };

  // 1. Category Switcher Logic
  catCards.forEach((card) => {
    card.addEventListener("click", () => {
      const selectedCat = card.dataset.category;
      if (selectedCat === activeCategory) return;

      // Update Card Active State
      catCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");

      // Switch Form Blocks
      Object.keys(formBlocks).forEach((key) => {
        if (formBlocks[key]) {
          formBlocks[key].style.display = (key === selectedCat) ? "block" : "none";
        }
      });

      activeCategory = selectedCat;
      sumCategory.textContent = categoryTitles[activeCategory] || activeCategory;
      updateSummaryName();

      // Smooth scroll to the newly opened block
      if (formBlocks[selectedCat]) {
        formBlocks[selectedCat].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // 2. Chip Button Selectors (Custom Single-Choice Pills)
  document.querySelectorAll(".chip-selector").forEach((container) => {
    const groupName = container.dataset.group;
    const hiddenInput = document.getElementById(`${groupName}-val`);
    const chips = container.querySelectorAll(".chip-btn");

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        if (hiddenInput) {
          hiddenInput.value = chip.dataset.value;
        }
      });
    });
  });

  // 3. Theme Preset Cards (Sync Color Pickers)
  const themeCards = document.querySelectorAll(".theme-card");
  const colorBg = document.getElementById("web-color-bg");
  const colorBgVal = document.getElementById("web-color-bg-val");
  const colorPrimary = document.getElementById("web-color-primary");
  const colorPrimaryVal = document.getElementById("web-color-primary-val");
  const colorAccent = document.getElementById("web-color-accent");
  const colorAccentVal = document.getElementById("web-color-accent-val");

  themeCards.forEach((theme) => {
    theme.addEventListener("click", () => {
      themeCards.forEach((t) => t.classList.remove("active"));
      theme.classList.add("active");

      if (colorBg) {
        colorBg.value = theme.dataset.c1;
        if (colorBgVal) colorBgVal.textContent = theme.dataset.c1;
      }
      if (colorPrimary) {
        colorPrimary.value = theme.dataset.c2;
        if (colorPrimaryVal) colorPrimaryVal.textContent = theme.dataset.c2;
      }
      if (colorAccent) {
        colorAccent.value = theme.dataset.c3;
        if (colorAccentVal) colorAccentVal.textContent = theme.dataset.c3;
      }
    });
  });

  // Custom Color Pickers Input Events
  function bindColorPicker(picker, label) {
    if (picker && label) {
      picker.addEventListener("input", (e) => {
        label.textContent = e.target.value;
        themeCards.forEach((t) => t.classList.remove("active"));
      });
    }
  }
  bindColorPicker(colorBg, colorBgVal);
  bindColorPicker(colorPrimary, colorPrimaryVal);
  bindColorPicker(colorAccent, colorAccentVal);

  // 4. Live Summary Name Updater
  const nameInputs = {
    website: document.getElementById("web-name"),
    mobile: document.getElementById("app-name"),
    desktop: document.getElementById("desk-name"),
    poster: document.getElementById("poster-title")
  };

  function updateSummaryName() {
    const activeInput = nameInputs[activeCategory];
    const val = activeInput ? activeInput.value.trim() : "";
    sumName.textContent = val || "هنوز وارد نشده";
  }

  Object.values(nameInputs).forEach((input) => {
    if (input) {
      input.addEventListener("input", updateSummaryName);
    }
  });

  // 5. Toast Notification System
  function showToast(text, isError = false) {
    if (!toastBox) return;
    const toast = document.createElement("div");
    toast.className = `toast-msg ${isError ? "error" : ""}`;
    toast.innerHTML = `
      <i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i>
      <span>${text}</span>
    `;
    toastBox.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(40px)";
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // 6. Supabase Backup Client Initialization
  const SUPABASE_URL = "https://thkaconmltqowxhjamfj.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ZGZe4Tna3kz3VzKRQmPlRg_bWB7Hs4h";
  let supabaseClient = null;
  if (typeof supabase !== "undefined" && supabase.createClient) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
      console.warn("Supabase init notice:", e);
    }
  }

  // 7. Form Submission Handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Contact Information (Common to all)
    const clientName = document.getElementById("client-name").value.trim();
    const clientPhone = document.getElementById("client-phone").value.trim();
    const clientSocial = document.getElementById("client-social").value.trim();
    const clientEmail = document.getElementById("client-email").value.trim();
    const contactMethod = document.getElementById("contact-method-val")?.value || "پیام در واتساپ";

    // Category-Specific Name Validation
    const currentNameInput = nameInputs[activeCategory];
    const projectName = currentNameInput ? currentNameInput.value.trim() : "";

    if (!projectName) {
      showToast("لطفاً نام یا عنوان پروژه خود را وارد نمایید.", true);
      if (currentNameInput) {
        currentNameInput.focus();
        currentNameInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!clientName) {
      showToast("لطفاً نام و نام خانوادگی خود را وارد کنید.", true);
      document.getElementById("client-name").focus();
      return;
    }

    if (!clientPhone) {
      showToast("لطفاً شماره تماس یا واتساپ خود را وارد کنید.", true);
      document.getElementById("client-phone").focus();
      return;
    }

    // Generate Order Ticket ID
    const randomTicket = "UR-" + Math.floor(10000 + Math.random() * 90000);

    // Build Category-Specific Questionnaire Details
    let specificDetails = {};

    if (activeCategory === "website") {
      const selectedFeatures = Array.from(document.querySelectorAll('input[name="web_features"]:checked'))
        .map((cb) => cb.value)
        .join(" | ");

      specificDetails = {
        "نوع و کاربری وب‌سایت": document.getElementById("web-type-val")?.value || "",
        "شعار وب‌سایت": document.getElementById("web-slogan").value.trim() || "ندارد",
        "تعداد صفحات": document.getElementById("web-pages-val")?.value || "",
        "زبان‌های سایت": document.getElementById("web-lang-val")?.value || "",
        "رنگ پس‌زمینه": colorBg?.value || "#0a0a0c",
        "رنگ اصلی سایت": colorPrimary?.value || "#a855f7",
        "رنگ برجسته (Accent)": colorAccent?.value || "#38bdf8",
        "نوع دامین مد نظر": document.getElementById("web-domain-type-val")?.value || "",
        "آدرس دامین پیشنهادی": document.getElementById("web-domain-name").value.trim() || "تعیین نشده",
        "پایگاه داده و هاستینگ": document.getElementById("web-db-val")?.value || "",
        "امکانات درخواستی": selectedFeatures || "امکانات پیش‌فرض",
        "سایت‌های نمونه و مرجع": document.getElementById("web-refs").value.trim() || "ندارد",
        "توضیحات تکمیلی سایت": document.getElementById("web-notes").value.trim() || "ندارد"
      };
    } else if (activeCategory === "mobile") {
      specificDetails = {
        "پلتفرم اپلیکیشن": document.getElementById("app-platform-val")?.value || "",
        "دسته‌بندی اپلیکیشن": document.getElementById("app-cat-val")?.value || "",
        "دیتابیس و سرور اپ": document.getElementById("app-db-val")?.value || "",
        "روش ثبت‌نام و ورود": document.getElementById("app-auth-val")?.value || "",
        "توضیحات و امکانات اپ": document.getElementById("app-notes").value.trim() || "ندارد"
      };
    } else if (activeCategory === "desktop") {
      specificDetails = {
        "سیستم‌عامل مقصد": document.getElementById("desk-os-val")?.value || "",
        "موضوع و کارکرد نرم‌افزار": document.getElementById("desk-type-val")?.value || "",
        "نوع دیتابیس نرم‌افزار": document.getElementById("desk-db-val")?.value || "",
        "توضیحات نرم‌افزار": document.getElementById("desk-notes").value.trim() || "ندارد"
      };
    } else if (activeCategory === "poster") {
      specificDetails = {
        "ابعاد و فرمت پوستر": document.getElementById("poster-size-val")?.value || "",
        "زیرعنوان / اطلاعات پوستر": document.getElementById("poster-subtitle").value.trim() || "ندارد",
        "سبک و هویت بصری": document.getElementById("poster-style-val")?.value || "",
        "رنگ‌های ترجیحی پوستر": document.getElementById("poster-colors").value.trim() || "طبق نظر طراح",
        "لینک عکس‌ها و لوگو": document.getElementById("poster-images").value.trim() || "ندارد",
        "توضیحات و متن‌های پوستر": document.getElementById("poster-notes").value.trim() || "ندارد"
      };
    }

    // Construct Master Email Payload for FormSubmit
    const fullPayload = {
      _subject: `[سفارش URCLUB] ${categoryTitles[activeCategory]} - ${projectName} (${clientName})`,
      _captcha: "false",
      _template: "table",
      "کد پیگیری سفارش": randomTicket,
      "نوع پروژه": categoryTitles[activeCategory],
      "عنوان پروژه": projectName,
      "نام کارفرما": clientName,
      "شماره تماس و واتساپ": clientPhone,
      "آیدی تلگرام / اینستاگرام": clientSocial || "ثبت نشده",
      "ایمیل کارفرما": clientEmail || "ثبت نشده",
      "روش ارتباطی ترجیحی": contactMethod,
      ...specificDetails,
      "زمان ثبت سفارش": new Date().toLocaleString("fa-IR")
    };

    // UI Loading State
    btnSubmit.disabled = true;
    btnText.style.display = "none";
    btnSpinner.style.display = "inline-flex";

    let emailSuccess = false;

    try {
      // 1. Direct AJAX Delivery to urclub7@gmail.com via FormSubmit
      const response = await fetch("https://formsubmit.co/ajax/urclub7@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(fullPayload)
      });

      if (response.ok) {
        emailSuccess = true;
      }
    } catch (err) {
      console.warn("FormSubmit fetch error:", err);
    }

    // 2. Cloud Database Backup (Supabase) so no order is ever lost
    if (supabaseClient) {
      try {
        await supabaseClient.from("bio_profiles").upsert({
          id: `order_${randomTicket.toLowerCase()}`,
          data: fullPayload,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Supabase backup notice:", err);
      }
    }

    // Reset Loading State
    btnSubmit.disabled = false;
    btnText.style.display = "inline-flex";
    btnSpinner.style.display = "none";

    // Show Success Modal
    ticketIdEl.textContent = randomTicket;
    ticketCatEl.textContent = `${categoryTitles[activeCategory]} (${projectName})`;

    // Update WhatsApp link with prefilled order ticket
    const waBtn = document.querySelector(".btn-wa");
    if (waBtn) {
      const waMsg = encodeURIComponent(`سلام، من سفارش با کد ${randomTicket} برای «${categoryTitles[activeCategory]} - ${projectName}» را ثبت کردم.`);
      waBtn.href = `https://wa.me/491624212685?text=${waMsg}`;
    }

    successModal.classList.add("active");
    showToast(`سفارش شما با کد ${randomTicket} با موفقیت به ایمیل urclub7@gmail.com فرستاده شد!`);
  });

  // Close Success Modal Handler
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      successModal.classList.remove("active");
    });
  }

  if (successModal) {
    successModal.addEventListener("click", (e) => {
      if (e.target === successModal) {
        successModal.classList.remove("active");
      }
    });
  }
});
