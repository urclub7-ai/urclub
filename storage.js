/**
 * Guns.lol Cloud Engine with Supabase (Multi-Profile & Main Owner Page)
 */

const SUPABASE_URL = "https://thkaconmltqowxhjamfj.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZGZe4Tna3kz3VzKRQmPlRg_bWB7Hs4h";

let supabaseClient = null;
if (typeof supabase !== "undefined" && supabase.createClient) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const DB_NAME = "GunsLolBioDB";
const DB_VERSION = 1;
const STORE_NAME = "profiles";
const MAIN_PROFILE_ID = "main";

const DEFAULT_MAIN_PROFILE = {
  id: "main",
  name: "LEVI",
  username: "levi",
  subtitle: "Humanity's Strongest Soldier & Content Creator",
  views: "10",
  baseViews: "10",
  autoIncrementViews: true,
  showSparkles: true,
  showDotMatrix: true,
  mainAvatar: "",
  presenceAvatar: "",
  backgroundVideo: "",
  presence: {
    handle: "levi",
    status: "online",
    statusColor: "#22c55e"
  },
  socials: {}
};

const SOCIAL_CATALOG = [
  { id: "discord", name: "Discord", icon: "fa-brands fa-discord", color: "#5865F2", placeholder: "https://discord.gg/yourserver" },
  { id: "tiktok", name: "TikTok", icon: "fa-brands fa-tiktok", color: "#ff0050", placeholder: "https://tiktok.com/@yourhandle" },
  { id: "whatsapp", name: "WhatsApp", icon: "fa-brands fa-whatsapp", color: "#25D366", placeholder: "https://wa.me/yournumber" },
  { id: "instagram", name: "Instagram", icon: "fa-brands fa-instagram", color: "#E1306C", placeholder: "https://instagram.com/yourhandle" },
  { id: "telegram", name: "Telegram", icon: "fa-brands fa-telegram", color: "#229ED9", placeholder: "https://t.me/yourusername" },
  { id: "youtube", name: "YouTube", icon: "fa-brands fa-youtube", color: "#FF0000", placeholder: "https://youtube.com/@yourchannel" },
  { id: "twitch", name: "Twitch", icon: "fa-brands fa-twitch", color: "#9146FF", placeholder: "https://twitch.tv/yourchannel" },
  { id: "steam", name: "Steam", icon: "fa-brands fa-steam", color: "#66c0f4", placeholder: "https://steamcommunity.com/id/yourprofile" },
  { id: "twitter", name: "Twitter / X", icon: "fa-brands fa-x-twitter", color: "#ffffff", placeholder: "https://x.com/yourhandle" },
  { id: "github", name: "GitHub", icon: "fa-brands fa-github", color: "#f0f6fc", placeholder: "https://github.com/yourusername" },
  { id: "spotify", name: "Spotify", icon: "fa-brands fa-spotify", color: "#1DB954", placeholder: "https://open.spotify.com/user/..." },
  { id: "kick", name: "Kick", icon: "fa-solid fa-k", color: "#53FC18", placeholder: "https://kick.com/yourchannel" },
  { id: "snapchat", name: "Snapchat", icon: "fa-brands fa-snapchat", color: "#FFFC00", placeholder: "https://snapchat.com/add/..." },
  { id: "reddit", name: "Reddit", icon: "fa-brands fa-reddit", color: "#FF4500", placeholder: "https://reddit.com/user/..." }
];

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

class ProfileStore {
  static getSupabase() {
    if (!supabaseClient && typeof supabase !== "undefined" && supabase.createClient) {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return supabaseClient;
  }

  // Fetch all profiles from Supabase Cloud
  static async getProfilesAsync() {
    const sb = this.getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from("bio_profiles")
          .select("*")
          .setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        if (!error && data && data.length > 0) {
          const map = {};
          data.forEach((row) => {
            map[row.id] = row.data;
          });
          return map;
        }
      } catch (e) {
        console.warn("Supabase getProfiles error:", e);
      }
    }

    // Local IndexedDB Fallback
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = req.result || [];
          const map = {};
          list.forEach((p) => { map[p.id] = p; });
          resolve(Object.keys(map).length > 0 ? map : { "main": DEFAULT_MAIN_PROFILE });
        };
        req.onerror = () => resolve({ "main": DEFAULT_MAIN_PROFILE });
      });
    } catch (e) {
      return { "main": DEFAULT_MAIN_PROFILE };
    }
  }

  // Fetch single profile: Defaults to 'main' for the root site
  static async getProfileAsync(id) {
    const targetId = id || MAIN_PROFILE_ID;
    const sb = this.getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from("bio_profiles")
          .select("data")
          .setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
          .eq("id", targetId)
          .single();
        if (!error && data && data.data) {
          const profile = data.data;
          // Safeguard: Ensure views is at least 10
          let v = parseInt(String(profile.views || "10").replace(/[^0-9]/g, ""), 10);
          if (isNaN(v) || v < 10) v = 10;
          profile.views = String(v);
          if (!profile.baseViews) profile.baseViews = "10";
          return profile;
        }
      } catch (e) {
        console.warn("Supabase fetch error for", targetId, e);
      }
    }

    // Local Storage / IndexedDB Fallback
    try {
      const cached = localStorage.getItem("urclub_cached_profile_" + targetId);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed) {
          let v = parseInt(String(parsed.views || "10").replace(/[^0-9]/g, ""), 10);
          if (isNaN(v) || v < 10) v = 10;
          parsed.views = String(v);
          return parsed;
        }
      }
    } catch (e) {}

    const profiles = await this.getProfilesAsync();
    const fallbackProfile = profiles[targetId] || profiles[MAIN_PROFILE_ID] || { ...DEFAULT_MAIN_PROFILE };
    let fallbackV = parseInt(String(fallbackProfile.views || "10").replace(/[^0-9]/g, ""), 10);
    if (isNaN(fallbackV) || fallbackV < 10) fallbackV = 10;
    fallbackProfile.views = String(fallbackV);
    return fallbackProfile;
  }

  // Save profile to Supabase Cloud + Local Cache (Only called when Save Changes is clicked)
  static async saveProfileAsync(id, profileData) {
    const targetId = id || MAIN_PROFILE_ID;
    profileData.id = targetId;
    const sb = this.getSupabase();

    // Prevent saving view count < 10
    let savingViews = parseInt(String(profileData.views || "10").replace(/[^0-9]/g, ""), 10);
    if (isNaN(savingViews) || savingViews < 10) savingViews = 10;

    let baseViews = parseInt(String(profileData.baseViews || savingViews).replace(/[^0-9]/g, ""), 10);
    if (isNaN(baseViews) || baseViews < 10) baseViews = 10;

    profileData.views = String(savingViews);
    profileData.baseViews = String(baseViews);

    if (sb) {
      try {
        // If preserving live views (admin didn't manually change the views input), retain live cloud count
        if (profileData._preserveLiveViews) {
          try {
            const { data: cloudRow } = await sb
              .from("bio_profiles")
              .select("data")
              .eq("id", targetId)
              .single();
            if (cloudRow && cloudRow.data) {
              const cloudViews = parseInt(String(cloudRow.data.views || "10").replace(/[^0-9]/g, ""), 10);
              if (!isNaN(cloudViews) && cloudViews > savingViews) {
                profileData.views = String(cloudViews);
              }
            }
          } catch (e) {}
        }
        delete profileData._preserveLiveViews;

        const { error } = await sb.from("bio_profiles").upsert({
          id: targetId,
          data: profileData,
          updated_at: new Date().toISOString()
        });
        if (error) {
          console.error("Supabase upsert error:", error);
          throw error;
        }
      } catch (e) {
        console.error("Supabase save exception:", e);
        throw e;
      }
    }

    // Cache locally
    try {
      localStorage.setItem("urclub_cached_profile_" + targetId, JSON.stringify(profileData));
    } catch (e) {}

    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(profileData);
    } catch (e) {}

    return profileData;
  }

  // Increment view counter safely in Supabase (Guaranteed: Floor >= 10, never resets to 0 or 1)
  static async incrementViewsAsync(id) {
    const targetId = id || MAIN_PROFILE_ID;
    const sb = this.getSupabase();
    if (!sb) return null;

    try {
      const { data: row, error } = await sb
        .from("bio_profiles")
        .select("data")
        .eq("id", targetId)
        .setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
        .single();

      if (error || !row || !row.data) {
        console.warn("Could not fetch profile for view increment, aborting to prevent reset:", error);
        return null;
      }

      const profile = row.data;
      let baseMin = parseInt(String(profile.baseViews || "10").replace(/[^0-9]/g, ""), 10);
      if (isNaN(baseMin) || baseMin < 10) baseMin = 10;

      let currentViews = parseInt(String(profile.views || baseMin).replace(/[^0-9]/g, ""), 10);
      if (isNaN(currentViews) || currentViews < baseMin) {
        currentViews = baseMin;
      }

      // Add strictly 1 to current cloud count
      const newCount = currentViews + 1;
      profile.views = String(newCount);
      profile.baseViews = String(baseMin);

      const { error: updateErr } = await sb
        .from("bio_profiles")
        .update({
          data: profile,
          updated_at: new Date().toISOString()
        })
        .eq("id", targetId);

      if (updateErr) {
        console.error("Supabase view update error:", updateErr);
        return null;
      }

      try {
        localStorage.setItem("urclub_cached_profile_" + targetId, JSON.stringify(profile));
      } catch (e) {}

      try {
        const db = await openDatabase();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(profile);
      } catch (e) {}

      return profile.views;
    } catch (e) {
      console.error("Increment exception:", e);
      return null;
    }
  }

  // Delete profile
  static async deleteProfileAsync(id) {
    if (id === MAIN_PROFILE_ID) return; // Protect main profile

    const sb = this.getSupabase();
    if (sb) {
      try {
        await sb.from("bio_profiles").delete().eq("id", id);
      } catch (e) {}
    }

    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
    } catch (e) {}
  }
}

/**
 * ============================================================================
 * OrderCodeStore - Cloud-Synced Order Access & Tracking Codes (Supabase)
 * ============================================================================
 */
const ORDER_CODES_DOC_ID = "urclub_order_codes";
const ORDER_CODES_LOCAL_KEY = "urclub_cached_order_codes";

class OrderCodeStore {
  static getSupabase() {
    return ProfileStore.getSupabase();
  }

  // Normalize code for comparison (uppercase, strip hyphens & whitespace)
  static normalize(code) {
    if (!code) return "";
    return String(code).trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  // Format 8-char code as XXXX-XXXX for presentation
  static formatDisplay(code) {
    const clean = this.normalize(code);
    if (clean.length === 8) {
      return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    }
    return code ? String(code).toUpperCase() : "";
  }

  // Generate crisp 8-character alphanumeric code
  static generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omits confusing 0/O, 1/I
    let p1 = "", p2 = "";
    for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    return `${p1}-${p2}`;
  }

  // Fetch all codes from Cloud with Local fallback
  static async getAllCodesAsync() {
    const sb = this.getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from("bio_profiles")
          .select("data")
          .eq("id", ORDER_CODES_DOC_ID)
          .single();
        if (!error && data && data.data && Array.isArray(data.data.codes)) {
          try {
            localStorage.setItem(ORDER_CODES_LOCAL_KEY, JSON.stringify(data.data.codes));
          } catch (e) {}
          return data.data.codes;
        }
      } catch (e) {
        console.warn("OrderCodeStore getAllCodesAsync error:", e);
      }
    }

    try {
      const cached = localStorage.getItem(ORDER_CODES_LOCAL_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}

    return [];
  }

  // Save codes list to Cloud
  static async saveCodesAsync(codesList) {
    try {
      localStorage.setItem(ORDER_CODES_LOCAL_KEY, JSON.stringify(codesList));
    } catch (e) {}

    const sb = this.getSupabase();
    if (sb) {
      try {
        await sb.from("bio_profiles").upsert({
          id: ORDER_CODES_DOC_ID,
          data: { codes: codesList },
          updated_at: new Date().toISOString()
        });
        return true;
      } catch (e) {
        console.error("OrderCodeStore saveCodesAsync error:", e);
      }
    }
    return false;
  }

  // Verify a code entered by a customer
  static async verifyCodeAsync(rawInput) {
    const norm = this.normalize(rawInput);
    if (!norm) return { valid: false, reason: "empty" };

    const list = await this.getAllCodesAsync();
    const match = list.find((item) => this.normalize(item.code) === norm);

    if (!match) {
      return { valid: false, reason: "notFound" };
    }

    if (match.status === "used") {
      return { valid: false, reason: "alreadyUsed", codeObj: match };
    }

    if (match.status === "revoked") {
      return { valid: false, reason: "revoked", codeObj: match };
    }

    return { valid: true, codeObj: match };
  }

  // Create and register a new code
  static async createCodeAsync({ code, clientName, note }) {
    const formatted = code ? code.trim().toUpperCase() : this.generateCode();
    const norm = this.normalize(formatted);
    const list = await this.getAllCodesAsync();

    if (list.some((item) => this.normalize(item.code) === norm)) {
      throw new Error("این کد قبلاً در سیستم ثبت شده است.");
    }

    const newEntry = {
      code: formatted,
      normalized: norm,
      clientName: (clientName || "").trim() || "مشتری جدید",
      note: (note || "").trim(),
      status: "active", // "active" | "used" | "revoked"
      createdAt: new Date().toISOString(),
      usedAt: null,
      orderTicket: null,
      projectName: null
    };

    list.unshift(newEntry);
    await this.saveCodesAsync(list);
    return newEntry;
  }

  // Mark code as used when customer submits order
  static async markCodeUsedAsync(rawCode, orderDetails = {}) {
    const norm = this.normalize(rawCode);
    const list = await this.getAllCodesAsync();
    const idx = list.findIndex((item) => this.normalize(item.code) === norm);

    if (idx !== -1) {
      list[idx].status = "used";
      list[idx].usedAt = new Date().toISOString();
      if (orderDetails.clientName) list[idx].clientName = orderDetails.clientName;
      if (orderDetails.projectName) list[idx].projectName = orderDetails.projectName;
      if (orderDetails.orderTicket) list[idx].orderTicket = orderDetails.orderTicket;
      await this.saveCodesAsync(list);
    }

    // Also persist order record in bio_profiles under order_<norm>
    const sb = this.getSupabase();
    if (sb) {
      try {
        await sb.from("bio_profiles").upsert({
          id: `order_${norm.toLowerCase()}`,
          data: {
            code: rawCode,
            normCode: norm,
            ...orderDetails,
            updated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Order persistence notice:", e);
      }
    }

    return true;
  }

  // Toggle or change status
  static async updateStatusAsync(rawCode, newStatus) {
    const norm = this.normalize(rawCode);
    const list = await this.getAllCodesAsync();
    const item = list.find((c) => this.normalize(c.code) === norm);
    if (item) {
      item.status = newStatus;
      await this.saveCodesAsync(list);
      return true;
    }
    return false;
  }

  // Delete code
  static async deleteCodeAsync(rawCode) {
    const norm = this.normalize(rawCode);
    let list = await this.getAllCodesAsync();
    list = list.filter((c) => this.normalize(c.code) !== norm);
    await this.saveCodesAsync(list);
    return true;
  }

  // Fetch full submitted order details for a code
  static async getOrderDetailsAsync(rawCode) {
    const norm = this.normalize(rawCode);
    const sb = this.getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from("bio_profiles")
          .select("data")
          .eq("id", `order_${norm.toLowerCase()}`)
          .single();
        if (!error && data && data.data) {
          return data.data;
        }
      } catch (e) {}
    }
    return null;
  }
}
