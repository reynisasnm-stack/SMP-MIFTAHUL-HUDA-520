import React, { useState } from 'react';
import { UserAuth, Student } from '../types';
import { ShieldCheck, User, Lock, Key, GraduationCap, X, ChevronRight, Check } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserAuth, token: string) => void;
  students: Student[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onLoginSuccess,
  students
}) => {
  const [role, setRole] = useState<'admin' | 'student'>('admin');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [studentNisn, setStudentNisn] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'admin',
          username: adminUsername,
          password: adminPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login gagal.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login sebagai admin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (nisnVal?: string) => {
    const targetNisn = nisnVal || studentNisn;
    if (!targetNisn) {
      setErrorMsg('Masukkan NISN / NIS siswa terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'student',
          nisn: targetNisn
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Data santri tidak ditemukan.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk ke portal siswa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStudentSelect = (nisn: string) => {
    setStudentNisn(nisn);
    handleStudentLogin(nisn);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">Masuk Akun SppGo</h2>
              <p className="text-xs text-emerald-200">
                SMP IT Miftahul Huda 520 Karangpucung
              </p>
            </div>
          </div>

          {/* Role Segmented Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-emerald-950/40 p-1.5 rounded-2xl border border-emerald-700/50">
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setErrorMsg('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'admin'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100/80 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Petugas TU / Bendahara</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('student');
                setErrorMsg('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'student'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100/80 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Siswa / Orang Tua</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {role === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username Petugas TU
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="admin atau bendahara"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Key className="w-4 h-4" />
                  <span>{isLoading ? 'Memverifikasi JWT...' : 'Masuk Sebagai Petugas TU'}</span>
                </button>
              </div>

              {/* 1-Click Demo Buttons */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block mb-2 text-center">
                  Akses Cepat Demo Penguji (1-Klik):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminUsername('admin');
                      setAdminPassword('admin123');
                      handleAdminLogin();
                    }}
                    className="p-2 border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-xl font-bold hover:bg-emerald-100 transition-colors text-center"
                  >
                    Petugas Kasir TU
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminUsername('bendahara');
                      setAdminPassword('spp520');
                      handleAdminLogin();
                    }}
                    className="p-2 border border-teal-200 bg-teal-50 text-teal-800 rounded-xl font-bold hover:bg-teal-100 transition-colors text-center"
                  >
                    Bendahara Sekolah
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Masukkan NISN atau NIS Santri
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={studentNisn}
                    onChange={(e) => setStudentNisn(e.target.value)}
                    placeholder="Contoh: 0112345601 atau 5202401"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleStudentLogin()}
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cek
                  </button>
                </div>
              </div>

              {/* Quick Pick from 41 Students */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Atau Pilih Contoh Siswa dari 41 Santri (Karangpucung):
                </label>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-slate-50/50">
                  {students.slice(0, 15).map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleQuickStudentSelect(s.nisn)}
                      className="p-2.5 hover:bg-emerald-50 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{s.name}</div>
                        <div className="text-[10px] text-slate-500">
                          Kelas {s.class} • NISN: {s.nisn} • Wali: {s.parentName}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
