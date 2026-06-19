/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Activity, 
  Wallet, 
  Coins, 
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
  onRefresh: () => void;
  onNavigateTab?: (tab: string) => void;
  userRole?: string;
}

export default function Dashboard({ stats, loading, onRefresh, onNavigateTab, userRole }: DashboardProps) {
  const rupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRecentIconColor = (tipe: 'setoran' | 'penarikan') => {
    return tipe === 'setoran' 
      ? 'bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400' 
      : 'bg-red-50 text-red-600 dark:bg-zinc-850 dark:text-red-400';
  };

  // Safe defaults
  const data = stats || {
    totalSiswa: 0,
    totalSaldo: 0,
    totalSetoranHariIni: 0,
    totalPenarikanHariIni: 0,
    setoranCountHariIni: 0,
    penarikanCountHariIni: 0,
    transaksiTerbaru: [],
    chartData: []
  };

  const isTabAllowed = (tab?: string) => {
    if (!tab) return false;
    const role = userRole || 'siswa';
    if (tab === 'siswa') return ['admin', 'bendahara', 'wali_kelas'].includes(role);
    if (tab === 'kelas') return ['admin', 'bendahara'].includes(role);
    if (tab === 'setoran') return ['admin', 'bendahara'].includes(role);
    if (tab === 'penarikan') return ['admin', 'bendahara'].includes(role);
    if (tab === 'laporan') return true;
    return true;
  };

  const statCards = [
    {
      title: 'Total Siswa Aktif',
      value: data.totalSiswa.toString(),
      badge: null as string | null,
      sub: 'Siswa aktif terdaftar',
      icon: Users,
      color: 'border-t-2 border-t-blue-500',
      tab: 'siswa'
    },
    {
      title: 'Total Saldo Tabungan',
      value: rupiah(data.totalSaldo),
      badge: null as string | null,
      sub: 'Dana tersimpan di sistem',
      icon: Wallet,
      color: 'border-t-2 border-t-slate-300',
      tab: 'laporan'
    },
    {
      title: 'Setoran Hari Ini',
      value: rupiah(data.totalSetoranHariIni),
      badge: `${data.setoranCountHariIni || 0} Trx`,
      sub: 'Dana masuk terverifikasi',
      icon: Coins,
      color: 'border-t-2 border-t-green-550',
      tab: 'setoran'
    },
    {
      title: 'Penarikan Hari Ini',
      value: rupiah(data.totalPenarikanHariIni),
      badge: `${data.penarikanCountHariIni || 0} Trx`,
      sub: 'Dana keluar diserahkan',
      icon: ArrowDownLeft,
      color: 'border-t-2 border-t-red-500',
      tab: 'penarikan'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title with refresh trigger */}
      <div className="flex justify-between items-center bg-transparent">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Kilas Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Analisis ringkasan tabungan, mutasi harian, dan pencatatan kas sekolah.</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer text-slate-700 dark:text-zinc-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {loading && (
        <div className="p-4 bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-zinc-700 text-xs font-medium animate-pulse">
          Sedang menyinkronkan data dengan sistem database...
        </div>
      )}

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const allowed = isTabAllowed(card.tab);
          const clickable = allowed && !!onNavigateTab;
          
          return (
            <div 
              key={idx} 
              onClick={() => {
                if (clickable && card.tab) {
                  onNavigateTab(card.tab);
                }
              }}
              className={`p-5 bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200 dark:border-zinc-800 flex items-center justify-between transition-all duration-200 ${card.color} ${
                clickable 
                  ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] hover:border-slate-300 dark:hover:border-zinc-700' 
                  : ''
              }`}
              title={clickable ? `Buka menu ${card.title}` : undefined}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block uppercase tracking-wider">{card.title}</span>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{card.value}</span>
                  {card.badge && (
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      card.tab === 'penarikan'
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400'
                        : 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                    }`}>
                      {card.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">{card.sub}</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-100 dark:border-zinc-850">
                <Icon className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Workspace Row: Dual graph & activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Transaction Graph */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-0.5">
              <h3 className="font-bold text-md text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
                <span>Tren Transaksi Tabungan</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Kilas perbandingan total setoran masuk dan penarikan keluar 6 bulan terakhir</p>
            </div>
          </div>

          <div className="w-full h-[320px] text-[10px] font-medium text-slate-400">
            {data.chartData && data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" className="dark:opacity-10" />
                  <XAxis dataKey="bulan" stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', borderRadius: '8px', border: 'none' }}
                    formatter={(value: number) => [rupiah(value), '']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="setoran" name="Setoran" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="penarikan" name="Penarikan" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Activity className="w-8 h-8 stroke-1 animate-pulse text-slate-300" />
                <span className="text-xs">Umpan data grafis masih kosong.</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Activity Feed / Recent Transaction Feed */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-md text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-blue-650" />
              <span>Aktivitas Terbaru</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Pencatatan mutasi kas tabungan terverifikasi di sekolah</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[320px] pr-1">
            {data.transaksiTerbaru && data.transaksiTerbaru.length > 0 ? (
              data.transaksiTerbaru.map((tx: any) => (
                <div key={tx.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-855 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${getRecentIconColor(tx.tipe)}`}>
                      {tx.tipe === 'setoran' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block truncate leading-tight">{tx.siswaNama} <span className="text-[10px] text-slate-450 font-normal">({tx.kelas})</span></span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[170px]">{tx.keterangan || (tx.tipe === 'setoran' ? 'Setor tabungan' : 'Tarik tabungan')}</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0 space-y-0.5">
                    <span className={`text-xs font-bold block ${tx.tipe === 'setoran' ? 'text-blue-600' : 'text-red-500'}`}>
                      {tx.tipe === 'setoran' ? '+' : '-'} {rupiah(tx.nominal)}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">{tx.tanggal}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-7 h-7 stroke-1 text-slate-350" />
                <span className="text-xs text-center leading-normal text-slate-400">Belum ada aktivitas transaksi.<br/>Mulai tambahkan transaksi di tab samping!</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick Setup Notice Alert */}
      <div className="p-6 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <h4 className="font-bold text-xs text-slate-705 dark:text-zinc-200 uppercase tracking-wider">💡 Mode Database Dinamis</h4>
          <p className="text-xs text-slate-500">Gunakan Mode Simulasi (Lokal) untuk pengujian cepat, atau hubungkan ke Google Sheets dengan menyalin kode Apps Script dari menu konfigurasi di sudut kanan atas.</p>
        </div>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-md shadow-blue-105 transition-all"
        >
          Periksa Koneksi
        </button>
      </div>

    </div>
  );
}
