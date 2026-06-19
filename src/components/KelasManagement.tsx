/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { Kelas } from '../types';

interface KelasProps {
  kelasList: Kelas[];
  loading: boolean;
  onAddKelas: (data: any) => Promise<boolean>;
  onUpdateKelas: (data: any) => Promise<boolean>;
  onDeleteKelas: (id: string) => Promise<boolean>;
  userRole: string;
}

export default function KelasManagement({ 
  kelasList, 
  loading, 
  onAddKelas, 
  onUpdateKelas, 
  onDeleteKelas,
  userRole
}: KelasProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);

  const [namaKelas, setNamaKelas] = useState('');
  const [waliKelas, setWaliKelas] = useState('');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingKelas(null);
    setNamaKelas('');
    setWaliKelas('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (k: Kelas) => {
    setEditingKelas(k);
    setNamaKelas(k.nama_kelas);
    setWaliKelas(k.wali_kelas);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!namaKelas.trim() || !waliKelas.trim()) {
      setFormError('Nama kelas dan Wali kelas wajib diisi!');
      return;
    }

    setSubmitting(true);
    const data = {
      id_kelas: editingKelas ? editingKelas.id_kelas : undefined,
      nama_kelas: namaKelas.trim(),
      wali_kelas: waliKelas.trim()
    };

    let success = false;
    if (editingKelas) {
      success = await onUpdateKelas(data as Kelas);
    } else {
      success = await onAddKelas(data);
    }

    setSubmitting(false);

    if (success) {
      setShowModal(false);
    } else {
      setFormError('Gagal memproses data kelas. Silakan coba kembali.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Hapus Kelas "${name}"? Pastikan tidak ada siswa aktif yang dialokasikan di kelas ini.`)) {
      await onDeleteKelas(id);
    }
  };

  const filteredList = kelasList.filter(k => 
    k.nama_kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.wali_kelas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Master Data Kelas</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Atur daftar kelas di sekolah beserta guru pembimbing fungsional (Wali Kelas).</p>
        </div>

        {/* Create Classroom Button */}
        {(userRole === 'admin' || userRole === 'bendahara') && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-805 shadow-xs flex justify-between items-center">
        <div className="relative w-full max-w-xs flex items-center bg-zinc-50 dark:bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-850">
          <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari kelas atau wali kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 outline-hidden w-full"
          />
        </div>
        <span className="text-zinc-400 text-xs font-mono">{filteredList.length} kelas terdaftar</span>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-500 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          <span className="text-xs font-semibold">Sinkronisasi data kelas sedang berlangsung...</span>
        </div>
      )}

      {/* Main Grid content list */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.length > 0 ? (
            filteredList.map(k => (
              <div key={k.id_kelas} className="p-5 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 rounded-xl border border-zinc-100 dark:border-zinc-850">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-white font-mono">Kelas {k.nama_kelas}</h3>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">Tingkatan Akademik</p>
                    </div>
                  </div>
                  
                  {/* Actions for Authorized roles */}
                  {(userRole === 'admin' || userRole === 'bendahara') && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(k)}
                        className="p-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-550 dark:text-zinc-350 transition-colors cursor-pointer"
                        title="Edit Kelas"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(k.id_kelas, k.nama_kelas)}
                        className="p-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/25 dark:hover:text-red-400 text-zinc-550 dark:text-zinc-350 transition-colors cursor-pointer"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-850 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Wali Kelas:
                  </span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[170px]" title={k.wali_kelas}>
                    {k.wali_kelas}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 py-16 text-center text-zinc-450">
              <GraduationCap className="w-9 h-9 mx-auto text-zinc-300 stroke-1 mb-2" />
              <span className="text-xs text-center block">Tidak ada kelas terdaftar.</span>
            </div>
          )}
        </div>
      )}

      {/* Form Modal (Create and Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800">
            
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 dark:bg-zinc-850 text-blue-600 dark:text-blue-400 rounded-lg">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wide">
                    {editingKelas ? 'Perbarui Rincian Kelas' : 'Tambahkan Kelas Baru'}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-medium">Buat pengelompokan tingkatan siswa</p>
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
                <div className="p-3 bg-red-50 text-red-705 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nama Kelas */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Nama Kelas / Rombel</label>
                <input
                  type="text"
                  required
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  placeholder="Contoh: 7-A atau 8-B"
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono focus:border-blue-500 outline-hidden"
                />
              </div>

              {/* Wali Kelas */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Wali Kelas (Nama Lengkap & Gelar)</label>
                <input
                  type="text"
                  required
                  value={waliKelas}
                  onChange={(e) => setWaliKelas(e.target.value)}
                  placeholder="Contoh: Budi Hermawan, S.Pd."
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-805 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:border-blue-500 outline-hidden"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3 border-t border-zinc-150 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2 px-4 rounded-lg text-xs font-semibold bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-802 text-zinc-700 dark:text-zinc-200 text-center transition-colors cursor-pointer"
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
                    <span>{editingKelas ? 'Simpan' : 'Buat Kelas'}</span>
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
