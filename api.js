/**
 * 🌿 ZynHealth — API Client v2.1 FIXED
 * FIX: CORS issue dengan Google Apps Script
 * Solusi: Semua request pakai GET (hindari CORS preflight pada POST)
 */

// ============================================================
// ⚙️ GANTI URL INI DENGAN URL WEB APP GAS ANDA
// ============================================================
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyNpMzHXDKxg_sfNIuXwI6Ib--rfS6Auf6oDMF-zd9Ywu7l-b0c0c-JX_C3iAq10ta8/exec";
// Contoh: "https://script.google.com/macros/s/AKfycbx.../exec"

// ============================================================
// 🌐 API CLIENT
// ============================================================
const ZynAPI = {

  isConfigured() {
    return GAS_API_URL && !GAS_API_URL.includes("GANTI_DENGAN");
  },

  // Semua request pakai GET untuk hindari CORS preflight
  async request(params) {
    if (!this.isConfigured()) {
      console.warn("[ZynAPI] URL belum diset, pakai localStorage");
      return null;
    }
    try {
      // Encode semua parameter ke URL
      const url = new URL(GAS_API_URL);
      Object.keys(params).forEach(key => {
        const val = typeof params[key] === 'object'
          ? JSON.stringify(params[key])
          : params[key];
        url.searchParams.append(key, val);
      });
      // Tambah timestamp untuk hindari cache
      url.searchParams.append('t', Date.now());

      const res = await fetch(url.toString(), {
        method: "GET",
        redirect: "follow"
      });

      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      console.log("[ZynAPI] Response:", params.action, data?.status);
      return data;
    } catch (err) {
      console.error("[ZynAPI] Error:", err.message);
      return null;
    }
  },

  // ── Data Obat ──────────────────────────────────────────────
  async getObatData() {
    const res = await this.request({ action: "getObatData" });
    if (res && Array.isArray(res)) return res;
    if (res && res.data) return res.data;
    // Fallback localStorage
    const local = localStorage.getItem("zynhealth_local_db");
    return local ? JSON.parse(local) : [];
  },

  async saveObat(dataForm) {
    const res = await this.request({
      action: "saveObat",
      data: dataForm
    });
    if (res && res.status === "success") return res;
    return this._localSaveObat(dataForm);
  },

  async deleteObat(id) {
    const res = await this.request({
      action: "deleteObat",
      id: id
    });
    if (res && res.status === "success") return res;
    return this._localDeleteObat(id);
  },

  // ── Config ─────────────────────────────────────────────────
  async getAppConfig() {
    const res = await this.request({ action: "getAppConfig" });
    if (res && res.appName) return res;
    // Fallback localStorage
    const local = localStorage.getItem("zynhealth_app_settings");
    return local ? JSON.parse(local) : null;
  },

  async saveAppConfig(configPayload) {
    const res = await this.request({
      action: "saveAppConfig",
      data: configPayload
    });
    // Simpan ke localStorage juga sebagai backup
    localStorage.setItem("zynhealth_app_settings", JSON.stringify({
      appName:      configPayload.appName,
      appLogo:      configPayload.appLogo,
      appPinFather: configPayload.appPin,
      appPinMother: configPayload.appPinMother,
      usePin:       configPayload.usePin
    }));
    return res || { status: "success", message: "Tersimpan lokal" };
  },

  async saveCategories(categoriesList) {
    const res = await this.request({
      action: "saveCategories",
      data: categoriesList
    });
    localStorage.setItem("zynhealth_categories", JSON.stringify(categoriesList));
    return res || { status: "success", message: "Tersimpan lokal" };
  },

  async migrateDemoToSheet(demoDataList) {
    return await this.request({
      action: "migrateDemoToSheet",
      data: demoDataList
    });
  },

  // ── Fallback localStorage ──────────────────────────────────
  _localSaveObat(dataForm) {
    let data = JSON.parse(localStorage.getItem("zynhealth_local_db") || "[]");
    if (dataForm.id) {
      data = data.map(d => String(d.id || d.ID) === String(dataForm.id) ? {
        ...d,
        "Nama Anak":    dataForm.namaAnak,
        "Nama Obat":    dataForm.namaObat,
        "Kategori":     dataForm.kategori,
        "Dosis":        dataForm.dosis,
        "Aturan Pakai": dataForm.aturan,
        "Tgl Expired":  dataForm.expired,
        "Sisa Stok":    dataForm.stok,
        "Status Pakai": dataForm.statusPakai,
        "Lokasi":       dataForm.lokasi,
        "Pernah Dicoba":dataForm.pernahDicoba,
        "Kegunaan":     dataForm.kegunaan,
        "Gambar":       dataForm.gambar
      } : d);
    } else {
      const newId = "MED-" + Date.now();
      data.unshift({
        id: newId, ID: newId,
        "Nama Anak":    dataForm.namaAnak,
        "Nama Obat":    dataForm.namaObat,
        "Kategori":     dataForm.kategori,
        "Dosis":        dataForm.dosis,
        "Aturan Pakai": dataForm.aturan,
        "Tgl Expired":  dataForm.expired,
        "Sisa Stok":    dataForm.stok,
        "Status Pakai": dataForm.statusPakai,
        "Lokasi":       dataForm.lokasi,
        "Pernah Dicoba":dataForm.pernahDicoba,
        "Kegunaan":     dataForm.kegunaan,
        "Gambar":       dataForm.gambar
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

  // ── Cek koneksi ────────────────────────────────────────────
  async checkConnection() {
    if (!this.isConfigured()) return { online: false, reason: "URL belum diset" };
    try {
      const res = await this.request({ action: "ping" });
      const ok = res && (res.status === "ok" || res.appName || Array.isArray(res));
      return { online: ok, reason: ok ? "Terhubung ✅" : "Gagal baca data" };
    } catch {
      return { online: false, reason: "Tidak dapat terhubung" };
    }
  }
};

window.ZynAPI = ZynAPI;
console.log("[ZynHealth] API v2.1 loaded.",
  ZynAPI.isConfigured() ? "GAS: ✅ Configured" : "GAS: ⚠️ URL belum diset");
