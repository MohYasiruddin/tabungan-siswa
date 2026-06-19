/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  School, 
  AlertCircle, 
  ArrowRight,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  Database
} from 'lucide-react';
import { apiService, getApiMode, setApiMode } from '../services/api';

interface LoginProps {
  onLogin: (username: string, password_plain: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

export default function LoginPage({ onLogin, loading }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentMode, setCurrentMode] = useState<'simulasi' | 'api'>(getApiMode());

  // Helper shortcut box for evaluation
  const [showDemoDrawer, setShowDemoDrawer] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  const handleResetUsers = async () => {
    if (window.confirm('Apakah Anda yakin ingin mereset ulang database akun pengguna simulator ke setelan bawaan?')) {
      setResetting(true);
      setErrorMsg('');
      setResetSuccess('');
      try {
        const res = await apiService.resetUsersToDefault();
        if (res.success) {
          setResetSuccess('Akun berhasil direset ke bawaan!');
          setUsername('admin');
          setPassword('admin');
          setTimeout(() => {
            setResetSuccess('');
          }, 3500);
        } else {
          setErrorMsg(res.message);
        }
      } catch (e: any) {
        setErrorMsg('Gagal mereset: ' + e.message);
      } finally {
        setResetting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Harap masukkan username dan kata sandi!');
      return;
    }

    setSubmitting(true);
    const result = await onLogin(username.toLowerCase().trim(), password);
    setSubmitting(false);

    if (!result.success) {
      if (currentMode === 'api') {
        setErrorMsg(result.message || 'Kredensial login salah, periksa kembali! Hubungi pihak sekolah jika akun wali belum dibuat di Google Sheets.');
      } else {
        setErrorMsg(result.message || 'Kredensial login salah, periksa kembali!');
      }
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    // If we are in Google Sheets (API) mode, use the actual production password hashes (admin123 instead of admin)
    let actualPass = pass;
    if (getApiMode() === 'api') {
      if (user === 'admin') actualPass = 'admin123';
      if (user === 'bendahara') actualPass = 'bendahara123';
      if (user === 'wali_7a') actualPass = 'wali123';
    }
    setPassword(actualPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
      
      {/* Brand logo card header */}
      <div className="w-full max-w-sm text-center mb-4 space-y-2.5">
        <div className="w-14 h-14 bg-blue-600 hover:scale-105 transition-transform text-white rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
          <School className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">SDIT AL-FUNGSI</h2>
          <p className="text-xs text-slate-500 font-medium">Sistem Informasi Manajemen Tabungan Siswa</p>
        </div>
      </div>

      {/* Mode Status Indicator & Switcher bar */}
      <div className="w-full max-w-sm mb-3">
        {currentMode === 'api' ? (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-center flex flex-col items-center justify-center gap-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-550 animate-pulse"></span>
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span>Koneksi Aktif: Google Sheets API</span>
            </div>
            <p className="text-[9px] text-slate-500 dark:text-zinc-400 leading-tight">
              Aplikasi saat ini terhubung online dengan Google Spreadsheet.
            </p>
            <button
              type="button"
              onClick={() => {
                setApiMode('simulasi');
                setCurrentMode('simulasi');
                setErrorMsg('');
                window.location.reload();
              }}
              className="mt-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-[9px] rounded-md cursor-pointer transition-all uppercase tracking-wider"
              title="Gunakan database simulator jika spreadsheet belum dikonfigurasi"
            >
              Kembali ke Mode Simulasi Offline (Aman)
            </button>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-150 dark:border-emerald-900/30 rounded-xl text-center flex items-center justify-center gap-2 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">
              Database Simulasi Lokal Terpakai (Offline)
            </span>
          </div>
        )}
      </div>

      {/* Main login card container */}
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 rounded-xl shadow-sm p-6 space-y-5">
        <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-zinc-850">
          <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-150 uppercase tracking-wide">Otoritas Akses Pegawai</h3>
          <p className="text-[11px] text-slate-400">Silakan masukkan username dan password tabungan Anda</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 dark:bg-red-955/20 border border-red-100 dark:border-red-900/40 rounded-lg text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {resetSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 rounded-lg text-xs flex items-center gap-2">
            <UserCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{resetSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username block */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">Username</label>
            <div className="flex bg-slate-50 dark:bg-zinc-950 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 items-center">
              <User className="text-slate-400 w-4.5 h-4.5 shrink-0 mr-2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="rekening"
                className="bg-transparent text-xs text-slate-800 dark:text-white font-mono outline-hidden w-full placeholder-slate-400"
              />
            </div>
          </div>

          {/* Password block */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">Kata Sandi</label>
            <div className="flex bg-slate-50 dark:bg-zinc-950 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 items-center">
              <Lock className="text-slate-400 w-4.5 h-4.5 shrink-0 mr-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="bg-transparent text-xs outline-hidden w-full text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || submitting}
            className="w-full mt-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all cursor-pointer flex justify-center items-center gap-2 shadow-md shadow-blue-500/10 disabled:opacity-40"
          >
            {loading || submitting ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <>
                <span>Masuk Aplikasi</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Demo fast logs launcher box */}
        {showDemoDrawer && (
          <div className="pt-4 border-t border-dashed border-slate-150 dark:border-zinc-850 space-y-2.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4" />
                DEMO AKSES CEPAT
              </span>
              <button 
                onClick={() => setShowDemoDrawer(false)}
                className="text-slate-400 hover:text-red-500 hover:underline"
              >
                Tutup
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'admin')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 dark:bg-zinc-950 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-lg text-left text-slate-600 dark:text-zinc-300 font-mono flex items-center justify-between cursor-pointer"
                title="Login sebagai Administrator Utama"
              >
                <span>admin</span>
                <b className="text-[9px] text-blue-600 dark:text-blue-400">PW: admin</b>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('bendahara', 'bendahara')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 dark:bg-zinc-950 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-lg text-left text-slate-600 dark:text-zinc-300 font-mono flex items-center justify-between cursor-pointer"
                title="Login sebagai Bendahara"
              >
                <span>bendahara</span>
                <b className="text-[9px] text-blue-605 dark:text-blue-400">PW: bendahara</b>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('wali_7a', 'wali123')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 dark:bg-zinc-950 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-lg text-left text-slate-600 dark:text-zinc-300 font-mono flex items-center justify-between cursor-pointer grid-cols-1 span-2"
                title="Login sebagai Wali Kelas"
              >
                <span>wali_7a</span>
                <b className="text-[9px] text-amber-600 dark:text-amber-400">PW: wali123</b>
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleResetUsers}
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-150 dark:border-red-900/30 rounded-lg text-center font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50 text-[10px]"
                title="Atur ulang semua data dan password pengguna ke setelan default"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                <span>Reset Akun</span>
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="text-center mt-6 text-[10px] text-zinc-450 leading-relaxed max-w-xs font-mono">
        <p>Copyright © SDIT AL-FUNGSI. All Rights Reserved.</p>
        <p className="font-semibold text-zinc-500 mt-1">Status Enkripsi: SHA-256 Sesi Valid JWT</p>
      </div>

    </div>
  );
}
