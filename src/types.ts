/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'bendahara' | 'wali_kelas' | 'siswa';

export interface User {
  id_user: string;
  username: string;
  password_hash: string;
  role: UserRole;
  status: 'aktif' | 'nonaktif';
  created_at: string;
}

export interface Siswa {
  id_siswa: string;
  nis: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  kelas: string; // nama_kelas
  alamat: string;
  nama_orang_tua: string;
  no_hp: string;
  status_aktif: 'aktif' | 'nonaktif';
  created_at: string;
}

export interface Kelas {
  id_kelas: string;
  nama_kelas: string;
  wali_kelas: string;
}

export interface Setoran {
  id_setoran: string;
  tanggal: string; // yyyy-mm-dd
  id_siswa: string;
  nominal: number;
  keterangan: string;
  petugas: string;
  created_at: string;
}

export interface Penarikan {
  id_penarikan: string;
  tanggal: string; // yyyy-mm-dd
  id_siswa: string;
  nominal: number;
  keterangan: string;
  petugas: string;
  created_at: string;
}

export interface AuditLog {
  id_log: string;
  tanggal: string;
  user: string;
  aktivitas: string;
}

export interface DashboardStats {
  totalSiswa: number;
  totalSaldo: number;
  totalSetoranHariIni: number;
  totalPenarikanHariIni: number;
  setoranCountHariIni?: number;
  penarikanCountHariIni?: number;
  transaksiTerbaru: Array<{
    id: string;
    tipe: 'setoran' | 'penarikan';
    siswaNama: string;
    kelas: string;
    nominal: number;
    tanggal: string;
    keterangan: string;
  }>;
  chartData: Array<{
    bulan: string;
    setoran: number;
    penarikan: number;
  }>;
}
