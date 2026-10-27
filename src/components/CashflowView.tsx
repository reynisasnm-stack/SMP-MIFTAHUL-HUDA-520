import React, { useState } from 'react';
import { CashflowEntry } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PlusCircle, 
  Search, 
  Filter,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

interface CashflowViewProps {
  cashflow: CashflowEntry[];
  onOpenPaymentModal: () => void;
  onOpenExpenseModal: () => void;
}

export const CashflowView: React.FC<CashflowViewProps> = ({
  cashflow,
  onOpenPaymentModal,
  onOpenExpenseModal
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const totalIncome = cashflow
    .filter((c) => c.type === 'INCOME')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalExpense = cashflow
    .filter((c) => c.type === 'EXPENSE')
    .reduce((sum, c) => sum + c.amount, 0);

  const balance = totalIncome - totalExpense;

  const filtered = cashflow.filter((c) => {
    if (filterType !== 'ALL' && c.type !== filterType) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.referenceReceiptNo && c.referenceReceiptNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Pemasukan Kas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {formatRupiah(totalIncome)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Penerimaan SPP & infaq sukarela
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Pengeluaran (BKU)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">
            {formatRupiah(totalExpense)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Operasional, listrik, ATK & kegiatan
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-1">
            <span className="text-xs font-semibold">Saldo Kas Bersih Riil</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-800 font-mono mt-1">
            {formatRupiah(balance)}
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">
            Tersimpan di Kasir TU & Rek BSI
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Mutasi ({cashflow.length})
          </button>
          <button
            onClick={() => setFilterType('INCOME')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setFilterType('EXPENSE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'EXPENSE'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Pengeluaran
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi / kwitansi..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={onOpenPaymentModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Pemasukan</span>
          </button>

          <button
            onClick={onOpenExpenseModal}
            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Cashflow Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Kategori Pos</th>
                <th className="py-3 px-4">Deskripsi / Uraian</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {formatDateIndo(item.date)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.type === 'INCOME'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.type === 'INCOME' ? (
                        <>
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          Masuk
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          Keluar
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {item.category}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {item.description}
                    {item.referenceReceiptNo && (
                      <span className="text-[10px] text-slate-400 font-mono block">
                        No. Bukti: {item.referenceReceiptNo}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {item.officerName}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                    item.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {item.type === 'INCOME' ? '+' : '-'}{formatRupiah(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
