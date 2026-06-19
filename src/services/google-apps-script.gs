/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SISTEM MANAJEMEN TABUNGAN SISWA - GOOGLE APPS SCRIPT BACKEND
 * -------------------------------------------------------------
 * Salin dan tempel kode ini di menu "Ekstensi" > "Apps Script" 
 * pada Spreadsheet Google Anda.
 * Deploy sebagai Web App dan pilih akses "Anyone" (Siapa saja).
 * Salin URL Web App yang dihasilkan dan tempelkan ke aplikasi Next.js/React.
 */

// Konfigurasi ID Spreadsheet (Kosongkan jika script terikat ke spreadsheet langsung)
var SPREADSHEET_ID = ""; 

function getActiveSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

// Custom CORS Header helper
function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// doGet ROUTING (Untuk request GET)
function doGet(e) {
  try {
    var action = e.parameter.action;
    if (!action) {
      return response({ success: false, message: "Parameter action tidak ditemukan" });
    }

    var ss = getActiveSpreadsheet();
    
    switch (action) {
      case "getUsers":
        return getUsers(ss);
      case "getSiswa":
        return getSiswa(ss);
      case "getKelas":
        return getKelas(ss);
      case "getSetoran":
        return getSetoran(ss);
      case "getPenarikan":
        return getPenarikan(ss);
      case "getDashboard":
        return getDashboard(ss);
      case "getLaporan":
        return getLaporan(ss, e.parameter);
      default:
        return response({ success: false, message: "Action GET '" + action + "' tidak dikenal" });
    }
  } catch (error) {
    return response({ success: false, message: "Terjadi kesalahan: " + error.toString() });
  }
}

// doPost ROUTING (Untuk request POST)
function doPost(e) {
  try {
    var action = e.parameter.action;
    var postData = {};
    
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      // Fallback jika dikirim via form parameter biasa
      postData = e.parameter;
    }

    if (!action) {
      action = postData.action;
    }

    if (!action) {
      return response({ success: false, message: "Parameter action tidak ditemukan" });
    }

    var ss = getActiveSpreadsheet();

    switch (action) {
      case "login":
        return login(ss, postData);
      case "createUser":
        return createUser(ss, postData);
      case "updateUser":
        return updateUser(ss, postData);
      case "deleteUser":
        return deleteUser(ss, postData);
      case "createSiswa":
        return createSiswa(ss, postData);
      case "updateSiswa":
        return updateSiswa(ss, postData);
      case "deleteSiswa":
        return deleteSiswa(ss, postData);
      case "createKelas":
        return createKelas(ss, postData);
      case "updateKelas":
        return updateKelas(ss, postData);
      case "deleteKelas":
        return deleteKelas(ss, postData);
      case "createSetoran":
        return createSetoran(ss, postData);
      case "createPenarikan":
        return createPenarikan(ss, postData);
      default:
        return response({ success: false, message: "Action POST '" + action + "' tidak dikenal" });
    }
  } catch (error) {
    return response({ success: false, message: "Terjadi kesalahan di POST: " + error.toString() });
  }
}

// ======================= HELPER FUNCTIONS =======================

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
    // Otomatis bikin sheet jika tidak ada biar tidak error
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

// ======================= DATABASE INTIALIZATION =======================
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
      
      // Khusus users, buat admin default
      if (sheetName === "users") {
        var defaultPassHash = sha256("admin123"); // Default password
        sheet.appendRow(["USR-ADMIN", "admin", defaultPassHash, "admin", "aktif", new Date().toISOString()]);
      }
      // Tambahkan data dummy siswa jika baru diinisialisasi biar user bisa test langsung
      if (sheetName === "kelas") {
        sheet.appendRow(["KLS-01", "7-A", "Budi Hermawan, S.Pd."]);
        sheet.appendRow(["KLS-02", "7-B", "Siti Aminah, M.Pd."]);
        sheet.appendRow(["KLS-03", "8-A", "Junaedi, S.Kom."]);
      }
      if (sheetName === "siswa") {
        sheet.appendRow(["SIS-01", "10111", "Andi Wijaya", "L", "7-A", "Jl. Merpati No. 12", "Eko Wijaya", "081234567890", "aktif", new Date().toISOString()]);
        sheet.appendRow(["SIS-02", "10112", "Siti Rahma", "P", "7-A", "Jl. Kenanga No. 44", "Suryono", "081398765432", "aktif", new Date().toISOString()]);
        sheet.appendRow(["SIS-03", "10201", "Bagus Pratama", "L", "7-B", "Jl. Mawar Gg. 3", "Harmono", "082155554444", "aktif", new Date().toISOString()]);
      }
    }
  }
}

// ======================= DATA HANDLERS =======================

// 1. LOGIN
function login(ss, data) {
  var users = getSheetData(ss, "users");
  var username = data.username ? data.username.toLowerCase().trim() : "";
  var password = data.password ? data.password : "";
  var passHash = sha256(password);

  for (var i = 0; i < users.length; i++) {
    if (users[i].username.toLowerCase() === username && users[i].password_hash === passHash) {
      if (users[i].status !== "aktif") {
        return response({ success: false, message: "Akun Anda dinonaktifkan. Hubungi Administrator." });
      }
      
      writeAuditLog(ss, username, "Login berhasil");
      
      // Return detail user (JWT disimulasikan di frontend/gas response)
      return response({
        success: true,
        message: "Login Berhasil",
        data: {
          id_user: users[i].id_user,
          username: users[i].username,
          role: users[i].role,
          status: users[i].status,
          token: "simulated-jwt-" + btoa(JSON.stringify({ id: users[i].id_user, role: users[i].role, expired: Date.now() + 86400000 }))
        }
      });
    }
  }
  
  return response({ success: false, message: "Username atau password salah!" });
}

// 2. USERS
function getUsers(ss) {
  var users = getSheetData(ss, "users");
  // Sensor password hash sebelum dikembalikan
  var safeUsers = users.map(function(u) {
    return {
      id_user: u.id_user,
      username: u.username,
      role: u.role,
      status: u.status,
      created_at: u.created_at
    };
  });
  return response({ success: true, message: "Berhasil memuat data user", data: safeUsers });
}

function createUser(ss, data) {
  var sheet = ss.getSheetByName("users");
  var users = getSheetData(ss, "users");
  var username = data.username ? data.username.toLowerCase().trim() : "";
  
  if (!username || !data.password || !data.role) {
    return response({ success: false, message: "Username, Password, dan Role harus diisi!" });
  }

  // Cek apakah username sudah ada
  for (var i = 0; i < users.length; i++) {
    if (users[i].username.toLowerCase() === username) {
      return response({ success: false, message: "Username '" + username + "' sudah digunakan!" });
    }
  }

  var id = "USR-" + Date.now();
  var passHash = sha256(data.password);
  var role = data.role;
  var status = data.status || "aktif";
  var createdAt = new Date().toISOString();

  sheet.appendRow([id, username, passHash, role, status, createdAt]);
  writeAuditLog(ss, "system", "Membuat user baru: " + username);
  
  return response({ success: true, message: "User '" + username + "' berhasil ditambahkan" });
}

function updateUser(ss, data) {
  var sheet = ss.getSheetByName("users");
  var rIndex = findRowIndexById(sheet, "id_user", data.id_user);
  
  if (rIndex === -1) {
    return response({ success: false, message: "User tidak ditemukan" });
  }

  var colMapping = getColumnMapping(sheet);

  if (data.role) sheet.getRange(rIndex, colMapping["role"]).setValue(data.role);
  if (data.status) sheet.getRange(rIndex, colMapping["status"]).setValue(data.status);
  if (data.password) {
    var passHash = sha256(data.password);
    sheet.getRange(rIndex, colMapping["password_hash"]).setValue(passHash);
  }

  writeAuditLog(ss, "system", "Mengupdate user: ID " + data.id_user);
  return response({ success: true, message: "User berhasil diperbarui" });
}

function deleteUser(ss, data) {
  var sheet = ss.getSheetByName("users");
  var rIndex = findRowIndexById(sheet, "id_user", data.id_user);
  
  if (rIndex === -1) {
    return response({ success: false, message: "User tidak ditemukan" });
  }

  // Mencegah menghapus akun admin utama yang sedang dipakai
  var username = sheet.getRange(rIndex, 2).getValue();
  if (username === "admin") {
    return response({ success: false, message: "User utama 'admin' tidak boleh dihapus!" });
  }

  sheet.deleteRow(rIndex);
  writeAuditLog(ss, "system", "Menghapus user: " + username);
  return response({ success: true, message: "User berhasil dihapus" });
}

// 3. SISWA
function getSiswa(ss) {
  var siswa = getSheetData(ss, "siswa");
  var setoran = getSheetData(ss, "setoran");
  var penarikan = getSheetData(ss, "penarikan");

  // Hitung saldo realtime untuk setiap siswa
  var enrichedSiswa = siswa.map(function(s) {
    var totalSetoran = 0;
    var totalPenarikan = 0;

    for (var i = 0; i < setoran.length; i++) {
      if (String(setoran[i].id_siswa) === String(s.id_siswa)) {
        totalSetoran += Number(setoran[i].nominal) || 0;
      }
    }

    for (var j = 0; j < penarikan.length; j++) {
      if (String(penarikan[j].id_siswa) === String(s.id_siswa)) {
        totalPenarikan += Number(penarikan[j].nominal) || 0;
      }
    }

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
      total_setoran: totalSetoran,
      total_penarikan: totalPenarikan,
      saldo: totalSetoran - totalPenarikan
    };
  });

  return response({ success: true, message: "Berhasil memuat data siswa", data: enrichedSiswa });
}

function createSiswa(ss, data) {
  var sheet = ss.getSheetByName("siswa");
  var siswaList = getSheetData(ss, "siswa");
  
  if (!data.nis || !data.nama || !data.kelas) {
    return response({ success: false, message: "NIS, Nama, dan Kelas wajib diisi!" });
  }

  // Cek NIS unik
  for (var i = 0; i < siswaList.length; i++) {
    if (String(siswaList[i].nis).trim() === String(data.nis).trim()) {
      return response({ success: false, message: "Siswa dengan NIS '" + data.nis + "' sudah terdaftar!" });
    }
  }

  var id = data.id_siswa || ("SIS-" + Date.now());
  var jenis_kelamin = data.jenis_kelamin || "L";
  var status_aktif = data.status_aktif || "aktif";
  var createdAt = new Date().toISOString();

  sheet.appendRow([
    id, 
    data.nis, 
    data.nama, 
    jenis_kelamin, 
    data.kelas, 
    data.alamat || "-", 
    data.nama_orang_tua || "-", 
    data.no_hp || "-", 
    status_aktif, 
    createdAt
  ]);

  writeAuditLog(ss, "system", "Menambahkan siswa baru: " + data.nama + " (" + data.nis + ")");
  return response({ success: true, message: "Siswa baru berhasil ditambahkan", data: { id_siswa: id } });
}

function updateSiswa(ss, data) {
  var sheet = ss.getSheetByName("siswa");
  var rIndex = findRowIndexById(sheet, "id_siswa", data.id_siswa);
  
  if (rIndex === -1) {
    return response({ success: false, message: "Data Siswa tidak ditemukan" });
  }

  var colMapping = getColumnMapping(sheet);

  if (data.nis) sheet.getRange(rIndex, colMapping["nis"]).setValue(data.nis);
  if (data.nama) sheet.getRange(rIndex, colMapping["nama"]).setValue(data.nama);
  if (data.jenis_kelamin) sheet.getRange(rIndex, colMapping["jenis_kelamin"]).setValue(data.jenis_kelamin);
  if (data.kelas) sheet.getRange(rIndex, colMapping["kelas"]).setValue(data.kelas);
  if (data.alamat) sheet.getRange(rIndex, colMapping["alamat"]).setValue(data.alamat);
  if (data.nama_orang_tua) sheet.getRange(rIndex, colMapping["nama_orang_tua"]).setValue(data.nama_orang_tua);
  if (data.no_hp) sheet.getRange(rIndex, colMapping["no_hp"]).setValue(data.no_hp);
  if (data.status_aktif) sheet.getRange(rIndex, colMapping["status_aktif"]).setValue(data.status_aktif);

  writeAuditLog(ss, "system", "Mengupdate data siswa: " + data.nama + " (ID: " + data.id_siswa + ")");
  return response({ success: true, message: "Data siswa berhasil diperbarui" });
}

function deleteSiswa(ss, data) {
  var sheet = ss.getSheetByName("siswa");
  var rIndex = findRowIndexById(sheet, "id_siswa", data.id_siswa);
  
  if (rIndex === -1) {
    return response({ success: false, message: "Data Siswa tidak ditemukan" });
  }

  // Hapus semua rekaman sisa / siswa
  var nama = sheet.getRange(rIndex, 3).getValue();
  sheet.deleteRow(rIndex);

  writeAuditLog(ss, "system", "Menghapus siswa: " + nama);
  return response({ success: true, message: "Siswa berhasil dihapus dari sistem" });
}

// 4. KELAS
function getKelas(ss) {
  var data = getSheetData(ss, "kelas");
  return response({ success: true, message: "Berhasil memuat kelas", data: data });
}

function createKelas(ss, data) {
  var sheet = ss.getSheetByName("kelas");
  var id = data.id_kelas || ("KLS-" + Date.now());
  
  if (!data.nama_kelas || !data.wali_kelas) {
    return response({ success: false, message: "Nama Kelas dan Wali Kelas harus diisi!" });
  }

  sheet.appendRow([id, data.nama_kelas, data.wali_kelas]);
  writeAuditLog(ss, "system", "Menambahkan kelas baru: " + data.nama_kelas);
  
  return response({ success: true, message: "Kelas berhasil ditambahkan" });
}

function updateKelas(ss, data) {
  var sheet = ss.getSheetByName("kelas");
  var rIndex = findRowIndexById(sheet, "id_kelas", data.id_kelas);
  if (rIndex === -1) {
    return response({ success: false, message: "Kelas tidak ditemukan" });
  }

  var colMapping = getColumnMapping(sheet);
  if (data.nama_kelas) sheet.getRange(rIndex, colMapping["nama_kelas"]).setValue(data.nama_kelas);
  if (data.wali_kelas) sheet.getRange(rIndex, colMapping["wali_kelas"]).setValue(data.wali_kelas);

  writeAuditLog(ss, "system", "Memperbarui kelas: " + data.nama_kelas);
  return response({ success: true, message: "Kelas berhasil diperbarui" });
}

function deleteKelas(ss, data) {
  var sheet = ss.getSheetByName("kelas");
  var rIndex = findRowIndexById(sheet, "id_kelas", data.id_kelas);
  if (rIndex === -1) {
    return response({ success: false, message: "Kelas tidak ditemukan" });
  }

  var nama = sheet.getRange(rIndex, 2).getValue();
  sheet.deleteRow(rIndex);
  writeAuditLog(ss, "system", "Menghapus kelas: " + nama);
  return response({ success: true, message: "Kelas berhasil dihapus" });
}

// 5. TRANSAKSI SETORAN
function getSetoran(ss) {
  var setoran = getSheetData(ss, "setoran");
  var siswa = getSheetData(ss, "siswa");

  var enrichedSetoran = setoran.map(function(s) {
    var matchedSiswa = findItem(siswa, "id_siswa", s.id_siswa);
    return {
      id_setoran: s.id_setoran,
      id_siswa: s.id_siswa,
      siswa_nama: matchedSiswa ? matchedSiswa.nama : "Siswa Dihapus",
      siswa_nis: matchedSiswa ? matchedSiswa.nis : "-",
      siswa_kelas: matchedSiswa ? matchedSiswa.kelas : "-",
      tanggal: s.tanggal,
      nominal: Number(s.nominal) || 0,
      keterangan: s.keterangan,
      petugas: s.petugas,
      created_at: s.created_at
    };
  });

  return response({ success: true, message: "Berhasil memuat data setoran", data: enrichedSetoran });
}

function createSetoran(ss, data) {
  var sheet = ss.getSheetByName("setoran");
  
  if (!data.id_siswa || !data.nominal) {
    return response({ success: false, message: "Siswa dan nominal wajib diisi!" });
  }

  var nominal = Number(data.nominal);
  if (isNaN(nominal) || nominal <= 0) {
    return response({ success: false, message: "Nominal harus angka positif lebih besar dari 0!" });
  }

  var id = data.id_setoran || ("TXS-" + Date.now());
  var tanggal = data.tanggal || new Date().toISOString().split('T')[0];
  var petugas = data.petugas || "admin";
  var createdAt = new Date().toISOString();

  sheet.appendRow([
    id,
    tanggal,
    data.id_siswa,
    nominal,
    data.keterangan || "Setoran Tabungan",
    petugas,
    createdAt
  ]);

  var siswaSheet = ss.getSheetByName("siswa");
  var siswaIdx = findRowIndexById(siswaSheet, "id_siswa", data.id_siswa);
  var siswaNama = "Siswa";
  if (siswaIdx !== -1) {
    siswaNama = siswaSheet.getRange(siswaIdx, 3).getValue();
  }

  writeAuditLog(ss, petugas, "Input setoran untuk: " + siswaNama + " sebesar Rp. " + nominal);
  return response({
    success: true,
    message: "Setoran berhasil dicatat",
    data: { id_setoran: id, rincian: { siswa: siswaNama, nominal: nominal, id_setoran: id } }
  });
}

// 6. TRANSAKSI PENARIKAN
function getPenarikan(ss) {
  var penarikan = getSheetData(ss, "penarikan");
  var siswa = getSheetData(ss, "siswa");

  var enrichedPenarikan = penarikan.map(function(p) {
    var matchedSiswa = findItem(siswa, "id_siswa", p.id_siswa);
    return {
      id_penarikan: p.id_penarikan,
      id_siswa: p.id_siswa,
      siswa_nama: matchedSiswa ? matchedSiswa.nama : "Siswa Dihapus",
      siswa_nis: matchedSiswa ? matchedSiswa.nis : "-",
      siswa_kelas: matchedSiswa ? matchedSiswa.kelas : "-",
      tanggal: p.tanggal,
      nominal: Number(p.nominal) || 0,
      keterangan: p.keterangan,
      petugas: p.petugas,
      created_at: p.created_at
    };
  });

  return response({ success: true, message: "Berhasil memuat data penarikan", data: enrichedPenarikan });
}

function createPenarikan(ss, data) {
  var sheet = ss.getSheetByName("penarikan");
  
  if (!data.id_siswa || !data.nominal) {
    return response({ success: false, message: "Siswa dan nominal wajib diisi!" });
  }

  var nominal = Number(data.nominal);
  if (isNaN(nominal) || nominal <= 0) {
    return response({ success: false, message: "Nominal harus angka aktif positif!" });
  }

  // --- VALIDASI SALDO REALTIME ---
  var setoran = getSheetData(ss, "setoran");
  var penarikan = getSheetData(ss, "penarikan");
  var totalSetoranSiswa = 0;
  var totalPenarikanSiswa = 0;

  for (var i = 0; i < setoran.length; i++) {
    if (String(setoran[i].id_siswa) === String(data.id_siswa)) {
      totalSetoranSiswa += Number(setoran[i].nominal) || 0;
    }
  }

  for (var j = 0; j < penarikan.length; j++) {
    if (String(penarikan[j].id_siswa) === String(data.id_siswa)) {
      totalPenarikanSiswa += Number(penarikan[j].nominal) || 0;
    }
  }

  var saldoSiswa = totalSetoranSiswa - totalPenarikanSiswa;

  if (saldoSiswa < nominal) {
    return response({ 
      success: false, 
      message: "Transaksi GAGAL: Saldo siswa tidak mencukupi! Saldo saat ini: Rp. " + saldoSiswa + ", nominal penarikan: Rp. " + nominal 
    });
  }

  var id = data.id_penarikan || ("TXW-" + Date.now());
  var tanggal = data.tanggal || new Date().toISOString().split('T')[0];
  var petugas = data.petugas || "admin";
  var createdAt = new Date().toISOString();

  sheet.appendRow([
    id,
    tanggal,
    data.id_siswa,
    nominal,
    data.keterangan || "Penarikan Tabungan",
    petugas,
    createdAt
  ]);

  var siswaSheet = ss.getSheetByName("siswa");
  var siswaIdx = findRowIndexById(siswaSheet, "id_siswa", data.id_siswa);
  var siswaNama = "Siswa";
  if (siswaIdx !== -1) {
    siswaNama = siswaSheet.getRange(siswaIdx, 3).getValue();
  }

  writeAuditLog(ss, petugas, "Input penarikan tabungan: " + siswaNama + " sebesar Rp. " + nominal);
  return response({
    success: true,
    message: "Penarikan berhasil dicatat",
    data: { id_penarikan: id, rincian: { siswa: siswaNama, nominal: nominal, id_penarikan: id } }
  });
}

// 7. GET DASHBOARD STATISTICS
function getDashboard(ss) {
  var siswa = getSheetData(ss, "siswa");
  var setoran = getSheetData(ss, "setoran");
  var penarikan = getSheetData(ss, "penarikan");

  var totalSiswa = siswa.filter(function(s) { return s.status_aktif === "aktif"; }).length;
  
  var totalSetoran = 0;
  for (var i = 0; i < setoran.length; i++) {
    totalSetoran += Number(setoran[i].nominal) || 0;
  }

  var totalPenarikan = 0;
  for (var j = 0; j < penarikan.length; j++) {
    totalPenarikan += Number(penarikan[j].nominal) || 0;
  }

  var totalSaldo = totalSetoran - totalPenarikan;

  // Setoran & Penarikan Hari Ini
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
  var totalSetoranHariIni = 0;
  var countSetoranHariIni = 0;
  for (var a = 0; a < setoran.length; a++) {
    if (formatDateOnly(setoran[a].tanggal) === todayStr) {
      totalSetoranHariIni += Number(setoran[a].nominal) || 0;
      countSetoranHariIni++;
    }
  }

  var totalPenarikanHariIni = 0;
  var countPenarikanHariIni = 0;
  for (var b = 0; b < penarikan.length; b++) {
    if (formatDateOnly(penarikan[b].tanggal) === todayStr) {
      totalPenarikanHariIni += Number(penarikan[b].nominal) || 0;
      countPenarikanHariIni++;
    }
  }

  // Kombinasikan riwayat transaksi terbaru (maksimal 10)
  var matchedSiswa = {};
  for (var sIdx = 0; sIdx < siswa.length; sIdx++) {
    matchedSiswa[siswa[sIdx].id_siswa] = siswa[sIdx];
  }

  var gabungan = [];
  for (var k = 0; k < setoran.length; k++) {
    var siswaObj = matchedSiswa[setoran[k].id_siswa];
    gabungan.push({
      id: setoran[k].id_setoran,
      tipe: "setoran",
      siswaNama: siswaObj ? siswaObj.nama : "Siswa Dihapus",
      kelas: siswaObj ? siswaObj.kelas : "-",
      nominal: Number(setoran[k].nominal) || 0,
      tanggal: setoran[k].tanggal,
      keterangan: setoran[k].keterangan || "-"
    });
  }

  for (var l = 0; l < penarikan.length; l++) {
    var siswaObj2 = matchedSiswa[penarikan[l].id_siswa];
    gabungan.push({
      id: penarikan[l].id_penarikan,
      tipe: "penarikan",
      siswaNama: siswaObj2 ? siswaObj2.nama : "Siswa Dihapus",
      kelas: siswaObj2 ? siswaObj2.kelas : "-",
      nominal: Number(penarikan[l].nominal) || 0,
      tanggal: penarikan[l].tanggal,
      keterangan: penarikan[l].keterangan || "-"
    });
  }

  // Urutkan berdasarkan tanggal terbaru
  gabungan.sort(function(x, y) {
    return new Date(y.tanggal).getTime() - new Date(x.tanggal).getTime();
  });
  var transaksiTerbaru = gabungan.slice(0, 10);

  // Grafik bulanan (6 bulan terakhir)
  var chartData = [];
  var bulanIndo = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  
  // Buat map 6 bulan terakhir
  var saatIni = new Date();
  for (var m = 5; m >= 0; m--) {
    var d = new Date(saatIni.getFullYear(), saatIni.getMonth() - m, 1);
    var label = bulanIndo[d.getMonth()] + " " + String(d.getFullYear()).substring(2);
    chartData.push({
      key: d.getFullYear() + "-" + (d.getMonth() + 1), // YYYY-MM
      bulan: label,
      setoran: 0,
      penarikan: 0
    });
  }

  // Isi data chart
  setoran.forEach(function(tx) {
    if (!tx.tanggal) return;
    var txDate = new Date(tx.tanggal);
    var txKey = txDate.getFullYear() + "-" + (txDate.getMonth() + 1);
    for (var c = 0; c < chartData.length; c++) {
      if (chartData[c].key === txKey) {
        chartData[c].setoran += Number(tx.nominal) || 0;
      }
    }
  });

  penarikan.forEach(function(tx) {
    if (!tx.tanggal) return;
    var txDate = new Date(tx.tanggal);
    var txKey = txDate.getFullYear() + "-" + (txDate.getMonth() + 1);
    for (var c = 0; c < chartData.length; c++) {
      if (chartData[c].key === txKey) {
        chartData[c].penarikan += Number(tx.nominal) || 0;
      }
    }
  });

  return response({
    success: true,
    message: "Berhasil memuat statistik dashboard",
    data: {
      totalSiswa: totalSiswa,
      totalSaldo: totalSaldo,
      totalSetoranHariIni: totalSetoranHariIni,
      totalPenarikanHariIni: totalPenarikanHariIni,
      setoranCountHariIni: countSetoranHariIni,
      penarikanCountHariIni: countPenarikanHariIni,
      transaksiTerbaru: transaksiTerbaru,
      chartData: chartData
    }
  });
}

// 8. LAPORAN DENGAN FILTER
function getLaporan(ss, params) {
  var users = getSheetData(ss, "users");
  var siswa = getSheetData(ss, "siswa");
  var kelasList = getSheetData(ss, "kelas");
  var setoran = getSheetData(ss, "setoran");
  var penarikan = getSheetData(ss, "penarikan");
  var logList = getSheetData(ss, "audit_log");

  // Tambahkan rekap saldo ke masing-masing siswa
  var enrichedSiswa = siswa.map(function(s) {
    var s_setoran = 0;
    var s_penarikan = 0;
    setoran.forEach(function(st) {
      if (String(st.id_siswa) === String(s.id_siswa)) s_setoran += Number(st.nominal) || 0;
    });
    penarikan.forEach(function(pn) {
      if (String(pn.id_siswa) === String(s.id_siswa)) s_penarikan += Number(pn.nominal) || 0;
    });
    return {
      id_siswa: s.id_siswa,
      nis: s.nis,
      nama: s.nama,
      kelas: s.kelas,
      jenis_kelamin: s.jenis_kelamin,
      alamat: s.alamat,
      nama_orang_tua: s.nama_orang_tua,
      no_hp: s.no_hp,
      status_aktif: s.status_aktif,
      total_setoran: s_setoran,
      total_penarikan: s_penarikan,
      saldo: s_setoran - s_penarikan
    };
  });

  // Gabungkan semua riwayat transaksi untuk jajaran lap harian/bulanan/tahunan
  var matchedSiswa = {};
  siswa.forEach(function(s) { matchedSiswa[s.id_siswa] = s; });

  var semuaTransaksi = [];
  setoran.forEach(function(s) {
    var siswaObj = matchedSiswa[s.id_siswa];
    semuaTransaksi.push({
      id_transaksi: s.id_setoran,
      tipe: "setoran",
      tanggal: s.tanggal,
      id_siswa: s.id_siswa,
      siswa_nama: siswaObj ? siswaObj.nama : "Siswa Dihapus",
      siswa_nis: siswaObj ? siswaObj.nis : "-",
      siswa_kelas: siswaObj ? siswaObj.kelas : "-",
      nominal: Number(s.nominal) || 0,
      keterangan: s.keterangan,
      petugas: s.petugas,
      created_at: s.created_at
    });
  });

  penarikan.forEach(function(p) {
    var siswaObj = matchedSiswa[p.id_siswa];
    semuaTransaksi.push({
      id_transaksi: p.id_penarikan,
      tipe: "penarikan",
      tanggal: p.tanggal,
      id_siswa: p.id_siswa,
      siswa_nama: siswaObj ? siswaObj.nama : "Siswa Dihapus",
      siswa_nis: siswaObj ? siswaObj.nis : "-",
      siswa_kelas: siswaObj ? siswaObj.kelas : "-",
      nominal: Number(p.nominal) || 0,
      keterangan: p.keterangan,
      petugas: p.petugas,
      created_at: p.created_at
    });
  });

  // Urutkan berdasarkan tanggal
  semuaTransaksi.sort(function(a, b) {
    return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
  });

  return response({
    success: true,
    message: "Berhasil memuat Laporan Terpadu",
    data: {
      siswa: enrichedSiswa,
      kelas: kelasList,
      semuaTransaksi: semuaTransaksi,
      auditLog: logList.reverse().slice(0, 50) // Ambil 50 log terakhir
    }
  });
}

// ======================= UTILITY SHEET METHODS =======================

function findRowIndexById(sheet, keyColumnName, idToFind) {
  var range = sheet.getDataRange();
  var values = range.getValues();
  var headers = values[0];
  var colIndex = headers.indexOf(keyColumnName);
  
  if (colIndex === -1) return -1;
  
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][colIndex]) === String(idToFind)) {
      return i + 1; // Sesuai index baris spreadsheet yang 1-based
    }
  }
  return -1;
}

function getColumnMapping(sheet) {
  var headers = sheet.getDataRange().getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    map[headers[i]] = i + 1; // Sesuai index kolom spreadsheet yang 1-based
  }
  return map;
}

function findItem(list, key, value) {
  for (var i = 0; i < list.length; i++) {
    if (String(list[i][key]) === String(value)) {
      return list[i];
    }
  }
  return null;
}
