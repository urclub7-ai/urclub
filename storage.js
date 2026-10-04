/**
 * Guns.lol Cloud Engine with Supabase & IndexedDB Hybrid Sync
 */

const SUPABASE_URL = "https://thkaconmltqowxhjamfj.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZGZe4Tna3kz3VzKRQmPlRg_bWB7Hs4h";

// Init Supabase Client
let supabaseClient = null;
if (typeof supabase !== "undefined" && supabase.createClient) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const DB_NAME = "GunsLolBioDB";
const DB_VERSION = 1;
const STORE_NAME = "profiles";

const DEFAULT_PROFILES = {
  "levi": {
    id: "levi",
    name: "LEVI",
    username: "levi85150",
    subtitle: "Humanity's Strongest Soldier & Content Creator",
    views: "90",
    autoIncrementViews: true,
    showSparkles: true,
    showDotMatrix: true,
    mainAvatar: "assets/avatar.jpg",
    presenceAvatar: "assets/avatar.jpg",
    backgroundVideo: "assets/levi_background.mp4",
    presence: {
      handle: "levi85150",
      status: "online",
      statusColor: "#22c55e"
    },
    socials: {
      discord: "https://discord.gg/rFq2ayYv",
      tiktok: "https://www.tiktok.com/@n_othing1?_r=1&_t=ZG-9AH1lYp6ddJ",
      whatsapp: "https://wa.me/491624212685",
      instagram: "https://www.instagram.com/levi85150?stkn=aGJheWtjZXkxY3I1&utm_source=qr",
      telegram: "https://t.me/LEVI_2213",
      youtube: "",
      twitch: "",
      steam: "",
      twitter: "",
      github: "",
      spotify: "",
      kick: "",
      snapchat: "",
      reddit: ""
    }
  }
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

// Open IndexedDB (Local Fallback & Cache)
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

  // Fetch all profiles from Supabase Cloud (with IndexedDB fallback)
  static async getProfilesAsync() {
    const sb = this.getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("bio_profiles").select("*");
        if (!error && data && data.length > 0) {
          const map = {};
          data.forEach((row) => {
            map[row.id] = row.data;
          });
          return map;
        }
      } catch (e) {
        console.warn("Supabase fetch failed, fallback to local:", e);
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
          resolve(Object.keys(map).length > 0 ? map : DEFAULT_PROFILES);
        };
        req.onerror = () => resolve(DEFAULT_PROFILES);
      });
    } catch (e) {
      return DEFAULT_PROFILES;
    }
  }

  // Fetch single profile
  static async getProfileAsync(id) {
    const targetId = id || this.getActiveId() || "levi";
    const sb = this.getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("bio_profiles").select("data").eq("id", targetId).single();
        if (!error && data && data.data) {
          return data.data;
        }
      } catch (e) {
        console.warn("Supabase single fetch error:", e);
      }
    }

    const profiles = await this.getProfilesAsync();
    return profiles[targetId] || profiles["levi"] || DEFAULT_PROFILES["levi"];
  }

  // Save profile to Supabase Cloud + Local Cache
  static async saveProfileAsync(id, profileData) {
    profileData.id = id;
    const sb = this.getSupabase();

    if (sb) {
      try {
        const { error } = await sb.from("bio_profiles").upsert({
          id: id,
          data: profileData,
          updated_at: new Date().toISOString()
        });
        if (error) console.error("Supabase upsert error:", error);
      } catch (e) {
        console.error("Supabase save exception:", e);
      }
    }

    // Also cache locally
    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(profileData);
    } catch (e) {}

    this.setActiveId(id);
    return profileData;
  }

  // Increment view counter globally in Supabase
  static async incrementViewsAsync(id) {
    const targetId = id || this.getActiveId() || "levi";
    const profile = await this.getProfileAsync(targetId);
    if (!profile) return "90";

    let baseCount = parseInt(String(profile.views).replace(/,/g, ""), 10);
    if (isNaN(baseCount)) baseCount = 90;

    const newCount = baseCount + 1;
    profile.views = newCount.toLocaleString();

    await this.saveProfileAsync(targetId, profile);
    return profile.views;
  }

  // Delete profile
  static async deleteProfileAsync(id) {
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

  static getActiveId() {
    return localStorage.getItem("guns_lol_active_profile_id") || "levi";
  }

  static setActiveId(id) {
    localStorage.setItem("guns_lol_active_profile_id", id);
  }
}
