/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  HelpCircle, 
  Moon, 
  Sun, 
  Link2, 
  Database,
  CloudLightning,
  Check,
  Zap,
  BookOpen,
  RefreshCw,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { getApiMode, setApiMode, getGasApiUrl, setGasApiUrl, apiService } from '../services/api';

interface NavbarProps {
  currentTab: string;
  onOpenGASDocs: () => void;
  onRefreshData?: () => void;
}

export default function Navbar({ currentTab, onOpenGASDocs, onRefreshData }: NavbarProps) {
  const [mode, setMode] = useState<'simulasi' | 'api'>(getApiMode());
  const [gasUrl, setGasUrl] = useState<string>(getGasApiUrl());
  const [showConfig, setShowConfig] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleSyncLocalData = async () => {
    if (!gasUrl.trim()) {
      alert("Silakan masukkan dan simpan URL Web App Google Apps Script terlebih dahulu.");
      return;
    }
    const confirmSync = window.confirm(
      "Apakah Anda yakin ingin mengunggah & menyinkronkan seluruh data simulasi lokal saat ini (Siswa, Kelas, Setoran, Penarikan) ke Google Sheets?\n\nSemua relasi ID siswa dan transaksi akan dipindah secara utuh ke Spreadsheet Anda."
    );
    if (!confirmSync) return;

    try {
      setIsSyncing(true);
      setSyncStatus("Menghubungkan...");
      const res = await apiService.syncLocalDataToSheets((progress) => {
        setSyncStatus(progress);
      });
      if (res.success) {
        alert(
          `Sukses menyinkronkan data ke Sheets!\n- Kelas berhasil: ${res.data.kelas}\n- Siswa berhasil: ${res.data.siswa}\n- Setoran berhasil: ${res.data.setoran}\n- Penarikan berhasil: ${res.data.penarikan}\n\nSeluruh data sekarang sudah terhubung realtime di file Excel/Google Sheets Anda!`
        );
        if (onRefreshData) onRefreshData();
      }
    } catch (error: any) {
      alert("Gagal melakukan penyelarasan data: " + (error.message || "Pastikan URL Apps Script yang Anda paste benar & sudah di-deploy dengan opsi akses 'Anyone'."));
    } finally {
      setIsSyncing(false);
      setSyncStatus('');
    }
  };

  // Sync state with HTML dark class
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('tabungan_dark_mode') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tabungan_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tabungan_dark_mode', 'false');
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setGasApiUrl(gasUrl.trim());
    if (gasUrl.trim()) {
      setApiMode('api');
      setMode('api');
    } else {
      setApiMode('simulasi');
      setMode('simulasi');
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowConfig(false);
    }, 1500);

    // Refresh context if requested
    if (onRefreshData) onRefreshData();
  };

  const handleModeChange = (targetMode: 'simulasi' | 'api') => {
    if (targetMode === 'api' && !gasUrl.trim()) {
      setShowConfig(true);
      return;
    }
    setApiMode(targetMode);
    setMode(targetMode);
    if (onRefreshData) onRefreshData();
  };

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Beranda & Ringkasan Keuangan';
      case 'siswa': return 'Pendaftaran & Master Siswa';
      case 'kelas': return 'Manajemen Kelas & Wali Kelas';
      case 'setoran': return 'Setoran Kas Tabungan Siswa';
      case 'penarikan': return 'Penarikan Kas Tabungan Siswa';
      case 'laporan': return 'Laporan Bulanan & Catatan Audit';
      case 'users': return 'Pengaturan Hak Akses Sesi';
      default: return 'Tabungan Siswa';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-between">
        
        {/* Tab Context Page Header */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-300 dark:text-zinc-700 text-lg font-light font-mono">/</span>
          <h2 className="font-semibold text-zinc-900 dark:text-white tracking-tight">{getPageTitle(currentTab)}</h2>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3">
          
          {/* Quick Database Toggle Switch */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-850">
            <button
              onClick={() => handleModeChange('simulasi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                mode === 'simulasi'
                  ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-850 dark:hover:text-zinc-300'
              }`}
            >
              <CloudLightning className="w-3.5 h-3.5 text-slate-400" />
              <span>Simulasi (Lokal)</span>
            </button>
            <button
              onClick={() => handleModeChange('api')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                mode === 'api'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-850 dark:hover:text-zinc-300'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Google Sheets API</span>
            </button>
          </div>

          <span className="w-px h-6 bg-slate-200 dark:bg-zinc-805 hidden sm:block"></span>

          {/* Apps Script Guide */}
          <button
            onClick={onOpenGASDocs}
            className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-55 dark:hover:bg-zinc-800 text-slate-550 dark:text-zinc-400 hover:text-blue-650 dark:hover:text-blue-400 transition-colors cursor-pointer"
            title="Panduan Google Sheets"
          >
            <BookOpen className="w-4.5 h-4.5" />
          </button>

          {/* API Config Panel Trigger */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-55 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
              showConfig ? 'bg-slate-100 dark:bg-zinc-800 text-blue-650' : 'text-slate-550 dark:text-zinc-300'
            }`}
            title="Konfigurasi Endpoint API"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-55 dark:hover:bg-zinc-800 text-slate-550 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Ganti Tema"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {/* Floating Endpoint Configuration Drawer */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowConfig(false)}></div>
          <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl p-6 border-l border-zinc-200 dark:border-zinc-800 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Konfigurasi database</h3>
                  <p className="text-xs text-zinc-500 mt-1">Ganti target penyimpanan antara browser lokal dan Sheets API.</p>
                </div>
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Batal
                </button>
              </div>

              {/* Mode Description Banner */}
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-850 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40 text-xs leading-relaxed space-y-1">
                <span className="font-semibold block">⚠️ Informasi API Google Sheets:</span>
                <p>Google Apps Script memerlukan URL Web App yang telah dideploy agar transaksi dapat terekam langsung di file Excel Google Drive Anda.</p>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block uppercase">Mode Aktif</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('simulasi');
                      }}
                      className={`px-3 py-2.5 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                        mode === 'simulasi'
                          ? 'bg-slate-100 text-slate-800 border-slate-300 font-bold'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <CloudLightning className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                      Mode Simulasi (Lokal)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('api');
                      }}
                      className={`px-3 py-2.5 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                        mode === 'api'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Database className="w-4 h-4 mx-auto mb-1 text-blue-505" />
                      Google Sheets API
                    </button>
                  </div>
                </div>

                {mode === 'api' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block uppercase">URL Web App Google Apps Script</label>
                      <div className="flex gap-1 bg-slate-50 dark:bg-zinc-950 p-2 rounded-lg border border-slate-200 dark:border-zinc-850 items-center">
                        <Link2 className="text-slate-400 w-4 h-4 shrink-0 mx-1" />
                        <input
                          type="url"
                          required
                          value={gasUrl}
                          onChange={(e) => setGasUrl(e.target.value)}
                          placeholder="https://script.google.com/macros/s/.../exec"
                          className="bg-transparent text-xs text-slate-800 dark:text-white outline-hidden w-full placeholder-slate-400 font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 leading-normal block">
                        Dapatkan URL ini dengan mendeploy kode dari tombol <b>Buku Panduan</b> di Apps Script Anda.
                      </span>
                    </div>

                    {/* Sync local simulation data section */}
                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-zinc-350 uppercase">
                        <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>Koneksikan Data Lokal</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Sudah menginput banyak data simulasi sebelumnya? Klik tombol di bawah untuk mentransfer dan menyinkronkan seluruh data luring browser Anda langsung ke file Spreadsheet Google Anda sekarang.
                      </p>
                      <button
                        type="button"
                        disabled={isSyncing || !gasUrl}
                        onClick={handleSyncLocalData}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-blue-200 dark:border-zinc-800 bg-blue-50/50 hover:bg-blue-55 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-blue-700 dark:text-blue-400 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                            <span className="font-mono text-[10px] text-blue-700 dark:text-blue-400">{syncStatus}</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                            <span>Unggah/Sinkronisasi Data Simulasi</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex justify-center items-center gap-2 cursor-pointer shadow-md transition-all mt-4"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Berhasil Tersimpan!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Terapkan Perubahan</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick tips */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-500 space-y-1">
              <span className="font-semibold block text-zinc-700 dark:text-zinc-300">💡 Tips Simulasi:</span>
              <p>Hanya dengan Mode Simulasi, aplikasi Anda siap dijalankan offline 100% dan instan di preview. Anda bebas bereksperimen sebelum setup koneksi database Sheets.</p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
