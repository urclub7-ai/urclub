/**
 * Guns.lol Robust Storage Engine with IndexedDB (Supports Unlimited Large Video & Audio Files)
 */

const DB_NAME = "GunsLolBioDB";
const DB_VERSION = 1;
const STORE_NAME = "profiles";

const DEFAULT_PROFILES = {
  "levi": {
    id: "levi",
    name: "LEVI",
    username: "levi85150",
    subtitle: "Humanity's Strongest Soldier & Content Creator",
    views: "7,841",
    showSparkles: true,
    showDotMatrix: true,
    mainAvatar: "assets/avatar.jpg",
    presenceAvatar: "assets/avatar.jpg",
    backgroundVideo: "assets/levi_background.mp4",
    musicAudio: "assets/levi_audio.mp3",
    musicTitle: "Levi Ackerman Edit Track",
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

// Open IndexedDB
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
  static async getProfilesAsync() {
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
          if (Object.keys(map).length === 0) {
            // Seed default
            this.saveProfileAsync("levi", DEFAULT_PROFILES["levi"]);
            resolve(DEFAULT_PROFILES);
          } else {
            resolve(map);
          }
        };
        req.onerror = () => resolve(DEFAULT_PROFILES);
      });
    } catch (e) {
      console.warn("IndexedDB fallback to memory:", e);
      return DEFAULT_PROFILES;
    }
  }

  static async getProfileAsync(id) {
    const profiles = await this.getProfilesAsync();
    if (id && profiles[id]) return profiles[id];
    const activeId = this.getActiveId();
    if (activeId && profiles[activeId]) return profiles[activeId];
    return profiles["levi"] || DEFAULT_PROFILES["levi"];
  }

  static async saveProfileAsync(id, profileData) {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        profileData.id = id;
        const req = store.put(profileData);
        req.onsuccess = () => {
          this.setActiveId(id);
          resolve(profileData);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error("Save error:", e);
    }
  }

  static async deleteProfileAsync(id) {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error("Delete error:", e);
    }
  }

  static getActiveId() {
    return localStorage.getItem("guns_lol_active_profile_id") || "levi";
  }

  static setActiveId(id) {
    localStorage.setItem("guns_lol_active_profile_id", id);
  }
}
