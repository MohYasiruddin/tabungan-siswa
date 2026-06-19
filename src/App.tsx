/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, 
  X, 
  Database, 
  CloudLightning,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Terminal,
  DatabaseZap
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import SiswaManagement from './components/SiswaManagement';
import KelasManagement from './components/KelasManagement';
import UserManagement from './components/UserManagement';
import TransaksiSetoran from './components/TransaksiSetoran';
import TransaksiPenarikan from './components/TransaksiPenarikan';
import LaporanKeuangan from './components/LaporanKeuangan';
import LoginPage from './components/LoginPage';
import GASCodeModal from './components/GASCodeModal';

import { apiService, getApiMode, getGasApiUrl } from './services/api';
import { User, Siswa, Kelas, AuditLog, DashboardStats } from './types';

export default function App() {
  
  // --- SESSION STATE ---
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('tabungan_logged_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- COMPONENT VIEW NAVIGATION ---
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showGASModal, setShowGASModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- DATABASE & DATA STATES ---
  const [usersList, setUsersList] = useState<User[]>([]);
  const [siswaList, setSiswaList] = useState<(Siswa & { total_setoran: number; total_penarikan: number; saldo: number })[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [setoranList, setSetoranList] = useState<any[]>([]);
  const [penarikanList, setPenarikanList] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // --- LOADING STATES ---
  const [dataLoading, setDataLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- SHOW DANGER TOAST Helper ---
  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // --- LOGIN SESSION HANDLER ---
  const handleLogin = async (usr: string, pass: string) => {
    setDataLoading(true);
    try {
      const resp = await apiService.login(usr, pass);
      if (resp.success && resp.data) {
        localStorage.setItem('tabungan_logged_user', JSON.stringify(resp.data));
        setCurrentUser(resp.data);
        triggerToast(`Sesi Berhasil! Selamat datang ${resp.data.username}.`, 'success');
        return { success: true, message: resp.message };
      }
      return { success: false, message: resp.message };
    } catch (e: any) {
      return { success: false, message: e.message };
    } finally {
      setDataLoading(false);
    }
  };

  // --- LOGOUT SESSION HANDLER ---
  const handleLogout = () => {
    localStorage.removeItem('tabungan_logged_user');
    setCurrentUser(null);
    setCurrentTab('dashboard');
    triggerToast('Anda telah keluar dari aplikasi tabungan.', 'success');
  };

  // --- REFRESH / DATA FETCH SYNC ---
  const loadApplicationData = useCallback(async () => {
    if (!currentUser) return;
    setDataLoading(true);

    try {
      // 1. Load Dashboard
      const dashboardResp = await apiService.getDashboard();
      if (dashboardResp.success) {
        setDashboardStats(dashboardResp.data);
      }

      // 2. Load Core listings & calculations
      const siswaResp = await apiService.getSiswa();
      if (siswaResp.success) {
        setSiswaList(siswaResp.data);
      }

      const kelasResp = await apiService.getKelas();
      if (kelasResp.success) {
        setKelasList(kelasResp.data);
      }

      // 3. Load reports summary
      const reportsResp = await apiService.getLaporan();
      if (reportsResp.success && reportsResp.data) {
        const transaksiList = reportsResp.data.semuaTransaksi || [];
        setSetoranList(transaksiList.filter((t: any) => t.tipe === 'setoran'));
        setPenarikanList(transaksiList.filter((t: any) => t.tipe === 'penarikan'));
        setAuditLog(reportsResp.data.auditLog || []);
      }

      // 4. Load users list if administrator log in
      if (currentUser.role === 'admin') {
        const usersResp = await apiService.getUsers();
        if (usersResp.success) {
          setUsersList(usersResp.data);
        }
      }

    } catch (err: any) {
      triggerToast('Koneksi Gagal: ' + err.message, 'error');
    } finally {
      setDataLoading(false);
    }
  }, [currentUser]);

  // Sync data automatically on session initial load, or when active mode switches
  useEffect(() => {
    if (currentUser) {
      loadApplicationData();
    }
  }, [currentUser, loadApplicationData]);

  // --- CRUD ACTIONS ROUTED ---

  // A. SISWA MUTATIONS
  const handleAddSiswa = async (data: any) => {
    const resp = await apiService.createSiswa(data);
    if (resp.success) {
      triggerToast('Siswa berhasil didaftarkan!', 'success');
      loadApplicationData();
      return true;
    }
    triggerToast(resp.message || 'Gagal mendaftarkan siswa', 'error');
    return false;
  };

  const handleUpdateSiswa = async (data: any) => {
    const resp = await apiService.updateSiswa(data);
    if (resp.success) {
      triggerToast('Katalog rincian siswa berhasil diperbaharui!', 'success');
      loadApplicationData();
      return true;
    }
    triggerToast(resp.message || 'Gagal memperbaharui siswa', 'error');
    return false;
  };

  const handleDeleteSiswa = async (id: string) => {
    const resp = await apiService.deleteSiswa(id);
    if (resp.success) {
      triggerToast('Siswa bersangkutan berhasil dihapus dari sistem.', 'success');
      loadApplicationData();
      return true;
    }
    triggerToast(resp.message || 'Gagal menghapus siswa', 'error');
    return false;
  };

  // B. KELAS MUTATIONS
  const handleAddKelas = async (data: any) => {
    const resp = await apiService.createKelas(data);
    if (resp.success) {
      triggerToast('Kelas akademik berhasil dibentuk!', 'success');
      loadApplicationData();
      return true;
    }
    triggerToast(resp.message || 'Gagal membentuk kelas', 'error');
    return false;
  };

  const handleUpdateKelas = async (data: any) => {
    const resp = await apiService.updateKelas(data);
    if (resp.success) {
      triggerToast('Data wali kelas fungsional berhasil diperbarui!', 'success');
      loadApplicationData();
      return true;
    }
    triggerToast(resp.message || 'Gagal mengupdate kelas', 'error');
    return false;
  };

  const handleDeleteKelas = async (id: string) => {
    const resp = await apiService.deleteKelas(id);
    if (resp.success) {
      triggerToast('Kelas berhasil dilebur / ditiadakan.', 'success');
      loadApplicationData();
      return true;
    }
    triggerToast(resp.message || 'Gagal menghapus kelas', 'error');
    return false;
  };

  // C. USER LOGIN MUTATIONS
  const handleAddUser = async (data: any) => {
    const resp = await apiService.createUser(data);
    if (resp.success) {
      triggerToast('Petugas login berhasil didaftarkan!', 'success');
      loadApplicationData();
      return true;
    }
    triggerToast(resp.message || 'Gagal menambahkan petugas baru', 'error');
    return false;
  };

  const handleUpdateUser = async (data: any) => {
    const resp = await apiService.updateUser(data);
    if (resp.success) {
      triggerToast('Sesi / kredensial petugas berhasil diupdate!', 'success');
      loadApplicationData();
      return true;
    }
    triggerToast(resp.message || 'Gagal memperbaharui akses petugas', 'error');
    return false;
  };

  const handleDeleteUser = async (id: string) => {
    const resp = await apiService.deleteUser(id);
    if (resp.success) {
      triggerToast('Otoritas akses login dihapus selamanya.', 'success');
      loadApplicationData();
      return true;
    }
    triggerToast(resp.message || 'Gagal menghapus akses petugas', 'error');
    return false;
  };

  // D. TRANSACTION LEDGERS
  const handleAddSetoran = async (data: any) => {
    try {
      const resp = await apiService.createSetoran(data);
      if (resp.success) {
        triggerToast('Pemasukan tabungan siswa berhasil dibukukan!', 'success');
        loadApplicationData();
        return true;
      }
      triggerToast(resp.message || 'Gagal membukukan setoran', 'error');
      return false;
    } catch (err: any) {
      triggerToast('Gagal memproses setoran: ' + (err.message || err), 'error');
      return false;
    }
  };

  const handleAddPenarikan = async (data: any) => {
    try {
      const resp = await apiService.createPenarikan(data);
      if (resp.success) {
        triggerToast('Penarikan tabungan berhasil terekam!', 'success');
        loadApplicationData();
        return true;
      }
      triggerToast(resp.message || 'Gagal merekam penarikan', 'error');
      return false;
    } catch (err: any) {
      triggerToast('Gagal memproses penarikan: ' + (err.message || err), 'error');
      return false;
    }
  };

  // Guard: Not logged in show LoginPage view
  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} loading={dataLoading} />
        {/* Floating help triggers */}
        <button
          onClick={() => setShowGASModal(true)}
          className="fixed bottom-4 right-4 p-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-805 text-zinc-3 w-12 h-12 rounded-full cursor-pointer flex items-center justify-center text-white"
          title="Manual Panduan Sheets"
        >
          <HelpCircle className="w-6 h-6 animate-pulse" />
        </button>
        {showGASModal && <GASCodeModal isOpen={showGASModal} onClose={() => setShowGASModal(false)} />}
      </>
    );
  }

  // Define active subview component renderers
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            stats={dashboardStats}
            onRefresh={loadApplicationData}
            loading={dataLoading}
            onNavigateTab={setCurrentTab}
            userRole={currentUser.role}
          />
        );
      case 'siswa':
        return (
          <SiswaManagement
            siswaList={siswaList}
            kelasList={kelasList}
            loading={dataLoading}
            onAddSiswa={handleAddSiswa}
            onUpdateSiswa={handleUpdateSiswa}
            onDeleteSiswa={handleDeleteSiswa}
            onRefresh={loadApplicationData}
            userRole={currentUser.role}
          />
        );
      case 'kelas':
        return (
          <KelasManagement
            kelasList={kelasList}
            loading={dataLoading}
            onAddKelas={handleAddKelas}
            onUpdateKelas={handleUpdateKelas}
            onDeleteKelas={handleDeleteKelas}
            userRole={currentUser.role}
          />
        );
      case 'setoran':
        return (
          <TransaksiSetoran
            siswaList={siswaList}
            setoranList={setoranList}
            loading={dataLoading}
            onAddSetoran={handleAddSetoran}
            onRefresh={loadApplicationData}
            petugasName={currentUser.username}
          />
        );
      case 'penarikan':
        return (
          <TransaksiPenarikan
            siswaList={siswaList}
            penarikanList={penarikanList}
            loading={dataLoading}
            onAddPenarikan={handleAddPenarikan}
            onRefresh={loadApplicationData}
            petugasName={currentUser.username}
          />
        );
      case 'laporan':
        return (
          <LaporanKeuangan
            siswaList={siswaList}
            kelasList={kelasList}
            semuaTransaksi={[...setoranList, ...penarikanList]}
            auditLog={auditLog}
            loading={dataLoading}
            onRefresh={loadApplicationData}
            userRole={currentUser.role}
          />
        );
      case 'users':
        return (
          <UserManagement
            usersList={usersList}
            loading={dataLoading}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            userRole={currentUser.role}
          />
        );
      default:
        return (
          <div className="py-20 text-center text-zinc-500">
            Halaman belum diimplementasikan.
          </div>
        );
    }
  };

  const getDbModeDisplay = () => {
    const isApi = getApiMode() === 'api';
    return (
      <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold font-mono tracking-tight ${
        isApi 
          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-805' 
          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
      }`}>
        {isApi ? <DatabaseZap className="w-3.5 h-3.5" /> : <CloudLightning className="w-3.5 h-3.5" />}
        <span>DB: {isApi ? 'GOOGLE SHEETS CONNECTED' : 'SIMULATOR BROWSER LOCAL'}</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans">
      
      {/* 1. DESKTOP SIDEBAR VIEW */}
      <div className="hidden lg:block">
        <Sidebar
          currentTab={currentTab}
          setTab={setCurrentTab}
          role={currentUser.role}
          username={currentUser.username}
          onLogout={handleLogout}
        />
      </div>

      {/* 2. MOBILE FLOATING REPLACEMENT NAV DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative z-50 animate-slide-right">
            <Sidebar
              currentTab={currentTab}
              setTab={(tab) => {
                setCurrentTab(tab);
                setMobileMenuOpen(false);
              }}
              role={currentUser.role}
              username={currentUser.username}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* 3. PRIMARY CONTENT MODULE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Dynamic header navbar bar */}
        <div className="relative flex items-center h-16 shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          
          {/* Quick Mobile trigger bar hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex lg:hidden p-3 ml-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <Navbar 
              currentTab={currentTab} 
              onOpenGASDocs={() => setShowGASModal(true)} 
              onRefreshData={loadApplicationData}
            />
          </div>
        </div>

        {/* Global Network indicators list banner */}
        <div className="px-6 py-2 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${dataLoading ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
            <span className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">
              {dataLoading ? 'Sinkronisasi sinkron...' : `Status Sinkron Terkunci`}
            </span>
          </div>
          {getDbModeDisplay()}
        </div>

        {/* Dynamic Scrollable Child Page Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {renderTabContent()}
        </main>
      </div>

      {/* 4. NOTIFICATION POPUP PANEL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 p-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200 max-w-sm flex items-start gap-3 animate-slide-up">
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <span className="font-bold block tracking-wide uppercase text-[10px] text-zinc-400 dark:text-zinc-500">Notifikasi Sistem</span>
            <p className="mt-0.5 font-medium leading-relaxed">{toastMessage.text}</p>
          </div>
        </div>
      )}

      {/* 5. GOOGLE APPS SCRIPT TUTORIAL MODAL */}
      {showGASModal && (
        <GASCodeModal isOpen={showGASModal} onClose={() => setShowGASModal(false)} />
      )}

    </div>
  );
}
