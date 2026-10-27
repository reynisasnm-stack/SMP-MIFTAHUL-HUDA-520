import React from 'react';
import { UserAuth, SchoolInfo } from '../types';
import { 
  GraduationCap, 
  ShieldCheck, 
  User, 
  LogOut, 
  PlusCircle, 
  Layers, 
  Users, 
  FileText, 
  Wallet,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  user: UserAuth;
  school: SchoolInfo;
  activeTab: 'dashboard' | 'students' | 'payments' | 'cashflow' | 'reports';
  onSelectTab: (tab: 'dashboard' | 'students' | 'payments' | 'cashflow' | 'reports') => void;
  onOpenPaymentModal: () => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  school,
  activeTab,
  onSelectTab,
  onOpenPaymentModal,
  onOpenLoginModal,
  onLogout
}) => {
  return (
    <header className="no-print bg-white border-b border-emerald-100 sticky top-0 z-40 shadow-xs">
      {/* Top Banner with School Identity */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white py-1.5 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-400/30">
              NPSN: {school.npsn || '69987654'}
            </span>
            <span className="text-emerald-100 font-semibold tracking-wide hidden sm:inline">
              {school.name || 'SMP IT MIFTAHUL HUDA 520 KARANGPUCUNG'}
            </span>
            <span className="text-emerald-200/80 text-[11px] hidden md:inline">
              • Karangpucung, Kab. Cilacap, Jawa Tengah
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-200/90 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Tahun Ajaran {school.academicYear || '2026/2027'} (Semester Ganjil)
            </span>
            <div className="bg-emerald-700/50 px-2 py-0.5 rounded text-[11px] text-emerald-100 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              <span>JWT Auth Aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
                  SppGo
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
                Sistem Keuangan & SPP SMP IT Miftahul Huda 520
              </p>
            </div>
          </div>

          {/* Navigation Links for Admin */}
          {user.role === 'admin' ? (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Ringkasan</span>
              </button>

              <button
                onClick={() => onSelectTab('students')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'students'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>41 Siswa</span>
              </button>

              <button
                onClick={() => onSelectTab('cashflow')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'cashflow'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Buku Kas & BKU</span>
              </button>

              <button
                onClick={() => onSelectTab('reports')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'reports'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Laporan Keuangan</span>
              </button>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-200/60 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Portal Mandiri Siswa & Wali Murid
              </span>
            </div>
          )}

          {/* Action buttons & User profile */}
          <div className="flex items-center gap-2.5">
            {user.role === 'admin' && (
              <button
                onClick={onOpenPaymentModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all hover:shadow-md hover:scale-[1.01]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Catat Bayar TU</span>
              </button>
            )}

            {/* User Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div 
                onClick={onOpenLoginModal}
                className="cursor-pointer group flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Klik untuk ganti peran atau login akun lain"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  user.role === 'admin'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {user.role === 'admin' ? 'TU' : 'SW'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-700">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {user.role === 'admin' ? 'Petugas TU / Bendahara' : `Siswa Kelas ${user.class || 'VII'}`}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Ganti Akun / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Bar for Admin */}
        {user.role === 'admin' && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto text-xs">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`py-1.5 px-2 font-medium rounded ${
                activeTab === 'dashboard' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'
              }`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => onSelectTab('students')}
              className={`py-1.5 px-2 font-medium rounded ${
                activeTab === 'students' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'
              }`}
            >
              41 Siswa
            </button>
            <button
              onClick={() => onSelectTab('cashflow')}
              className={`py-1.5 px-2 font-medium rounded ${
                activeTab === 'cashflow' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'
              }`}
            >
              Buku Kas
            </button>
            <button
              onClick={() => onSelectTab('reports')}
              className={`py-1.5 px-2 font-medium rounded ${
                activeTab === 'reports' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'
              }`}
            >
              Laporan
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
