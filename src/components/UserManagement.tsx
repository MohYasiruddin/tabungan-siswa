/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserSquare2, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  AlertCircle,
  KeyRound,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserProps {
  usersList: User[];
  loading: boolean;
  onAddUser: (data: any) => Promise<boolean>;
  onUpdateUser: (data: any) => Promise<boolean>;
  onDeleteUser: (id: string) => Promise<boolean>;
  userRole: string;
}

export default function UserManagement({ 
  usersList, 
  loading, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser,
  userRole
}: UserProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('bendahara');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Guard access
  if (userRole !== 'admin') {
    return (
      <div className="py-16 text-center max-w-sm mx-auto space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 rounded-full inline-block">
          <ShieldAlert className="w-10 h-10 outline-hidden" />
        </div>
        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Akses Ditolak!</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Halaman Manajemen Akun Pengguna hanya dapat diakses oleh personil berwenang dengan hak akses <b>Administrator Utama</b>.
        </p>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setRole('bendahara');
    setStatus('aktif');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(''); // leave blank if no charge
    setRole(u.role);
    setStatus(u.status);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !role) {
      setFormError('Username dan Level akses wajib diisi!');
      return;
    }

    if (!editingUser && !password) {
      setFormError('Sandi default wajib diisi untuk pengguna baru!');
      return;
    }

    setSubmitting(true);
    const data = {
      id_user: editingUser ? editingUser.id_user : undefined,
      username: username.toLowerCase().trim(),
      role,
      status,
      password: password ? password : undefined
    };

    let success = false;
    if (editingUser) {
      success = await onUpdateUser(data);
    } else {
      success = await onAddUser(data);
    }

    setSubmitting(false);

    if (success) {
      setShowModal(false);
    } else {
      setFormError('Nama pengguna tersebut kemungkinan sudah terdaftar!');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (name === 'admin') {
      alert('Akun administrator default tidak boleh dihapus atau ditiadakan!');
      return;
    }
    if (window.confirm(`Hapus hak akses pengguna "${name}"? Pengguna tidak akan bisa melakukan login sesi kembali.`)) {
      await onDeleteUser(id);
    }
  };

  const filteredList = usersList.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40';
      case 'bendahara':
        return 'bg-blue-50 border border-blue-105 text-blue-700 dark:bg-zinc-800 dark:text-blue-400 dark:border-zinc-700';
      case 'wali_kelas':
        return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-250 dark:border-amber-800/40';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Otoritas Sesi Pengguna</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Atur kredensial login, audit operasional tingkatan peran admin, bendahara, wali kelas, serta pengaturan status.</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Petugas / User</span>
        </button>
      </div>

      {/* Toolbar filter */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-805 shadow-xs flex justify-between items-center">
        <div className="relative w-full max-w-xs flex items-center bg-zinc-50 dark:bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-850">
          <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 outline-hidden w-full"
          />
        </div>
        <span className="text-zinc-400 text-xs font-mono">{filteredList.length} user terdaftar</span>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-500 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          <span className="text-xs font-semibold">Sinkronisasi data user akun sedang berlangsung...</span>
        </div>
      )}

      {/* Main Table DataTable */}
      {!loading && (
        <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left animate-fade-in">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] font-bold font-mono">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Status Sesi</th>
                <th className="px-6 py-4">Tingkatan Peran</th>
                <th className="px-6 py-4">Didaftarkan Pada</th>
                <th className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-805 text-zinc-700 dark:text-zinc-350 text-xs font-medium">
              {filteredList.length > 0 ? (
                filteredList.map((u) => (
                  <tr key={u.id_user} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 font-bold border border-zinc-250 dark:border-zinc-700 text-zinc-650 dark:text-zinc-350 flex items-center justify-center uppercase">
                          {u.username.substring(0, 2)}
                        </div>
                        <span className="font-bold text-zinc-900 dark:text-white font-mono">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.status === 'aktif' 
                          ? 'bg-blue-50/60 dark:bg-zinc-950 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-zinc-800/40' 
                          : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-550 dark:text-zinc-400'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${u.status === 'aktif' ? 'bg-blue-600' : 'bg-zinc-400'}`}></span>
                        <span>{u.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider ${getRoleBadge(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono tracking-tight text-[11px]">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-805 hover:bg-zinc-105 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                          title="Perbarui Sandi / Role"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={u.username === 'admin'}
                          onClick={() => handleDelete(u.id_user, u.username)}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-805 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-950/25 dark:hover:text-red-400 disabled:opacity-30 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-450">
                    <UserSquare2 className="w-8 h-8 mx-auto stroke-1 text-zinc-300 mb-2" />
                    <span className="text-xs">Identitas pengguna tidak ditemukan.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal (Create and Edit User) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm shadow-2xl border border-zinc-200 dark:border-zinc-800">
            
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 dark:bg-zinc-850 text-blue-600 dark:text-blue-400 rounded-lg">
                  <UserSquare2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wide">
                    {editingUser ? 'Perbarui Akun Petugas' : 'Tambahkan Akun Baru'}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-medium">Atur kredensial dan hak operasional sistem</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-zinc-450" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-705 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40 rounded-xl text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Username Login</label>
                <input
                  type="text"
                  required
                  disabled={editingUser?.username === 'admin'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: bendahara"
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-809 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono focus:border-blue-500 outline-hidden disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{editingUser ? 'Reset Kata Sandi (Opsional)' : 'Pasword Sandi Default'}</span>
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? "Kosongkan jika tidak diganti" : "Contoh: bendahara123"}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-809 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:border-blue-500 outline-hidden"
                />
              </div>

              {/* Level / Role */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Tingkatan Peran</label>
                <select
                  disabled={editingUser?.username === 'admin'}
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-809 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-hidden font-medium cursor-pointer disabled:opacity-50"
                >
                  <option value="bendahara">Bendahara (Input Tabungan, Laporan)</option>
                  <option value="wali_kelas">Wali Kelas (Lihat Laporan Saja)</option>
                  <option value="admin">Administrator (Akses Penuh)</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Status Akun</label>
                <select
                  disabled={editingUser?.username === 'admin'}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-809 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-medium outline-hidden cursor-pointer"
                >
                  <option value="aktif">Aktif Bekerja</option>
                  <option value="nonaktif">Nonaktif / Penangguhan</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3 border-t border-zinc-150 dark:border-zinc-800 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2 px-4 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-850 dark:hover:bg-zinc-802 text-zinc-700 dark:text-zinc-200 text-center transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2 px-4 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex justify-center items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  ) : (
                    <span>{editingUser ? 'Perbarui' : 'Daftarkan'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
