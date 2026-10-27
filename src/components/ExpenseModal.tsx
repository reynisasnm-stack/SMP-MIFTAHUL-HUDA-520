import React, { useState } from 'react';
import { CashflowEntry } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Wallet, X, ArrowUpRight, Calendar } from 'lucide-react';

interface ExpenseModalProps {
  onClose: () => void;
  onSuccess: (entry: CashflowEntry) => void;
  jwtToken: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  onClose,
  onSuccess,
  jwtToken
}) => {
  const [category, setCategory] = useState('Listrik & Utilitas');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(100000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const expenseCategories = [
    'Listrik & Utilitas',
    'ATK & Fotokopi Soal/Modul',
    'Honor Ustadz/Guru Tambahan',
    'Internet & WiFi Lab Komputer',
    'Kebersihan & Pemeliharaan Gedung',
    'Kegiatan Santri & Lomba',
    'Konsumsi Rapat Guru & Wali',
    'Operasional Lainnya'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) {
      setErrorMsg('Harap lengkapi uraian pengeluaran dan nominal.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/cashflow/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          category,
          description,
          amount,
          date
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan pengeluaran kas.');
      }

      onSuccess(data.entry);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-800 to-rose-700 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-rose-300" />
            <div>
              <h3 className="text-base font-bold">Catat Pengeluaran Kas (BKU)</h3>
              <p className="text-[11px] text-rose-200">Buku Kas Umum Sekolah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kategori Pengeluaran
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              {expenseCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Uraian / Deskripsi Pengeluaran
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Beli token listrik gedung lab komputer 100rb"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nominal (Rp)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="1000"
                step="1000"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {formatRupiah(amount)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Pengeluaran
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
