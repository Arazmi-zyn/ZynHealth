/**
 * 🌿 ZynHealth — API Client v2.5 FIXED
 * FIX: ALL requests via GET (no POST = no CORS issue)
 * Data encoded as URL parameter
 */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyNpMzHXDKxg_sfNIuXwI6Ib--rfS6Auf6oDMF-zd9Ywu7l-b0c0c-JX_C3iAq10ta8/exec";

const ZynAPI = {

  isConfigured() {
    return GAS_API_URL && !GAS_API_URL.includes("GANTI_DENGAN");
  },

  // ALL requests use GET - no CORS preflight problem
  async call(action, data) {
    if (!this.isConfigured()) return null;
    try {
      // Build URL with action + data as JSON param
      let url = GAS_API_URL + "?action=" + encodeURIComponent(action);
      if (data !== undefined && data !== null) {
        url += "&data=" + encodeURIComponent(JSON.stringify(data));
      }
      url += "&t=" + Date.now();

      // Timeout 10 detik
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 10000);

      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal
      });
      clearTimeout(tid);

      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      console.log("[ZynAPI] ✅", action, json?.status || json?.length || "ok");
      return json;
    } catch (err) {
      if (err.name === "AbortError") {
        console.warn("[ZynAPI] ⏱️ Timeout:", action);
      } else {
        console.error("[ZynAPI] ❌", action, err.message);
      }
      return null;
    }
  },

  // ── Obat Data ──────────────────────────────────
  async getObatData() {
    const res = await this.call("getObatData");
    if (Array.isArray(res) && res.length > 0) {
      localStorage.setItem("zynhealth_local_db", JSON.stringify(res));
      return res;
    }
    // Fallback localStorage
    const local = localStorage.getItem("zynhealth_local_db");
    return local ? JSON.parse(local) : [];
  },

  async saveObat(dataForm) {
    const res = await this.call("saveObat", dataForm);
    if (res && res.status === "success") {
      console.log("[ZynAPI] ✅ Saved to Sheets:", dataForm.namaObat);
      return res;
    }
    // Fallback localStorage
    console.warn("[ZynAPI] ⚠️ Saving to localStorage (GAS unavailable)");
    return this._localSaveObat(dataForm);
  },

  async deleteObat(id) {
    const res = await this.call("deleteObat", { id: id });
    if (res && res.status === "success") return res;
    return this._localDeleteObat(id);
  },

  // ── Config ─────────────────────────────────────
  async getAppConfig() {
    // Race: max 4 detik
    const fromGAS = this.call("getAppConfig");
    const timeout = new Promise(resolve => setTimeout(() => resolve(null), 4000));
    const res = await Promise.race([fromGAS, timeout]);
    if (res && res.appName) return res;
    const local = localStorage.getItem("zynhealth_app_settings");
    return local ? JSON.parse(local) : null;
  },

  async saveAppConfig(payload) {
    const res = await this.call("saveAppConfig", payload);
    localStorage.setItem("zynhealth_app_settings", JSON.stringify({
      appName: payload.appName,
      appLogo: payload.appLogo,
      appPinFather: payload.appPin,
      appPinMother: payload.appPinMother,
      usePin: payload.usePin
    }));
    return res || { status: "success", message: "Tersimpan lokal" };
  },

  async saveCategories(list) {
    const res = await this.call("saveCategories", list);
    localStorage.setItem("zynhealth_categories", JSON.stringify(list));
    return res || { status: "success" };
  },

  async migrateDemoToSheet(list) {
    return await this.call("migrateDemoToSheet", list);
  },

  async checkConnection() {
    if (!this.isConfigured()) return { online: false };
    try {
      const res = await this.call("ping");
      const ok = res && (res.status === "ok" || res.appName);
      return { online: !!ok };
    } catch { return { online: false }; }
  },

  // ── localStorage fallback ──────────────────────
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
    return { status: "success", message: "Tersimpan lokal (GAS tidak tersedia)" };
  },

  _localDeleteObat(id) {
    let data = JSON.parse(localStorage.getItem("zynhealth_local_db") || "[]");
    data = data.filter(d => String(d.id || d.ID) !== String(id));
    localStorage.setItem("zynhealth_local_db", JSON.stringify(data));
    return { status: "success", message: "Dihapus lokal" };
  }
};

window.ZynAPI = ZynAPI;
console.log("[ZynHealth] API v2.5 ready.", ZynAPI.isConfigured() ? "GAS: ✅" : "GAS: ⚠️ URL belum diset");
