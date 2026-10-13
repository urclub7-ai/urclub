/**
 * URCLUB Studio - Comprehensive Bilingual (FA / EN) Order Form
 * Features: Initial Language Gate Overlay with Background Blur + Mid-Form Live Switcher
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 0. DIGIT LOCALIZATION HELPERS (FA <-> EN)
  // ==========================================================================
  const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const LATIN_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  function toPersianDigits(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[d]);
  }

  function toLatinDigits(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[۰-۹]/g, (d) => {
      const idx = PERSIAN_DIGITS.indexOf(d);
      return idx !== -1 ? LATIN_DIGITS[idx] : d;
    });
  }

  // ==========================================================================
  // 1. I18N DICTIONARY (PERSIAN & ENGLISH)
  // ==========================================================================
  const I18N = {
    fa: {
      order_code_label: "کد سفارش:",
      code_gate_title: "فرم اختصاصی ثبت پروژه URCLUB",
      code_gate_subtitle: "برای دسترسی به فرم و ثبت مشخصات پروژه کد خود را وارد کنید",
      code_gate_btn: '<i class="fa-solid fa-key"></i> باز کردن و ورود به فرم',
      code_gate_spinner: "در حال اعتبارسنجی...",
      code_gate_no_code: "کد ندارم",
      admin_contact_text: "برای دریافت کد سفارش خود را ثبت کنید.",
      header_status: "پذیرش سفارشات فعال است",
      hero_pill: "پروپوزال و ثبت مشخصات دقیق پروژه",
      hero_title_1: "پروژه اختصاصی خود را ",
      hero_title_2: "طراحی و سفارش دهید",
      hero_desc: "برای اینکه سفارش شما دقیقاً مطابق با سلیقه، رنگ‌بندی و نیازهای فنی شما بدون هیچ نقصی ساخته شود، نوع پروژه خود را انتخاب کرده و فرم تخصصی آن را پر کنید.",

      // Step 1
      step1_title: "انتخاب نوع پروژه",
      step1_subtitle: "ابتدا دسته‌بندی خدمتی که مد نظر دارید را انتخاب کنید:",
      cat_web_title: "طراحی وب‌سایت",
      cat_web_desc: "فروشگاهی، شرکتی، خدماتی، پورتفولیو / بیو شخصی، لندینگ پیج و وبلاگ",
      cat_web_tag: "پراستفاده‌ترین",
      cat_app_title: "برنامه موبایل",
      cat_app_desc: "اپلیکیشن‌های اندروید (Android) و آی‌او‌اس (iOS) مدرن و واکنش‌گرا",
      cat_app_tag: "Android / iOS",
      cat_desk_title: "نرم‌افزار کامپیوتر",
      cat_desk_desc: "برنامه‌های دسکتاپ ویندوز (Windows)، مک (macOS) و لینوکس",
      cat_desk_tag: "Desktop OS",
      cat_poster_title: "طراحی پوستر و گرافیک",
      cat_poster_desc: "پوستر تبلیغاتی، کاور ریلز/یوتیوب، بنر چاپی، هویت بصری و لوگو",
      cat_poster_tag: "Creative Design",

      // Step 2: Website
      step2_web_title: "مشخصات و جزییات فنی وب‌سایت",
      step2_web_subtitle: "تمام جزییات ظاهری، دامنه، دیتابیس و صفحات وب‌سایت خود را مشخص کنید:",
      web_name_label: "نام وب‌سایت / برند شما",
      web_name_ph: "مثال: فروشگاه لِوی یا کلاب آنلاین",
      web_name_hint: "نامی که در بالای سایت و تب مرورگر درج می‌شود.",
      web_slogan_label: "شعار یا توضیح کوتاه وب‌سایت",
      web_slogan_ph: "مثال: مرجع تخصصی پوشاک و اکسسوری گیمینگ",
      web_slogan_hint: "یک جمله یا شعار جذاب برای معرفی کارتان.",
      web_type_label: "نوع و کاربرد اصلی وب‌سایت",
      web_type_1: "🛒 فروشگاهی (فروش کالا یا فایل)",
      web_type_2: "🏢 شرکتی و معرفی بیزینس",
      web_type_3: "👑 لینک بیو و پورتفولیو شخصی",
      web_type_4: "🚀 تبلیغاتی و لندینگ تک‌صفحه",
      web_type_5: "🎓 آموزشی و دوره آنلاین",
      web_type_6: "📰 وبلاگ و انتشار مقاله",
      web_type_7: "✨ ایده و کاربرد سفارشی",
      web_pages_label: "تعداد صفحات مد نظر",
      web_pages_1: "تک‌صفحه‌ای (Landing)",
      web_pages_2: "۲ تا ۵ صفحه",
      web_pages_3: "۵ تا ۱۰ صفحه",
      web_pages_4: "جامع و نامحدود",
      web_lang_label: "زبان(های) وب‌سایت",
      web_lang_1: "فارسی",
      web_lang_2: "English",
      web_lang_3: "دوزبانه (فارسی + انگلیسی)",
      web_lang_4: "پشتو + فارسی",
      web_lang_5: "چندزبانه کامل",
      web_theme_label: "تم رنگی و استایل بصری وب‌سایت",
      theme_1: "تیره و لوکس نئونی (استایل URCLUB)",
      theme_2: "سایبرپانک و گیمینگ (آبی و صورتی)",
      theme_3: "مینیمال سیاه و سفید خالص",
      theme_4: "زمردی و طلایی سلطنتی",
      color_custom_title: "یا رنگ‌های دلخواه خود را دقیق انتخاب کنید:",
      color_bg_label: "رنگ زمینه (Background):",
      color_primary_label: "رنگ اصلی (Primary):",
      color_accent_label: "رنگ برجسته (Accent):",
      web_domain_type_label: "پسوند و نوع دامین مد نظر",
      domain_1: "🌐 .com (پیشنهادی تجاری)",
      domain_2: "🌐 .net یا .org",
      domain_3: "⚡ رایگان سریع (.vercel.app)",
      domain_4: "🔒 خودم دامنه دارم",
      domain_5: "💡 نیاز به راهنمایی دامین",
      web_domain_name_label: "آدرس یا نام دامین پیشنهادی",
      web_domain_name_hint: "آدرسی که می‌خواهید کاربر با سرچ آن وارد سایت شود.",
      web_db_label: "پایگاه داده (دیتابیس) و هاستینگ",
      db_1_text: "استفاده از دیتابیس رایگان و پرسرعت سوپابیس (Supabase)",
      db_2_text: "هاست و دیتابیس اختصاصی خودم را دارم",
      db_3_text: "وب‌سایت تک‌منظوره بدون نیاز به دیتابیس",
      db_4_text: "صفر تا صد هاست را شما تهیه و ست کنید",
      features_label: "امکانات و قابلیت‌های ویژه مورد نیاز (چند مورد را انتخاب کنید)",
      feat_1: "درگاه پرداخت آنلاین",
      feat_2: "ثبت‌نام و پروفایل کاربران",
      feat_3: "پنل ادمین اختصاصی",
      feat_4: "پس‌زمینه ویدیو/صدا",
      feat_5: "چت آنلاین و پشتیبانی",
      feat_6: "سوئیچ دارک/لایت",
      feat_7: "سیستم شمارنده بازدید",
      feat_8: "اتصال به شبکه‌های اجتماعی",
      feat_9: "سئو استاندارد گوگل",
      feat_10: "سبد خرید و صدور فاکتور",
      web_refs_label: "سایت‌های نمونه یا رقبا که می‌پسندید",
      web_refs_hint: "لینک هر وب‌سایتی که استایلش را دوست دارید وارد کنید.",
      web_notes_label: "توضیحات تکمیلی یا جزئیات خاص وب‌سایت",
      web_notes_ph: "هر توضیح دیگری مثل نحوه چیدمان منوها، فونت ترجیحی، امکانات خاص و...",

      // Step 2: Mobile
      step2_app_title: "مشخصات و الزامات برنامه موبایل",
      step2_app_subtitle: "جزییات مربوط به ساخت اپلیکیشن اندروید یا آیفون را مشخص کنید:",
      app_name_label: "نام اپلیکیشن موبایل",
      app_name_ph: "مثال: اپلیکیشن فروشگاهی لِوی",
      app_platform_label: "سیستم‌عامل هدف (Platform)",
      app_plat_1: "📱 هردو (Android + iOS)",
      app_plat_2: "🤖 فقط اندروید (Android)",
      app_plat_3: "🍎 فقط آیفون (iOS)",
      app_cat_label: "دسته‌بندی و ماهیت اپلیکیشن",
      app_cat_1: "🛍️ فروشگاهی و خرید آنلاین",
      app_cat_2: "📅 خدماتی و رزرو نوبت",
      app_cat_3: "📚 آموزشی و پلیر ویدیو",
      app_cat_4: "💬 اجتماعی و پیام‌رسان",
      app_cat_5: "🛠️ ابزار تخصصی و کاربردی",
      app_db_label: "سرور و دیتابیس اپلیکیشن",
      app_db_1: "سوپابیس (Supabase)",
      app_db_2: "API و سرور اختصاصی دارم",
      app_db_3: "آفلاین داخلی (SQLite)",
      app_auth_label: "روش ثبت‌نام و ورود کاربران",
      app_auth_1: "📲 شماره تلفن و SMS",
      app_auth_2: "✉️ ایمیل + گوگل (Google)",
      app_auth_3: "👤 ورود مستقیم میهمان",
      app_notes_label: "امکانات ویژه و توضیحات اپلیکیشن",
      app_notes_ph: "توضیح کامل صفحاتی که برنامه باید داشته باشد، نیاز به لوکیشن یا نوتیفیکیشن، پرداخت درون‌برنامه‌ای و...",

      // Step 2: Desktop
      step2_desk_title: "مشخصات نرم‌افزار کامپیوتر (دسکتاپ)",
      step2_desk_subtitle: "نیازمندی‌های نرم‌افزار ویندوز یا مک را مشخص نمایید:",
      desk_name_label: "نام نرم‌افزار دسکتاپ",
      desk_name_ph: "مثال: سیستم مدیریت مشتریان یا ربات اتوماسیون",
      desk_os_label: "سیستم‌عامل مقصد",
      desk_os_1: "🪟 ویندوز (Windows)",
      desk_os_2: "🍏 مک (macOS)",
      desk_os_3: "🌐 همه‌کاره (ویندوز + مک)",
      desk_type_label: "نوع کارکرد و موضوع نرم‌افزار",
      desk_type_1: "📊 حسابداری و انبارداری",
      desk_type_2: "🤖 اتوماسیون و ابزار خودکار",
      desk_type_3: "🎬 مالتی‌مدیا و گرافیک",
      desk_type_4: "⚙️ ابزار اختصاصی",
      desk_db_label: "نحوه اتصال و دیتابیس نرم‌افزار",
      desk_db_1: "💾 آفلاین محلی (SQLite)",
      desk_db_2: "☁️ آنلاین ابری چندکاربره",
      desk_notes_label: "توضیحات دقیق عملیاتی و امکانات نرم‌افزار",
      desk_notes_ph: "جزییات امکاناتی که نرم‌افزار باید انجام دهد (مانند چاپ فاکتور، خروجی اکسل یا PDF، هشدارها و...)",

      // Step 2: Poster
      step2_poster_title: "مشخصات طراحی پوستر و گرافیک",
      step2_poster_subtitle: "ابعاد، متن‌ها، تم بصری و جزئیات گرافیکی پوستر خود را وارد کنید:",
      poster_size_label: "ابعاد و فرمت مورد نظر پوستر",
      poster_size_1: "📱 استوری اینستاگرام و ریلز (1080x1920)",
      poster_size_2: "🖼️ پست اینستاگرام (مربعی یا عمودی)",
      poster_size_3: "🎬 کاور یوتیوب (1920x1080 Thumbnail)",
      poster_size_4: "🖨️ چاپ باکیفیت (A3 / A4 / بیلبورد)",
      poster_size_5: "✨ طراحی لوگو و نشان تجاری",
      poster_title_label: "عنوان اصلی (تیتر بزرگ) پوستر",
      poster_title_ph: "مثال: مسابقات بزرگ تابستانه لِوی",
      poster_title_hint: "بزرگ‌ترین متنی که باید با فونت بولد و چشمگیر دیده شود.",
      poster_sub_label: "زیرعنوان یا اطلاعات کلیدی",
      poster_sub_ph: "مثال: تاریخ: جمعه ساعت ۲۰ | جوایز ویژه",
      poster_style_label: "سبک و هویت بصری پوستر",
      poster_style_1: "⚡ تیره، نئونی و گیمینگ",
      poster_style_2: "✒️ خوشنویسی و نستعلیق باشکوه",
      poster_style_3: "💎 مینیمال مدرن و تمیز",
      poster_style_4: "🏢 اداری و رسمی",
      poster_style_5: "🔮 سه‌بعدی و فانتزی",
      poster_colors_label: "رنگ‌های ترجیحی پوستر",
      poster_colors_ph: "مثال: بنفش و فیروزه‌ای، یا مشکی و طلایی",
      poster_images_label: "عکس‌ها یا لوگوی پیوست شده",
      poster_images_hint: "اگر عکس شخص یا محصول خاصی باید قرار گیرد لینک آن را بگذارید.",
      poster_notes_label: "سایر نوشته‌ها و توضیحات تکمیلی پوستر",
      poster_notes_ph: "متن‌های فرعی، آدرس وب‌سایت یا آیدی‌های شبکه‌های اجتماعی که باید در پایین پوستر درج شود...",

      // Step 3: Contact
      step3_contact_title: "اطلاعات تماس سفارش‌دهنده",
      step3_contact_subtitle: "برای ارسال پیش‌نمایش و هماهنگی نهایی پروژه، راه‌های ارتباطی خود را بنویسید:",
      client_name_label: "نام و نام خانوادگی شما",
      client_name_ph: "مثال: علی یاسین",
      client_phone_label: "شماره تماس / واتساپ",
      client_phone_hint: "شماره‌ای که در واتساپ یا تلگرام در دسترس است.",
      client_social_label: "آیدی تلگرام / دیسکورد / اینستاگرام",
      client_email_label: "ایمیل شما (جهت دریافت پیش‌فاکتور)",
      contact_method_label: "روش ترجیحی شما برای ارتباط ما",
      cm_1: "💬 پیام در واتساپ",
      cm_2: "✈️ پیام در تلگرام",
      cm_3: "📞 تماس تلفنی مستقیم",
      cm_4: "✉️ ایمیل",

      // Step 4: Summary & Submit
      summary_header: "خلاصه مشخصات سفارش شما:",
      sum_lbl_type: "نوع پروژه:",
      sum_lbl_name: "نام پروژه:",
      sum_lbl_email: "ارسال به ایمیل:",
      sum_empty_name: "هنوز وارد نشده",
      btn_submit_text: "ثبت و ارسال کامل سفارش",
      btn_spinner_text: "در حال ارسال اطلاعات...",
      submit_guarantee: "تمامی اطلاعات شما مستقیماً و به صورت ایمن به استودیو ارسال شده و در کمتر از ۲ ساعت پاسخ داده می‌شود.",

      // Modal
      modal_success_title: "سفارش شما با موفقیت ثبت و ارسال شد!",
      modal_success_desc1: "اطلاعات کامل پروژه شما به ایمیل ",
      modal_success_desc2: " فرستاده شد و کارشناسان ما به زودی با شما تماس خواهند گرفت.",
      modal_ticket_lbl: "کد پیگیری سفارش:",
      modal_proj_lbl: "پروژه انتخابی:",
      modal_wa_btn: "پیام سریع در واتساپ",
      modal_tg_btn: "پیام در تلگرام",
      modal_close_btn: "بستن پنجره",

      // Alerts & Validation
      err_project_name: "لطفاً نام یا عنوان پروژه خود را وارد نمایید.",
      err_client_name: "لطفاً نام و نام خانوادگی خود را وارد کنید.",
      err_client_phone: "لطفاً شماره تماس یا واتساپ خود را وارد کنید.",
      success_toast_prefix: "سفارش شما با کد "
    },

    en: {
      order_code_label: "Order Code:",
      code_gate_title: "URCLUB Exclusive Project Registration",
      code_gate_subtitle: "Enter your verified order code to access the project proposal form",
      code_gate_btn: '<i class="fa-solid fa-key"></i> Verify & Open Form',
      code_gate_spinner: "Verifying code...",
      code_gate_no_code: "I don't have a code",
      admin_contact_text: "To receive an access code, register your order with admin.",
      header_status: "Accepting New Projects",
      hero_pill: "Project Proposal & Detailed Specifications",
      hero_title_1: "Design & Order Your ",
      hero_title_2: "Custom Project",
      hero_desc: "To ensure your project is built exactly to your vision, color palette, and technical needs without compromise, select your category and fill out the form.",

      // Step 1
      step1_title: "Select Project Category",
      step1_subtitle: "Choose the type of service you wish to commission:",
      cat_web_title: "Website Development",
      cat_web_desc: "E-commerce, corporate, service, personal bio portfolio, landing page, and blog",
      cat_web_tag: "Most Popular",
      cat_app_title: "Mobile Application",
      cat_app_desc: "Modern, responsive Android and iOS mobile applications",
      cat_app_tag: "Android / iOS",
      cat_desk_title: "Desktop Software",
      cat_desk_desc: "Native desktop software for Windows, macOS, and Linux",
      cat_desk_tag: "Desktop OS",
      cat_poster_title: "Poster & Graphic Design",
      cat_poster_desc: "Promotional posters, Reels/YouTube covers, print banners, branding, and logos",
      cat_poster_tag: "Creative Design",

      // Step 2: Website
      step2_web_title: "Website Specifications & Technical Details",
      step2_web_subtitle: "Define all visual styles, domains, databases, and page structures:",
      web_name_label: "Website / Brand Name",
      web_name_ph: "e.g. Levi Store or Urclub Online",
      web_name_hint: "The title displayed on your website header and browser tab.",
      web_slogan_label: "Website Tagline or Brief Intro",
      web_slogan_ph: "e.g. The premier gaming apparel & lifestyle club",
      web_slogan_hint: "A catchy sentence or motto describing your brand.",
      web_type_label: "Primary Purpose & Website Type",
      web_type_1: "🛒 E-Commerce (Products & Digital Goods)",
      web_type_2: "🏢 Corporate & Business Portfolio",
      web_type_3: "👑 Personal Bio Link & Portfolio",
      web_type_4: "🚀 Landing Page & Marketing Campaign",
      web_type_5: "🎓 Online Academy & Course Platform",
      web_type_6: "📰 Blog & Media Publication",
      web_type_7: "✨ Custom / Unique Vision",
      web_pages_label: "Number of Pages Required",
      web_pages_1: "Single Page (Landing)",
      web_pages_2: "2 to 5 Pages",
      web_pages_3: "5 to 10 Pages",
      web_pages_4: "Full Scale / Unlimited",
      web_lang_label: "Website Language(s)",
      web_lang_1: "Persian",
      web_lang_2: "English",
      web_lang_3: "Bilingual (Persian + English)",
      web_lang_4: "Pashto + Persian",
      web_lang_5: "Multilingual Global",
      web_theme_label: "Color Palette & Visual Theme",
      theme_1: "Dark Cyber Luxury (URCLUB Style)",
      theme_2: "Cyberpunk & Gaming (Cyan + Pink)",
      theme_3: "Pure Minimal Monochrome",
      theme_4: "Royal Emerald & Gold",
      color_custom_title: "Or pick your exact custom hex colors:",
      color_bg_label: "Background Color:",
      color_primary_label: "Primary Accent:",
      color_accent_label: "Highlight Color:",
      web_domain_type_label: "Domain Preference",
      domain_1: "🌐 .com (Commercial Standard)",
      domain_2: "🌐 .net or .org",
      domain_3: "⚡ Free Fast Vercel (.vercel.app)",
      domain_4: "🔒 I already own a custom domain",
      domain_5: "💡 Need domain recommendation",
      web_domain_name_label: "Proposed Domain Name",
      web_domain_name_hint: "The URL visitors will type to reach your site.",
      web_db_label: "Database & Cloud Hosting",
      db_1_text: "Use free high-speed Supabase Cloud Database",
      db_2_text: "I have my own dedicated hosting & database",
      db_3_text: "Static lightweight site without database",
      db_4_text: "Set up full hosting & server management for me",
      features_label: "Key Features & Capabilities (Select all that apply)",
      feat_1: "Online Payment Gateway",
      feat_2: "User Authentication & Profiles",
      feat_3: "Dedicated Admin Dashboard",
      feat_4: "Background Video / Music Autoplay",
      feat_5: "Live Chat & Support System",
      feat_6: "Dark / Light Mode Switch",
      feat_7: "Real Unique Visitor Counter",
      feat_8: "Social Media Integration",
      feat_9: "Standard Google SEO",
      feat_10: "Cart System & Automated Invoicing",
      web_refs_label: "Reference Websites or Competitors You Like",
      web_refs_hint: "Paste links of any website design you admire.",
      web_notes_label: "Additional Notes or Specific Instructions",
      web_notes_ph: "Any special requirements, layout preferences, fonts, or bespoke features...",

      // Step 2: Mobile
      step2_app_title: "Mobile App Specifications & Requirements",
      step2_app_subtitle: "Specify platform, category, and feature requirements:",
      app_name_label: "Mobile Application Name",
      app_name_ph: "e.g. Levi Shopping App",
      app_platform_label: "Target Platform",
      app_plat_1: "📱 Both (Android + iOS)",
      app_plat_2: "🤖 Android Only",
      app_plat_3: "🍎 iOS / iPhone Only",
      app_cat_label: "App Category & Genre",
      app_cat_1: "🛍️ E-Commerce & Online Store",
      app_cat_2: "📅 Booking & Appointments",
      app_cat_3: "📚 Education & Video Courses",
      app_cat_4: "💬 Social & Messaging",
      app_cat_5: "🛠️ Utility & Practical Tools",
      app_db_label: "Server & Backend Infrastructure",
      app_db_1: "Supabase / Firebase Cloud",
      app_db_2: "Custom Backend API Ready",
      app_db_3: "Offline Local Storage (SQLite)",
      app_auth_label: "User Sign-In & Authentication",
      app_auth_1: "📲 Phone Number + SMS OTP",
      app_auth_2: "✉️ Email + Google Sign-In",
      app_auth_3: "👤 Guest Access (No Login)",
      app_notes_label: "Special Features & Detailed Overview",
      app_notes_ph: "List of screens needed, push notifications, in-app purchases, maps/location...",

      // Step 2: Desktop
      step2_desk_title: "Desktop Software Specifications",
      step2_desk_subtitle: "Specify Windows, macOS, or Linux application details:",
      desk_name_label: "Desktop Software Name",
      desk_name_ph: "e.g. CRM System or Automation Bot",
      desk_os_label: "Target Operating System",
      desk_os_1: "🪟 Windows (10/11 - exe/msi)",
      desk_os_2: "🍏 macOS (Apple Silicon / Intel)",
      desk_os_3: "🌐 Cross-Platform (Win + Mac)",
      desk_type_label: "Software Purpose & Category",
      desk_type_1: "📊 Accounting & Inventory",
      desk_type_2: "🤖 Automation Bot & Tasks",
      desk_type_3: "🎬 Multimedia & Editing",
      desk_type_4: "⚙️ Custom Engineering Tool",
      desk_db_label: "Data Architecture & Storage",
      desk_db_1: "💾 Offline Local DB (SQLite)",
      desk_db_2: "☁️ Online Multi-User Cloud DB",
      desk_notes_label: "Detailed Functional Requirements",
      desk_notes_ph: "Features such as invoice printing, Excel/PDF exports, background alerts...",

      // Step 2: Poster
      step2_poster_title: "Poster & Graphic Design Specifications",
      step2_poster_subtitle: "Dimensions, headlines, visual vibe, and graphic assets:",
      poster_size_label: "Dimensions & Format",
      poster_size_1: "📱 Instagram Story / Reels (1080x1920)",
      poster_size_2: "🖼️ Instagram Post (Square / Portrait)",
      poster_size_3: "🎬 YouTube Thumbnail (1920x1080)",
      poster_size_4: "🖨️ High-Res Print (A3 / A4 / Billboard)",
      poster_size_5: "✨ Logo & Brand Symbol",
      poster_title_label: "Main Headline (Large Title)",
      poster_title_ph: "e.g. Levi Summer Championship",
      poster_title_hint: "The most prominent text in bold typography.",
      poster_sub_label: "Subtitle or Key Details",
      poster_sub_ph: "e.g. Date: Friday 8 PM | Exclusive Prizes",
      poster_style_label: "Visual Style & Mood",
      poster_style_1: "⚡ Dark, Neon & Gaming Vibe",
      poster_style_2: "✒️ Elegant Calligraphy Art",
      poster_style_3: "💎 Modern Minimal Luxury",
      poster_style_4: "🏢 Corporate & Professional",
      poster_style_5: "🔮 3D & Futuristic Art",
      poster_colors_label: "Preferred Color Scheme",
      poster_colors_ph: "e.g. Purple & Cyan, or Black & Gold",
      poster_images_label: "Attached Photos or Logo Links",
      poster_images_hint: "Provide links to high-res images, logos, or reference files.",
      poster_notes_label: "Additional Copy & Design Instructions",
      poster_notes_ph: "Secondary text, social handles, or footers to include...",

      // Step 3: Contact
      step3_contact_title: "Client Contact Details",
      step3_contact_subtitle: "For sending prototypes and final project coordination:",
      client_name_label: "Your Full Name",
      client_name_ph: "e.g. Ali Yasin",
      client_phone_label: "Phone / WhatsApp Number",
      client_phone_hint: "Number active on WhatsApp or Telegram.",
      client_social_label: "Telegram / Discord / Instagram Handle",
      client_email_label: "Your Email Address (for proposals)",
      contact_method_label: "Preferred Contact Channel",
      cm_1: "💬 WhatsApp Message",
      cm_2: "✈️ Telegram Message",
      cm_3: "📞 Direct Phone Call",
      cm_4: "✉️ Email",

      // Step 4: Summary & Submit
      summary_header: "Your Order Summary:",
      sum_lbl_type: "Project Type:",
      sum_lbl_name: "Project Name:",
      sum_lbl_email: "Sent to Email:",
      sum_empty_name: "Not entered yet",
      btn_submit_text: "Submit & Send Complete Order",
      btn_spinner_text: "Sending specifications...",
      submit_guarantee: "All your specifications are delivered securely to our studio and answered within 2 hours.",

      // Modal
      modal_success_title: "Your Order Was Submitted Successfully!",
      modal_success_desc1: "Your complete project specifications have been delivered to ",
      modal_success_desc2: " and our team will get in touch with you shortly.",
      modal_ticket_lbl: "Order Tracking ID:",
      modal_proj_lbl: "Project Type:",
      modal_wa_btn: "Quick WhatsApp Chat",
      modal_tg_btn: "Message on Telegram",
      modal_close_btn: "Close Window",

      // Alerts & Validation
      err_project_name: "Please enter your project name or title.",
      err_client_name: "Please enter your full name.",
      err_client_phone: "Please enter your phone or WhatsApp number.",
      success_toast_prefix: "Your order with ticket "
    }
  };

  // ==========================================================================
  // 2. STATE & DOM ELEMENTS
  // ==========================================================================
  let currentLang = "fa";
  let activeCategory = "website";

  const langGateOverlay = document.getElementById("lang-gate-overlay");
  const appMainWrapper = document.getElementById("app-main-wrapper");
  const langToggleBtn = document.getElementById("lang-toggle-btn");
  const langOptFa = document.querySelector('.lang-opt[data-target-lang="fa"]');
  const langOptEn = document.querySelector('.lang-opt[data-target-lang="en"]');

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

  const sumCategory = document.getElementById("sum-category");
  const sumName = document.getElementById("sum-name");

  const successModal = document.getElementById("success-modal");
  const ticketIdEl = document.getElementById("ticket-id");
  const ticketCatEl = document.getElementById("ticket-cat");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const toastBox = document.getElementById("toast-box");

  const nameInputs = {
    website: document.getElementById("web-name"),
    mobile: document.getElementById("app-name"),
    desktop: document.getElementById("desk-name"),
    poster: document.getElementById("poster-title")
  };

  // ==========================================================================
  // 3. I18N RENDERER
  // ==========================================================================
  function setLanguage(lang) {
    currentLang = (lang === "en") ? "en" : "fa";
    const dict = I18N[currentLang];
    const isEn = (currentLang === "en");

    // 1. HTML Direction & Font Class
    document.documentElement.lang = currentLang;
    document.documentElement.dir = isEn ? "ltr" : "rtl";
    document.body.className = "lang-" + currentLang;

    // 2. Translate Elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key]) {
        if (dict[key].includes("<")) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // 3. Translate Input Placeholders with data-i18n-ph
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const key = el.dataset.i18nPh;
      if (dict[key]) {
        el.placeholder = dict[key];
      }
    });

    // 4. Localize Step Numbers (01, 02, 03 vs ۰۱, ۰۲, ۰۳)
    document.querySelectorAll(".step-num").forEach((el) => {
      const stepVal = el.getAttribute("data-step") || toLatinDigits(el.textContent.trim());
      el.setAttribute("data-step", stepVal);
      el.textContent = isEn ? stepVal : toPersianDigits(stepVal);
    });

    // 5. Update Order Code Badge Value
    if (headerCodeVal) {
      const currentCode = verifiedOrderCode || (headerCodeVal.textContent !== "----" ? headerCodeVal.textContent : "");
      if (currentCode) {
        headerCodeVal.textContent = isEn ? toLatinDigits(currentCode) : currentCode;
      }
    }

    // 6. Update Header Switcher Active State
    if (langOptFa && langOptEn) {
      if (currentLang === "fa") {
        langOptFa.classList.add("active");
        langOptEn.classList.remove("active");
      } else {
        langOptFa.classList.remove("active");
        langOptEn.classList.add("active");
      }
    }

    // 7. Update Category Card Labels in Summary
    const catTitles = {
      website: dict.cat_web_title,
      mobile: dict.cat_app_title,
      desktop: dict.cat_desk_title,
      poster: dict.cat_poster_title
    };
    if (sumCategory) {
      sumCategory.textContent = catTitles[activeCategory] || dict.cat_web_title;
    }
    updateSummaryName();

    // 8. Update Active Chip Hidden Values to Match Language
    document.querySelectorAll(".chip-selector").forEach((container) => {
      const groupName = container.dataset.group;
      const hiddenInput = document.getElementById(`${groupName}-val`);
      const activeChip = container.querySelector(".chip-btn.active");
      if (hiddenInput && activeChip) {
        hiddenInput.value = (isEn && activeChip.dataset.valueEn)
          ? activeChip.dataset.valueEn
          : activeChip.dataset.value;
      }
    });
  }

  // ==========================================================================
  // 3.5 ORDER ACCESS CODE GATE (STRICT AUTHORIZATION GATE)
  // ==========================================================================
  const codeGateOverlay = document.getElementById("code-gate-overlay");
  const formGateCodeForm = document.getElementById("form-gate-code-form");
  const gateCodeInput = document.getElementById("gate-code-input");
  const gateCodeError = document.getElementById("gate-code-error");
  const btnGateVerify = document.getElementById("btn-gate-verify");
  const headerOrderBadge = document.getElementById("header-order-badge");
  const headerCodeVal = document.getElementById("header-code-val");

  let verifiedOrderCode = "";

  async function checkInitialOrderCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramCode = urlParams.get("code");
    const sessionCode = sessionStorage.getItem("urclub_order_code");
    const testCode = (paramCode || sessionCode || "").trim();

    if (testCode && typeof OrderCodeStore !== "undefined") {
      try {
        const res = await OrderCodeStore.verifyCodeAsync(testCode);
        if (res.valid) {
          unlockFormWithCode(res.codeObj.code);
          return;
        }
      } catch (e) {
        console.warn("verifyCodeAsync notice:", e);
      }
    }

    // If not verified or no code, lock form behind Code Gate
    if (codeGateOverlay) {
      codeGateOverlay.style.display = "flex";
      if (langGateOverlay) langGateOverlay.style.display = "none";
      if (testCode && gateCodeInput) {
        gateCodeInput.value = testCode;
        if (gateCodeError) {
          gateCodeError.textContent = "کد وارد شده معتبر نمی‌باشد یا قبلاً استفاده شده است.";
          gateCodeError.style.display = "block";
        }
      }
    }
  }

  function unlockFormWithCode(code) {
    verifiedOrderCode = code;
    try {
      sessionStorage.setItem("urclub_order_code", code);
    } catch (e) {}

    if (headerOrderBadge) headerOrderBadge.style.display = "inline-flex";
    if (headerCodeVal) {
      headerCodeVal.textContent = (currentLang === "en") ? toLatinDigits(code) : code;
    }

    if (codeGateOverlay) codeGateOverlay.style.display = "none";
    if (langGateOverlay) {
      langGateOverlay.style.display = "flex";
      langGateOverlay.classList.remove("hidden");
    }
  }

  if (gateCodeInput) {
    gateCodeInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
      if (gateCodeError) gateCodeError.style.display = "none";
    });
  }

  if (formGateCodeForm) {
    formGateCodeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const val = gateCodeInput ? gateCodeInput.value.trim() : "";
      if (!val) return;

      const btnText = btnGateVerify ? btnGateVerify.querySelector(".btn-gate-text") : null;
      const btnSpin = btnGateVerify ? btnGateVerify.querySelector(".btn-gate-spinner") : null;
      if (btnGateVerify) btnGateVerify.disabled = true;
      if (btnText) btnText.style.display = "none";
      if (btnSpin) btnSpin.style.display = "inline-flex";

      try {
        if (typeof OrderCodeStore !== "undefined") {
          const res = await OrderCodeStore.verifyCodeAsync(val);
          if (res.valid) {
            unlockFormWithCode(res.codeObj.code);
          } else {
            let msg = "کد وارد شده در سیستم یافت نشد. لطفاً از صحت کد اطمینان حاصل فرمایید.";
            if (res.reason === "alreadyUsed") {
              msg = "این کد قبلاً برای ثبت یک سفارش استفاده شده است. لطفاً کد دیگری از واتساپ دریافت فرمایید.";
            } else if (res.reason === "revoked") {
              msg = "این کد توسط مدیریت غیرفعال شده است.";
            }
            if (gateCodeError) {
              gateCodeError.textContent = msg;
              gateCodeError.style.display = "block";
            }
          }
        } else {
          unlockFormWithCode(val);
        }
      } catch (err) {
        if (gateCodeError) {
          gateCodeError.textContent = "خطا در اتصال به سرور. لطفاً مجدداً تلاش نمایید.";
          gateCodeError.style.display = "block";
        }
      } finally {
        if (btnGateVerify) btnGateVerify.disabled = false;
        if (btnText) btnText.style.display = "inline-flex";
        if (btnSpin) btnSpin.style.display = "none";
      }
    });
  }

  const btnGateNoCode = document.getElementById("btn-gate-no-code");
  const modalGateAdminContact = document.getElementById("modal-gate-admin-contact");
  const btnCloseGateAdminContact = document.getElementById("btn-close-gate-admin-contact");

  if (btnGateNoCode) {
    btnGateNoCode.addEventListener("click", () => {
      if (modalGateAdminContact) modalGateAdminContact.style.display = "flex";
    });
  }

  if (btnCloseGateAdminContact) {
    btnCloseGateAdminContact.addEventListener("click", () => {
      if (modalGateAdminContact) modalGateAdminContact.style.display = "none";
    });
  }

  if (modalGateAdminContact) {
    modalGateAdminContact.addEventListener("click", (e) => {
      if (e.target === modalGateAdminContact) {
        modalGateAdminContact.style.display = "none";
      }
    });
  }

  checkInitialOrderCode();

  // Initialize saved or default language
  const savedLang = localStorage.getItem("urclub_lang");
  if (savedLang === "en" || savedLang === "fa") {
    setLanguage(savedLang);
  } else {
    setLanguage("fa");
  }

  // ==========================================================================
  // 4. LANGUAGE GATE INITIAL OVERLAY (BLURRED UNTIL CHOSEN)
  // ==========================================================================
  // ALWAYS ENFORCE BLURRED LANGUAGE GATE ON SITE ENTRY
  // Site remains locked and blurred until user clicks Persian or English
  // ==========================================================================
  if (langGateOverlay) langGateOverlay.classList.remove("hidden");
  if (appMainWrapper) appMainWrapper.classList.add("blurred-gate");

  // Handle Gate Choice Buttons
  document.querySelectorAll(".lang-select-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chosenLang = btn.dataset.lang;
      localStorage.setItem("urclub_lang", chosenLang);

      setLanguage(chosenLang);

      // Smooth unblur transition
      if (langGateOverlay) {
        langGateOverlay.classList.add("hidden");
      }
      if (appMainWrapper) {
        appMainWrapper.classList.remove("blurred-gate");
      }
    });
  });

  // Mid-form Language Switcher Pill Toggle
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", () => {
      const nextLang = (currentLang === "fa") ? "en" : "fa";
      localStorage.setItem("urclub_lang", nextLang);
      setLanguage(nextLang);
    });
  }

  // ==========================================================================
  // 5. CATEGORY SWITCHER LOGIC
  // ==========================================================================
  catCards.forEach((card) => {
    card.addEventListener("click", () => {
      const selectedCat = card.dataset.category;
      if (selectedCat === activeCategory) return;

      catCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");

      Object.keys(formBlocks).forEach((key) => {
        if (formBlocks[key]) {
          formBlocks[key].style.display = (key === selectedCat) ? "block" : "none";
        }
      });

      activeCategory = selectedCat;
      const dict = I18N[currentLang];
      const catTitles = {
        website: dict.cat_web_title,
        mobile: dict.cat_app_title,
        desktop: dict.cat_desk_title,
        poster: dict.cat_poster_title
      };
      sumCategory.textContent = catTitles[activeCategory] || selectedCat;
      updateSummaryName();

      if (formBlocks[selectedCat]) {
        formBlocks[selectedCat].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ==========================================================================
  // 6. CHIP SELECTORS
  // ==========================================================================
  document.querySelectorAll(".chip-selector").forEach((container) => {
    const groupName = container.dataset.group;
    const hiddenInput = document.getElementById(`${groupName}-val`);
    const chips = container.querySelectorAll(".chip-btn");

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        if (hiddenInput) {
          hiddenInput.value = (currentLang === "en" && chip.dataset.valueEn)
            ? chip.dataset.valueEn
            : chip.dataset.value;
        }
      });
    });
  });

  // ==========================================================================
  // 7. THEMES & COLOR PICKERS
  // ==========================================================================
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

  // ==========================================================================
  // 8. LIVE SUMMARY & TOAST
  // ==========================================================================
  function updateSummaryName() {
    const activeInput = nameInputs[activeCategory];
    const val = activeInput ? activeInput.value.trim() : "";
    const dict = I18N[currentLang];
    sumName.textContent = val || dict.sum_empty_name;
  }

  Object.values(nameInputs).forEach((input) => {
    if (input) {
      input.addEventListener("input", updateSummaryName);
    }
  });

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
      toast.style.transform = (currentLang === "en") ? "translateX(-40px)" : "translateX(40px)";
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // ==========================================================================
  // 9. SUPABASE BACKUP CLIENT
  // ==========================================================================
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

  // ==========================================================================
  // 10. SUBMISSION HANDLER
  // ==========================================================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dict = I18N[currentLang];

    const clientName = document.getElementById("client-name").value.trim();
    const clientPhone = document.getElementById("client-phone").value.trim();
    const clientSocial = document.getElementById("client-social").value.trim();
    const clientEmail = document.getElementById("client-email").value.trim();
    const contactMethod = document.getElementById("contact-method-val")?.value || "WhatsApp";

    const currentNameInput = nameInputs[activeCategory];
    const projectName = currentNameInput ? currentNameInput.value.trim() : "";

    if (!projectName) {
      showToast(dict.err_project_name, true);
      if (currentNameInput) {
        currentNameInput.focus();
        currentNameInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!clientName) {
      showToast(dict.err_client_name, true);
      document.getElementById("client-name").focus();
      return;
    }

    if (!clientPhone) {
      showToast(dict.err_client_phone, true);
      document.getElementById("client-phone").focus();
      return;
    }

    const randomTicket = "UR-" + Math.floor(10000 + Math.random() * 90000);
    const catTitles = {
      website: dict.cat_web_title,
      mobile: dict.cat_app_title,
      desktop: dict.cat_desk_title,
      poster: dict.cat_poster_title
    };

    let specificDetails = {};

    if (activeCategory === "website") {
      const selectedFeatures = Array.from(document.querySelectorAll('input[name="web_features"]:checked'))
        .map((cb) => (currentLang === "en" ? (cb.dataset.enVal || cb.value) : cb.value))
        .join(" | ");

      specificDetails = {
        "Category / نوع": document.getElementById("web-type-val")?.value || "",
        "Tagline / شعار": document.getElementById("web-slogan").value.trim() || "N/A",
        "Pages / صفحات": document.getElementById("web-pages-val")?.value || "",
        "Languages / زبان‌ها": document.getElementById("web-lang-val")?.value || "",
        "Background Color": colorBg?.value || "#0a0a0c",
        "Primary Color": colorPrimary?.value || "#a855f7",
        "Accent Color": colorAccent?.value || "#38bdf8",
        "Domain Preference / دامین": document.getElementById("web-domain-type-val")?.value || "",
        "Proposed Domain / آدرس پیشنهادی": document.getElementById("web-domain-name").value.trim() || "N/A",
        "Database / دیتابیس": document.getElementById("web-db-val")?.value || "",
        "Features / امکانات": selectedFeatures || "Default",
        "References / رفرنس‌ها": document.getElementById("web-refs").value.trim() || "N/A",
        "Notes / توضیحات": document.getElementById("web-notes").value.trim() || "N/A"
      };
    } else if (activeCategory === "mobile") {
      specificDetails = {
        "Platform / پلتفرم": document.getElementById("app-platform-val")?.value || "",
        "App Category": document.getElementById("app-cat-val")?.value || "",
        "Database / دیتابیس": document.getElementById("app-db-val")?.value || "",
        "Authentication": document.getElementById("app-auth-val")?.value || "",
        "Notes / توضیحات": document.getElementById("app-notes").value.trim() || "N/A"
      };
    } else if (activeCategory === "desktop") {
      specificDetails = {
        "Target OS": document.getElementById("desk-os-val")?.value || "",
        "Category / موضوع": document.getElementById("desk-type-val")?.value || "",
        "Database / دیتابیس": document.getElementById("desk-db-val")?.value || "",
        "Notes / توضیحات": document.getElementById("desk-notes").value.trim() || "N/A"
      };
    } else if (activeCategory === "poster") {
      specificDetails = {
        "Dimensions / ابعاد": document.getElementById("poster-size-val")?.value || "",
        "Subtitle / زیرعنوان": document.getElementById("poster-subtitle").value.trim() || "N/A",
        "Visual Style / سبک": document.getElementById("poster-style-val")?.value || "",
        "Colors / رنگ‌ها": document.getElementById("poster-colors").value.trim() || "N/A",
        "Asset Links / عکس‌ها": document.getElementById("poster-images").value.trim() || "N/A",
        "Notes / متن‌ها": document.getElementById("poster-notes").value.trim() || "N/A"
      };
    }

    const safeClientFolder = clientName.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, "_").replace(/_+/g, "_");
    const activeOrderCode = verifiedOrderCode || "N/A";
    const recommendedFolderName = `URCLUB_${(activeOrderCode !== "N/A" && typeof OrderCodeStore !== "undefined") ? OrderCodeStore.normalize(activeOrderCode) : randomTicket}_${safeClientFolder}`;

    const fullPayload = {
      _subject: `[URCLUB Order] کد: ${activeOrderCode} - ${catTitles[activeCategory]} - ${projectName} (${clientName})`,
      _captcha: "false",
      _template: "table",
      "Order Access Code / کد اختصاصی سفارش": activeOrderCode,
      "Project Folder Name / نام پوشه پیشنهادی": recommendedFolderName,
      "Tracking Ticket / کد پیگیری": randomTicket,
      "Project Category / نوع پروژه": catTitles[activeCategory],
      "Project Name / عنوان": projectName,
      "Client Name / نام کارفرما": clientName,
      "Phone / WhatsApp": clientPhone,
      "Social Handle": clientSocial || "N/A",
      "Email": clientEmail || "N/A",
      "Contact Channel": contactMethod,
      "Language Used": currentLang.toUpperCase(),
      ...specificDetails,
      "Submitted At": new Date().toISOString()
    };

    btnSubmit.disabled = true;
    btnText.style.display = "none";
    btnSpinner.style.display = "inline-flex";

    try {
      await fetch("https://formsubmit.co/ajax/urclub7@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(fullPayload)
      });
    } catch (err) {
      console.warn("FormSubmit fetch notice:", err);
    }

    // Persist order in Supabase and update code status
    if (typeof OrderCodeStore !== "undefined" && verifiedOrderCode) {
      try {
        await OrderCodeStore.markCodeUsedAsync(verifiedOrderCode, {
          clientName: clientName,
          projectName: projectName,
          orderTicket: randomTicket,
          folderName: recommendedFolderName,
          category: catTitles[activeCategory],
          fullPayload: fullPayload
        });
      } catch (err) {
        console.warn("OrderCodeStore markCodeUsed notice:", err);
      }
    } else if (supabaseClient) {
      try {
        await supabaseClient.from("bio_profiles").upsert({
          id: `order_${randomTicket.toLowerCase()}`,
          data: fullPayload,
          updated_at: new Date().toISOString()
        });
      } catch (err) {}
    }

    btnSubmit.disabled = false;
    btnText.style.display = "inline-flex";
    btnSpinner.style.display = "none";

    const displayTicket = activeOrderCode !== "N/A" ? `${activeOrderCode} • ${randomTicket}` : randomTicket;
    ticketIdEl.textContent = (currentLang === "en") ? toLatinDigits(displayTicket) : displayTicket;
    ticketCatEl.textContent = `${catTitles[activeCategory]} (${projectName})`;

    const waBtn = document.querySelector(".btn-wa");
    if (waBtn) {
      const msg = encodeURIComponent(`Hello, I submitted an order with Ticket ${randomTicket} for "${catTitles[activeCategory]} - ${projectName}".`);
      waBtn.href = `https://wa.me/491624212685?text=${msg}`;
    }

    successModal.classList.add("active");
    showToast(`${dict.success_toast_prefix} ${randomTicket} sent to urclub7@gmail.com!`);
  });

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
