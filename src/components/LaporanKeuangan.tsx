/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  Users, 
  GraduationCap, 
  ShieldAlert, 
  Clock,
  TrendingUp,
  TrendingDown,
  Database,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  BookOpen
} from 'lucide-react';
import { Siswa, Kelas, AuditLog } from '../types';

interface LaporanProps {
  siswaList: (Siswa & { total_setoran: number; total_penarikan: number; saldo: number })[];
  kelasList: Kelas[];
  semuaTransaksi: any[];
  auditLog: AuditLog[];
  loading: boolean;
  onRefresh: () => void;
  userRole: string;
}

type LaporanTab = 'siswa' | 'kelas' | 'mutasi' | 'audit';

export default function LaporanKeuangan({ 
  siswaList, 
  kelasList, 
  semuaTransaksi, 
  auditLog, 
  loading,
  onRefresh,
  userRole
}: LaporanProps) {

  const [activeTab, setActiveTab] = useState<LaporanTab>('siswa');
  
  // Filtering & Query states
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const rupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 1. DATA FILTERS EXPORTS
  const getFilteredSiswa = () => {
    return siswaList.filter(s => {
      const sNama = s.nama ? String(s.nama).toLowerCase() : '';
      const sNis = s.nis ? String(s.nis) : '';
      const q = searchQuery.toLowerCase();
      const matchesKelas = filterKelas === 'Semua' || s.kelas === filterKelas;
      const matchesSearch = sNama.includes(q) || sNis.includes(searchQuery);
      return matchesKelas && matchesSearch;
    });
  };

  const getFilteredMutasi = () => {
    return semuaTransaksi.filter(t => {
      const sNama = t.siswa_nama ? String(t.siswa_nama).toLowerCase() : '';
      const sNis = t.siswa_nis ? String(t.siswa_nis) : '';
      const q = searchQuery.toLowerCase();
      const matchesDate = !filterDate || t.tanggal === filterDate;
      const matchesSearch = sNama.includes(q) || sNis.includes(searchQuery);
      return matchesDate && matchesSearch;
    });
  };

  // 2. CSV EXCEL COMPATIBLE DOWNLOAD GENERATOR
  const exportToExcel = (type: LaporanTab) => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `Laporan_Tabungan_${type}_${new Date().toISOString().split('T')[0]}`;

    if (type === 'siswa') {
      headers = ['ID Siswa', 'NIS', 'Nama Siswa', 'Kelas', 'Jenis Kelamin', 'Alamat', 'Nama Orang Tua', 'No HP', 'Total Setoran', 'Total Penarikan', 'Saldo Akhir'];
      rows = getFilteredSiswa().map(s => [
        s.id_siswa, s.nis, s.nama, s.kelas, s.jenis_kelamin, s.alamat, s.nama_orang_tua, s.no_hp, s.total_setoran, s.total_penarikan, s.saldo
      ]);
    } else if (type === 'kelas') {
      headers = ['ID Kelas', 'Nama Kelas', 'Wali Kelas', 'Jumlah Siswa Kelas', 'Total Setoran Kelas', 'Total Penarikan Kelas', 'Saldo Kas Kelas'];
      rows = kelasList.map(k => {
        const listSiswaKelas = siswaList.filter(s => s.kelas === k.nama_kelas);
        const totalS = listSiswaKelas.reduce((acc, curr) => acc + curr.total_setoran, 0);
        const totalP = listSiswaKelas.reduce((acc, curr) => acc + curr.total_penarikan, 0);
        return [
          k.id_kelas, k.nama_kelas, k.wali_kelas, listSiswaKelas.length, totalS, totalP, totalS - totalP
        ];
      });
    } else if (type === 'mutasi') {
      headers = ['ID Transaksi', 'Tipe Mutasi', 'Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Nominal Transaksi', 'Keterangan', 'Petugas Pencatat'];
      rows = getFilteredMutasi().map(t => [
        t.id_transaksi, t.tipe === 'setoran' ? 'SETORAN' : 'PENARIKAN', t.tanggal, t.siswa_nis, t.siswa_nama, t.siswa_kelas, t.nominal, t.keterangan || '-', t.petugas
      ]);
    } else if (type === 'audit') {
      headers = ['ID Log', 'Tanggal Jam', 'Akun Pengguna', 'Aktivitas Event'];
      rows = auditLog.map(l => [
        l.id_log, l.tanggal, l.user, l.aktivitas
      ]);
    }

    // CSV UTF-8 string building with Byte Order Mark (BOM) to support direct Excel open without column splitting issues
    const csvRows = [];
    csvRows.push(headers.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    rows.forEach(row => {
      csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    });

    const csvString = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. PHYSICAL PDF PRINT ENGINE VIA BROWSER
  const handlePrintReport = (elementId: string) => {
    const printArea = document.getElementById(elementId);
    if (!printArea) return;

    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printArea.innerHTML;
    window.print();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Laporan & Pengarsipan</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Cetak pertanggungjawaban tabungan, filter mutasi, dan lacak catatan audit keamanan petugas.</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 dark:text-zinc-200 transition-colors cursor-pointer"
        >
          Muat Ulang Laporan
        </button>
      </div>

      {loading && (
        <div className="p-4 bg-blue-50/60 dark:bg-zinc-950 text-blue-800 dark:text-blue-400 rounded-lg border border-blue-105 text-xs font-semibold animate-pulse">
          Sedang menyiapkan rekap laporan keuangan...
        </div>
      )}

      {/* Primary Report Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-950 rounded-2xl border border-zinc-250 dark:border-zinc-850">
        <button
          onClick={() => { setActiveTab('siswa'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'siswa' 
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-extrabold shadow-xs' 
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350'
          }`}
        >
          <Users className="w-4 h-4 text-zinc-400" />
          <span>Rekap Tabungan Siswa</span>
        </button>
        <button
          onClick={() => { setActiveTab('kelas'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'kelas' 
              ? 'bg-white dark:bg-zinc-900 text-blue-605 dark:text-blue-400 font-extrabold shadow-xs' 
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-zinc-400" />
          <span>Analisis Saldo Kelas</span>
        </button>
        <button
          onClick={() => { setActiveTab('mutasi'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'mutasi' 
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-extrabold shadow-xs' 
              : 'text-zinc-500 hover:text-zinc-805 dark:hover:text-zinc-350'
          }`}
        >
          <FileText className="w-4 h-4 text-zinc-400" />
          <span>Buku Jurnal Mutasi</span>
        </button>
        {userRole === 'admin' && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'audit' 
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-extrabold shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350'
            }`}
          >
            <Clock className="w-4 h-4 text-zinc-400" />
            <span>Sinyal Audit Log Keamanan</span>
          </button>
        )}
      </div>

      {/* Sub Filter Toolbars depending on Active Tab */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-805 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center bg-transparent">
        
        {/* Dynamic Left Input */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {activeTab === 'siswa' && (
            <>
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-500 font-medium">Filter Kelas:</span>
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-white cursor-pointer outline-hidden"
                >
                  <option value="Semua">Semua Kelas</option>
                  {kelasList.map(k => (
                    <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850">
                <Search className="w-4 h-4 text-zinc-400 mr-1.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari nama / NIS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-zinc-800 dark:text-zinc-200 outline-hidden w-28 placeholder-zinc-500"
                />
              </div>
            </>
          )}

          {activeTab === 'mutasi' && (
            <>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-500 font-medium">Filter Tanggal:</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-white outline-hidden cursor-pointer"
                />
                {filterDate && (
                  <button 
                    onClick={() => setFilterDate('')}
                    className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850">
                <Search className="w-4 h-4 text-zinc-400 mr-1.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari nama / NIS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-zinc-800 dark:text-zinc-200 outline-hidden w-28 placeholder-zinc-500"
                />
              </div>
            </>
          )}

          {activeTab === 'kelas' && (
            <span className="text-xs text-zinc-500">Membaca rangkuman likuiditas keuangan tiap kelas akademik</span>
          )}

          {activeTab === 'audit' && (
            <span className="text-xs text-red-500 flex items-center gap-1.5 font-semibold">
              <ShieldAlert className="w-4 h-4" />
              Catatan sistem penelusuran aktivitas operator sekolah (Audit Logs)
            </span>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => exportToExcel(activeTab)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Unduh Excel</span>
          </button>
          
          <button
            onClick={() => handlePrintReport(`print-area-${activeTab}`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Main content viewport layout */}
      {!loading && (
        <div className="space-y-6">
          
          {/* TAB 1: REKAP TABUNGAN SISWA */}
          {activeTab === 'siswa' && (
            <div id="print-area-siswa" className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
              <div className="pb-4 mb-6 border-b border-dashed border-zinc-200 dark:border-zinc-800 text-center sm:text-left space-y-1">
                <span className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-tight block">KOP PEMBUKUAN TABUNGAN REKAPITULASI SISWA</span>
                <p className="text-xs text-zinc-500">Daftar neraca saldo seluruh siswa terdaftar aktif</p>
                <p className="text-[10px] text-zinc-400 font-mono">Filter Kelas: {filterKelas} | Dicetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-805 text-left text-xs font-medium">
                <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 font-mono text-[10px] font-bold uppercase">
                  <tr>
                    <th className="px-6 py-3.5">NIS</th>
                    <th className="px-6 py-3.5">Nama Siswa</th>
                    <th className="px-6 py-3.5">Kelas</th>
                    <th className="px-6 py-3.5 text-blue-600">Setoran Kas (+)</th>
                    <th className="px-6 py-3.5 text-red-500">Penarikan Kas (-)</th>
                    <th className="px-6 py-3.5 text-zinc-900 dark:text-white font-bold">Saldo Akhir</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-805 text-zinc-700 dark:text-zinc-300">
                  {getFilteredSiswa().length > 0 ? (
                    getFilteredSiswa().map(s => (
                       <tr key={s.id_siswa} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                        <td className="px-6 py-3 font-mono font-medium">{s.nis}</td>
                        <td className="px-6 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{s.nama}</td>
                        <td className="px-6 py-3 font-mono">Class {s.kelas}</td>
                        <td className="px-6 py-3 font-mono text-blue-600 font-semibold">{rupiah(s.total_setoran)}</td>
                        <td className="px-6 py-3 font-mono text-red-500 font-semibold">{rupiah(s.total_penarikan)}</td>
                        <td className="px-6 py-3 font-mono font-bold text-zinc-900 dark:text-white bg-zinc-50/40 dark:bg-zinc-955/20 pr-4">{rupiah(s.saldo)}</td>
                        <td className="px-6 py-3 text-[10px] uppercase font-bold text-zinc-500">{s.status_aktif}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">Nihil / tidak ada siswa di rombel ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total Summary Footer bar inside report */}
              <div className="pt-6 mt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold font-mono">TOTAL SETORAN KAS</span>
                  <span className="text-sm font-extrabold text-blue-600 block mt-1 font-mono">{rupiah(getFilteredSiswa().reduce((acc, curr) => acc + curr.total_setoran, 0))}</span>
                </div>
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                  <span className="text-[10px] text-zinc-404 block uppercase font-bold font-mono">TOTAL PENARIKAN KAS</span>
                  <span className="text-sm font-extrabold text-red-500 block mt-1 font-mono">{rupiah(getFilteredSiswa().reduce((acc, curr) => acc + curr.total_penarikan, 0))}</span>
                </div>
                <div className="col-span-2 md:col-span-1 p-3.5 bg-blue-50/60 dark:bg-zinc-950 rounded-lg border border-dashed border-blue-150 dark:border-zinc-800">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 block uppercase font-bold font-mono">TOTAL SALDO AKTIF</span>
                  <span className="text-sm font-extrabold text-blue-700 dark:text-blue-300 block mt-1 font-mono">{rupiah(getFilteredSiswa().reduce((acc, curr) => acc + curr.saldo, 0))}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANALISIS SALDO KELAS */}
          {activeTab === 'kelas' && (
            <div id="print-area-kelas" className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs animate-fade-in">
              <div className="pb-4 mb-6 border-b border-dashed border-zinc-200 dark:border-zinc-800 text-center sm:text-left space-y-1">
                <span className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-tight block">KOP LAPORAN GRAFIS REKAPITULASI KASTA KELAS</span>
                <p className="text-xs text-zinc-500">Summary akumulasi tabungan diklasifikasikan per rombel belajar siswa</p>
                <p className="text-[10px] text-zinc-400 font-mono">Dicetak: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-805 text-left text-xs font-medium">
                <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 font-mono text-[10px] font-bold uppercase">
                  <tr>
                    <th className="px-6 py-4">Nama Rombel / Kelas</th>
                    <th className="px-6 py-4">Wali Kelas Pengampu</th>
                    <th className="px-6 py-4">Jumlah Siswa</th>
                    <th className="px-6 py-4 text-emerald-600">Akumulasi Setoran</th>
                    <th className="px-6 py-4 text-red-500">Akumulasi Penarikan</th>
                    <th className="px-6 py-4 font-bold text-zinc-900 dark:text-white">Saldo Komulatif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-805 text-zinc-700 dark:text-zinc-300">
                  {kelasList.map(k => {
                    const listSiswaKelas = siswaList.filter(s => s.kelas === k.nama_kelas);
                    const totalS = listSiswaKelas.reduce((acc, curr) => acc + curr.total_setoran, 0);
                    const totalP = listSiswaKelas.reduce((acc, curr) => acc + curr.total_penarikan, 0);
                    const totalSaldo = totalS - totalP;
                    return (
                      <tr key={k.id_kelas} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                        <td className="px-6 py-3.5 font-bold text-zinc-900 dark:text-white font-mono">Class {k.nama_kelas}</td>
                        <td className="px-6 py-3.5">{k.wali_kelas}</td>
                        <td className="px-6 py-3.5 font-mono">{listSiswaKelas.length} anak</td>
                        <td className="px-6 py-3.5 font-mono text-emerald-600 font-semibold">{rupiah(totalS)}</td>
                        <td className="px-6 py-3.5 font-mono text-red-500 font-semibold">{rupiah(totalP)}</td>
                        <td className="px-6 py-3.5 font-mono font-bold text-zinc-900 dark:text-white bg-zinc-50/40 dark:bg-zinc-955/20 pr-4">{rupiah(totalSaldo)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="pt-6 mt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex justify-between items-center px-4">
                <span className="text-xs text-zinc-400">Total Akumulasi Pembukuan Kelas:</span>
                <span className="text-base font-extrabold text-blue-600 font-mono bg-blue-50 dark:bg-zinc-950 px-3 py-1 rounded-lg border border-blue-100">
                  {rupiah(siswaList.reduce((acc, curr) => acc + curr.saldo, 0))}
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: BUKU JURNAL MUTASI */}
          {activeTab === 'mutasi' && (
            <div id="print-area-mutasi" className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs animate-fade-in">
              <div className="pb-4 mb-6 border-b border-dashed border-zinc-200 dark:border-zinc-800 text-center sm:text-left space-y-1">
                <span className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-tight block">KOP JURNAL UMUM MUTASI TABUNGAN HARIAN</span>
                <p className="text-xs text-zinc-500">Log lengkap buku rekening masuk & keluar kas tabungan terverifikasi</p>
                <p className="text-[10px] text-zinc-400 font-mono">Saringan Tanggal: {filterDate || 'Semua Tanggal'} | Dicetak: {new Date().toLocaleDateString('id-ID')}</p>
              </div>

              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-805 text-left text-xs font-medium">
                <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-550 dark:text-zinc-400 font-mono text-[10px] font-bold uppercase">
                  <tr>
                    <th className="px-6 py-3.5 col-span-1">ID Transaksi</th>
                    <th className="px-6 py-3.5">Tanggal</th>
                    <th className="px-6 py-3.5">Nama & NIS</th>
                    <th className="px-6 py-3.5">Jenis Aliran</th>
                    <th className="px-6 py-3.5">Nominal Mutasi</th>
                    <th className="px-6 py-3.5">Keterangan</th>
                    <th className="px-6 py-3.5">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-805 text-zinc-700 dark:text-zinc-300">
                  {getFilteredMutasi().length > 0 ? (
                    getFilteredMutasi().map(m => (
                      <tr key={m.id_transaksi} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                        <td className="px-6 py-3 font-mono text-[11px] text-zinc-550">{m.id_transaksi || '-' }</td>
                        <td className="px-6 py-3 font-mono text-[11px]">{m.tanggal}</td>
                        <td className="px-6 py-3">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">{m.siswa_nama}</span>
                          <span className="text-[9px] text-zinc-400 block font-mono">NIS: {m.siswa_nis} • Class {m.siswa_kelas}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            m.tipe === 'setoran' 
                              ? 'bg-blue-50/70 dark:bg-zinc-800 text-blue-700 dark:text-blue-400' 
                              : 'bg-red-50/70 dark:bg-red-950/30 text-red-500'
                          }`}>
                            {m.tipe === 'setoran' ? (
                              <>
                                <ArrowUpRight className="w-3 h-3 text-blue-500" />
                                <span>Setoran</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownLeft className="w-3 h-3 text-red-500" />
                                <span>Penarikan</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className={`px-6 py-3 font-mono font-bold ${m.tipe === 'setoran' ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                          {m.tipe === 'setoran' ? '+' : '-'} {rupiah(m.nominal)}
                        </td>
                        <td className="px-6 py-3 italic text-zinc-500 text-[11px] truncate max-w-[130px]" title={m.keterangan}>{m.keterangan || '-'}</td>
                        <td className="px-6 py-3 font-mono text-[10px] uppercase font-semibold text-zinc-500">{m.petugas}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">Tidak ada riwayat pembukuan kas pada filter terpilih.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS SECURITY (ONLY ADMIN ACCESSIBLE) */}
          {activeTab === 'audit' && userRole === 'admin' && (
            <div id="print-area-audit" className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs animate-fade-in font-mono text-xs">
              <div className="pb-4 mb-4 border-b border-dashed border-zinc-200 dark:border-zinc-800 text-center sm:text-left space-y-1">
                <span className="font-extrabold text-sm text-zinc-904 dark:text-white uppercase tracking-tight block">KOP REKAPITULASI AUDIT LOG AKTIVITAS PETUGAS</span>
                <p className="text-[10px] text-zinc-400">Arsip pencatatan aktivitas login dan update data yang dilakukan fungsionaris</p>
                <p className="text-[9px] text-zinc-500">Tingkat Keamanan: ENCRYPTED • Dicetak: {new Date().toISOString()}</p>
              </div>

              <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                {auditLog.length > 0 ? (
                  auditLog.map(log => (
                    <div key={log.id_log} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl flex items-start gap-4 justify-between text-[11px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-sm font-bold text-[9px] font-mono tracking-tight text-zinc-650 dark:text-zinc-400 uppercase">
                            User: {log.user}
                          </span>
                          <span className="text-zinc-350 text-[10px] font-mono">({log.id_log})</span>
                        </div>
                        <p className="text-zinc-800 dark:text-zinc-300 font-medium">{log.aktivitas}</p>
                      </div>
                      <span className="text-[10px] text-zinc-455 font-mono text-right shrink-0">{log.tanggal}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-zinc-400 flex flex-col justify-center items-center gap-1.5">
                    <Database className="w-6 h-6 animate-pulse" />
                    <span>Belum ada mutasi log terdaftar di sistem.</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
