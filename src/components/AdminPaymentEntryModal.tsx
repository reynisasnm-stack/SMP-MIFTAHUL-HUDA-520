import React, { useState, useEffect } from 'react';
import { Student, PaymentTransaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  Calendar, 
  X, 
  User, 
  Receipt,
  HeartHandshake,
  BookOpen,
  Building2,
  Sparkles
} from 'lucide-react';

interface AdminPaymentEntryModalProps {
  students: Student[];
  preSelectedStudent?: Student | null;
  onClose: () => void;
  onSuccess: (payment: PaymentTransaction, updatedStudent: Student) => void;
  jwtToken: string;
}

export const AdminPaymentEntryModal: React.FC<AdminPaymentEntryModalProps> = ({
  students,
  preSelectedStudent,
  onClose,
  onSuccess,
  jwtToken
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(preSelectedStudent || null);
  const [category, setCategory] = useState<'SPP_BULANAN' | 'INFAQ_SUKARELA' | 'UANG_GEDUNG_DSP' | 'KITAB_BUKU' | 'KEGIATAN'>('SPP_BULANAN');
  const [selectedMonthIndices, setSelectedMonthIndices] = useState<number[]>([]);
  const [customAmount, setCustomAmount] = useState<number>(150000);
  const [paymentMethod, setPaymentMethod] = useState<'Tunai / Kasir TU' | 'Transfer Bank' | 'QRIS' | 'Tabungan Siswa'>('Tunai / Kasir TU');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // When a student is selected or initialized, auto-select first unpaid month
  useEffect(() => {
    if (selectedStudent) {
      const firstUnpaid = selectedStudent.sppMonths.find((m) => m.status !== 'LUNAS');
      if (firstUnpaid) {
        setSelectedMonthIndices([firstUnpaid.monthIndex]);
        setCustomAmount(selectedStudent.monthlyFee);
      } else {
        setSelectedMonthIndices([]);
      }
    }
  }, [selectedStudent]);

  // Recalculate amount if month indices change
  useEffect(() => {
    if (category === 'SPP_BULANAN' && selectedStudent) {
      setCustomAmount(selectedMonthIndices.length * selectedStudent.monthlyFee);
    }
  }, [selectedMonthIndices, category, selectedStudent]);

  // Filter 41 students by search
  const filteredStudents = searchQuery.trim() === ''
    ? students.slice(0, 8)
    : students.filter((s) => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery) ||
        s.nisn.includes(searchQuery) ||
        s.class.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const toggleMonth = (mIdx: number) => {
    if (selectedMonthIndices.includes(mIdx)) {
      setSelectedMonthIndices(selectedMonthIndices.filter((i) => i !== mIdx));
    } else {
      setSelectedMonthIndices([...selectedMonthIndices, mIdx].sort((a, b) => a - b));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setErrorMsg('Pilih siswa terlebih dahulu.');
      return;
    }

    if (category === 'SPP_BULANAN' && selectedMonthIndices.length === 0) {
      setErrorMsg('Pilih minimal satu bulan SPP yang akan dibayar.');
      return;
    }

    if (customAmount <= 0) {
      setErrorMsg('Nominal pembayaran harus lebih besar dari 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          paymentCategory: category,
          monthIndices: category === 'SPP_BULANAN' ? selectedMonthIndices : undefined,
          amount: customAmount,
          paymentMethod,
          notes
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan transaksi pembayaran.');
      }

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      onSuccess(data.payment, data.student);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="text-base font-bold">Catat Penerimaan Kas TU</h3>
              <p className="text-[11px] text-emerald-200/90">SMP IT Miftahul Huda 520 Karangpucung</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* 1. Pilih Siswa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              1. Pilih Siswa (Total 41 Siswa SMP IT)
            </label>

            {!selectedStudent ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik nama santri, NIS, atau kelas..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Suggestions List */}
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50">
                  {filteredStudents.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStudent(st)}
                      className="p-2.5 hover:bg-emerald-50 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{st.name}</div>
                        <div className="text-[10px] text-slate-500">
                          Kelas {st.class} • NIS: {st.nis} • Wali: {st.parentName}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Pilih
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {selectedStudent.name}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Kelas {selectedStudent.class} • NIS: {selectedStudent.nis} • Wali: {selectedStudent.parentName}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 underline font-semibold"
                >
                  Ganti Siswa
                </button>
              </div>
            )}
          </div>

          {/* 2. Jenis Pembayaran */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              2. Kategori Pos Pembayaran
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCategory('SPP_BULANAN')}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                  category === 'SPP_BULANAN'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SPP Bulanan</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Iuran Wajib Siswa</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('INFAQ_SUKARELA');
                  setCustomAmount(100000);
                }}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                  category === 'INFAQ_SUKARELA'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                  <span>Infaq Sukarela</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Wakaf & Pembangunan</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('UANG_GEDUNG_DSP');
                  setCustomAmount(250000);
                }}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                  category === 'UANG_GEDUNG_DSP'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>DSP / Gedung</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Uang Pengembangan</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('KITAB_BUKU');
                  setCustomAmount(150000);
                }}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                  category === 'KITAB_BUKU'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Buku & Kitab</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Modul & Seragam</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('KEGIATAN');
                  setCustomAmount(75000);
                }}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                  category === 'KEGIATAN'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Kegiatan / Ujian</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Asesmen & Ekstrakurikuler</div>
              </button>
            </div>
          </div>

          {/* 3. Multi-Select Month Picker if SPP */}
          {category === 'SPP_BULANAN' && selectedStudent && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  3. Pilih Bulan SPP yang Dibayar
                </label>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Tarif: {formatRupiah(selectedStudent.monthlyFee)}/bln
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                {selectedStudent.sppMonths.map((m) => {
                  const isPaid = m.status === 'LUNAS';
                  const isSelected = selectedMonthIndices.includes(m.monthIndex);

                  return (
                    <button
                      type="button"
                      key={m.monthIndex}
                      disabled={isPaid}
                      onClick={() => toggleMonth(m.monthIndex)}
                      className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isPaid
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <span className="text-xs font-bold">{m.monthName}</span>
                      <span className={`text-[10px] mt-1 ${isPaid ? 'text-slate-400' : isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {isPaid ? 'Lunas' : isSelected ? 'Dipilih' : 'Belum Bayar'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Nominal Pembayaran & Metode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Jumlah Dibayarkan (Rp)
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                min="1000"
                step="1000"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-sm text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {formatRupiah(customAmount)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Tunai / Kasir TU">Tunai / Kasir TU Langsung</option>
                <option value="Transfer Bank">Transfer Bank (BSI / BRI / Jateng)</option>
                <option value="QRIS">QRIS / E-Wallet</option>
                <option value="Tabungan Siswa">Potong Tabungan Siswa</option>
              </select>
            </div>
          </div>

          {/* 5. Catatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Keterangan Tambahan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Disetor tunai oleh wali santri Bpk. Suwarto"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedStudent}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : 'Simpan & Cetak Kuitansi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
