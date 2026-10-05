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
  views: "0",
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
          return data.data;
        }
      } catch (e) {
        console.warn("Supabase fetch error for", targetId, e);
      }
    }

    const profiles = await this.getProfilesAsync();
    return profiles[targetId] || profiles[MAIN_PROFILE_ID] || DEFAULT_MAIN_PROFILE;
  }

  // Save profile to Supabase Cloud + Local Cache (Only called when Save Changes is clicked)
  static async saveProfileAsync(id, profileData) {
    const targetId = id || MAIN_PROFILE_ID;
    profileData.id = targetId;
    const sb = this.getSupabase();

    if (sb) {
      try {
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
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(profileData);
    } catch (e) {}

    return profileData;
  }

  // Increment view counter safely in Supabase (never resets to 0)
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
      let baseCount = parseInt(String(profile.views || "0").replace(/[^0-9]/g, ""), 10);
      if (isNaN(baseCount)) baseCount = 0;

      const newCount = baseCount + 1;
      profile.views = String(newCount);

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
