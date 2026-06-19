/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  DollarSign, 
  Users, 
  GraduationCap, 
  FileSpreadsheet, 
  Settings, 
  UserSquare2, 
  ArrowLeftRight, 
  LayoutDashboard, 
  Coins, 
  Wallet,
  Menu,
  Database
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  role: UserRole;
  username: string;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, setTab, role, username, onLogout }: SidebarProps) {
  // Define menu items and associate them with roles
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      roles: ['admin', 'bendahara', 'wali_kelas', 'siswa'] 
    },
    { 
      id: 'siswa', 
      label: 'Data Siswa', 
      icon: Users, 
      roles: ['admin', 'bendahara', 'wali_kelas'] 
    },
    { 
      id: 'kelas', 
      label: 'Data Kelas', 
      icon: GraduationCap, 
      roles: ['admin', 'bendahara'] 
    },
    { 
      id: 'setoran', 
      label: 'Setoran Uang', 
      icon: Coins, 
      roles: ['admin', 'bendahara'] 
    },
    { 
      id: 'penarikan', 
      label: 'Penarikan Uang', 
      icon: Wallet, 
      roles: ['admin', 'bendahara'] 
    },
    { 
      id: 'laporan', 
      label: 'Laporan Keuangan', 
      icon: FileSpreadsheet, 
      roles: ['admin', 'bendahara', 'wali_kelas', 'siswa'] 
    },
    { 
      id: 'users', 
      label: 'Manajemen User', 
      icon: UserSquare2, 
      roles: ['admin'] // Only Administrator can see users list!
    }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(role));

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'admin': return 'Administrator';
      case 'bendahara': return 'Bendahara Sekolah';
      case 'wali_kelas': return 'Wali Kelas';
      case 'siswa': return 'Siswa Terdaftar';
      default: return 'User';
    }
  };

  return (
    <div className="w-64 h-full bg-white text-slate-900 flex flex-col border-r border-slate-200 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-650 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-100">
          S
        </div>
        <div>
          <h1 className="font-bold text-md tracking-tight text-slate-900 uppercase">SITABUNG</h1>
          <p className="text-[10px] text-slate-400 font-mono font-medium">v1.1.0 • CONNECTED</p>
        </div>
      </div>

      {/* User Session Profile Card */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 font-bold text-blue-600 flex items-center justify-center uppercase shadow-xs">
            {username.substring(0, 2)}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-800 truncate">{username}</h4>
            <div className="inline-block px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[9px] font-semibold text-blue-700 font-sans tracking-wide mt-0.5 uppercase">
              {getRoleLabel(role)}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Navigation Tabs */}
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-400 font-sans mb-3">Main Menu</p>
        {allowedItems.map(item => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 outline-hidden tracking-tight text-left ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <IconComponent className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-250 text-xs font-medium text-slate-600 hover:text-red-650 transition-all duration-200 cursor-pointer"
        >
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );
}
