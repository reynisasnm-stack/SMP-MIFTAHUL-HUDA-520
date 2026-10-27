import React, { useState, useEffect } from 'react';
import { UserAuth, SchoolInfo, Student, PaymentTransaction, CashflowEntry } from './types';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentsManagement } from './components/StudentsManagement';
import { FinancialReports } from './components/FinancialReports';
import { CashflowView } from './components/CashflowView';
import { AdminPaymentEntryModal } from './components/AdminPaymentEntryModal';
import { ExpenseModal } from './components/ExpenseModal';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginModal } from './components/LoginModal';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from './utils/formatters';
import { 
  Users, 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [user, setUser] = useState<UserAuth>({
    id: 'admin-1',
    role: 'admin',
    name: 'Ustadzah Siti Munawarah, S.Pd',
    title: 'Petugas Tata Usaha & Bendahara'
  });
  const [jwtToken, setJwtToken] = useState<string>('');

  // App Data State
  const [school, setSchool] = useState<SchoolInfo>({
    name: 'SMP IT MIFTAHUL HUDA 520 KARANGPUCUNG',
    code: '520-KPC',
    npsn: '69987654',
    address: 'Jl. Pesantren Miftahul Huda No. 520, Karangpucung, Cilacap, Jawa Tengah 53255',
    district: 'Karangpucung',
    regency: 'Cilacap',
    phone: '(0280) 626520 / 0813-2712-3520',
    email: 'smpit.miftahulhuda520@gmail.com',
    headmaster: 'K.H. Ahmad Mudatsir, S.Pd.I',
    treasurer: 'Ustadzah Siti Munawarah, S.Pd',
    academicYear: '2026/2027',
    currentMonthIndex: 3 // Oktober
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [cashflow, setCashflow] = useState<CashflowEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'payments' | 'cashflow' | 'reports'>('dashboard');
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);

  // Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [quickPayStudent, setQuickPayStudent] = useState<Student | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<PaymentTransaction | null>(null);

  // Initial Data Load & Login Setup
  useEffect(() => {
    async function initData() {
      try {
        setIsLoading(true);

        // Auto authenticate as demo admin TU first to get initial JWT
        const authRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'admin',
            username: 'admin',
            password: 'admin123'
          })
        });

        if (authRes.ok) {
          const authData = await authRes.json();
          setJwtToken(authData.token);
          setUser(authData.user);
        }

        // Fetch School Info
        const schoolRes = await fetch('/api/school');
        if (schoolRes.ok) {
          const sData = await schoolRes.json();
          setSchool(sData);
        }

        // Fetch Students
        const stdRes = await fetch('/api/students');
        if (stdRes.ok) {
          const stdData = await stdRes.json();
          setStudents(stdData.students);
        }

        // Fetch Payments
        const payRes = await fetch('/api/payments');
        if (payRes.ok) {
          const payData = await payRes.json();
          setPayments(payData.payments);
        }

        // Fetch Cashflow
        const cashRes = await fetch('/api/cashflow');
        if (cashRes.ok) {
          const cashData = await cashRes.json();
          setCashflow(cashData.entries);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, []);

  // Refresh data helper
  const reloadData = async () => {
    try {
      const [stdRes, payRes, cashRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/payments'),
        fetch('/api/cashflow')
      ]);

      if (stdRes.ok) {
        const stdData = await stdRes.json();
        setStudents(stdData.students);

        // If viewing a student, update their reference too
        if (selectedStudentForView) {
          const updatedSelected = stdData.students.find((s: Student) => s.id === selectedStudentForView.id);
          if (updatedSelected) setSelectedStudentForView(updatedSelected);
        }
      }

      if (payRes.ok) {
        const payData = await payRes.json();
        setPayments(payData.payments);
      }

      if (cashRes.ok) {
        const cashData = await cashRes.json();
        setCashflow(cashData.entries);
      }
    } catch (e) {
      console.error('Failed to reload data:', e);
    }
  };

  // Payment Recording Success Callback
  const handlePaymentSuccess = (newPayment: PaymentTransaction, updatedStudent: Student) => {
    setIsPaymentModalOpen(false);
    setQuickPayStudent(null);
    setViewingReceipt(newPayment);

    // Update students state immediately
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );

    if (selectedStudentForView && selectedStudentForView.id === updatedStudent.id) {
      setSelectedStudentForView(updatedStudent);
    }

    // Append to payments
    setPayments((prev) => [newPayment, ...prev]);

    // Reload full cashflow to keep BKU synchronized
    reloadData();
  };

  // Expense Recording Success Callback
  const handleExpenseSuccess = (newExpense: CashflowEntry) => {
    setIsExpenseModalOpen(false);
    setCashflow((prev) => [newExpense, ...prev]);
    reloadData();
  };

  // User Login Callback
  const handleLoginSuccess = (newUser: UserAuth, token: string) => {
    setUser(newUser);
    setJwtToken(token);
    setIsLoginModalOpen(false);

    if (newUser.role === 'student') {
      const targetStd = students.find((s) => s.id === newUser.id || s.nisn === newUser.nisn);
      if (targetStd) {
        setSelectedStudentForView(targetStd);
      }
      setActiveTab('dashboard');
    } else {
      setSelectedStudentForView(null);
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoginModalOpen(true);
  };

  // Quick pay trigger from student list or card
  const handleOpenQuickPay = (st: Student) => {
    setQuickPayStudent(st);
    setIsPaymentModalOpen(true);
  };

  // Derived calculations for Admin Summary
  const currentMonthIdx = school.currentMonthIndex ?? 3; // 3 = Oktober
  const currentMonthName = 'Oktober 2026';
  const totalStudents = students.length; // 41
  const lunasCount = students.filter((s) => s.currentMonthStatus === 'LUNAS').length;
  const belumLunasCount = totalStudents - lunasCount;
  const totalIncomeAll = cashflow.filter((c) => c.type === 'INCOME').reduce((sum, c) => sum + c.amount, 0);
  const totalExpenseAll = cashflow.filter((c) => c.type === 'EXPENSE').reduce((sum, c) => sum + c.amount, 0);
  const currentBalance = totalIncomeAll - totalExpenseAll;

  // Active student for Student View
  const loggedInStudentData = user.role === 'student'
    ? students.find((s) => s.id === user.id || s.nisn === user.nisn) || selectedStudentForView || students[0]
    : selectedStudentForView;

  const currentStudentPayments = loggedInStudentData
    ? payments.filter((p) => p.studentId === loggedInStudentData.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-200">
      {/* Top Navbar */}
      <Navbar
        user={user}
        school={school}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setSelectedStudentForView(null);
          setActiveTab(tab);
        }}
        onOpenPaymentModal={() => {
          setQuickPayStudent(null);
          setIsPaymentModalOpen(true);
        }}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">
              Memuat data SppGo SMP IT Miftahul Huda 520...
            </p>
          </div>
        ) : user.role === 'student' || selectedStudentForView ? (
          /* =======================================================
             MODE 1: DASHBOARD SISWA / ORANG TUA
             ======================================================= */
          <div>
            {user.role === 'admin' && selectedStudentForView && (
              <div className="no-print mb-4 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-600 font-medium">
                  Sedang melihat Kartu SPP Siswa: <strong>{selectedStudentForView.name}</strong> ({selectedStudentForView.class})
                </span>
                <button
                  onClick={() => setSelectedStudentForView(null)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline"
                >
                  &larr; Kembali ke Daftar Siswa
                </button>
              </div>
            )}

            {loggedInStudentData && (
              <StudentDashboard
                student={loggedInStudentData}
                paymentHistory={currentStudentPayments}
                school={school}
                onViewReceipt={(p) => setViewingReceipt(p)}
                onOpenQuickPay={user.role === 'admin' ? handleOpenQuickPay : undefined}
                isAdmin={user.role === 'admin'}
              />
            )}
          </div>
        ) : (
          /* =======================================================
             MODE 2: ADMIN & BENDAHARA DASHBOARD
             ======================================================= */
          <div>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome Hero Banner */}
                <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-12">
                    <Building2 className="w-72 h-72 text-white" />
                  </div>

                  <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30 mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Sistem Manajemen Keuangan & SPP Karangpucung</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      SMP IT Miftahul Huda 520
                    </h1>
                    <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                      Selamat datang, <strong>{user.name}</strong>. Kelola administrasi 41 santri, pantau penerimaan kas bulanan, cetak kuitansi resmi, dan susun Buku Kas Umum secara otomatis dan transparan.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-6">
                      <button
                        onClick={() => {
                          setQuickPayStudent(null);
                          setIsPaymentModalOpen(true);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02]"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Catat Pembayaran Masuk</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('reports')}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-xs transition-all"
                      >
                        <FileText className="w-4 h-4 text-emerald-300" />
                        <span>Laporan & BKU</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('students')}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-xs transition-all"
                      >
                        <Users className="w-4 h-4 text-emerald-300" />
                        <span>Lihat 41 Siswa</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex justify-between items-center text-slate-500 mb-1">
                      <span className="text-xs font-semibold">Total Siswa Aktif</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {totalStudents} Siswa
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      VII (14), VIII (14), IX (13)
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex justify-between items-center text-slate-500 mb-1">
                      <span className="text-xs font-semibold">Lunas {currentMonthName}</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                      {lunasCount} <span className="text-sm font-medium text-slate-400">/ {totalStudents}</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                      {Math.round((lunasCount / totalStudents) * 100)}% Kepatuhan Bulan Ini
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex justify-between items-center text-slate-500 mb-1">
                      <span className="text-xs font-semibold">Belum Lunas {currentMonthName}</span>
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-600">
                      {belumLunasCount} Siswa
                    </div>
                    <div className="text-[11px] text-amber-600 font-medium mt-1">
                      Siap reminder WhatsApp
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex justify-between items-center text-slate-500 mb-1">
                      <span className="text-xs font-semibold">Saldo Kas Riil</span>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-teal-800 font-mono mt-1">
                      {formatRupiah(currentBalance)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Pemasukan - Pengeluaran BKU
                    </div>
                  </div>
                </div>

                {/* Quick Class Progress */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Progres Pembayaran SPP {currentMonthName} per Kelas
                      </h3>
                      <p className="text-xs text-slate-500">
                        Distribusi kelancaran iuran 41 santri SMP IT Miftahul Huda 520 Karangpucung
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('students')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>Lihat Semua Siswa</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['VII', 'VIII', 'IX'].map((cls) => {
                      const clsStudents = students.filter((s) => s.class === cls);
                      const clsPaid = clsStudents.filter((s) => s.currentMonthStatus === 'LUNAS').length;
                      const pct = Math.round((clsPaid / clsStudents.length) * 100);

                      return (
                        <div
                          key={cls}
                          onClick={() => setActiveTab('students')}
                          className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 cursor-pointer transition-all"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-xs text-slate-800">
                              Kelas {cls} ({clsStudents.length} Santri)
                            </span>
                            <span className="text-xs font-black text-emerald-700">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Lunas: {clsPaid} siswa</span>
                            <span className="text-amber-700 font-semibold">
                              Belum: {clsStudents.length - clsPaid} siswa
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transaksi Terkini Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        10 Transaksi Pembayaran Terakhir
                      </h3>
                      <p className="text-xs text-slate-500">
                        Penerimaan kas yang baru saja diverifikasi dan dicatat oleh petugas TU
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('reports')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>Semua Transaksi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                          <th className="py-2.5 px-3">No. Kuitansi</th>
                          <th className="py-2.5 px-3">Tanggal</th>
                          <th className="py-2.5 px-3">Nama Santri</th>
                          <th className="py-2.5 px-3">Kelas</th>
                          <th className="py-2.5 px-3">Kategori</th>
                          <th className="py-2.5 px-3">Metode</th>
                          <th className="py-2.5 px-3 text-right">Nominal</th>
                          <th className="py-2.5 px-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.slice(0, 8).map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-3 font-mono font-semibold text-emerald-700">
                              {p.receiptNo}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {formatDateTimeIndo(p.timestamp)}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-900">
                              {p.studentName}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {p.studentClass}
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-800">
                              {p.categoryLabel}
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                {p.paymentMethod}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                              {formatRupiah(p.amount)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => setViewingReceipt(p)}
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
              </div>
            )}

            {/* TAB: 41 SISWA MANAGEMENT */}
            {activeTab === 'students' && (
              <StudentsManagement
                students={students}
                currentMonthName={currentMonthName}
                onSelectStudent={(st) => setSelectedStudentForView(st)}
                onOpenQuickPay={handleOpenQuickPay}
              />
            )}

            {/* TAB: BUKU KAS UMUM (BKU) */}
            {activeTab === 'cashflow' && (
              <CashflowView
                cashflow={cashflow}
                onOpenPaymentModal={() => {
                  setQuickPayStudent(null);
                  setIsPaymentModalOpen(true);
                }}
                onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
              />
            )}

            {/* TAB: LAPORAN KEUANGAN */}
            {activeTab === 'reports' && (
              <FinancialReports
                school={school}
                payments={payments}
                cashflow={cashflow}
                students={students}
                onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                onViewReceipt={(p) => setViewingReceipt(p)}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer (no-print) */}
      <footer className="no-print mt-auto bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <strong>SppGo</strong> — Sistem Informasi Manajemen Pembayaran SPP & Keuangan Sekolah
          </div>
          <div>
            SMP IT MIFTAHUL HUDA 520 KARANGPUCUNG • 41 SISWA
          </div>
          <div className="text-[11px] text-slate-400">
            Karangpucung, Cilacap, Jawa Tengah
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {isPaymentModalOpen && (
        <AdminPaymentEntryModal
          students={students}
          preSelectedStudent={quickPayStudent}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setQuickPayStudent(null);
          }}
          onSuccess={handlePaymentSuccess}
          jwtToken={jwtToken}
        />
      )}

      {isExpenseModalOpen && (
        <ExpenseModal
          onClose={() => setIsExpenseModalOpen(false)}
          onSuccess={handleExpenseSuccess}
          jwtToken={jwtToken}
        />
      )}

      {viewingReceipt && (
        <ReceiptModal
          payment={viewingReceipt}
          school={school}
          onClose={() => setViewingReceipt(null)}
          parentPhone={
            students.find((s) => s.id === viewingReceipt.studentId)?.parentPhone || '081327123001'
          }
        />
      )}

      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          students={students}
        />
      )}
    </div>
  );
}
