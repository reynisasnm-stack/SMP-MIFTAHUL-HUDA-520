import React from 'react';
import { PaymentTransaction, SchoolInfo } from '../types';
import { formatRupiah, terbilang, formatDateTimeIndo, cleanPhoneForWhatsApp } from '../utils/formatters';
import { Printer, MessageCircle, X, CheckCircle, ShieldCheck, Building2 } from 'lucide-react';

interface ReceiptModalProps {
  payment: PaymentTransaction | null;
  school: SchoolInfo;
  onClose: () => void;
  parentPhone?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  school,
  onClose,
  parentPhone = '081327123001'
}) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const sendWhatsAppReceipt = () => {
    const phone = cleanPhoneForWhatsApp(parentPhone);
    const message = `*BUKTI PEMBAYARAN RESMI (KUITANSI DIGITAL)*\n` +
      `*SMP IT MIFTAHUL HUDA 520 KARANGPUCUNG*\n\n` +
      `No. Kuitansi : *${payment.receiptNo}*\n` +
      `Tanggal       : ${formatDateTimeIndo(payment.timestamp)}\n` +
      `Nama Siswa    : *${payment.studentName}*\n` +
      `NIS / Kelas   : ${payment.studentNis} (${payment.studentClass})\n` +
      `Pembayaran    : *${payment.categoryLabel}*\n` +
      `Jumlah        : *${formatRupiah(payment.amount)}*\n` +
      `Terbilang     : _${terbilang(payment.amount)}_\n` +
      `Metode        : ${payment.paymentMethod}\n` +
      `Status        : *LUNAS (SAH)*\n` +
      `Petugas TU    : ${payment.officerName}\n\n` +
      `Terima kasih atas pembayaran iuran sekolah. Semoga berkah dan bernilai ibadah. Aamiin.\n` +
      `_SMP IT Miftahul Huda 520 Karangpucung_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header bar (no-print) */}
        <div className="no-print bg-slate-800 text-white px-5 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold tracking-wide">Kuitansi Pembayaran Digital</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={sendWhatsAppReceipt}
              className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Kirim ke WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div className="p-6 sm:p-8 print-page bg-white text-slate-800">
          {/* KOP RESMI SEKOLAH */}
          <div className="border-b-2 border-double border-slate-900 pb-4 mb-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl shrink-0">
              <Building2 className="w-10 h-10 text-emerald-100" />
            </div>
            <div className="text-center flex-1">
              <h2 className="text-lg font-black tracking-wide text-emerald-950 uppercase">
                {school.name || 'SMP IT MIFTAHUL HUDA 520 KARANGPUCUNG'}
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                NPSN: {school.npsn || '69987654'} • Akreditasi B • Ijin Operasional Kemendikbud
              </p>
              <p className="text-[11px] text-slate-500">
                {school.address || 'Jl. Pesantren Miftahul Huda No. 520, Karangpucung, Cilacap, Jawa Tengah'}
              </p>
              <p className="text-[10px] text-slate-400">
                Telp: {school.phone || '(0280) 626520'} • Email: {school.email || 'smpit.miftahulhuda520@gmail.com'}
              </p>
            </div>
          </div>

          {/* JUDUL KUITANSI */}
          <div className="text-center mb-6">
            <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900 underline underline-offset-4">
              BUKTI PEMBAYARAN KAS / KUITANSI
            </h3>
            <div className="text-xs font-mono font-bold text-slate-600 mt-1">
              No. Bukti: <span className="text-emerald-800">{payment.receiptNo}</span>
            </div>
          </div>

          {/* TABEL DATA PEMBAYARAN */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
              <span className="col-span-4 text-slate-500 font-medium">Telah Terima Dari</span>
              <span className="col-span-8 font-bold text-slate-900">
                {payment.studentName}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
              <span className="col-span-4 text-slate-500 font-medium">NIS / NISN</span>
              <span className="col-span-8 font-mono text-slate-700">
                {payment.studentNis} / {payment.studentNisn}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
              <span className="col-span-4 text-slate-500 font-medium">Kelas / Tingkat</span>
              <span className="col-span-8 font-semibold text-slate-800">
                {payment.studentClass}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
              <span className="col-span-4 text-slate-500 font-medium">Untuk Pembayaran</span>
              <span className="col-span-8 font-bold text-emerald-900">
                {payment.categoryLabel}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
              <span className="col-span-4 text-slate-500 font-medium">Metode Pembayaran</span>
              <span className="col-span-8 font-medium text-slate-700">
                {payment.paymentMethod}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
              <span className="col-span-4 text-slate-500 font-medium">Tanggal Transaksi</span>
              <span className="col-span-8 text-slate-700">
                {formatDateTimeIndo(payment.timestamp)} WIB
              </span>
            </div>

            {payment.notes && (
              <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
                <span className="col-span-4 text-slate-500 font-medium">Catatan Tambahan</span>
                <span className="col-span-8 italic text-slate-600">
                  {payment.notes}
                </span>
              </div>
            )}

            {/* JUMLAH TERBILANG */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 my-3">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Terbilang
              </div>
              <div className="text-xs sm:text-sm font-semibold italic text-slate-800 mt-0.5">
                "{terbilang(payment.amount)}"
              </div>
            </div>

            {/* NOMINAL TOTAL BOX */}
            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Jumlah Dibayarkan
                </span>
                <div className="text-2xl font-black text-emerald-950 font-mono">
                  {formatRupiah(payment.amount)}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow-xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  LUNAS
                </span>
              </div>
            </div>
          </div>

          {/* TANDA TANGAN & STEMPEL RESMI */}
          <div className="mt-8 pt-4 flex justify-between items-end text-xs">
            <div className="text-center w-48">
              <p className="text-slate-500">Penyetor / Santri,</p>
              <div className="h-14"></div>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1">
                {payment.studentName}
              </p>
            </div>

            {/* Cap Digital */}
            <div className="relative border-2 border-dashed border-emerald-500/40 rounded-full w-24 h-24 flex flex-col items-center justify-center rotate-[-12deg] text-emerald-700 select-none opacity-85">
              <span className="text-[9px] font-extrabold uppercase">SMP IT MIFDA 520</span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">LUNAS</span>
              <span className="text-[8px] font-semibold">KARANGPUCUNG</span>
            </div>

            <div className="text-center w-52">
              <p className="text-slate-500">
                Karangpucung, {formatDateTimeIndo(payment.timestamp).split(',')[0]}
              </p>
              <p className="text-slate-500 font-medium">Petugas Kasir / TU,</p>
              <div className="h-12"></div>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1">
                {payment.officerName || 'Ustadzah Siti Munawarah, S.Pd'}
              </p>
            </div>
          </div>

          <div className="mt-6 text-[10px] text-center text-slate-400 italic border-t border-slate-100 pt-2">
            * Kuitansi ini dicetak secara sah oleh Sistem Manajemen Keuangan SppGo SMP IT Miftahul Huda 520 Karangpucung. Simpan bukti ini untuk arsip administrasi.
          </div>
        </div>

        {/* Footer (no-print) */}
        <div className="no-print bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kuitansi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
