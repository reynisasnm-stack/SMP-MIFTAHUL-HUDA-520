import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getDatabase, saveDatabase, Student, PaymentTransaction, CashflowEntry } from './server/db.ts';
import { generateToken, verifyToken, requireAdmin, AuthenticatedRequest } from './server/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize DB
  const db = getDatabase();

  // ----------------------------------------------------
  // AUTHENTICATION ROUTES (JWT)
  // ----------------------------------------------------

  // POST /api/auth/login
  app.post('/api/auth/login', (req, res) => {
    const { role, username, password, nisn } = req.body;

    if (role === 'admin') {
      // Petugas Tata Usaha / Bendahara
      // Accept admin/admin123 or bendahara/spp520
      const validAdmin =
        (username === 'admin' && (password === 'admin123' || password === 'admin')) ||
        (username === 'bendahara' && (password === 'spp520' || password === 'admin123')) ||
        (username === 'tu' && (password === 'tu520' || password === 'admin123'));

      if (!validAdmin) {
        return res.status(401).json({ error: 'Username atau kata sandi Petugas TU / Bendahara salah.' });
      }

      const token = generateToken({
        userId: 'admin-1',
        role: 'admin',
        name: username === 'bendahara' ? 'Ustadzah Siti Munawarah (Bendahara)' : 'Petugas TU SppGo'
      });

      return res.json({
        token,
        user: {
          id: 'admin-1',
          role: 'admin',
          name: username === 'bendahara' ? 'Ustadzah Siti Munawarah (Bendahara)' : 'Petugas TU SppGo',
          title: 'Petugas Tata Usaha & Keuangan'
        }
      });
    }

    if (role === 'student') {
      // Siswa / Orang Tua Login via NISN or NIS
      const queryNisn = (nisn || username || '').trim();
      if (!queryNisn) {
        return res.status(400).json({ error: 'Harap masukkan Nomor Induk Siswa Nasional (NISN) atau NIS.' });
      }

      const student = db.students.find(
        (s) => s.nisn === queryNisn || s.nis === queryNisn
      );

      if (!student) {
        return res.status(404).json({
          error: `Siswa dengan NISN/NIS "${queryNisn}" tidak ditemukan di database SMP IT Miftahul Huda 520 Karangpucung.`
        });
      }

      const token = generateToken({
        userId: student.id,
        role: 'student',
        name: student.name,
        nisn: student.nisn,
        classGroup: student.class
      });

      return res.json({
        token,
        user: {
          id: student.id,
          role: 'student',
          name: student.name,
          nis: student.nis,
          nisn: student.nisn,
          class: student.class,
          parentName: student.parentName,
          monthlyFee: student.monthlyFee
        }
      });
    }

    return res.status(400).json({ error: 'Pilihan role tidak valid.' });
  });

  // GET /api/auth/me (Verify JWT Token)
  app.get('/api/auth/me', verifyToken, (req: AuthenticatedRequest, res) => {
    if (req.user?.role === 'admin') {
      return res.json({
        user: {
          id: req.user.userId,
          role: 'admin',
          name: req.user.name,
          title: 'Petugas Tata Usaha & Keuangan'
        }
      });
    }

    // Student
    const student = db.students.find((s) => s.id === req.user?.userId);
    if (!student) {
      return res.status(404).json({ error: 'Data siswa tidak ditemukan.' });
    }

    return res.json({
      user: {
        id: student.id,
        role: 'student',
        name: student.name,
        nis: student.nis,
        nisn: student.nisn,
        class: student.class,
        parentName: student.parentName,
        monthlyFee: student.monthlyFee
      }
    });
  });

  // ----------------------------------------------------
  // SCHOOL PROFILE
  // ----------------------------------------------------
  app.get('/api/school', (_req, res) => {
    res.json(db.schoolInfo);
  });

  // ----------------------------------------------------
  // STUDENTS API
  // ----------------------------------------------------
  app.get('/api/students', (req, res) => {
    const { classFilter, statusFilter, search } = req.query;
    let list = [...db.students];

    if (classFilter && classFilter !== 'ALL') {
      list = list.filter((s) => s.class === classFilter);
    }

    const currentMonthIdx = db.schoolInfo.currentMonthIndex; // Oktober = 3

    if (statusFilter === 'LUNAS') {
      list = list.filter((s) => s.sppMonths[currentMonthIdx]?.status === 'LUNAS');
    } else if (statusFilter === 'BELUM_BAYAR') {
      list = list.filter((s) => s.sppMonths[currentMonthIdx]?.status !== 'LUNAS');
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nis.includes(q) ||
          s.nisn.includes(q) ||
          s.parentName.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
      );
    }

    // Enrich with current month status and unpaid count
    const enriched = list.map((s) => {
      const curMonth = s.sppMonths[currentMonthIdx];
      const unpaidCount = s.sppMonths
        .slice(0, currentMonthIdx + 1)
        .filter((m) => m.status !== 'LUNAS').length;
      return {
        ...s,
        currentMonthStatus: curMonth ? curMonth.status : 'BELUM_BAYAR',
        currentMonthName: curMonth ? curMonth.monthName : 'Oktober 2026',
        unpaidMonthsToDate: unpaidCount,
        totalTunggakan: unpaidCount * s.monthlyFee
      };
    });

    res.json({
      total: enriched.length,
      currentMonth: db.schoolInfo.currentMonthIndex,
      students: enriched
    });
  });

  app.get('/api/students/:id', (req, res) => {
    const student = db.students.find((s) => s.id === req.params.id || s.nis === req.params.id || s.nisn === req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Data siswa tidak ditemukan.' });
    }

    const currentMonthIdx = db.schoolInfo.currentMonthIndex;
    const unpaidCount = student.sppMonths
      .slice(0, currentMonthIdx + 1)
      .filter((m) => m.status !== 'LUNAS').length;

    // Fetch payment history for this student
    const history = db.payments.filter((p) => p.studentId === student.id);

    res.json({
      student: {
        ...student,
        currentMonthStatus: student.sppMonths[currentMonthIdx]?.status || 'BELUM_BAYAR',
        unpaidMonthsToDate: unpaidCount,
        totalTunggakan: unpaidCount * student.monthlyFee
      },
      paymentHistory: history
    });
  });

  // ----------------------------------------------------
  // PAYMENTS API (PENCATATAN KAS ADMIN & UPDATE STATUS SISWA)
  // ----------------------------------------------------
  app.get('/api/payments', (req, res) => {
    const { category, classFilter, search, startDate, endDate } = req.query;
    let list = [...db.payments];

    if (category && category !== 'ALL') {
      list = list.filter((p) => p.paymentCategory === category);
    }

    if (classFilter && classFilter !== 'ALL') {
      list = list.filter((p) => p.studentClass.includes(String(classFilter)));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.studentName.toLowerCase().includes(q) ||
          p.receiptNo.toLowerCase().includes(q) ||
          p.studentNis.includes(q)
      );
    }

    if (startDate && typeof startDate === 'string') {
      list = list.filter((p) => p.timestamp.split('T')[0] >= startDate);
    }

    if (endDate && typeof endDate === 'string') {
      list = list.filter((p) => p.timestamp.split('T')[0] <= endDate);
    }

    // Sort descending by timestamp
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      total: list.length,
      totalAmount: list.reduce((sum, p) => sum + p.amount, 0),
      payments: list
    });
  });

  // POST /api/payments - Catat Pembayaran Masuk oleh TU
  app.post('/api/payments', verifyToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    const {
      studentId,
      paymentCategory,
      monthIndices, // array of month indices for SPP e.g. [3] for Oktober
      amount,
      paymentMethod,
      notes,
      otherFeeId
    } = req.body;

    const student = db.students.find((s) => s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan.' });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ error: 'Jumlah pembayaran tidak valid.' });
    }

    const dateNow = new Date();
    const dateStr = dateNow.toISOString();
    const dateFormatted = `${dateNow.getFullYear()}${String(dateNow.getMonth() + 1).padStart(2, '0')}${String(dateNow.getDate()).padStart(2, '0')}`;
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const receiptNo = `KW-${paymentCategory === 'SPP_BULANAN' ? 'SPP' : 'KAS'}-${dateFormatted}-${student.nis}-${randomSeq}`;

    let categoryLabel = 'Iuran Bulanan SPP';
    const monthNamesList: string[] = [];

    // Automatic Status Update for Student
    if (paymentCategory === 'SPP_BULANAN') {
      if (!Array.isArray(monthIndices) || monthIndices.length === 0) {
        return res.status(400).json({ error: 'Pilih minimal satu bulan SPP yang akan dibayarkan.' });
      }

      monthIndices.forEach((mIdx: number) => {
        const monthRec = student.sppMonths.find((m) => m.monthIndex === Number(mIdx));
        if (monthRec) {
          monthRec.status = 'LUNAS';
          monthRec.paidAmount = monthRec.amount;
          monthRec.paymentDate = dateStr;
          monthRec.receiptNo = receiptNo;
          monthRec.paymentMethod = paymentMethod || 'Tunai / Kasir TU';
          monthRec.notes = notes || 'Pembayaran SPP';
          monthNamesList.push(monthRec.monthName);
        }
      });
      categoryLabel = `Iuran SPP (${monthNamesList.join(', ')})`;
    } else if (paymentCategory === 'INFAQ_SUKARELA') {
      categoryLabel = notes ? `Infaq Sukarela: ${notes}` : 'Infaq Sukarela / Pembangunan Pesantren';
    } else if (paymentCategory === 'UANG_GEDUNG_DSP') {
      categoryLabel = 'DSP / Uang Gedung & Pengembangan';
      if (otherFeeId) {
        const targetFee = student.otherFees.find((f) => f.id === otherFeeId || f.feeName.includes('DSP'));
        if (targetFee) {
          targetFee.paidAmount = Math.min(targetFee.totalTarget, targetFee.paidAmount + payAmount);
          targetFee.status = targetFee.paidAmount >= targetFee.totalTarget ? 'LUNAS' : 'SEBAGIAN';
        }
      }
    } else if (paymentCategory === 'KITAB_BUKU') {
      categoryLabel = 'Paket Buku & Kitab Pesantren';
      const targetFee = student.otherFees.find((f) => f.feeName.includes('Buku') || f.feeName.includes('Kitab'));
      if (targetFee) {
        targetFee.paidAmount = Math.min(targetFee.totalTarget, targetFee.paidAmount + payAmount);
        targetFee.status = targetFee.paidAmount >= targetFee.totalTarget ? 'LUNAS' : 'SEBAGIAN';
      }
    } else {
      categoryLabel = notes || 'Iuran Tambahan / Kegiatan Siswa';
    }

    const newPayment: PaymentTransaction = {
      id: `TX-${Date.now()}-${randomSeq}`,
      receiptNo,
      studentId: student.id,
      studentName: student.name,
      studentNis: student.nis,
      studentNisn: student.nisn,
      studentClass: `Kelas ${student.class}`,
      paymentCategory,
      categoryLabel,
      monthNames: monthNamesList.length > 0 ? monthNamesList : undefined,
      amount: payAmount,
      paymentMethod: paymentMethod || 'Tunai / Kasir TU',
      officerName: req.user?.name || 'Petugas TU SppGo',
      timestamp: dateStr,
      notes: notes || ''
    };

    db.payments.unshift(newPayment);

    // Record automatically in Cashflow Pemasukan
    const cashEntry: CashflowEntry = {
      id: `CASH-${Date.now()}`,
      type: 'INCOME',
      category: paymentCategory === 'INFAQ_SUKARELA' ? 'Infaq / Sumbangan Sukarela' : 'Penerimaan SPP & Biaya Siswa',
      description: `${categoryLabel} - Siswa: ${student.name} (${student.class})`,
      amount: payAmount,
      date: dateStr.split('T')[0],
      officerName: req.user?.name || 'Petugas TU SppGo',
      referenceReceiptNo: receiptNo
    };
    db.cashflow.unshift(cashEntry);

    // Save persistent
    saveDatabase(db);

    return res.status(201).json({
      message: 'Pembayaran berhasil dicatat dan status siswa otomatis diperbarui!',
      payment: newPayment,
      student
    });
  });

  // ----------------------------------------------------
  // CASHFLOW & BUKU KAS UMUM (BKU)
  // ----------------------------------------------------
  app.get('/api/cashflow', (_req, res) => {
    const totalIncome = db.cashflow
      .filter((c) => c.type === 'INCOME')
      .reduce((sum, c) => sum + c.amount, 0);

    const totalExpense = db.cashflow
      .filter((c) => c.type === 'EXPENSE')
      .reduce((sum, c) => sum + c.amount, 0);

    const balance = totalIncome - totalExpense;

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        balance
      },
      entries: db.cashflow
    });
  });

  // POST /api/cashflow/expense - Admin catat pengeluaran operasional
  app.post('/api/cashflow/expense', verifyToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    const { category, description, amount, date } = req.body;
    const numAmount = Number(amount);

    if (!description || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Data pengeluaran tidak valid.' });
    }

    const newExpense: CashflowEntry = {
      id: `EXP-${Date.now()}`,
      type: 'EXPENSE',
      category: category || 'Operasional Sekolah',
      description,
      amount: numAmount,
      date: date || new Date().toISOString().split('T')[0],
      officerName: req.user?.name || 'Bendahara Sekolah'
    };

    db.cashflow.unshift(newExpense);
    saveDatabase(db);

    res.status(201).json({
      message: 'Pengeluaran kas berhasil dicatat dalam Buku Kas Umum (BKU).',
      entry: newExpense
    });
  });

  // ----------------------------------------------------
  // LAPORAN KEUANGAN OTOMATIS (DAILY / MONTHLY / YEARLY)
  // ----------------------------------------------------
  app.get('/api/reports/recap', (req, res) => {
    const { period, month, year, classFilter } = req.query;

    const currentMonthIdx = db.schoolInfo.currentMonthIndex;
    const totalStudents = db.students.length; // 41 students
    const targetMonthlyFeePerStudent = 150000;
    const totalTargetMonthlySPP = totalStudents * targetMonthlyFeePerStudent; // 41 * 150.000 = 6.150.000

    // Filter payments
    let filteredPayments = [...db.payments];
    let filteredCashflow = [...db.cashflow];

    const todayDate = new Date().toISOString().split('T')[0];

    if (period === 'daily') {
      const selectedDate = (req.query.date as string) || todayDate;
      filteredPayments = filteredPayments.filter((p) => p.timestamp.startsWith(selectedDate));
      filteredCashflow = filteredCashflow.filter((c) => c.date === selectedDate);
    } else if (period === 'monthly') {
      const targetMonthStr = (month as string) || '10'; // default Oktober
      const targetYearStr = (year as string) || '2026';
      const prefix = `${targetYearStr}-${targetMonthStr.padStart(2, '0')}`;
      filteredPayments = filteredPayments.filter((p) => p.timestamp.startsWith(prefix));
      filteredCashflow = filteredCashflow.filter((c) => c.date.startsWith(prefix));
    }

    if (classFilter && classFilter !== 'ALL') {
      filteredPayments = filteredPayments.filter((p) => p.studentClass.includes(String(classFilter)));
    }

    // Breakdown per kelas
    const classBreakdown = ['VII', 'VIII', 'IX'].map((cls) => {
      const classStudents = db.students.filter((s) => s.class === cls);
      const paidThisMonthCount = classStudents.filter(
        (s) => s.sppMonths[currentMonthIdx]?.status === 'LUNAS'
      ).length;
      const unpaidThisMonthCount = classStudents.length - paidThisMonthCount;
      const collectedAmount = filteredPayments
        .filter((p) => p.studentClass.includes(`Kelas ${cls}`))
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        className: `Kelas ${cls}`,
        totalStudents: classStudents.length,
        paidCount: paidThisMonthCount,
        unpaidCount: unpaidThisMonthCount,
        collectionRate: Math.round((paidThisMonthCount / classStudents.length) * 100),
        collectedAmount
      };
    });

    // Breakdown per payment category
    const categoryTotals: Record<string, number> = {};
    filteredPayments.forEach((p) => {
      categoryTotals[p.paymentCategory] = (categoryTotals[p.paymentCategory] || 0) + p.amount;
    });

    const income = filteredCashflow
      .filter((c) => c.type === 'INCOME')
      .reduce((sum, c) => sum + c.amount, 0);

    const expense = filteredCashflow
      .filter((c) => c.type === 'EXPENSE')
      .reduce((sum, c) => sum + c.amount, 0);

    // List of students with arrears (tunggakan)
    const arrearsStudents = db.students
      .map((s) => {
        const unpaidMonths = s.sppMonths
          .slice(0, currentMonthIdx + 1)
          .filter((m) => m.status !== 'LUNAS');
        return {
          id: s.id,
          nis: s.nis,
          nisn: s.nisn,
          name: s.name,
          class: s.class,
          parentName: s.parentName,
          parentPhone: s.parentPhone,
          unpaidCount: unpaidMonths.length,
          unpaidMonthNames: unpaidMonths.map((m) => m.monthName),
          totalTunggakan: unpaidMonths.length * s.monthlyFee
        };
      })
      .filter((s) => s.unpaidCount > 0);

    res.json({
      school: db.schoolInfo,
      targetMonthlyFeePerStudent,
      totalStudents,
      totalTargetMonthlySPP,
      totalIncomePeriod: income,
      totalExpensePeriod: expense,
      netBalancePeriod: income - expense,
      classBreakdown,
      categoryTotals,
      arrearsCount: arrearsStudents.length,
      arrearsTotalAmount: arrearsStudents.reduce((sum, a) => sum + a.totalTunggakan, 0),
      arrearsList: arrearsStudents,
      paymentsCount: filteredPayments.length,
      payments: filteredPayments,
      cashflowEntries: filteredCashflow
    });
  });

  // ----------------------------------------------------
  // RESET DEMO DATA
  // ----------------------------------------------------
  app.post('/api/admin/reset-demo', verifyToken, requireAdmin, (_req, res) => {
    // Reset back to fresh seeded state
    const students = getDatabase().students;
    // Just refresh
    saveDatabase(db);
    res.json({ message: 'Data demo telah diperbarui!' });
  });

  // ----------------------------------------------------
  // VITE INTEGRATION
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SppGo Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SppGo Server] Fatal start error:', err);
  process.exit(1);
});
