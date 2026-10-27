import React from 'react';
import { Student, PaymentTransaction, SchoolInfo } from '../types';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '../utils/formatters';
import { 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Calendar, 
  Download, 
  Receipt, 
  MessageCircle, 
  BookOpen, 
  Building2, 
  HeartHandshake,
  User,
  MapPin,
  Phone,
  Clock
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  paymentHistory: PaymentTransaction[];
  school: SchoolInfo;
  onViewReceipt: (payment: PaymentTransaction) => void;
  onOpenQuickPay?: (student: Student) => void;
  isAdmin?: boolean;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  paymentHistory,
  school,
  onViewReceipt,
  onOpenQuickPay,
  isAdmin = false
}) => {
  const currentMonthIdx = school.currentMonthIndex ?? 3; // 3 = Oktober
  const currentMonthRecord = student.sppMonths[currentMonthIdx];
  const isCurrentMonthPaid = currentMonthRecord?.status === 'LUNAS';

  const paidMonthsCount = student.sppMonths.filter((m) => m.status === 'LUNAS').length;
  const unpaidMonthsList = student.sppMonths
    .slice(0, currentMonthIdx + 1)
    .filter((m) => m.status !== 'LUNAS');
  
  const totalPaidSPP = paidMonthsCount * student.monthlyFee;
  const totalTunggakanSPP = unpaidMonthsList.length * student.monthlyFee;

  // WhatsApp confirmation text for parent
  const waContactText = encodeURIComponent(
    `Assalamu'alaikum Petugas TU SMP IT Miftahul Huda 520 Karangpucung, saya orang tua/wali dari ananda ${student.name} (Kelas ${student.class}), ingin konfirmasi perihal administrasi / pembayaran SPP.`
  );
  const waTuUrl = `https://wa.me/6281327123520?text=${waContactText}`;

  return (
    <div className="space-y-6">
      {/* Student Identity Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Building2 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-400/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                  Kelas {student.class}
                </span>
                <span className="text-emerald-200/80 text-xs font-medium">
                  NIS: {student.nis} • NISN: {student.nisn}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-white">
                {student.name}
              </h1>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-emerald-100/80 mt-1">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-300" />
                  Wali: {student.parentName}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  {student.address}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-300" />
                  {student.parentPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <a
              href={waTuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>Hubungi TU</span>
            </a>

            {isAdmin && onOpenQuickPay && (
              <button
                onClick={() => onOpenQuickPay(student)}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Catat Bayar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status SPP Bulan Berjalan Highlight */}
      <div className={`rounded-2xl p-6 border transition-all shadow-sm ${
        isCurrentMonthPaid 
          ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
          : 'bg-amber-50/80 border-amber-200/80 text-amber-950'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isCurrentMonthPaid ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              {isCurrentMonthPaid ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <AlertCircle className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold opacity-75">
                  Status Bulan Berjalan
                </span>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  isCurrentMonthPaid 
                    ? 'bg-emerald-200 text-emerald-800' 
                    : 'bg-amber-200 text-amber-800'
                }`}>
                  {isCurrentMonthPaid ? 'LUNAS' : 'BELUM LUNAS'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mt-0.5">
                {isCurrentMonthPaid 
                  ? `SPP Bulan ${currentMonthRecord?.monthName || 'Oktober 2026'} Sudah Lunas`
                  : `Tagihan SPP ${currentMonthRecord?.monthName || 'Oktober 2026'}: ${formatRupiah(student.monthlyFee)}`
                }
              </h2>
              <p className="text-xs opacity-80 mt-0.5">
                {isCurrentMonthPaid
                  ? `Dibayarkan pada ${formatDateIndo(currentMonthRecord?.paymentDate)} melalui ${currentMonthRecord?.paymentMethod || 'Kasir TU'}.`
                  : 'Batas akhir pembayaran iuran bulanan adalah tanggal 10 setiap bulannya.'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isCurrentMonthPaid ? (
              <button
                onClick={() => {
                  // Find transaction for this receipt
                  const tx = paymentHistory.find((p) => p.receiptNo === currentMonthRecord?.receiptNo) || {
                    id: 'temp-tx',
                    receiptNo: currentMonthRecord?.receiptNo || 'KW-SPP-CURRENT',
                    studentId: student.id,
                    studentName: student.name,
                    studentNis: student.nis,
                    studentNisn: student.nisn,
                    studentClass: `Kelas ${student.class}`,
                    paymentCategory: 'SPP_BULANAN',
                    categoryLabel: `Iuran SPP (${currentMonthRecord?.monthName})`,
                    monthNames: [currentMonthRecord?.monthName || 'Oktober 2026'],
                    amount: student.monthlyFee,
                    paymentMethod: currentMonthRecord?.paymentMethod || 'Tunai / Kasir TU',
                    officerName: 'Petugas TU SppGo',
                    timestamp: currentMonthRecord?.paymentDate || new Date().toISOString()
                  };
                  onViewReceipt(tx);
                }}
                className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Receipt className="w-4 h-4" />
                <span>Lihat Kuitansi</span>
              </button>
            ) : (
              <a
                href={waTuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Konfirmasi Pembayaran</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tarif SPP Bulanan</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900">
            {formatRupiah(student.monthlyFee)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Per bulan / santri</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">SPP Terbayar</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-700">
            {formatRupiah(totalPaidSPP)}
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-1 font-semibold">
            {paidMonthsCount} dari 12 Bulan Lunas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tunggakan SPP</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-rose-600">
            {formatRupiah(totalTunggakanSPP)}
          </div>
          <div className="text-[11px] text-rose-600/80 mt-1 font-semibold">
            {unpaidMonthsList.length > 0 ? `${unpaidMonthsList.length} bulan belum dibayar` : 'Tidak ada tunggakan'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Biaya DSP / Gedung</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900">
            {formatRupiah(student.otherFees[0]?.paidAmount || 0)}
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-1">
            Status: {student.otherFees[0]?.status || 'LUNAS'}
          </div>
        </div>
      </div>

      {/* Kartu Kendali SPP 12 Bulan (Juli s.d Juni) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Kartu Kendali SPP Siswa (Tahun Ajaran {student.academicYear})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pantauan pembayaran iuran bulanan santri selama 12 bulan (Juli s.d. Juni).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Lunas ({paidMonthsCount})
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Belum ({12 - paidMonthsCount})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {student.sppMonths.map((m) => {
            const isLunas = m.status === 'LUNAS';
            const isCurrent = m.monthIndex === currentMonthIdx;

            return (
              <div
                key={m.monthIndex}
                className={`relative rounded-xl p-3 border transition-all ${
                  isLunas
                    ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                    : isCurrent
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2 right-2 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                    Bulan Ini
                  </span>
                )}

                <div className="text-xs font-bold text-slate-800">
                  {m.monthName}
                </div>

                <div className="text-xs font-semibold text-slate-600 mt-1">
                  {formatRupiah(m.amount)}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isLunas 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isLunas ? 'LUNAS' : 'BELUM'}
                  </span>

                  {isLunas && (
                    <button
                      onClick={() => {
                        const tx = paymentHistory.find((p) => p.receiptNo === m.receiptNo) || {
                          id: `tx-m-${m.monthIndex}`,
                          receiptNo: m.receiptNo || `KW-SPP-${m.monthName}-${student.nis}`,
                          studentId: student.id,
                          studentName: student.name,
                          studentNis: student.nis,
                          studentNisn: student.nisn,
                          studentClass: `Kelas ${student.class}`,
                          paymentCategory: 'SPP_BULANAN',
                          categoryLabel: `Iuran SPP Bulan ${m.monthName}`,
                          monthNames: [m.monthName],
                          amount: m.amount,
                          paymentMethod: m.paymentMethod || 'Tunai / Kasir TU',
                          officerName: 'Petugas TU SppGo',
                          timestamp: m.paymentDate || '2026-10-01T08:00:00Z'
                        };
                        onViewReceipt(tx);
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline flex items-center gap-0.5"
                      title="Lihat Kuitansi"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>Nota</span>
                    </button>
                  )}
                </div>

                {isLunas && m.paymentDate && (
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    {formatDateIndo(m.paymentDate)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pos Biaya Lainnya (DSP / Kitab / Infaq Sukarela) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Iuran & Sumbangan Sarana Santri</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Rincian kewajiban pengembangan, seragam, dan buku kitab santri.
          </p>

          <div className="space-y-3">
            {student.otherFees.map((fee) => {
              const pct = Math.round((fee.paidAmount / fee.totalTarget) * 100);
              return (
                <div key={fee.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800">{fee.feeName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      fee.status === 'LUNAS' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {fee.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-600 mb-2">
                    <span>Terbayar: {formatRupiah(fee.paidAmount)}</span>
                    <span className="text-slate-400">Total: {formatRupiah(fee.totalTarget)}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Guide & Bank Account */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl p-6 border border-emerald-100 shadow-xs">
          <h3 className="text-base font-bold text-emerald-950 mb-1 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-700" />
            <span>Rekening & Saluran Pembayaran</span>
          </h3>
          <p className="text-xs text-emerald-800/80 mb-4">
            Pembayaran dapat disetor langsung ke Loket TU atau transfer ke rekening resmi madrasah.
          </p>

          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200/70 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">Bank Syariah Indonesia (BSI)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Utama
                </span>
              </div>
              <div className="text-lg font-mono font-bold text-emerald-700 mt-1 select-all">
                7152052026
              </div>
              <div className="text-[11px] text-slate-500">
                an. SMP IT MIFTAHUL HUDA 520 KARANGPUCUNG
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-emerald-200/70 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">Kasir / Tata Usaha (TU)</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                  Langsung
                </span>
              </div>
              <div className="text-xs font-medium text-slate-600 mt-1">
                Gedung Utama Lt. 1 SMP IT Miftahul Huda 520
              </div>
              <div className="text-[11px] text-slate-500">
                Jam Operasional: Senin - Sabtu (07.30 - 14.30 WIB)
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs">
            <span className="text-emerald-800">Butuh bantuan tata usaha?</span>
            <a
              href={waTuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp TU Karangpucung</span>
            </a>
          </div>
        </div>
      </div>

      {/* Riwayat Pembayaran Siswa */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>Riwayat Transaksi Pembayaran Siswa</span>
            </h3>
            <p className="text-xs text-slate-500">
              Daftar bukti setoran SPP dan sumbangan yang telah tercatat di sistem TU.
            </p>
          </div>
        </div>

        {paymentHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Belum ada riwayat transaksi pembayaran tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                  <th className="py-2.5 px-3 font-semibold">No. Kuitansi</th>
                  <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                  <th className="py-2.5 px-3 font-semibold">Kategori / Keterangan</th>
                  <th className="py-2.5 px-3 font-semibold">Metode</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Nominal</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentHistory.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-emerald-700">
                      {p.receiptNo}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {formatDateTimeIndo(p.timestamp)}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      <div>{p.categoryLabel}</div>
                      {p.notes && <div className="text-[11px] text-slate-400">{p.notes}</div>}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 text-right">
                      {formatRupiah(p.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onViewReceipt(p)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Kuitansi</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
