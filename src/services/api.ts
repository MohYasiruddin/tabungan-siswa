/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Siswa, Kelas, Setoran, Penarikan, AuditLog, DashboardStats, UserRole } from '../types';

// Simple SHA-256 hashing helper in pure TypeScript/JavaScript for offline mode consistency
export async function sha256(message: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Basic fallback hash for outdated environments (extremely unlikely, but prevents crash)
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'fallback-' + Math.abs(hash).toString(16);
  }
}

// Global state key for active GAS API URL in browser
const API_URL_KEY = 'tabungan_siswa_gas_api_url';
const API_MODE_KEY = 'tabungan_siswa_api_mode'; // 'simulasi' | 'api'

export function getGasApiUrl(): string {
  // @ts-ignore
  const metaEnvUrl = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_GAS_API_URL : '';
  return localStorage.getItem(API_URL_KEY) || metaEnvUrl || '';
}

export function setGasApiUrl(url: string) {
  localStorage.setItem(API_URL_KEY, url);
}

export function getApiMode(): 'simulasi' | 'api' {
  const mode = localStorage.getItem(API_MODE_KEY);
  if (mode === 'api' && getGasApiUrl()) {
    return 'api';
  }
  return 'simulasi';
}

export function setApiMode(mode: 'simulasi' | 'api') {
  localStorage.setItem(API_MODE_KEY, mode);
}

// ==========================================
// OFFLINE / SIMULATED DATABASE IMPLEMENTATION
// ==========================================

function getStoredData<T>(key: string, defaultData: T[]): T[] {
  const stored = localStorage.getItem(`db_${key}`);
  if (!stored) {
    localStorage.setItem(`db_${key}`, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(stored);
}

function setStoredData<T>(key: string, data: T[]) {
  localStorage.setItem(`db_${key}`, JSON.stringify(data));
}

// Initial Data Seeds
const defaultUsers: User[] = [
  {
    id_user: 'USR-ADMIN',
    username: 'admin',
    // SHA256 hash of 'admin123'
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    role: 'admin',
    status: 'aktif',
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id_user: 'USR-BENDAHARA',
    username: 'bendahara',
    // SHA256 of 'bendahara123'
    password_hash: '39403d6d63df4d516248cc94b61ef059bd09b60d03b0c8db46b6fc5df5834914',
    role: 'bendahara',
    status: 'aktif',
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id_user: 'USR-WALIKELAS',
    username: 'wali_7a',
    // SHA256 of 'wali123'
    password_hash: 'aa9bbf939de323e2060b97cb31c81ef94e183764834ff4414eec2b0cfdc71690',
    role: 'wali_kelas',
    status: 'aktif',
    created_at: new Date('2026-06-01').toISOString()
  }
];

const defaultKelas: Kelas[] = [
  { id_kelas: 'KLS-01', nama_kelas: '7-A', wali_kelas: 'Budi Hermawan, S.Pd.' },
  { id_kelas: 'KLS-02', nama_kelas: '7-B', wali_kelas: 'Siti Aminah, M.Pd.' },
  { id_kelas: 'KLS-03', nama_kelas: '8-A', wali_kelas: 'Junaedi, S.Kom.' }
];

const defaultSiswa: Siswa[] = [
  {
    id_siswa: 'SIS-01',
    nis: '10111',
    nama: 'Andi Wijaya',
    jenis_kelamin: 'L',
    kelas: '7-A',
    alamat: 'Jl. Merpati No. 12, Bandung',
    nama_orang_tua: 'Eko Wijaya',
    no_hp: '081234567890',
    status_aktif: 'aktif',
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id_siswa: 'SIS-02',
    nis: '10112',
    nama: 'Siti Rahma',
    jenis_kelamin: 'P',
    kelas: '7-A',
    alamat: 'Jl. Kenanga No. 44, Bandung',
    nama_orang_tua: 'Suryono',
    no_hp: '081398765432',
    status_aktif: 'aktif',
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id_siswa: 'SIS-03',
    nis: '10201',
    nama: 'Bagus Pratama',
    jenis_kelamin: 'L',
    kelas: '7-B',
    alamat: 'Jl. Mawar Gg. 3, Bandung',
    nama_orang_tua: 'Harmono',
    no_hp: '082155554444',
    status_aktif: 'aktif',
    created_at: new Date('2026-06-01').toISOString()
  }
];

const defaultSetoran: Setoran[] = [
  {
    id_setoran: 'TXS-1',
    tanggal: '2026-06-15',
    id_siswa: 'SIS-01',
    nominal: 50000,
    keterangan: 'Tabungan Mingguan',
    petugas: 'bendahara',
    created_at: '2026-06-15T08:00:00.000Z'
  },
  {
    id_setoran: 'TXS-2',
    tanggal: '2026-06-15',
    id_siswa: 'SIS-02',
    nominal: 100000,
    keterangan: 'Setoran Awal',
    petugas: 'admin',
    created_at: '2026-06-15T09:12:00.000Z'
  },
  {
    id_setoran: 'TXS-3',
    tanggal: '2026-06-16',
    id_siswa: 'SIS-03',
    nominal: 75000,
    keterangan: 'Pindahan Celengan',
    petugas: 'bendahara',
    created_at: '2026-06-16T10:05:00.000Z'
  },
  {
    id_setoran: 'TXS-4',
    tanggal: '2026-06-17',
    id_siswa: 'SIS-01',
    nominal: 30000,
    keterangan: 'Sisa Uang Jajan',
    petugas: 'bendahara',
    created_at: '2026-06-17T07:45:00.000Z'
  }
];

const defaultPenarikan: Penarikan[] = [
  {
    id_penarikan: 'TXW-1',
    tanggal: '2026-06-16',
    id_siswa: 'SIS-01',
    nominal: 20000,
    keterangan: 'Beli Buku Tulis',
    petugas: 'bendahara',
    created_at: '2026-06-16T14:30:00.000Z'
  }
];

const defaultLogs: AuditLog[] = [
  { id_log: 'LOG-1', tanggal: '2026-06-15T08:01:00.000Z', user: 'system', aktivitas: 'Sistem diinisialisasi' },
  { id_log: 'LOG-2', tanggal: '2026-06-15T09:15:00.000Z', user: 'admin', aktivitas: 'Input setoran SIS-02 Rp. 100,000' }
];

// Helper to write logs in Local Mode oline-first
function addSimulatedLog(username: string, aktivitas: string) {
  const logs = getStoredData<AuditLog>('audit_log', defaultLogs);
  const newLog: AuditLog = {
    id_log: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    tanggal: new Date().toISOString(),
    user: username,
    aktivitas
  };
  setStoredData('audit_log', [newLog, ...logs]);
}

// ==========================================
// CORE EXPORTED API WRAPPER
// ==========================================

export const apiService = {
  // Generic Fetch POST to GAS Web App with Redirect handling
  async reqPost(action: string, data: any): Promise<any> {
    try {
      const url = getGasApiUrl();
      if (!url) {
        return { success: false, message: "Google Apps Script API URL belum dikonfigurasi di pengaturan." };
      }

      const response = await fetch(`${url}?action=${action}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data)
      });
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        if (text.includes("ScriptValue") || text.includes("Service-Unavailable") || text.includes("google-site-verification") || text.includes("<html") || text.includes("<script")) {
          return { 
            success: false, 
            message: "Akses Google Apps Script Terblokir/Tidak Diizinkan. Pastikan status publikasi script sebagai Web App diatur ke 'Anyone' (Siapa saja) dan Anda telah memberikan persetujuan saat deployment." 
          };
        }
        return { 
          success: false, 
          message: `Respon server bukan format JSON yang valid. Silakan periksa kembali konfigurasi Apps Script Anda.` 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: `Koneksi ke server gagal: ${error.message || error}. Harap periksa jaringan internet atau validitas URL Google Apps Script Anda.` 
      };
    }
  },

  async reqGet(action: string, params: Record<string, string> = {}): Promise<any> {
    try {
      const url = getGasApiUrl();
      if (!url) {
        return { success: false, message: "Google Apps Script API URL belum dikonfigurasi di pengaturan." };
      }

      const queryParams = new URLSearchParams({ action, ...params }).toString();
      const response = await fetch(`${url}?${queryParams}`, {
        method: 'GET',
        mode: 'cors'
      });
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        if (text.includes("ScriptValue") || text.includes("Service-Unavailable") || text.includes("google-site-verification") || text.includes("<html") || text.includes("<script")) {
          return { 
            success: false, 
            message: "Akses Google Apps Script Terblokir/Tidak Diizinkan. Pastikan status publikasi script sebagai Web App diatur ke 'Anyone' (Siapa saja) dan Anda telah memberikan persetujuan saat deployment." 
          };
        }
        return { 
          success: false, 
          message: `Respon server bukan format JSON yang valid. Silakan periksa kembali konfigurasi Apps Script Anda.` 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: `Koneksi ke server gagal: ${error.message || error}. Harap periksa jaringan internet atau validitas URL Google Apps Script Anda.` 
      };
    }
  },

  // Batch sync local/simulated browser data directly to Google Sheets
  async syncLocalDataToSheets(progressCallback?: (status: string) => void): Promise<{ success: boolean; message: string; data?: any }> {
    const url = getGasApiUrl();
    if (!url) throw new Error("Google Apps Script API URL belum dikonfigurasi.");

    // Retrieve all local browser/simulated data tables
    const siswa = getStoredData<Siswa>('siswa', defaultSiswa);
    const kelas = getStoredData<Kelas>('kelas', defaultKelas);
    const setoran = getStoredData<Setoran>('setoran', defaultSetoran);
    const penarikan = getStoredData<Penarikan>('penarikan', defaultPenarikan);

    if (progressCallback) progressCallback("Menginisialisasi pencocokan sinkronisasi...");

    // 1. Sync Kelas
    let kelasCount = 0;
    for (const k of kelas) {
      if (progressCallback) progressCallback(`Menyinkronkan Kelas: ${k.nama_kelas}...`);
      try {
        await this.reqPost('createKelas', {
          id_kelas: k.id_kelas,
          nama_kelas: k.nama_kelas,
          wali_kelas: k.wali_kelas
        });
        kelasCount++;
      } catch (err) {
        console.error("Gagal sinkron kelas:", k, err);
      }
    }

    // 2. Sync Siswa
    let siswaCount = 0;
    for (const s of siswa) {
      if (progressCallback) progressCallback(`Menyinkronkan Siswa: ${s.nama}...`);
      try {
        await this.reqPost('createSiswa', {
          id_siswa: s.id_siswa,
          nis: s.nis,
          nama: s.nama,
          jenis_kelamin: s.jenis_kelamin,
          kelas: s.kelas,
          alamat: s.alamat,
          nama_orang_tua: s.nama_orang_tua,
          no_hp: s.no_hp,
          status_aktif: s.status_aktif
        });
        siswaCount++;
      } catch (err) {
        console.error("Gagal sinkron siswa:", s, err);
      }
    }

    // 3. Sync Setoran
    let setoranCount = 0;
    for (const s of setoran) {
      if (progressCallback) progressCallback(`Menyinkronkan Setoran: Rp. ${s.nominal.toLocaleString('id-ID')}...`);
      try {
        await this.reqPost('createSetoran', {
          id_setoran: s.id_setoran,
          tanggal: s.tanggal,
          id_siswa: s.id_siswa,
          nominal: s.nominal,
          keterangan: s.keterangan || "Setoran",
          petugas: s.petugas
        });
        setoranCount++;
      } catch (err) {
        console.error("Gagal sinkron setoran:", s, err);
      }
    }

    // 4. Sync Penarikan
    let penarikanCount = 0;
    for (const p of penarikan) {
      if (progressCallback) progressCallback(`Menyinkronkan Penarikan: Rp. ${p.nominal.toLocaleString('id-ID')}...`);
      try {
        await this.reqPost('createPenarikan', {
          id_penarikan: p.id_penarikan,
          tanggal: p.tanggal,
          id_siswa: p.id_siswa,
          nominal: p.nominal,
          keterangan: p.keterangan || "Penarikan",
          petugas: p.petugas
        });
        penarikanCount++;
      } catch (err) {
        console.error("Gagal sinkron penarikan:", p, err);
      }
    }

    return {
      success: true,
      message: `Berhasil menyinkronkan data ke Google Sheets!`,
      data: {
        kelas: kelasCount,
        siswa: siswaCount,
        setoran: setoranCount,
        penarikan: penarikanCount
      }
    };
  },

  // Auth User Session JWT
  async login(username: string, password: string): Promise<{ success: boolean; message: string; data?: any }> {
    const mode = getApiMode();
    if (mode === 'api') {
      try {
        return await this.reqPost('login', { username, password });
      } catch (error: any) {
        return { success: false, message: 'Gagal menghubungi API: ' + error.message };
      }
    }

    // Local Simulation
    const users = getStoredData<User>('users', defaultUsers);
    const passHash = await sha256(password);
    const normalizedUsername = username.toLowerCase().trim();

    const isMatched = (u: User) => {
      if (u.username.toLowerCase() !== normalizedUsername) return false;
      
      // Flexible password checking for default demo accounts
      if (normalizedUsername === 'admin' && (password === 'admin' || password === 'admin123')) return true;
      if (normalizedUsername === 'bendahara' && (password === 'bendahara' || password === 'bendahara123' || password === 'bndhr')) return true;
      if (normalizedUsername === 'wali_7a' && (password === 'wali' || password === 'wali123')) return true;

      // Otherwise fallback to SHA256 match
      return u.password_hash === passHash;
    };

    const matched = users.find(isMatched);
    
    if (matched) {
      if (matched.status !== 'aktif') {
        return { success: false, message: 'Akun Anda dinonaktifkan. Hubungi Administrator.' };
      }
      
      addSimulatedLog(matched.username, 'Login berhasil (Simulasi)');
      
      const simulatedToken = 'simulated-jwt-' + btoa(JSON.stringify({ 
        id: matched.id_user, 
        role: matched.role, 
        exp: Date.now() + 86400000 
      }));

      return {
        success: true,
        message: 'Login Berhasil (Model Simulasi)',
        data: {
          id_user: matched.id_user,
          username: matched.username,
          role: matched.role,
          status: matched.status,
          token: simulatedToken
        }
      };
    }
    
    return { success: false, message: 'Username atau password simulasi salah! (Gunakan menu akses cepat di bawah, atau sandi default: admin, bendahara, wali123)' };
  },

  async resetUsersToDefault(): Promise<{ success: boolean; message: string }> {
    const mode = getApiMode();
    if (mode === 'api') {
      return { success: false, message: 'Fungsi reset langsung hanya tersedia pada Mode Simulasi.' };
    }
    localStorage.removeItem('db_users');
    return { success: true, message: 'Berhasil mereset ulang semua akun pengguna simulator ke setelan default!' };
  },

  // USERS CRUD
  async getUsers(): Promise<{ success: boolean; message: string; data: User[] }> {
    const mode = getApiMode();
    if (mode === 'api') {
      try {
        return await this.reqGet('getUsers');
      } catch (error: any) {
        return { success: false, message: error.message, data: [] };
      }
    }

    const users = getStoredData<User>('users', defaultUsers);
    return { success: true, message: 'Berhasil memuat user', data: users };
  },

  async createUser(data: Omit<User, 'id_user' | 'created_at' | 'password_hash'> & { password?: string }): Promise<any> {
    const mode = getApiMode();
    if (mode === 'api') {
      return this.reqPost('createUser', data);
    }

    const users = getStoredData<User>('users', defaultUsers);
    if (!data.username || !data.password || !data.role) {
      return { success: false, message: 'Username, password, dan role wajib diisi!' };
    }

    const nameExists = users.some(u => u.username.toLowerCase() === data.username.toLowerCase().trim());
    if (nameExists) {
      return { success: false, message: `Username '${data.username}' sudah dipakai!` };
    }

    const newUser: User = {
      id_user: 'USR-' + Date.now(),
      username: data.username.trim(),
      password_hash: await sha256(data.password),
      role: data.role as UserRole,
      status: data.status || 'aktif',
      created_at: new Date().toISOString()
    };

    setStoredData('users', [...users, newUser]);
    addSimulatedLog('admin', `Membuat user baru: ${newUser.username}`);
    return { success: true, message: `User '${newUser.username}' berhasil ditambahkan` };
  },

  async updateUser(data: { id_user: string; role?: UserRole; status?: 'aktif' | 'nonaktif'; password?: string }): Promise<any> {
    const mode = getApiMode();
    if (mode === 'api') {
      return this.reqPost('updateUser', data);
    }

    const users = getStoredData<User>('users', defaultUsers);
    const index = users.findIndex(u => u.id_user === data.id_user);
    if (index === -1) return { success: false, message: 'User tidak ditemukan' };

    const updated = { ...users[index] };
    if (data.role) updated.role = data.role;
    if (data.status) updated.status = data.status;
    if (data.password) updated.password_hash = await sha256(data.password);

    users[index] = updated;
    setStoredData('users', users);
    addSimulatedLog('admin', `Mengupdate data user: ${updated.username}`);
    return { success: true, message: 'User berhasil diperbarui' };
  },

  async deleteUser(id: string): Promise<any> {
    const mode = getApiMode();
    if (mode === 'api') {
      return this.reqPost('deleteUser', { id_user: id });
    }

    const users = getStoredData<User>('users', defaultUsers);
    const userToDelete = users.find(u => u.id_user === id);
    if (!userToDelete) return { success: false, message: 'User tidak ditemukan' };
    if (userToDelete.username === 'admin') {
      return { success: false, message: 'User utama admin tidak boleh dihapus!' };
    }

    const filtered = users.filter(u => u.id_user !== id);
    setStoredData('users', filtered);
    addSimulatedLog('admin', `Menghapus user: ${userToDelete.username}`);
    return { success: true, message: 'User berhasil dihapus' };
  },

  // SISWA CRUD
  async getSiswa(): Promise<{ success: boolean; message: string; data: (Siswa & { total_setoran: number; total_penarikan: number; saldo: number })[] }> {
    const mode = getApiMode();
    if (mode === 'api') {
      try {
        return await this.reqGet('getSiswa');
      } catch (error: any) {
        return { success: false, message: error.message, data: [] };
      }
    }

    // Local Simulation
    const siswa = getStoredData<Siswa>('siswa', defaultSiswa);
    const setoran = getStoredData<Setoran>('setoran', defaultSetoran);
    const penarikan = getStoredData<Penarikan>('penarikan', defaultPenarikan);

    const enriched = siswa.map(s => {
      const sSetoran = setoran.filter(tx => tx.id_siswa === s.id_siswa).reduce((acc, curr) => acc + curr.nominal, 0);
      const sPenarikan = penarikan.filter(tx => tx.id_siswa === s.id_siswa).reduce((acc, curr) => acc + curr.nominal, 0);
      return {
        ...s,
        total_setoran: sSetoran,
        total_penarikan: sPenarikan,
        saldo: sSetoran - sPenarikan
      };
    });

    return { success: true, message: 'Berhasil memuat siswa', data: enriched };
  },

  async createSiswa(data: Omit<Siswa, 'id_siswa' | 'created_at'>): Promise<any> {
    const mode = getApiMode();
    if (mode === 'api') {
      return this.reqPost('createSiswa', data);
    }

    const siswa = getStoredData<Siswa>('siswa', defaultSiswa);
    if (!data.nis || !data.nama || !data.kelas) {
      return { success: false, message: 'NIS, Nama, dan Kelas wajib diisi!' };
    }

    const nisExists = siswa.some(s => s.nis.trim() === data.nis.trim());
    if (nisExists) {
      return { success: false, message: `Siswa dengan NIS '${data.nis}' telah terdaftar!` };
    }

    const newSiswa: Siswa = {
      id_siswa: 'SIS-' + Date.now(),
      nis: data.nis,
      nama: data.nama,
      jenis_kelamin: data.jenis_kelamin,
      kelas: data.kelas,
      alamat: data.alamat || '-',
      nama_orang_tua: data.nama_orang_tua || '-',
      no_hp: data.no_hp || '-',
      status_aktif: data.status_aktif || 'aktif',
      created_at: new Date().toISOString()
    };

    setStoredData('siswa', [...siswa, newSiswa]);
    addSimulatedLog('system', `Menambahkan siswa baru: ${newSiswa.nama} (${newSiswa.nis})`);
    return { success: true, message: 'Siswa baru berhasil ditambahkan', data: { id_siswa: newSiswa.id_siswa } };
  },

  async updateSiswa(data: Partial<Siswa> & { id_siswa: string }): Promise<any> {
    const mode = getApiMode();
    if (mode === 'api') {
      return this.reqPost('updateSiswa', data);
    }

    const siswa = getStoredData<Siswa>('siswa', defaultSiswa);
    const index = siswa.findIndex(s => s.id_siswa === data.id_siswa);
    if (index === -1) return { success: false, message: 'Siswa tidak ditemukan' };

    siswa[index] = { ...siswa[index], ...data } as Siswa;
    setStoredData('siswa', siswa);
    addSimulatedLog('system', `Mengupdate data siswa: ${siswa[index].nama}`);
    return { success: true, message: 'Data siswa berhasil diperbarui' };
  },

  async deleteSiswa(id: string): Promise<any> {
    const mode = getApiMode();
    if (mode === 'api') {
      return this.reqPost('deleteSiswa', { id_siswa: id });
    }

    const siswa = getStoredData<Siswa>('siswa', defaultSiswa);
    const matched = siswa.find(s => s.id_siswa === id);
    if (!matched) return { success: false, message: 'Siswa tidak ditemukan' };

    const filtered = siswa.filter(s => s.id_siswa !== id);
    setStoredData('siswa', filtered);
    addSimulatedLog('system', `Menghapus siswa: ${matched.nama}`);
    return { success: true, message: 'Siswa dan datanya berhasil dihapus' };
  },

  // KELAS CRUD
  async getKelas(): Promise<{ success: boolean; message: string; data: Kelas[] }> {
    const mode = getApiMode();
    if (mode === 'api') {
      try {
        return await this.reqGet('getKelas');
      } catch (error: any) {
        return { success: false, message: error.message, data: [] };
      }
    }

    const kelas = getStoredData<Kelas>('kelas', defaultKelas);
    return { success: true, message: 'Berhasil memuat data kelas', data: kelas };
  },

  async createKelas(data: Omit<Kelas, 'id_kelas'>): Promise<any> {
    const mode = getApiMode();
    if (mode === 'api') {
      return this.reqPost('createKelas', data);
    }

    const kelas = getStoredData<Kelas>('kelas', defaultKelas);
    if (!data.nama_kelas || !data.wali_kelas) {
      return { success: false, message: 'Nama Kelas dan Wali kelas harus diisi!' };
    }

    const newKelas: Kelas = {
      id_kelas: 'KLS-' + Date.now(),
      nama_kelas: data.nama_kelas,
      wali_kelas: data.wali_kelas
    };

    setStoredData('kelas', [...kelas, newKelas]);
    addSimulatedLog('system', `Menambahkan kelas baru: ${newKelas.nama_kelas}`);
    return { success: true, message: 'Kelas berhasil ditumbuhkan' };
  },

  async updateKelas(data: Kelas): Promise<any> {
    const mode = getApiMode();
    if (mode === 'api') {
      return this.reqPost('updateKelas', data);
    }

    const kelas = getStoredData<Kelas>('kelas', defaultKelas);
    const index = kelas.findIndex(k => k.id_kelas === data.id_kelas);
    if (index === -1) return { success: false, message: 'Kelas tidak ditemukan' };

    kelas[index] = data;
    setStoredData('kelas', kelas);
    addSimulatedLog('system', `Mengupdate kelas: ${data.nama_kelas}`);
    return { success: true, message: 'Kelas berhasil diperbarui' };
  },

  async deleteKelas(id: string): Promise<any> {
    const mode = getApiMode();
    if (mode === 'api') {
      return this.reqPost('deleteKelas', { id_kelas: id });
    }

    const kelas = getStoredData<Kelas>('kelas', defaultKelas);
    const matched = kelas.find(k => k.id_kelas === id);
    if (!matched) return { success: false, message: 'Kelas tidak ditemukan' };

    const filtered = kelas.filter(k => k.id_kelas !== id);
    setStoredData('kelas', filtered);
    addSimulatedLog('system', `Menghapus kelas: ${matched.nama_kelas}`);
    return { success: true, message: 'Kelas berhasil dihapus' };
  },

  // SETORAN
  async getSetoran(): Promise<{ success: boolean; message: string; data: any[] }> {
    const mode = getApiMode();
    if (mode === 'api') {
      try {
        return await this.reqGet('getSetoran');
      } catch (error: any) {
        return { success: false, message: error.message, data: [] };
      }
    }

    const setoran = getStoredData<Setoran>('setoran', defaultSetoran);
    const siswa = getStoredData<Siswa>('siswa', defaultSiswa);

    const enriched = setoran.map(s => {
      const student = siswa.find(stud => stud.id_siswa === s.id_siswa);
      return {
        id_setoran: s.id_setoran,
        id_siswa: s.id_siswa,
        siswa_nama: student ? student.nama : 'Siswa Dihapus',
        siswa_nis: student ? student.nis : '-',
        siswa_kelas: student ? student.kelas : '-',
        tanggal: s.tanggal,
        nominal: s.nominal,
        keterangan: s.keterangan,
        petugas: s.petugas,
        created_at: s.created_at
      };
    });

    return { success: true, message: 'Berhasil memuat setoran', data: enriched };
  },

  async createSetoran(data: { id_siswa: string; nominal: number; keterangan?: string; petugas: string; tanggal?: string }): Promise<any> {
    const mode = getApiMode();
    if (mode === 'api') {
      return this.reqPost('createSetoran', data);
    }

    const setoran = getStoredData<Setoran>('setoran', defaultSetoran);
    const siswa = getStoredData<Siswa>('siswa', defaultSiswa);

    const student = siswa.find(s => s.id_siswa === data.id_siswa);
    if (!student) return { success: false, message: 'Siswa tidak valid' };

    const nominal = Number(data.nominal);
    if (isNaN(nominal) || nominal <= 0) {
      return { success: false, message: 'Nominal setoran harus lebih besar dari Rp. 0' };
    }

    const newSetoran: Setoran = {
      id_setoran: 'TXS-' + Date.now(),
      tanggal: data.tanggal || new Date().toISOString().split('T')[0],
      id_siswa: data.id_siswa,
      nominal: nominal,
      keterangan: data.keterangan || 'Setoran Tabungan',
      petugas: data.petugas,
      created_at: new Date().toISOString()
    };

    setStoredData('setoran', [...setoran, newSetoran]);
    addSimulatedLog(data.petugas, `Setoran dicatat untuk ${student.nama} sebesar Rp. ${nominal.toLocaleString('id-ID')}`);
    return {
      success: true,
      message: 'Setoran berhasil dicatat',
      data: {
        id_setoran: newSetoran.id_setoran,
        rincian: {
          siswa: student.nama,
          nominal: nominal,
          id_setoran: newSetoran.id_setoran
        }
      }
    };
  },

  // PENARIKAN
  async getPenarikan(): Promise<{ success: boolean; message: string; data: any[] }> {
    const mode = getApiMode();
    if (mode === 'api') {
      try {
        return await this.reqGet('getPenarikan');
      } catch (error: any) {
        return { success: false, message: error.message, data: [] };
      }
    }

    const penarikan = getStoredData<Penarikan>('penarikan', defaultPenarikan);
    const siswa = getStoredData<Siswa>('siswa', defaultSiswa);

    const enriched = penarikan.map(p => {
      const student = siswa.find(stud => stud.id_siswa === p.id_siswa);
      return {
        id_penarikan: p.id_penarikan,
        id_siswa: p.id_siswa,
        siswa_nama: student ? student.nama : 'Siswa Dihapus',
        siswa_nis: student ? student.nis : '-',
        siswa_kelas: student ? student.kelas : '-',
        tanggal: p.tanggal,
        nominal: p.nominal,
        keterangan: p.keterangan || '-',
        petugas: p.petugas,
        created_at: p.created_at
      };
    });

    return { success: true, message: 'Berhasil memuat penarikan', data: enriched };
  },

  async createPenarikan(data: { id_siswa: string; nominal: number; keterangan?: string; petugas: string; tanggal?: string }): Promise<any> {
    const mode = getApiMode();
    if (mode === 'api') {
      return this.reqPost('createPenarikan', data);
    }

    const penarikan = getStoredData<Penarikan>('penarikan', defaultPenarikan);
    const setoran = getStoredData<Setoran>('setoran', defaultSetoran);
    const siswa = getStoredData<Siswa>('siswa', defaultSiswa);

    const student = siswa.find(s => s.id_siswa === data.id_siswa);
    if (!student) return { success: false, message: 'Siswa tidak valid' };

    const nominal = Number(data.nominal);
    if (isNaN(nominal) || nominal <= 0) {
      return { success: false, message: 'Nominal penarikan harus lebih besar dari Rp. 0' };
    }

    // --- VALIDATION SALDO SISWA ---
    const totalSetoran = setoran.filter(tx => tx.id_siswa === data.id_siswa).reduce((acc, curr) => acc + curr.nominal, 0);
    const totalPenarikan = penarikan.filter(tx => tx.id_siswa === data.id_siswa).reduce((acc, curr) => acc + curr.nominal, 0);
    const saldoSekarang = totalSetoran - totalPenarikan;

    if (saldoSekarang < nominal) {
      return {
        success: false,
        message: `Penarikan GAGAL: Saldo siswa tidak mencukupi! Saldo saat ini: Rp. ${saldoSekarang.toLocaleString('id-ID')}, nominal ditarik: Rp. ${nominal.toLocaleString('id-ID')}`
      };
    }

    const newPenarikan: Penarikan = {
      id_penarikan: 'TXW-' + Date.now(),
      tanggal: data.tanggal || new Date().toISOString().split('T')[0],
      id_siswa: data.id_siswa,
      nominal: nominal,
      keterangan: data.keterangan || 'Penarikan Tabungan',
      petugas: data.petugas,
      created_at: new Date().toISOString()
    };

    setStoredData('penarikan', [...penarikan, newPenarikan]);
    addSimulatedLog(data.petugas, `Penarikan dicatat untuk ${student.nama} sebesar Rp. ${nominal.toLocaleString('id-ID')}`);
    return {
      success: true,
      message: 'Penarikan berhasil dicatat',
      data: {
        id_penarikan: newPenarikan.id_penarikan,
        rincian: {
          siswa: student.nama,
          nominal: nominal,
          id_penarikan: newPenarikan.id_penarikan
        }
      }
    };
  },

  // GET DASHBOARD STATS
  async getDashboard(): Promise<{ success: boolean; message: string; data: DashboardStats }> {
    const mode = getApiMode();
    if (mode === 'api') {
      try {
        return await this.reqGet('getDashboard');
      } catch (error: any) {
        throw new Error(error.message);
      }
    }

    // Local Simulation
    const siswa = getStoredData<Siswa>('siswa', defaultSiswa);
    const setoran = getStoredData<Setoran>('setoran', defaultSetoran);
    const penarikan = getStoredData<Penarikan>('penarikan', defaultPenarikan);

    const totalActiveSiswa = siswa.filter(s => s.status_aktif === 'aktif').length;
    const totalSetoranVal = setoran.reduce((acc, curr) => acc + curr.nominal, 0);
    const totalPenarikanVal = penarikan.reduce((acc, curr) => acc + curr.nominal, 0);
    const totalSaldo = totalSetoranVal - totalPenarikanVal;

    const localToday = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();
    const utcToday = new Date().toISOString().split('T')[0];
    
    const normalizeDateStr = (val: any): string => {
      if (!val) return "";
      let str = String(val).trim();
      if (str.includes('T')) {
        str = str.split('T')[0];
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
      }
      const matchDMY = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (matchDMY) {
        const d = matchDMY[1].padStart(2, '0');
        const m = matchDMY[2].padStart(2, '0');
        const y = matchDMY[3];
        return `${y}-${m}-${d}`;
      }
      const matchYMD = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
      if (matchYMD) {
        const y = matchYMD[1];
        const m = matchYMD[2].padStart(2, '0');
        const d = matchYMD[3].padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      try {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      } catch(e) {}
      return str;
    };

    const isToday = (dateVal: string) => {
      const dStr = normalizeDateStr(dateVal);
      return dStr === localToday || dStr === utcToday;
    };

    const todaySetorans = setoran.filter(tx => isToday(tx.tanggal));
    const todayPenarikans = penarikan.filter(tx => isToday(tx.tanggal));

    const totalSetoranToday = todaySetorans.reduce((acc, curr) => acc + curr.nominal, 0);
    const totalPenarikanToday = todayPenarikans.reduce((acc, curr) => acc + curr.nominal, 0);
    const setoranCountToday = todaySetorans.length;
    const penarikanCountToday = todayPenarikans.length;

    // Merge & format newest transactions
    const combined: any[] = [];
    setoran.forEach(s => {
      const stud = siswa.find(x => x.id_siswa === s.id_siswa);
      combined.push({
        id: s.id_setoran,
        tipe: 'setoran',
        siswaNama: stud ? stud.nama : 'Siswa Dihapus',
        kelas: stud ? stud.kelas : '-',
        nominal: s.nominal,
        tanggal: s.tanggal,
        keterangan: s.keterangan
      });
    });

    penarikan.forEach(p => {
      const stud = siswa.find(x => x.id_siswa === p.id_siswa);
      combined.push({
        id: p.id_penarikan,
        tipe: 'penarikan',
        siswaNama: stud ? stud.nama : 'Siswa Dihapus',
        kelas: stud ? stud.kelas : '-',
        nominal: p.nominal,
        tanggal: p.tanggal,
        keterangan: p.keterangan
      });
    });

    combined.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    const transaksiTerbaru = combined.slice(0, 10);

    // Dynamic Monthly Charting data (last 6 months)
    const chartData: any[] = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = months[d.getMonth()] + " " + String(d.getFullYear()).substring(2);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      chartData.push({
        key: yearMonth,
        bulan: label,
        setoran: 0,
        penarikan: 0
      });
    }

    setoran.forEach(tx => {
      if (!tx.tanggal) return;
      // Extract YYYY-MM
      const parts = tx.tanggal.split('-');
      if (parts.length < 2) return;
      const txKey = `${parts[0]}-${parts[1]}`;
      const foundIdx = chartData.findIndex(item => item.key === txKey || item.key === `${parts[0]}-${parseInt(parts[1])}`);
      const foundIdx2 = chartData.find(item => item.key === `${parts[0]}-${String(parseInt(parts[1])).padStart(2, '0')}`);
      
      const item = chartData.find(c => c.key === txKey || c.key.replace('-0','-') === txKey.replace('-0','-'));
      if (item) {
        item.setoran += tx.nominal;
      }
    });

    penarikan.forEach(tx => {
      if (!tx.tanggal) return;
      const parts = tx.tanggal.split('-');
      if (parts.length < 2) return;
      const txKey = `${parts[0]}-${parts[1]}`;
      const item = chartData.find(c => c.key === txKey || c.key.replace('-0','-') === txKey.replace('-0','-'));
      if (item) {
        item.penarikan += tx.nominal;
      }
    });

    return {
      success: true,
      message: 'Berhasil memuat dashboard',
      data: {
        totalSiswa: totalActiveSiswa,
        totalSaldo,
        totalSetoranHariIni: totalSetoranToday,
        totalPenarikanHariIni: totalPenarikanToday,
        setoranCountHariIni: setoranCountToday,
        penarikanCountHariIni: penarikanCountToday,
        transaksiTerbaru,
        chartData
      }
    };
  },

  // GET REPORT INTEGRATED DATA
  async getLaporan(): Promise<{ success: boolean; message: string; data: any }> {
    const mode = getApiMode();
    if (mode === 'api') {
      try {
        return await this.reqGet('getLaporan');
      } catch (error: any) {
        return { success: false, message: error.message, data: null };
      }
    }

    // Local Simulation
    const users = getStoredData<User>('users', defaultUsers);
    const siswa = getStoredData<Siswa>('siswa', defaultSiswa);
    const kelas = getStoredData<Kelas>('kelas', defaultKelas);
    const setoran = getStoredData<Setoran>('setoran', defaultSetoran);
    const penarikan = getStoredData<Penarikan>('penarikan', defaultPenarikan);
    const audit_log = getStoredData<AuditLog>('audit_log', defaultLogs);

    // Enriched siswa list
    const enrichedSiswa = siswa.map(s => {
      const sSetoran = setoran.filter(tx => tx.id_siswa === s.id_siswa).reduce((acc, curr) => acc + curr.nominal, 0);
      const sPenarikan = penarikan.filter(tx => tx.id_siswa === s.id_siswa).reduce((acc, curr) => acc + curr.nominal, 0);
      return {
        ...s,
        total_setoran: sSetoran,
        total_penarikan: sPenarikan,
        saldo: sSetoran - sPenarikan
      };
    });

    // Merge transactions
    const semuaTransaksi: any[] = [];
    setoran.forEach(s => {
      const stud = siswa.find(x => x.id_siswa === s.id_siswa);
      semuaTransaksi.push({
        id_transaksi: s.id_setoran,
        tipe: 'setoran',
        tanggal: s.tanggal,
        id_siswa: s.id_siswa,
        siswa_nama: stud ? stud.nama : 'Siswa Dihapus',
        siswa_nis: stud ? stud.nis : '-',
        siswa_kelas: stud ? stud.kelas : '-',
        nominal: s.nominal,
        keterangan: s.keterangan,
        petugas: s.petugas,
        created_at: s.created_at
      });
    });

    penarikan.forEach(p => {
      const stud = siswa.find(x => x.id_siswa === p.id_siswa);
      semuaTransaksi.push({
        id_transaksi: p.id_penarikan,
        tipe: 'penarikan',
        tanggal: p.tanggal,
        id_siswa: p.id_siswa,
        siswa_nama: stud ? stud.nama : 'Siswa Dihapus',
        siswa_nis: stud ? stud.nis : '-',
        siswa_kelas: stud ? stud.kelas : '-',
        nominal: p.nominal,
        keterangan: p.keterangan,
        petugas: p.petugas,
        created_at: p.created_at
      });
    });

    semuaTransaksi.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    return {
      success: true,
      message: 'Berhasil memuat Laporan Terpadu',
      data: {
        siswa: enrichedSiswa,
        kelas,
        semuaTransaksi,
        auditLog: audit_log.slice(0, 100)
      }
    };
  }
};
