import React, { useState, useEffect } from 'react';
import { SchoolInfo, PaymentTransaction, CashflowEntry, Student } from '../types';
import { formatRupiah, formatDateIndo, formatDateTimeIndo, exportToCSV, createBillingWhatsAppLink } from '../utils/formatters';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  PlusCircle,
  MessageCircle,
  Search
} from 'lucide-react';

interface FinancialReportsProps {
  school: SchoolInfo;
  payments: PaymentTransaction[];
  cashflow: CashflowEntry[];
  students: Student[];
  onOpenExpenseModal: () => void;
  onViewReceipt: (p: PaymentTransaction) => void;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  school,
  payments,
  cashflow,
  students,
  onOpenExpenseModal,
  onViewReceipt
}) => {
  const [reportType, setReportType] = useState<'monthly' | 'daily' | 'yearly' | 'bku' | 'arrears'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState('10'); // Oktober
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classFilter, setClassFilter] = useState<'ALL' | 'VII' | 'VIII' | 'IX'>('ALL');

  // Month names
  const months = [
    { num: '07', name: 'Juli' },
    { num: '08', name: 'Agustus' },
    { num: '09', name: 'September' },
    { num: '10', name: 'Oktober' },
    { num: '11', name: 'November' },
    { num: '12', name: 'Desember' },
    { num: '01', name: 'Januari' },
    { num: '02', name: 'Februari' },
    { num: '03', name: 'Maret' },
    { num: '04', name: 'April' },
    { num: '05', name: 'Mei' },
    { num: '06', name: 'Juni' }
  ];

  // Filter payments according to period
  const filteredPayments = payments.filter((p) => {
    if (classFilter !== 'ALL' && !p.studentClass.includes(`Kelas ${classFilter}`)) {
      return false;
    }

    if (reportType === 'daily') {
      return p.timestamp.startsWith(selectedDate);
    } else if (reportType === 'monthly') {
      const prefix = `${selectedYear}-${selectedMonth}`;
      return p.timestamp.startsWith(prefix);
    } else if (reportType === 'yearly') {
      return true; // all academic year
    }
    return true;
  });

  // Filter cashflow
  const filteredCashflow = cashflow.filter((c) => {
    if (reportType === 'daily') {
      return c.date === selectedDate;
    } else if (reportType === 'monthly') {
      const prefix = `${selectedYear}-${selectedMonth}`;
      return c.date.startsWith(prefix);
    }
    return true;
  });

  const totalIncome = filteredCashflow
    .filter((c) => c.type === 'INCOME')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalExpense = filteredCashflow
    .filter((c) => c.type === 'EXPENSE')
    .reduce((sum, c) => sum + c.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // SPP Calculations for 41 students
  const totalStudents = students.length; // 41
  const sppTargetPerStudent = 150000;
  const targetMonthlySPP = totalStudents * sppTargetPerStudent; // 6.150.000
  const currentMonthIdx = school.currentMonthIndex ?? 3;

  const paidStudentsCount = students.filter(
    (s) => s.sppMonths[currentMonthIdx]?.status === 'LUNAS'
  ).length;
  const sppComplianceRate = Math.round((paidStudentsCount / totalStudents) * 100);

  // Arrears (Tunggakan)
  const arrearsList = students
    .map((s) => {
      const unpaid = s.sppMonths
        .slice(0, currentMonthIdx + 1)
        .filter((m) => m.status !== 'LUNAS');
      return {
        student: s,
        unpaidCount: unpaid.length,
        unpaidMonths: unpaid.map((m) => m.monthName),
        totalTunggakan: unpaid.length * s.monthlyFee
      };
    })
    .filter((a) => a.unpaidCount > 0);

  const totalTunggakanNominal = arrearsList.reduce((sum, a) => sum + a.totalTunggakan, 0);

  // Class breakdown
  const classBreakdowns = ['VII', 'VIII', 'IX'].map((cls) => {
    const clsStudents = students.filter((s) => s.class === cls);
    const clsPaid = clsStudents.filter((s) => s.sppMonths[currentMonthIdx]?.status === 'LUNAS').length;
    const clsCollected = filteredPayments
      .filter((p) => p.studentClass.includes(cls))
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      name: `Kelas ${cls}`,
      total: clsStudents.length,
      paid: clsPaid,
      unpaid: clsStudents.length - clsPaid,
      rate: Math.round((clsPaid / clsStudents.length) * 100),
      collected: clsCollected
    };
  });

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const filename = `Laporan_Keuangan_SPP_MiftahulHuda520_${reportType}_${Date.now()}`;
    const headers = [
      'No',
      'No Kuitansi',
      'Tanggal & Jam',
      'Nama Siswa',
      'NIS',
      'Kelas',
      'Kategori Pembayaran',
      'Jumlah (Rp)',
      'Metode Bayar',
      'Petugas TU / Kasir',
      'Catatan'
    ];

    const rows = filteredPayments.map((p, idx) => [
      idx + 1,
      p.receiptNo,
      p.timestamp,
      p.studentName,
      p.studentNis,
      p.studentClass,
      p.categoryLabel,
      p.amount,
      p.paymentMethod,
      p.officerName,
      p.notes || ''
    ]);

    exportToCSV(filename, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls (no-print) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Pusat Laporan Keuangan & Rekapitulasi Kas</span>
            </h2>
            <p className="text-xs text-slate-500">
              Generate laporan otomatis penerimaan SPP, Buku Kas Umum (BKU), dan daftar tunggakan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenExpenseModal}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-rose-600" />
              <span>Catat Pengeluaran Kas</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel / CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan / PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => setReportType('monthly')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              reportType === 'monthly'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Rekap Bulanan
          </button>
          <button
            onClick={() => setReportType('daily')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              reportType === 'daily'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Rekap Harian
          </button>
          <button
            onClick={() => setReportType('bku')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              reportType === 'bku'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Buku Kas Umum (BKU)
          </button>
          <button
            onClick={() => setReportType('arrears')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              reportType === 'arrears'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Daftar Tunggakan Siswa ({arrearsList.length})
          </button>
          <button
            onClick={() => setReportType('yearly')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              reportType === 'yearly'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Rekap Tahunan ({school.academicYear})
          </button>
        </div>

        {/* Filters according to mode */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          {reportType === 'monthly' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Pilih Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                {months.map((m) => (
                  <option key={m.num} value={m.num}>{m.name} 2026</option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'daily' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Tanggal Transaksi:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Filter Kelas:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
            >
              <option value="ALL">Semua Kelas (VII, VIII, IX)</option>
              <option value="VII">Kelas VII Saja</option>
              <option value="VIII">Kelas VIII Saja</option>
              <option value="IX">Kelas IX Saja</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRINTABLE REPORT SHEET */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm print-page">
        {/* KOP LAPORAN RESMI */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl">
              <Building2 className="w-8 h-8 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase text-emerald-950">
                {school.name || 'SMP IT MIFTAHUL HUDA 520 KARANGPUCUNG'}
              </h1>
              <p className="text-xs font-semibold text-slate-700">
                NPSN: {school.npsn || '69987654'} • NSS: 202030105520 • Karangpucung, Cilacap
              </p>
              <p className="text-[11px] text-slate-500">
                Laporan Pertanggungjawaban Administrasi Keuangan & Penerimaan SPP
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold text-slate-800">
              Periode: {reportType === 'monthly' ? `Bulan Oktober ${selectedYear}` : reportType === 'daily' ? formatDateIndo(selectedDate) : 'Tahun Ajaran 2026/2027'}
            </div>
            <div className="text-slate-500 text-[11px]">
              Dicetak: {formatDateIndo(new Date().toISOString())}
            </div>
          </div>
        </div>

        {/* 4 KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl">
            <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>Total Pemasukan Kas</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-950 font-mono mt-1">
              {formatRupiah(totalIncome)}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              {filteredPayments.length} transaksi penerimaan
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-xl">
            <div className="text-xs font-semibold text-rose-800 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>Total Pengeluaran (BKU)</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-950 font-mono mt-1">
              {formatRupiah(totalExpense)}
            </div>
            <div className="text-[11px] text-rose-700 mt-1">
              Operasional & kegiatan sekolah
            </div>
          </div>

          <div className="bg-teal-50/70 border border-teal-200 p-4 rounded-xl">
            <div className="text-xs font-semibold text-teal-800 flex items-center gap-1">
              <Wallet className="w-4 h-4 text-teal-600" />
              <span>Saldo Kas Tersedia</span>
            </div>
            <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${netBalance >= 0 ? 'text-teal-950' : 'text-rose-600'}`}>
              {formatRupiah(netBalance)}
            </div>
            <div className="text-[11px] text-teal-700 mt-1">
              Kas bersih sekolah
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
            <div className="text-xs font-semibold text-amber-800 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Total Piutang / Tunggakan</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-950 font-mono mt-1">
              {formatRupiah(totalTunggakanNominal)}
            </div>
            <div className="text-[11px] text-amber-700 mt-1">
              {arrearsList.length} siswa menunggak
            </div>
          </div>
        </div>

        {/* BREAKDOWN PER KELAS SUMMARY */}
        <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
            Rekapitulasi Kepatuhan Pembayaran SPP Per Tingkat Kelas (41 Siswa)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classBreakdowns.map((b) => (
              <div key={b.name} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-slate-800">{b.name}</span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {b.rate}% Lunas
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${b.rate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Lunas: {b.paid} / {b.total} Siswa</span>
                  <span className="font-bold text-slate-700">{formatRupiah(b.collected)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TABEL DATA SESUAI MODE */}
        {reportType === 'arrears' ? (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Daftar Siswa dengan Tunggakan Iuran SPP</span>
              </h3>
              <span className="text-xs text-slate-500">
                Total Tunggakan: <strong className="text-rose-600">{formatRupiah(totalTunggakanNominal)}</strong>
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Nama Santri</th>
                    <th className="py-2.5 px-3">Kelas</th>
                    <th className="py-2.5 px-3">Wali Murid & No. WhatsApp</th>
                    <th className="py-2.5 px-3">Bulan Belum Dibayar</th>
                    <th className="py-2.5 px-3 text-right">Total Tunggakan</th>
                    <th className="no-print py-2.5 px-3 text-center">Pengingat WA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {arrearsList.map((a, idx) => {
                    const waLink = createBillingWhatsAppLink({
                      phone: a.student.parentPhone,
                      studentName: a.student.name,
                      className: `Kelas ${a.student.class}`,
                      parentName: a.student.parentName,
                      unpaidMonths: a.unpaidMonths,
                      totalTunggakan: a.totalTunggakan
                    });

                    return (
                      <tr key={a.student.id} className="hover:bg-amber-50/40">
                        <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {a.student.name}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          Kelas {a.student.class}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800">{a.student.parentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{a.student.parentPhone}</div>
                        </td>
                        <td className="py-2.5 px-3 text-amber-700 font-medium">
                          {a.unpaidMonths.join(', ')} ({a.unpaidCount} bln)
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-600 font-mono">
                          {formatRupiah(a.totalTunggakan)}
                        </td>
                        <td className="no-print py-2.5 px-3 text-center">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Kirim WA</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : reportType === 'bku' ? (
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Buku Kas Umum (BKU) - Mutasi Penerimaan & Pengeluaran Kas</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Uraian / Transaksi</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700">Debit (Masuk)</th>
                    <th className="py-2.5 px-3 text-right text-rose-700">Kredit (Keluar)</th>
                    <th className="py-2.5 px-3 text-right font-bold">Saldo Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    let runningSaldo = 0;
                    // Sort chronological
                    const sortedEntries = [...filteredCashflow].reverse();

                    return sortedEntries.map((c) => {
                      if (c.type === 'INCOME') {
                        runningSaldo += c.amount;
                      } else {
                        runningSaldo -= c.amount;
                      }

                      return (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-600 font-mono">
                            {formatDateIndo(c.date)}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            {c.description}
                            {c.referenceReceiptNo && (
                              <span className="text-[10px] text-slate-400 font-mono ml-1">
                                ({c.referenceReceiptNo})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {c.category}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                            {c.type === 'INCOME' ? formatRupiah(c.amount) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-700">
                            {c.type === 'EXPENSE' ? formatRupiah(c.amount) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatRupiah(runningSaldo)}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Daftar Transaksi Penerimaan SPP & Kas Sekolah</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">No. Kuitansi</th>
                    <th className="py-2.5 px-3">Tanggal Transaksi</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Kelas</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Metode</th>
                    <th className="py-2.5 px-3 text-right">Nominal</th>
                    <th className="no-print py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-700">
                        {p.receiptNo}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {formatDateTimeIndo(p.timestamp)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {p.studentName}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {p.studentClass}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {p.categoryLabel}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-950">
                        {formatRupiah(p.amount)}
                      </td>
                      <td className="no-print py-2.5 px-3 text-center">
                        <button
                          onClick={() => onViewReceipt(p)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold transition-colors"
                        >
                          Kuitansi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LEMBAR PENGESAHAN LAPORAN (PRINT & OFFICIAL SIGNATURES) */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-start text-xs">
          <div className="text-center w-56">
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-800">Kepala SMP IT Miftahul Huda 520</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900 border-t border-slate-400 pt-1">
              {school.headmaster || 'K.H. Ahmad Mudatsir, S.Pd.I'}
            </p>
            <p className="text-[10px] text-slate-400">NIP: 19780512 200501 1 004</p>
          </div>

          <div className="text-center w-56">
            <p className="text-slate-500">
              Karangpucung, {formatDateIndo(new Date().toISOString())}
            </p>
            <p className="font-bold text-slate-800">Bendahara / Petugas TU</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900 border-t border-slate-400 pt-1">
              {school.treasurer || 'Ustadzah Siti Munawarah, S.Pd'}
            </p>
            <p className="text-[10px] text-slate-400">NIP: 19840915 201001 2 018</p>
          </div>
        </div>
      </div>
    </div>
  );
};
