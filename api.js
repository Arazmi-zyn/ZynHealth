/**
 * 🌿 ZynHealth — API Client v2.0
 * Menghubungkan GitHub Pages → Google Apps Script → Google Sheets
 * 
 * CARA PAKAI:
 * 1. Deploy Code.gs sebagai Web App di Google Apps Script
 * 2. Copy URL Web App → paste ke GAS_API_URL di bawah
 * 3. Upload file ini ke GitHub bersama index.html
 */

// ============================================================
// ⚙️ KONFIGURASI — GANTI URL INI SETELAH DEPLOY GAS
// ============================================================
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyNpMzHXDKxg_sfNIuXwI6Ib--rfS6Auf6oDMF-zd9Ywu7l-b0c0c-JX_C3iAq10ta8/exec";
// Contoh: "https://script.google.com/macros/s/AKfycbx.../exec"

// ============================================================
// 🌐 API CLIENT — semua request ke Google Apps Script
// ============================================================
const ZynAPI = {

  // Cek apakah API URL sudah diset
  isConfigured() {
    return GAS_API_URL && !GAS_API_URL.includes("GANTI_DENGAN");
  },

  // GET request
  async get(action) {
    if (!this.isConfigured()) {
      console.warn("[ZynAPI] GAS_API_URL belum diset, pakai localStorage");
      return null;
    }
    try {
      const url = `${GAS_API_URL}?action=${action}&t=${Date.now()}`;
      const res = await fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache"
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      console.error("[ZynAPI] GET error:", err);
      return null;
    }
  },

  // POST request
  async post(action, data) {
    if (!this.isConfigured()) {
      console.warn("[ZynAPI] GAS_API_URL belum diset, pakai localStorage");
      return null;
    }
    try {
      const res = await fetch(GAS_API_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data, id: data?.id })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      console.error("[ZynAPI] POST error:", err);
      return null;
    }
  },

  // ── Data Obat ──────────────────────────────────────
  async getObatData() {
    const res = await this.get("getObatData");
    return res || JSON.parse(localStorage.getItem("zynhealth_local_db") || "[]");
  },

  async saveObat(dataForm) {
    const res = await this.post("saveObat", dataForm);
    if (res) return res;
    // Fallback localStorage
    return this._localSaveObat(dataForm);
  },

  async deleteObat(id) {
    const res = await this.post("deleteObat", { id });
    if (res) return res;
    // Fallback localStorage
    return this._localDeleteObat(id);
  },

  // ── Config ─────────────────────────────────────────
  async getAppConfig() {
    const res = await this.get("getAppConfig");
    return res || JSON.parse(localStorage.getItem("zynhealth_app_settings") || "null");
  },

  async saveAppConfig(configPayload) {
    const res = await this.post("saveAppConfig", configPayload);
    // Selalu simpan ke localStorage juga sebagai backup
    localStorage.setItem("zynhealth_app_settings", JSON.stringify({
      appName: configPayload.appName,
      appLogo: configPayload.appLogo,
      appPinFather: configPayload.appPin,
      appPinMother: configPayload.appPinMother,
      usePin: configPayload.usePin
    }));
    return res || { status: "success", message: "Tersimpan lokal (GAS offline)" };
  },

  async saveCategories(categoriesList) {
    const res = await this.post("saveCategories", categoriesList);
    localStorage.setItem("zynhealth_categories", JSON.stringify(categoriesList));
    return res || { status: "success", message: "Kategori tersimpan lokal" };
  },

  async migrateDemoToSheet(demoDataList) {
    return await this.post("migrateDemoToSheet", demoDataList);
  },

  // ── Fallback localStorage ──────────────────────────
  _localSaveObat(dataForm) {
    let data = JSON.parse(localStorage.getItem("zynhealth_local_db") || "[]");
    if (dataForm.id) {
      data = data.map(d => String(d.id || d.ID) === String(dataForm.id) ? {
        ...d,
        "Nama Anak": dataForm.namaAnak, "Nama Obat": dataForm.namaObat,
        "Kategori": dataForm.kategori, "Dosis": dataForm.dosis,
        "Aturan Pakai": dataForm.aturan, "Tgl Expired": dataForm.expired,
        "Sisa Stok": dataForm.stok, "Status Pakai": dataForm.statusPakai,
        "Lokasi": dataForm.lokasi, "Pernah Dicoba": dataForm.pernahDicoba,
        "Kegunaan": dataForm.kegunaan, "Gambar": dataForm.gambar
      } : d);
    } else {
      const newId = "MED-" + Date.now();
      data.unshift({
        id: newId, ID: newId,
        "Nama Anak": dataForm.namaAnak, "Nama Obat": dataForm.namaObat,
        "Kategori": dataForm.kategori, "Dosis": dataForm.dosis,
        "Aturan Pakai": dataForm.aturan, "Tgl Expired": dataForm.expired,
        "Sisa Stok": dataForm.stok, "Status Pakai": dataForm.statusPakai,
        "Lokasi": dataForm.lokasi, "Pernah Dicoba": dataForm.pernahDicoba,
        "Kegunaan": dataForm.kegunaan, "Gambar": dataForm.gambar
      });
    }
    localStorage.setItem("zynhealth_local_db", JSON.stringify(data));
    return { status: "success", message: "Tersimpan lokal ✅ (GAS offline)" };
  },

  _localDeleteObat(id) {
    let data = JSON.parse(localStorage.getItem("zynhealth_local_db") || "[]");
    data = data.filter(d => String(d.id || d.ID) !== String(id));
    localStorage.setItem("zynhealth_local_db", JSON.stringify(data));
    return { status: "success", message: "Dihapus lokal ✅" };
  },

  // ── Status check ───────────────────────────────────
  async checkConnection() {
    if (!this.isConfigured()) return { online: false, reason: "URL belum diset" };
    try {
      const res = await fetch(`${GAS_API_URL}?action=ping&t=${Date.now()}`, {
        method: "GET", mode: "cors", signal: AbortSignal.timeout(5000)
      });
      return { online: res.ok, reason: res.ok ? "Terhubung ✅" : "Error " + res.status };
    } catch {
      return { online: false, reason: "Tidak dapat terhubung ke GAS" };
    }
  }
};

// Export untuk dipakai index.html
window.ZynAPI = ZynAPI;
console.log("[ZynHealth] API Client loaded.", ZynAPI.isConfigured() ? "GAS: ✅ Configured" : "GAS: ⚠️ URL belum diset (pakai localStorage)");
