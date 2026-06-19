/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wallet, 
  Search, 
  Plus, 
  Printer, 
  Calendar, 
  User, 
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  XCircle,
  MessageCircle
} from 'lucide-react';
import { Penarikan, Siswa } from '../types';

const rupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

interface PenarikanProps {
  siswaList: (Siswa & { total_setoran: number; total_penarikan: number; saldo: number })[];
  penarikanList: any[];
  loading: boolean;
  onAddPenarikan: (data: any) => Promise<boolean>;
  onRefresh: () => void;
  petugasName: string;
}

export default function TransaksiPenarikan({ 
  siswaList, 
  penarikanList, 
  loading, 
  onAddPenarikan,
  onRefresh,
  petugasName
}: PenarikanProps) {

  const [searchStudent, setSearchStudent] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState<any | null>(null);
  
  // Form fields
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('Penarikan Tabungan');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

  // UI States
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState<any | null>(null);
  
  // Ledger Pagination & Search
  const [searchLedger, setSearchLedger] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Active Students for lookup
  const lookupSiswa = siswaList.filter(s => {
    const sNama = s.nama ? String(s.nama).toLowerCase() : '';
    const sNis = s.nis ? String(s.nis) : '';
    const q = searchStudent.toLowerCase();
    return s.status_aktif === 'aktif' && (sNama.includes(q) || sNis.includes(searchStudent));
  });

  const handleSelectSiswa = (s: any) => {
    setSelectedSiswa(s);
    setSearchStudent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!selectedSiswa) {
      setFormError('Pilih siswa terlebih dahulu!');
      return;
    }

    const value = parseInt(nominal);
    if (isNaN(value) || value <= 0) {
      setFormError('Nominal penarikan harus berupa angka positif!');
      return;
    }

    // --- CRITICAL BALANCE VALIDATION (VALIDASI SALDO REALTIME) ---
    if (selectedSiswa.saldo < value) {
      setFormError(`Transaksi GAGAL: Saldo siswa tidak mencukupi! Saldo saat ini: ${rupiah(selectedSiswa.saldo)}, nominal yang ditarik: ${rupiah(value)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        id_siswa: selectedSiswa.id_siswa,
        nominal: value,
        keterangan: keterangan.trim(),
        tanggal,
        petugas: petugasName
      };

      const isSuccess = await onAddPenarikan(data);
      if (isSuccess) {
        setFormSuccess('Penarikan tabungan berhasil dicatat!');
        
        // Auto-open print receipt with metadata
        setShowReceipt({
          id_transaksi: 'TXW-' + Date.now(),
          siswa_nama: selectedSiswa.nama,
          siswa_nis: selectedSiswa.nis,
          siswa_kelas: selectedSiswa.kelas,
          tanggal,
          nominal: value,
          keterangan: keterangan || 'Penarikan Tabungan',
          petugas: petugasName
        });

        // Reset form
        setSelectedSiswa(null);
        setNominal('');
        setKeterangan('Penarikan Tabungan');
      } else {
        setFormError('Gagal menambahkan transaksi penarikan ke database.');
      }
    } catch (err: any) {
      setFormError('Gagal memproses transaksi: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    const printContent = document.getElementById('receipt-print-area-w');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    window.location.reload();
  };

  const getWhatsAppLink = (receipt: any) => {
    if (!receipt) return '#';
    const student = siswaList.find(std => String(std.nis) === String(receipt.siswa_nis));
    if (!student) return '#';

    let formattedPhone = String(student.no_hp || '').replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('8')) {
      formattedPhone = '62' + formattedPhone;
    }

    const parentName = student.nama_orang_tua && student.nama_orang_tua !== '-' ? student.nama_orang_tua : 'Bapak/Ibu Orang Tua';
    const nominalFormatted = rupiah(receipt.nominal);
    const dateFormatted = receipt.tanggal;
    const studentName = student.nama;
    const studentNis = student.nis;
    const studentClass = student.kelas;
    const currentBalance = rupiah(student.saldo || 0);

    const textMessage = 
`Yth. Bapak/Ibu *${parentName}*,

Kami menginformasikan bahwa transaksi *Penarikan/Debet Tabungan* siswa di *AL-FUNGSI* telah berhasil dibukukan dengan rincian sebagai berikut:

👤 *Nama Siswa:* ${studentName} (${studentNis})
🏫 *Kelas:* Class ${studentClass}
📅 *Tanggal:* ${dateFormatted}
💵 *Nominal Tarik:* *${nominalFormatted}*
📊 *Saldo Akhir:* *${currentBalance}*
📝 *Keterangan:* ${receipt.keterangan || 'Penarikan Tabungan'}
👤 *Petugas:* ${receipt.petugas}

_Terima kasih atas kepercayaannya. Semoga tabungan ini bermanfaat untuk masa depan putra-putri kita._

*Layanan Keuangan Sekolah AL-FUNGSI*`;

    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(textMessage)}`;
  };

  // Filter history list
  const filteredLedger = penarikanList.filter(p => {
    const sNama = p.siswa_nama ? String(p.siswa_nama).toLowerCase() : '';
    const sNis = p.siswa_nis ? String(p.siswa_nis) : '';
    const sId = (p.id_transaksi || p.id_penarikan) ? String(p.id_transaksi || p.id_penarikan) : '';
    const sKet = p.keterangan ? String(p.keterangan).toLowerCase() : '';
    const q = searchLedger.toLowerCase();
    return sNama.includes(q) || sNis.includes(searchLedger) || sId.includes(searchLedger) || sKet.includes(q);
  });

  const totalPages = Math.ceil(filteredLedger.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLedger.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Form col (Left) */}
      <div className="space-y-6 lg:col-span-1 border-r border-transparent">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-805 shadow-xs flex flex-col justify-between">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/45 text-red-600 dark:text-red-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Input Penarikan Kas</h3>
              <p className="text-[10px] text-zinc-400">Pencatatan kas keluar tabungan siswa</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/40 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-blue-50 text-blue-700 dark:bg-zinc-850 dark:text-blue-400 border border-blue-105 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Student Selector Field */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Cari & Pilih Siswa (Aktif)</label>
              
              {!selectedSiswa ? (
                <>
                  <div className="flex gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 items-center">
                    <Search className="text-zinc-400 w-4 h-4 shrink-0" />
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder="Ketik NIS atau Nama Siswa..."
                      className="bg-transparent text-xs text-zinc-800 dark:text-white outline-hidden w-full placeholder-zinc-500"
                    />
                  </div>
                  
                  {/* Results Dropdown */}
                  {searchStudent.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-805 max-h-48 overflow-y-auto z-10 p-1.5 divide-y divide-zinc-100 dark:divide-zinc-850 animate-fade-in">
                      {lookupSiswa.length > 0 ? (
                        lookupSiswa.map(s => (
                          <button
                            key={s.id_siswa}
                            type="button; submit"
                            onClick={() => handleSelectSiswa(s)}
                            className="w-full text-left p-2.5 rounded-lg text-xs hover:bg-zinc-50 dark:hover:bg-zinc-950 flex justify-between items-center transition-all cursor-pointer"
                          >
                            <div>
                              <span className="font-bold text-zinc-850 dark:text-zinc-100 block">{s.nama}</span>
                              <span className="text-[10px] text-zinc-400 mt-0.5 font-mono">{s.nis} • Class {s.kelas}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                              {rupiah(s.saldo)}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-zinc-450 flex items-center justify-center gap-1.5">
                          <XCircle className="w-4 h-4 text-zinc-300" />
                          <span>Tidak ada siswa aktif cocok.</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Selected student card */
                <div className="p-3.5 bg-zinc-950 text-white rounded-xl border border-zinc-850 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-xs block text-red-400">{selectedSiswa.nama}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">NIS: {selectedSiswa.nis} • {selectedSiswa.kelas}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Saldo Tersedia: <b className="text-blue-405">{rupiah(selectedSiswa.saldo)}</b></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSiswa(null)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Nominal */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Nominal Penarikan (RP)</label>
              <div className="flex gap-1 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 items-center">
                <span className="text-zinc-400 text-xs font-bold font-mono shrink-0 pl-1.5">Rp.</span>
                <input
                  type="number"
                  required
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  placeholder="Contoh: 15000"
                  className="bg-transparent text-xs font-mono font-bold text-zinc-800 dark:text-white outline-hidden w-full pl-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tanggal */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Tanggal Transaksi</label>
                <div className="flex gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 items-center">
                  <Calendar className="text-zinc-400 w-4 h-4 shrink-0 mx-0.5" />
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="bg-transparent text-[11px] text-zinc-800 dark:text-white font-mono outline-hidden w-full cursor-pointer"
                  />
                </div>
              </div>

              {/* Petugas */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">ID Petugas Logged</label>
                <div className="flex gap-1.5 bg-zinc-55/70 dark:bg-zinc-950/60 p-2 rounded-xl border border-zinc-200 dark:border-zinc-850 items-center">
                  <User className="text-zinc-455 w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-450 truncate uppercase font-mono">{petugasName}</span>
                </div>
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase">Keterangan Tambahan</label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Pembelian buku tulis"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:border-blue-500 outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-red-650 hover:bg-red-700 text-white flex justify-center items-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Cari & Catat Penarikan</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Ledger history list (Right) */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Stats bar */}
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-805 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="relative w-full md:max-w-xs flex items-center bg-zinc-50 dark:bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-850">
            <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Cari riwayat penarikan..."
              value={searchLedger}
              onChange={(e) => {
                setSearchLedger(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 outline-hidden w-full"
            />
          </div>

          <div className="text-right text-xs text-zinc-400 inline-flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span>Terekam {filteredLedger.length} Transaksi Penarikan</span>
          </div>
        </div>

        {/* List Table */}
        <div className="overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs animate-fade-in">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-550 dark:text-zinc-400 uppercase tracking-wider text-[10px] font-bold font-mono">
              <tr>
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-805 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
              {currentItems.length > 0 ? (
                currentItems.map((p: any) => (
                  <tr key={p.id_transaksi || p.id_penarikan} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-zinc-900 dark:text-white">{p.siswa_nama}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">{p.siswa_nis} • Class {p.siswa_kelas}</div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-zinc-500">{p.tanggal}</td>
                    <td className="px-6 py-3.5 font-semibold font-mono text-red-500">{rupiah(p.nominal)}</td>
                    <td className="px-6 py-3.5 text-zinc-500 truncate max-w-[150px] font-medium" title={p.keterangan}>{p.keterangan || 'Penarikan Tabungan'}</td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setShowReceipt(p)}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 transition-colors inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-bold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Karcis</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-450">
                    <Wallet className="w-8 h-8 mx-auto text-zinc-300 stroke-1 mb-2" />
                    <span className="text-xs">Umpan data penarikan kosong.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500 font-medium">
              <span>Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredLedger.length)} dari {filteredLedger.length} data</span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold px-2 font-mono text-zinc-800 dark:text-zinc-200">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printer receipt dialog block */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between overflow-hidden">
            
            {/* Header */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Karcis Bukti Penarikan</span>
              <button 
                onClick={() => setShowReceipt(null)}
                className="p-1.5 rounded-lg border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-155 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
              </button>
            </div>

            {/* Print Body Block */}
            <div id="receipt-print-area-w" className="p-6 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs space-y-4">
              
              {/* Receipt Visual Header */}
              <div className="text-center pb-3 border-b border-dashed border-zinc-300 dark:border-zinc-700 space-y-1">
                <span className="font-bold text-sm block tracking-tighter uppercase font-mono">KOP SEKOLAH AL-FUNGSI</span>
                <p className="text-[10px] text-zinc-400">Bukti Penarikan Kas Tabungan Resmi</p>
                <span className="text-[9px] text-zinc-500 block">ID: {showReceipt.id_penarikan || showReceipt.id_transaksi}</span>
              </div>

              {/* Grid data */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">NIS Siswa:</span>
                  <span className="font-bold text-right">{showReceipt.siswa_nis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Nama Siswa:</span>
                  <span className="font-bold text-right truncate max-w-[170px]">{showReceipt.siswa_nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tingkat Kelas:</span>
                  <span className="font-bold text-right">Class {showReceipt.siswa_kelas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tanggal Tarik:</span>
                  <span className="font-bold text-right">{showReceipt.tanggal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Petugas:</span>
                  <span className="font-bold text-right uppercase font-semibold">{showReceipt.petugas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Keterangan:</span>
                  <span className="font-bold text-right italic truncate max-w-[150px]">{showReceipt.keterangan || '-'}</span>
                </div>
              </div>

              {/* Total nominal banner */}
              <div className="py-2.5 bg-zinc-50 dark:bg-zinc-950 px-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs font-bold font-mono">
                <span className="text-zinc-500">PENARIKAN:</span>
                <span className="text-red-500 font-bold">{rupiah(showReceipt.nominal)}</span>
              </div>

              {/* Parents WhatsApp Contact Metadata */}
              {(() => {
                const std = siswaList.find(s => String(s.nis) === String(showReceipt.siswa_nis));
                if (std) {
                  return (
                    <div className="pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 text-[10px] font-mono">
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>Wali/Orang Tua:</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[150px]">{std.nama_orang_tua || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>WhatsApp HP:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{std.no_hp || '-'}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Warning footer */}
              <div className="text-center pt-2 text-[10px] text-zinc-400 border-t border-dashed border-zinc-300 dark:border-zinc-700 leading-relaxed font-mono">
                <p>Simpan karcis ini seaman mungkin untuk menyelaraskan pembukuan tabungan bulanan.</p>
                <p className="font-bold mt-1 text-zinc-500">Terima Kasih!</p>
              </div>

            </div>

            {/* Dialog trigger Actions */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-150 dark:border-zinc-800 flex flex-col gap-2.5">
              <a
                href={getWhatsAppLink(showReceipt)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  const student = siswaList.find(std => String(std.nis) === String(showReceipt?.siswa_nis));
                  if (!student) {
                    e.preventDefault();
                    alert("Detail data siswa tidak ditemukan di sistem.");
                  } else if (!student.no_hp || student.no_hp.trim() === '' || student.no_hp === '-') {
                    e.preventDefault();
                    alert("⚠️ Nomor WhatsApp orang tua belum diatur atau kosong. Silakan perbarui nomor HP orang tua terlebih dahulu di menu Kelola Siswa.");
                  }
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs text-center"
              >
                <MessageCircle className="w-4 h-4 text-emerald-100" />
                <span>Kirim Notifikasi WA Orang Tua</span>
              </a>

              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setShowReceipt(null)}
                  className="w-1/2 py-2 text-xs font-semibold bg-zinc-200 hover:bg-zinc-350 dark:bg-zinc-800 dark:hover:bg-zinc-755 text-zinc-855 dark:text-zinc-200 rounded-lg text-center cursor-pointer transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="w-1/2 py-2 text-xs font-semibold bg-red-650 hover:bg-red-750 text-white rounded-lg flex justify-center items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Karcis</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
