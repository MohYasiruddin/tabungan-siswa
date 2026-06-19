/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  AlertCircle, 
  X,
  CreditCard,
  UserCheck,
  Phone,
  FolderMinus,
  ArrowRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Siswa, Kelas } from '../types';

interface SiswaManagementProps {
  siswaList: (Siswa & { total_setoran: number; total_penarikan: number; saldo: number })[];
  kelasList: Kelas[];
  loading: boolean;
  onAddSiswa: (data: any) => Promise<boolean>;
  onUpdateSiswa: (data: any) => Promise<boolean>;
  onDeleteSiswa: (id: string) => Promise<boolean>;
  onRefresh: () => void;
  userRole: string;
}

export default function SiswaManagement({ 
  siswaList, 
  kelasList, 
  loading, 
  onAddSiswa, 
  onUpdateSiswa, 
  onDeleteSiswa,
  onRefresh,
  userRole
}: SiswaManagementProps) {

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modal Control
  const [showModal, setShowModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<any | null>(null);

  // Form Fields
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [kelas, setKelas] = useState('');
  const [alamat, setAlamat] = useState('');
  const [namaOrangTua, setNamaOrangTua] = useState('');
  const [noHp, setNoHp] = useState('');
  const [statusAktif, setStatusAktif] = useState<'aktif' | 'nonaktif'>('aktif');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pagination Table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Set default class if available when classes load
  useEffect(() => {
    if (kelasList.length > 0 && !kelas) {
      setKelas(kelasList[0].nama_kelas);
    }
  }, [kelasList]);

  const openAddModal = () => {
    setEditingSiswa(null);
    setNis('');
    setNama('');
    setJenisKelamin('L');
    if (kelasList.length > 0) setKelas(kelasList[0].nama_kelas);
    setAlamat('');
    setNamaOrangTua('');
    setNoHp('');
    setStatusAktif('aktif');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (s: Siswa) => {
    setEditingSiswa(s);
    setNis(s.nis);
    setNama(s.nama);
    setJenisKelamin(s.jenis_kelamin);
    setKelas(s.kelas);
    setAlamat(s.alamat);
    setNamaOrangTua(s.nama_orang_tua);
    setNoHp(s.no_hp);
    setStatusAktif(s.status_aktif);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nis.trim() || !nama.trim() || !kelas) {
      setFormError('NIS, Nama Lengkap, dan Kelas wajib diisi!');
      return;
    }

    setSubmitting(true);
    const formData = {
      id_siswa: editingSiswa ? editingSiswa.id_siswa : undefined,
      nis: nis.trim(),
      nama: nama.trim(),
      jenis_kelamin: jenisKelamin,
      kelas: kelas,
      alamat: alamat.trim(),
      nama_orang_tua: namaOrangTua.trim(),
      no_hp: noHp.trim(),
      status_aktif: statusAktif
    };

    let success: boolean;
    if (editingSiswa) {
      success = await onUpdateSiswa(formData);
    } else {
      success = await onAddSiswa(formData);
    }

    setSubmitting(false);
    if (success) {
      setShowModal(false);
    } else {
      setFormError('Gagal memproses data. NIS mungkin sudah terpakai.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data siswa "${name}"? Seluruh riwayat transaksi tabungan juga akan hilang.`)) {
      await onDeleteSiswa(id);
    }
  };

  // Filtering Logic
  const filteredList = siswaList.filter(s => {
    const sNama = s.nama ? String(s.nama).toLowerCase() : '';
    const sNis = s.nis ? String(s.nis) : '';
    const sOrtu = s.nama_orang_tua ? String(s.nama_orang_tua).toLowerCase() : '';
    const sAlamat = s.alamat ? String(s.alamat).toLowerCase() : '';
    const q = searchQuery.toLowerCase();

    const matchesSearch = sNama.includes(q) || 
                          sNis.includes(searchQuery) ||
                          sOrtu.includes(q) ||
                          sAlamat.includes(q);
    
    const matchesKelas = filterKelas === 'Semua' || s.kelas === filterKelas;
    const matchesStatus = filterStatus === 'Semua' || s.status_aktif === filterStatus;
    
    return matchesSearch && matchesKelas && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const rupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlesPageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Daftar Pendaftaran Siswa</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Kelola data induk siswa, alamat, status aktif, koordinasi kelas, dan pantau saldo tabungan realtime.</p>
        </div>

        {/* Create Student Trigger (For Admin & Bendahara only) */}
        {(userRole === 'admin' || userRole === 'bendahara') && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-805 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs flex items-center bg-zinc-50 dark:bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-850">
          <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama, NIS, orang tua..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // reset to page 1
            }}
            className="bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 outline-hidden w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Kelas list */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">Kelas:</span>
            <select
              value={filterKelas}
              onChange={(e) => {
                setFilterKelas(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-white outline-hidden cursor-pointer"
            >
              <option value="Semua">Semua Kelas</option>
              {kelasList.map(k => (
                <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>

          {/* Status list */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-zinc-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-white outline-hidden cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>

        </div>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          <span className="text-xs font-semibold">Sinkronisasi data siswa sedang berlangsung...</span>
        </div>
      )}

      {/* Main Table DataTable */}
      {!loading && (
        <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          <table className="min-w-full divide-y divide-slate-150 dark:divide-zinc-800 text-left">
            <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] font-bold font-sans">
              <tr>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">No. HP / Wali</th>
                <th className="px-6 py-4 text-blue-600 dark:text-blue-400">Total Setoran</th>
                <th className="px-6 py-4 text-red-500">Total Penarikan</th>
                <th className="px-6 py-4 font-bold text-slate-850 dark:text-zinc-100">Saldo Realtime</th>
                <th className="px-6 py-4">Status</th>
                {(userRole === 'admin' || userRole === 'bendahara') && <th className="px-6 py-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-805 text-zinc-755 dark:text-zinc-300 text-xs">
              {currentItems.length > 0 ? (
                currentItems.map((s) => (
                  <tr key={s.id_siswa} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-medium tracking-tight text-slate-400">{s.nis}</td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-850 dark:text-zinc-100">{s.nama}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • {s.alamat}</div>
                    </td>
                    <td className="px-6 py-3.5 font-mono font-medium">Class {s.kelas}</td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-700 dark:text-zinc-200 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{s.no_hp}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Wali: {s.nama_orang_tua}</div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold font-mono text-blue-605 dark:text-blue-400">{rupiah(s.total_setoran || 0)}</td>
                    <td className="px-6 py-3.5 font-semibold font-mono text-red-500">{rupiah(s.total_penarikan || 0)}</td>
                    <td className="px-6 py-3.5 font-bold font-mono text-slate-850 dark:text-white bg-slate-50/50 dark:bg-zinc-950/20">{rupiah(s.saldo || 0)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        s.status_aktif === 'aktif' 
                          ? 'bg-blue-50/60 text-blue-700 border-blue-100 dark:bg-zinc-950 dark:text-blue-400' 
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-850'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status_aktif === 'aktif' ? 'bg-blue-600' : 'bg-zinc-400'}`}></span>
                        <span>{s.status_aktif}</span>
                      </span>
                    </td>
                    {(userRole === 'admin' || userRole === 'bendahara') && (
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                            title="Edit Data Siswa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id_siswa, s.nama)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/25 dark:hover:text-red-400 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-450">
                    <Users className="w-8 h-8 mx-auto stroke-1 text-zinc-300 mb-2" />
                    <span className="text-xs">Data siswa tidak ditemukan / query nihil.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Toolbar */}
          {totalPages > 1 && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
              <span>Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredList.length)} dari {filteredList.length} siswa</span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlesPageChange(currentPage - 1)}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold font-mono px-2 text-zinc-800 dark:text-zinc-200">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlesPageChange(currentPage + 1)}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide Modal Dialog (Create & Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-zinc-800">
                       {/* Modal Header */}
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 dark:bg-zinc-850 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wide">
                    {editingSiswa ? 'Pemutakhiran Data Siswa' : 'Pendaftaran Siswa Baru'}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-medium">Input data resmi registrasi peserta didik</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-zinc-450" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 dark:bg-red-955/20 dark:text-red-400 border border-red-100 dark:border-red-900/40 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* NIS */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Nomor Induk Siswa (NIS)</label>
                  <input
                    type="text"
                    required
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="Contoh: 10111"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white outline-hidden font-mono focus:border-blue-500"
                  />
                </div>

                {/* Kelas */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Kelas</label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-zinc-800 dark:text-white outline-hidden font-medium cursor-pointer"
                  >
                    {kelasList.map(k => (
                      <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Andi Wijaya"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Jenis Kelamin */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Jenis Kelamin</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setJenisKelamin('L')}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                        jenisKelamin === 'L' 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-slate-50 dark:bg-zinc-950 text-slate-500 border-slate-200 dark:border-zinc-805 hover:bg-slate-100'
                      }`}
                    >
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setJenisKelamin('P')}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                        jenisKelamin === 'P' 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-slate-50 dark:bg-zinc-950 text-slate-500 border-slate-200 dark:border-zinc-805 hover:bg-slate-100'
                      }`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>

                {/* Status Aktif */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Status Aktif</label>
                  <select
                    value={statusAktif}
                    onChange={(e) => setStatusAktif(e.target.value as 'aktif' | 'nonaktif')}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white outline-hidden font-medium cursor-pointer"
                  >
                    <option value="aktif">Aktif Menabung</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Nama Orang Tua */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={namaOrangTua}
                    onChange={(e) => setNamaOrangTua(e.target.value)}
                    placeholder="Contoh: Eko Wijaya"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* No HP */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">No. HP Orang Tua / Wali</label>
                  <input
                    type="tel"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white outline-hidden font-mono focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Alamat Rumah */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Alamat Lengkap</label>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Merpati No. 12, Kelurahan Hegarmanah, Kota Bandung"
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 border-t border-zinc-150 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2 px-4 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-250 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-705 dark:text-zinc-200 text-center transition-colors cursor-pointer"
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
                    <span>{editingSiswa ? 'Simpan Perubahan' : 'Daftarkan Siswa'}</span>
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
