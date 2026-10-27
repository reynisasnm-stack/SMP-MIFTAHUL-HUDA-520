import React, { useState } from 'react';
import { Student } from '../types';
import { formatRupiah, createBillingWhatsAppLink } from '../utils/formatters';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  MessageCircle, 
  Phone, 
  MapPin, 
  User, 
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface StudentsManagementProps {
  students: Student[];
  currentMonthName: string;
  onSelectStudent: (student: Student) => void;
  onOpenQuickPay: (student: Student) => void;
}

export const StudentsManagement: React.FC<StudentsManagementProps> = ({
  students,
  currentMonthName,
  onSelectStudent,
  onOpenQuickPay
}) => {
  const [classFilter, setClassFilter] = useState<'ALL' | 'VII' | 'VIII' | 'IX'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LUNAS' | 'BELUM_BAYAR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filtered = students.filter((s) => {
    if (classFilter !== 'ALL' && s.class !== classFilter) return false;
    if (statusFilter === 'LUNAS' && s.currentMonthStatus !== 'LUNAS') return false;
    if (statusFilter === 'BELUM_BAYAR' && s.currentMonthStatus === 'LUNAS') return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.nis.includes(q) ||
        s.nisn.includes(q) ||
        s.parentName.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAll = students.length; // 41
  const countLunas = students.filter((s) => s.currentMonthStatus === 'LUNAS').length;
  const countBelum = totalAll - countLunas;

  const countVII = students.filter((s) => s.class === 'VII').length; // 14
  const countVIII = students.filter((s) => s.class === 'VIII').length; // 14
  const countIX = students.filter((s) => s.class === 'IX').length; // 13

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Siswa Aktif</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalAll} Siswa</div>
          <div className="text-[11px] text-slate-500 mt-1">
            SMP IT Miftahul Huda 520 Karangpucung
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-1">
            <span className="text-xs font-medium">Lunas ({currentMonthName})</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{countLunas} Siswa</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {Math.round((countLunas / totalAll) * 100)}% Kepatuhan
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-1">
            <span className="text-xs font-medium">Belum Lunas ({currentMonthName})</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{countBelum} Siswa</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Siap dikirim pengingat WhatsApp
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-1">
            <span className="text-xs font-medium">Tarif Standar SPP</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">Rp 150.000</div>
          <div className="text-[11px] text-slate-500 mt-1">Per bulan / santri</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Class Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
            <button
              onClick={() => setClassFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                classFilter === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kelas ({totalAll})
            </button>
            <button
              onClick={() => setClassFilter('VII')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                classFilter === 'VII'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kelas VII ({countVII})
            </button>
            <button
              onClick={() => setClassFilter('VIII')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                classFilter === 'VIII'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kelas VIII ({countVIII})
            </button>
            <button
              onClick={() => setClassFilter('IX')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                classFilter === 'IX'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kelas IX ({countIX})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, NIS, wali..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Status Filter buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Status SPP ({currentMonthName}):</span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({totalAll})
          </button>
          <button
            onClick={() => setStatusFilter('LUNAS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              statusFilter === 'LUNAS'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Lunas ({countLunas})
          </button>
          <button
            onClick={() => setStatusFilter('BELUM_BAYAR')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              statusFilter === 'BELUM_BAYAR'
                ? 'bg-amber-600 text-white'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Belum Lunas ({countBelum})
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">NIS / NISN</th>
                <th className="py-3 px-4">Wali Murid</th>
                <th className="py-3 px-4 text-center">Status ({currentMonthName})</th>
                <th className="py-3 px-4 text-right">Tunggakan SPP</th>
                <th className="py-3 px-4 text-center">Aksi Petugas TU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((st, idx) => {
                const isLunas = st.currentMonthStatus === 'LUNAS';
                const unpaidMonths = st.sppMonths
                  .slice(0, 4)
                  .filter((m) => m.status !== 'LUNAS')
                  .map((m) => m.monthName);

                const waLink = createBillingWhatsAppLink({
                  phone: st.parentPhone,
                  studentName: st.name,
                  className: `Kelas ${st.class}`,
                  parentName: st.parentName,
                  unpaidMonths,
                  totalTunggakan: st.totalTunggakan || st.monthlyFee
                });

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div 
                        onClick={() => onSelectStudent(st)}
                        className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{st.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{st.address}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        Kelas {st.class}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div>{st.nis}</div>
                      <div className="text-[10px] text-slate-400">{st.nisn}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{st.parentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{st.parentPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                        isLunas
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isLunas ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            LUNAS
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            BELUM
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {st.totalTunggakan && st.totalTunggakan > 0 ? (
                        <div>
                          <div className="font-bold text-rose-600">
                            {formatRupiah(st.totalTunggakan)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {st.unpaidMonthsToDate} bulan
                          </div>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-semibold">Nihil (Lunas)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectStudent(st)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Lihat Kartu Kendali SPP"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenQuickPay(st)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                          title="Catat Pembayaran Masuk"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Bayar</span>
                        </button>

                        {!isLunas && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 p-1.5 rounded-lg transition-colors"
                            title="Kirim Tagihan Pengingat via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            Tidak ada siswa yang sesuai dengan kriteria pencarian.
          </div>
        )}
      </div>
    </div>
  );
};
