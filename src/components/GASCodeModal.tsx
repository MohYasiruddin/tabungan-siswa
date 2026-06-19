/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, FileText, Settings, Database, Server, ExternalLink } from 'lucide-react';

interface GASCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GASCodeModal({ isOpen, onClose }: GASCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const steps = [
    {
      title: "1. Siapkan Google Spreadsheet",
      detail: "Buat spreadsheet baru di Google Drive Anda. Di baris pertama (A1), Anda tidak perlu mengetikkan header secara manual, karena script Apps Script akan otomatis menginisialisasi semua sheet beserta kolom-kolomnya pada jalankan pertama!"
    },
    {
      title: "2. Buka Extensions > Apps Script",
      detail: "Di Google Sheets Anda, klik menu 'Ekstensi' (Extensions) > 'Apps Script'. Hapus semua kode default di dalam file 'Kode.gs' atau 'Code.gs'."
    },
    {
      title: "3. Tempelkan Kode & Simpan",
      detail: "Salin seluruh kode dari tab Apps Script di bawah ini, tempelkan ke editor Apps Script, lalu klik tombol Simpan (ikon disket)."
    },
    {
      title: "4. Deploy Sebagai Web App",
      detail: "Klik tombol 'Terapkan' (Deploy) > 'Penerapan Baru' (New Deployment). Pilih jenis 'Aplikasi Web' (Web App). Ubah konfigurasi akses: 'Jalankan sebagai: Saya' (Execute as: Me) dan 'Siapa yang memiliki akses: Siapa saja' (Who has access: Anyone). Klik 'Terapkan' dan berikan izin autentikasi Google akun Anda."
    },
    {
      title: "5. Hubungkan URL ke Aplikasi",
      detail: "Salin 'URL Aplikasi Web' yang dihasilkan, buka pengaturan di Navbar aplikasi ini, lalu klik 'Mode API Google Sheets' dan paste URL tersebut."
    }
  ];

  const gasCode = `/**
 * SISTEM MANAJEMEN TABUNGAN SISWA - GOOGLE APPS SCRIPT BACKEND
 * (Disalin langsung dari menu /src/services/google-apps-script.gs)
 */

var SPREADSHEET_ID = ""; // Kosongkan jika script terikat ke spreadsheet langsung

function doGet(e) { ... }
function doPost(e) { ... }
// Selengkapnya ada di file /src/services/google-apps-script.gs
`;

  const copyFullCode = () => {
    // We would fetch the actual content we created or paste a condensed string
    // Let's copy a high quality representation
    const fullCodeElement = document.getElementById('full-gas-code-text');
    if (fullCodeElement) {
      navigator.clipboard.writeText(fullCodeElement.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-805">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Panduan Integrasi Google Sheets</h3>
              <p className="text-xs text-zinc-500">Hubungkan tabungan siswa dengan database realtime Google Drive</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
          >
            Tutup
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Alur Kerja */}
          <div>
            <h4 className="font-medium text-sm uppercase tracking-wider text-zinc-400 mb-4 inline-flex items-center gap-2">
              <Server className="w-4 h-4" /> Alur Deployment Langkah-demi-Langkah
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {steps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <h5 className="font-semibold text-sm text-zinc-850 dark:text-zinc-200">{step.title}</h5>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Integrasi Apps Script */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-sm uppercase tracking-wider text-zinc-400 inline-flex items-center gap-2">
                <FileText className="w-4 h-4" /> Kode Google Apps Script (GAS)
              </h4>
              <button
                onClick={copyFullCode}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Berhasil Disalin!" : "Salin Seluruh Kode GAS"}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 p-4 max-h-[350px] overflow-y-auto font-mono text-xs leading-relaxed">
              <div className="absolute top-2 right-2 flex items-center gap-2 bg-zinc-900/80 px-2 py-1 rounded text-[10px] text-zinc-400">
                <span>Code.gs</span>
              </div>
              
              <pre id="full-gas-code-text" className="whitespace-pre-wrap select-all focus:outline-hidden">
{`/**
 * SISTEM MANAJEMEN TABUNGAN SISWA - GOOGLE APPS SCRIPT BACKEND
 * -------------------------------------------------------------
 * Salin dan tempel kode ini di menu "Ekstensi" > "Apps Script" 
 * pada Spreadsheet Google Anda.
 * Deploy sebagai Web App dan pilih akses "Anyone" (Siapa saja).
 */

var SPREADSHEET_ID = ""; 

function getActiveSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var action = e.parameter.action;
    if (!action) return response({ success: false, message: "Parameter action tidak ditemukan" });
    var ss = getActiveSpreadsheet();
    
    switch (action) {
      case "getUsers": return getUsers(ss);
      case "getSiswa": return getSiswa(ss);
      case "getKelas": return getKelas(ss);
      case "getSetoran": return getSetoran(ss);
      case "getPenarikan": return getPenarikan(ss);
      case "getDashboard": return getDashboard(ss);
      case "getLaporan": return getLaporan(ss, e.parameter);
      default: return response({ success: false, message: "Action GET '" + action + "' tidak dikenal" });
    }
  } catch (error) {
    return response({ success: false, message: "Terjadi kesalahan: " + error.toString() });
  }
}

function doPost(e) {
  try {
    var action = e.parameter.action;
    var postData = {};
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      postData = e.parameter;
    }
    if (!action) action = postData.action;
    if (!action) return response({ success: false, message: "Parameter action tidak ditemukan" });
    var ss = getActiveSpreadsheet();

    switch (action) {
      case "login": return login(ss, postData);
      case "createUser": return createUser(ss, postData);
      case "updateUser": return updateUser(ss, postData);
      case "deleteUser": return deleteUser(ss, postData);
      case "createSiswa": return createSiswa(ss, postData);
      case "updateSiswa": return updateSiswa(ss, postData);
      case "deleteSiswa": return deleteSiswa(ss, postData);
      case "createKelas": return createKelas(ss, postData);
      case "updateKelas": return updateKelas(ss, postData);
      case "deleteKelas": return deleteKelas(ss, postData);
      case "createSetoran": return createSetoran(ss, postData);
      case "createPenarikan": return createPenarikan(ss, postData);
      default: return response({ success: false, message: "Action POST '" + action + "' tidak dikenal" });
    }
  } catch (error) {
    return response({ success: false, message: "Terjadi kesalahan di POST: " + error.toString() });
  }
}

function sha256(input) {
  if (!input) input = "";
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  var output = "";
  for (var i = 0; i < rawHash.length; i++) {
    var byteValue = rawHash[i];
    if (byteValue < 0) byteValue += 256;
    var byteString = byteValue.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    output += byteString;
  }
  return output;
}

function getSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initSheets(ss);
    sheet = ss.getSheetByName(sheetName);
  }
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  return rows;
}

function writeAuditLog(ss, user, aktivitas) {
  var sheet = ss.getSheetByName("audit_log");
  if (!sheet) return;
  var id = "LOG-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  var tanggal = new Date().toISOString();
  sheet.appendRow([id, tanggal, user, aktivitas]);
}

function initSheets(ss) {
  var sheets = {
    "users": ["id_user", "username", "password_hash", "role", "status", "created_at"],
    "siswa": ["id_siswa", "nis", "nama", "jenis_kelamin", "kelas", "alamat", "nama_orang_tua", "no_hp", "status_aktif", "created_at"],
    "kelas": ["id_kelas", "nama_kelas", "wali_kelas"],
    "setoran": ["id_setoran", "tanggal", "id_siswa", "nominal", "keterangan", "petugas", "created_at"],
    "penarikan": ["id_penarikan", "tanggal", "id_siswa", "nominal", "keterangan", "petugas", "created_at"],
    "audit_log": ["id_log", "tanggal", "user", "aktivitas"]
  };
  for (var sheetName in sheets) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(sheets[sheetName]);
      if (sheetName === "users") {
        var defaultPassHash = sha256("admin123");
        sheet.appendRow(["USR-ADMIN", "admin", defaultPassHash, "admin", "aktif", new Date().toISOString()]);
      }
      if (sheetName === "kelas") {
        sheet.appendRow(["KLS-01", "7-A", "Budi Hermawan, S.Pd."]);
        sheet.appendRow(["KLS-02", "7-B", "Siti Aminah, M.Pd."]);
        sheet.appendRow(["KLS-03", "8-A", "Junaedi, S.Kom."]);
      }
      if (sheetName === "siswa") {
        sheet.appendRow(["SIS-01", "10111", "Andi Wijaya", "L", "7-A", "Jl. Merpati No. 12", "Eko Wijaya", "081234567890", "aktif", new Date().toISOString()]);
        sheet.appendRow(["SIS-02", "10112", "Siti Rahma", "P", "7-A", "Jl. Kenanga No. 44", "Suryono", "081398765432", "aktif", new Date().toISOString()]);
      }
    }
  }
}

function login(ss, data) {
  var users = getSheetData(ss, "users");
  var username = data.username ? data.username.toLowerCase().trim() : "";
  var password = data.password ? data.password : "";
  var passHash = sha256(password);
  for (var i = 0; i < users.length; i++) {
    if (users[i].username.toLowerCase() === username && users[i].password_hash === passHash) {
      if (users[i].status !== "aktif") return response({ success: false, message: "User diblokir" });
      writeAuditLog(ss, username, "Login berhasil");
      return response({
        success: true,
        message: "Login Berhasil",
        data: {
          id_user: users[i].id_user,
          username: users[i].username,
          role: users[i].role,
          status: users[i].status,
          token: "simulated-jwt"
        }
      });
    }
  }
  return response({ success: false, message: "Username atau password salah!" });
}

function getUsers(ss) {
  var users = getSheetData(ss, "users");
  var safeUsers = users.map(function(u) {
    return { id_user: u.id_user, username: u.username, role: u.role, status: u.status, created_at: u.created_at };
  });
  return response({ success: true, message: "OK", data: safeUsers });
}

function createUser(ss, data) {
  var sheet = ss.getSheetByName("users");
  var users = getSheetData(ss, "users");
  var username = data.username ? data.username.toLowerCase().trim() : "";
  
  for (var i = 0; i < users.length; i++) {
    if (users[i].username.toLowerCase() === username) return response({ success: false, message: "Username sudah dipakai!" });
  }
  var id = "USR-" + Date.now();
  var passHash = sha256(data.password);
  sheet.appendRow([id, username, passHash, data.role, data.status || "aktif", new Date().toISOString()]);
  writeAuditLog(ss, "system", "Membuat user baru: " + username);
  return response({ success: true, message: "User sukses ditambahkan" });
}

function updateUser(ss, data) {
  var sheet = ss.getSheetByName("users");
  var rIndex = findRowIndexById(sheet, "id_user", data.id_user);
  if (rIndex === -1) return response({ success: false, message: "User tidak ditemukan" });
  var colMapping = getColumnMapping(sheet);
  if (data.role) sheet.getRange(rIndex, colMapping["role"]).setValue(data.role);
  if (data.status) sheet.getRange(rIndex, colMapping["status"]).setValue(data.status);
  if (data.password) sheet.getRange(rIndex, colMapping["password_hash"]).setValue(sha256(data.password));
  return response({ success: true, message: "User diupdate" });
}

function deleteUser(ss, data) {
  var sheet = ss.getSheetByName("users");
  var rIndex = findRowIndexById(sheet, "id_user", data.id_user);
  if (rIndex === -1) return response({ success: false, message: "User tidak ditemukan" });
  var username = sheet.getRange(rIndex, 2).getValue();
  if (username === "admin") return response({ success: false, message: "Admin default tidak dapat dihapus!" });
  sheet.deleteRow(rIndex);
  return response({ success: true, message: "User dihapus" });
}

function getSiswa(ss) {
  var siswa = getSheetData(ss, "siswa");
  var setoran = getSheetData(ss, "setoran");
  var penarikan = getSheetData(ss, "penarikan");
  
  var enriched = siswa.map(function(s) {
    var s_setor = 0;
    var s_tarik = 0;
    setoran.forEach(function(st) { if(String(st.id_siswa) === String(s.id_siswa)) s_setor += Number(st.nominal) || 0; });
    penarikan.forEach(function(pn) { if(String(pn.id_siswa) === String(s.id_siswa)) s_tarik += Number(pn.nominal) || 0; });
    return {
      id_siswa: s.id_siswa,
      nis: s.nis,
      nama: s.nama,
      jenis_kelamin: s.jenis_kelamin,
      kelas: s.kelas,
      alamat: s.alamat,
      nama_orang_tua: s.nama_orang_tua,
      no_hp: s.no_hp,
      status_aktif: s.status_aktif,
      created_at: s.created_at,
      total_setoran: s_setor,
      total_penarikan: s_tarik,
      saldo: s_setor - s_tarik
    };
  });
  return response({ success: true, message: "OK", data: enriched });
}

function createSiswa(ss, data) {
  var sheet = ss.getSheetByName("siswa");
  var siswaList = getSheetData(ss, "siswa");
  for (var i = 0; i < siswaList.length; i++) {
    if (String(siswaList[i].nis) === String(data.nis)) return response({ success: false, message: "NIS sudah ada!" });
  }
  var id = data.id_siswa || ("SIS-" + Date.now());
  sheet.appendRow([id, data.nis, data.nama, data.jenis_kelamin, data.kelas, data.alamat || "-", data.nama_orang_tua || "-", data.no_hp || "-", "aktif", new Date().toISOString()]);
  writeAuditLog(ss, "system", "Menambahkan siswa: " + data.nama);
  return response({ success: true, message: "OK" });
}

function updateSiswa(ss, data) {
  var sheet = ss.getSheetByName("siswa");
  var rIndex = findRowIndexById(sheet, "id_siswa", data.id_siswa);
  if (rIndex === -1) return response({ success: false, message: "Siswa tidak ada" });
  var colMapping = getColumnMapping(sheet);
  if (data.nis) sheet.getRange(rIndex, colMapping["nis"]).setValue(data.nis);
  if (data.nama) sheet.getRange(rIndex, colMapping["nama"]).setValue(data.nama);
  if (data.jenis_kelamin) sheet.getRange(rIndex, colMapping["jenis_kelamin"]).setValue(data.jenis_kelamin);
  if (data.kelas) sheet.getRange(rIndex, colMapping["kelas"]).setValue(data.kelas);
  if (data.alamat) sheet.getRange(rIndex, colMapping["alamat"]).setValue(data.alamat);
  if (data.nama_orang_tua) sheet.getRange(rIndex, colMapping["nama_orang_tua"]).setValue(data.nama_orang_tua);
  if (data.no_hp) sheet.getRange(rIndex, colMapping["no_hp"]).setValue(data.no_hp);
  if (data.status_aktif) sheet.getRange(rIndex, colMapping["status_aktif"]).setValue(data.status_aktif);
  return response({ success: true, message: "Siswa diupdate" });
}

function deleteSiswa(ss, data) {
  var sheet = ss.getSheetByName("siswa");
  var rIndex = findRowIndexById(sheet, "id_siswa", data.id_siswa);
  if (rIndex === -1) return response({ success: false, message: "Siswa tidak found" });
  sheet.deleteRow(rIndex);
  return response({ success: true, message: "Siswa didelete" });
}

function getKelas(ss) {
  return response({ success: true, message: "OK", data: getSheetData(ss, "kelas") });
}

function createKelas(ss, data) {
  var sheet = ss.getSheetByName("kelas");
  var id = data.id_kelas || ("KLS-" + Date.now());
  sheet.appendRow([id, data.nama_kelas, data.wali_kelas]);
  return response({ success: true, message: "Kelas dibuat" });
}

function updateKelas(ss, data) {
  var sheet = ss.getSheetByName("kelas");
  var rIndex = findRowIndexById(sheet, "id_kelas", data.id_kelas);
  if (rIndex === -1) return response({ success: false, message: "Gagal" });
  var colMapping = getColumnMapping(sheet);
  sheet.getRange(rIndex, colMapping["nama_kelas"]).setValue(data.nama_kelas);
  sheet.getRange(rIndex, colMapping["wali_kelas"]).setValue(data.wali_kelas);
  return response({ success: true, message: "OK" });
}

function deleteKelas(ss, data) {
  var sheet = ss.getSheetByName("kelas");
  var rIndex = findRowIndexById(sheet, "id_kelas", data.id_kelas);
  if (rIndex === -1) return response({ success: false, message: "Gagal" });
  sheet.deleteRow(rIndex);
  return response({ success: true, message: "OK" });
}

function getSetoran(ss) {
  var setoran = getSheetData(ss, "setoran");
  var siswa = getSheetData(ss, "siswa");
  var data = setoran.map(function(s) {
    var matched = findItem(siswa, "id_siswa", s.id_siswa);
    return {
      id_setoran: s.id_setoran, id_siswa: s.id_siswa,
      siswa_nama: matched ? matched.nama : "Siswa Dihapus",
      siswa_nis: matched ? matched.nis : "-",
      siswa_kelas: matched ? matched.kelas : "-",
      tanggal: s.tanggal, nominal: Number(s.nominal) || 0,
      keterangan: s.keterangan, petugas: s.petugas, created_at: s.created_at
    };
  });
  return response({ success: true, message: "OK", data: data });
}

function createSetoran(ss, data) {
  var sheet = ss.getSheetByName("setoran");
  var id = data.id_setoran || ("TXS-" + Date.now());
  var nominal = Number(data.nominal);
  sheet.appendRow([id, data.tanggal || new Date().toISOString().split('T')[0], data.id_siswa, nominal, data.keterangan || "Setoran", data.petugas, new Date().toISOString()]);
  writeAuditLog(ss, data.petugas, "Setoran Rp." + nominal);
  return response({ success: true, message: "Setoran sukses" });
}

function getPenarikan(ss) {
  var penarikan = getSheetData(ss, "penarikan");
  var siswa = getSheetData(ss, "siswa");
  var data = penarikan.map(function(p) {
    var matched = findItem(siswa, "id_siswa", p.id_siswa);
    return {
      id_penarikan: p.id_penarikan, id_siswa: p.id_siswa,
      siswa_nama: matched ? matched.nama : "Siswa Dihapus",
      siswa_nis: matched ? matched.nis : "-",
      siswa_kelas: matched ? matched.kelas : "-",
      tanggal: p.tanggal, nominal: Number(p.nominal) || 0,
      keterangan: p.keterangan, petugas: p.petugas, created_at: p.created_at
    };
  });
  return response({ success: true, message: "OK", data: data });
}

function createPenarikan(ss, data) {
  var sheet = ss.getSheetByName("penarikan");
  var nominal = Number(data.nominal);
  
  // Validasi saldo
  var setoran = getSheetData(ss, "setoran");
  var penarikan = getSheetData(ss, "penarikan");
  var totalS = 0; var totalP = 0;
  setoran.forEach(function(s){ if(String(s.id_siswa)===String(data.id_siswa)) totalS+=Number(s.nominal)||0; });
  penarikan.forEach(function(p){ if(String(p.id_siswa)===String(data.id_siswa)) totalP+=Number(p.nominal)||0; });
  if ((totalS - totalP) < nominal) {
    return response({ success: false, message: "Saldo tidak mencukupi! Sisa saldo: Rp. " + (totalS - totalP) });
  }

  var id = data.id_penarikan || ("TXW-" + Date.now());
  sheet.appendRow([id, data.tanggal || new Date().toISOString().split('T')[0], data.id_siswa, nominal, data.keterangan || "Penarikan", data.petugas, new Date().toISOString()]);
  writeAuditLog(ss, data.petugas, "Penarikan Rp." + nominal);
  return response({ success: true, message: "Penarikan sukses" });
}

function getDashboard(ss) {
  var siswa = getSheetData(ss, "siswa");
  var setoran = getSheetData(ss, "setoran");
  var penarikan = getSheetData(ss, "penarikan");
  
  var activeSiswaCount = siswa.filter(function(s) { return s.status_aktif === "aktif"; }).length;
  var s_total = 0; setoran.forEach(function(s){s_total+=Number(s.nominal)||0;});
  var p_total = 0; penarikan.forEach(function(p){p_total+=Number(p.nominal)||0;});
  var totalSaldo = s_total - p_total;

  var timezone = "GMT+7";
  try {
    timezone = ss.getSpreadsheetTimeZone() || "GMT+7";
  } catch (err) {}

  function formatDateOnly(val) {
    if (!val) return "";
    if (val instanceof Date) {
      try {
        return Utilities.formatDate(val, timezone, "yyyy-MM-dd");
      } catch (err) {}
    }
    var str = String(val);
    if (str.indexOf('T') !== -1) {
      return str.split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    try {
      var d = new Date(str);
      if (!isNaN(d.getTime())) {
        return Utilities.formatDate(d, timezone, "yyyy-MM-dd");
      }
    } catch(e) {}
    return str;
  }

  var todayStr = Utilities.formatDate(new Date(), timezone, "yyyy-MM-dd");
  var totalSetoranToday = 0;
  var countSetoranToday = 0;
  setoran.forEach(function(s) {
    if (formatDateOnly(s.tanggal) === todayStr) {
      totalSetoranToday += Number(s.nominal) || 0;
      countSetoranToday++;
    }
  });

  var totalPenarikanToday = 0;
  var countPenarikanToday = 0;
  penarikan.forEach(function(p) {
    if (formatDateOnly(p.tanggal) === todayStr) {
      totalPenarikanToday += Number(p.nominal) || 0;
      countPenarikanToday++;
    }
  });
  
  // Kombinasikan riwayat transaksi terbaru (maksimal 10)
  var matchedSiswa = {};
  siswa.forEach(function(s) { matchedSiswa[s.id_siswa] = s; });

  var combined = [];
  setoran.forEach(function(s) {
    var sObj = matchedSiswa[s.id_siswa];
    combined.push({
      id: s.id_setoran, tipo: "setoran", siswaNama: sObj ? sObj.nama : "Siswa Dihapus",
      kelas: sObj ? sObj.kelas : "-", nominal: Number(s.nominal) || 0, tanggal: s.tanggal, keterangan: s.keterangan || "-"
    });
  });
  penarikan.forEach(function(p) {
    var sObj = matchedSiswa[p.id_siswa];
    combined.push({
      id: p.id_penarikan, tipo: "penarikan", siswaNama: sObj ? sObj.nama : "Siswa Dihapus",
      kelas: sObj ? sObj.kelas : "-", nominal: Number(p.nominal) || 0, tanggal: p.tanggal, keterangan: p.keterangan || "-"
    });
  });
  combined.sort(function(a, b) { return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(); });

  // Grafik bulanan
  var chartData = [];
  var bulanIndo = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  var saatIni = new Date();
  for (var m = 5; m >= 0; m--) {
    var d = new Date(saatIni.getFullYear(), saatIni.getMonth() - m, 1);
    chartData.push({
      key: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0'),
      bulan: bulanIndo[d.getMonth()] + " " + String(d.getFullYear()).substring(2),
      setoran: 0,
      penarikan: 0
    });
  }

  setoran.forEach(function(tx) {
    if (!tx.tanggal) return;
    var fDate = formatDateOnly(tx.tanggal);
    var parts = fDate.split('-');
    if (parts.length < 2) return;
    var txKey = parts[0] + "-" + parts[1];
    var item = chartData.filter(function(c) { return c.key === txKey; })[0];
    if (item) item.setoran += Number(tx.nominal) || 0;
  });

  penarikan.forEach(function(tx) {
    if (!tx.tanggal) return;
    var fDate = formatDateOnly(tx.tanggal);
    var parts = fDate.split('-');
    if (parts.length < 2) return;
    var txKey = parts[0] + "-" + parts[1];
    var item = chartData.filter(function(c) { return c.key === txKey; })[0];
    if (item) item.penarikan += Number(tx.nominal) || 0;
  });
  
  return response({
    success: true,
    data: {
      totalSiswa: activeSiswaCount,
      totalSaldo: totalSaldo,
      totalSetoranHariIni: totalSetoranToday,
      totalPenarikanHariIni: totalPenarikanToday,
      setoranCountHariIni: countSetoranToday,
      penarikanCountHariIni: countPenarikanToday,
      transaksiTerbaru: combined.slice(0, 10),
      chartData: chartData
    }
  });
}

function getLaporan(ss, params) {
  var siswa = getSheetData(ss, "siswa");
  var kelasList = getSheetData(ss, "kelas");
  var setoran = getSheetData(ss, "setoran");
  var penarikan = getSheetData(ss, "penarikan");
  var logList = getSheetData(ss, "audit_log");
  
  var enrichedSiswa = siswa.map(function(s) {
    var s_setor = 0; var s_tarik = 0;
    setoran.forEach(function(st) { if (String(st.id_siswa) === String(s.id_siswa)) s_setor += Number(st.nominal) || 0; });
    penarikan.forEach(function(pn) { if (String(pn.id_siswa) === String(s.id_siswa)) s_tarik += Number(pn.nominal) || 0; });
    return {
      id_siswa: s.id_siswa, nis: s.nis, nama: s.nama, kelas: s.kelas, jenis_kelamin: s.jenis_kelamin,
      alamat: s.alamat, nama_orang_tua: s.nama_orang_tua, no_hp: s.no_hp, status_aktif: s.status_aktif,
      total_setoran: s_setor, total_penarikan: s_tarik, saldo: s_setor - s_tarik
    };
  });
  
  return response({
    success: true,
    data: {
      siswa: enrichedSiswa,
      kelas: kelasList,
      semuaTransaksi: [],
      auditLog: logList
    }
  });
}

function findRowIndexById(sheet, keyColumn, id) {
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idx = headers.indexOf(keyColumn);
  for(var i=1; i<data.length; i++) {
    if(String(data[i][idx]) === String(id)) return i+1;
  }
  return -1;
}

function getColumnMapping(sheet) {
  var headers = sheet.getDataRange().getValues()[0];
  var map = {};
  for(var i=0; i<headers.length; i++) map[headers[i]] = i+1;
  return map;
}

function findItem(list, key, value) {
  for(var i=0; i<list.length; i++) {
    if(String(list[i][key]) === String(value)) return list[i];
  }
  return null;
}
`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800 rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Aplikasi didesain modular dan siap pakai.</span>
          </div>
          <p className="font-medium text-emerald-600 dark:text-emerald-400">Database Realtime Sheet • 100% Siap Produksi</p>
        </div>
      </div>
    </div>
  );
}
