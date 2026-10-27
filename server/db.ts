import fs from 'fs';
import path from 'path';

export interface SppMonthRecord {
  monthIndex: number; // 0 = Juli, 1 = Agustus, ..., 11 = Juni
  monthName: string;
  year: number;
  status: 'LUNAS' | 'BELUM_BAYAR';
  amount: number;
  paidAmount: number;
  paymentDate?: string;
  receiptNo?: string;
  paymentMethod?: 'Tunai / Kasir TU' | 'Transfer Bank' | 'QRIS' | 'Tabungan Siswa';
  notes?: string;
}

export interface StudentOtherFee {
  id: string;
  feeName: string;
  totalTarget: number;
  paidAmount: number;
  status: 'LUNAS' | 'SEBAGIAN' | 'BELUM_BAYAR';
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  class: 'VII' | 'VIII' | 'IX';
  academicYear: string;
  parentName: string;
  parentPhone: string;
  address: string;
  monthlyFee: number;
  sppMonths: SppMonthRecord[];
  otherFees: StudentOtherFee[];
  joinedDate: string;
}

export interface PaymentTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  studentNisn: string;
  studentClass: string;
  paymentCategory: 'SPP_BULANAN' | 'INFAQ_SUKARELA' | 'UANG_GEDUNG_DSP' | 'KITAB_BUKU' | 'KEGIATAN';
  categoryLabel: string;
  monthNames?: string[]; // e.g. ["Oktober 2026", "November 2026"]
  amount: number;
  paymentMethod: 'Tunai / Kasir TU' | 'Transfer Bank' | 'QRIS' | 'Tabungan Siswa';
  officerName: string;
  timestamp: string; // ISO String
  notes?: string;
}

export interface CashflowEntry {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amount: number;
  date: string;
  officerName: string;
  referenceReceiptNo?: string;
}

export interface AppDatabase {
  schoolInfo: {
    name: string;
    code: string;
    npsn: string;
    address: string;
    district: string;
    regency: string;
    phone: string;
    email: string;
    headmaster: string;
    treasurer: string;
    academicYear: string;
    currentMonthIndex: number; // 3 for Oktober in July-based calendar
  };
  students: Student[];
  payments: PaymentTransaction[];
  cashflow: CashflowEntry[];
}

const DATA_FILE_PATH = path.resolve(process.cwd(), 'server', 'data_spp.json');

const MONTH_NAMES_ACADEMIC = [
  'Juli', 'Agustus', 'September', 'Oktober',
  'November', 'Desember', 'Januari', 'Februari',
  'Maret', 'April', 'Mei', 'Juni'
];

function generateInitialStudents(): Student[] {
  // 41 students of SMP IT MIFTAHUL HUDA 520 KARANGPUCUNG
  const rawList = [
    // KELAS VII (14 Siswa)
    { nis: '5202401', nisn: '0112345601', name: 'Muhammad Alif Fathurrahman', gender: 'L' as const, class: 'VII' as const, parent: 'H. Suwarto', phone: '081327123001', address: 'Dusun Karanganyar, Karangpucung' },
    { nis: '5202402', nisn: '0112345602', name: 'Aisyah Putri Azzahra', gender: 'P' as const, class: 'VII' as const, parent: 'Bpk. Ahmad Sugito', phone: '081229874002', address: 'Desa Ciporos RT 02/04, Karangpucung' },
    { nis: '5202403', nisn: '0112345603', name: 'Ahmad Fauzi Ramadhan', gender: 'L' as const, class: 'VII' as const, parent: 'Bpk. Mulyono', phone: '085741235003', address: 'Dusun Tayem Barat, Karangpucung' },
    { nis: '5202404', nisn: '0112345604', name: 'Nabila Syifa Wardani', gender: 'P' as const, class: 'VII' as const, parent: 'Ibu Siti Khotimah', phone: '081391456004', address: 'Desa Tayem Timur, Karangpucung' },
    { nis: '5202405', nisn: '0112345605', name: 'Fatih Nur Hidayat', gender: 'L' as const, class: 'VII' as const, parent: 'Bpk. Dedi Supriyadi', phone: '082136789005', address: 'Desa Pamulihan, Karangpucung' },
    { nis: '5202406', nisn: '0112345606', name: 'Zahra Amalia Sholiha', gender: 'P' as const, class: 'VII' as const, parent: 'Bpk. Hendro Prayitno', phone: '085291234006', address: 'Desa Sindangbarang, Karangpucung' },
    { nis: '5202407', nisn: '0112345607', name: 'Bilal Malik Ibrahim', gender: 'L' as const, class: 'VII' as const, parent: 'Bpk. Karyo Sudarso', phone: '081228901007', address: 'Dusun Babakan, Karangpucung' },
    { nis: '5202408', nisn: '0112345608', name: 'Kayla Safira Ramadhani', gender: 'P' as const, class: 'VII' as const, parent: 'Ibu Nurhayati', phone: '085876543008', address: 'Dusun Cidadap, Karangpucung' },
    { nis: '5202409', nisn: '0112345609', name: 'Rizky Pratama Wijaya', gender: 'L' as const, class: 'VII' as const, parent: 'Bpk. Slamet Riyadi', phone: '081392876009', address: 'Dusun Bengbulang, Karangpucung' },
    { nis: '5202410', nisn: '0112345610', name: 'Salma Khairunnisa', gender: 'P' as const, class: 'VII' as const, parent: 'Bpk. Bambang Irawan', phone: '082245678010', address: 'Desa Karangpucung Krajan' },
    { nis: '5202411', nisn: '0112345611', name: 'Hamdan Syakir Arrasyid', gender: 'L' as const, class: 'VII' as const, parent: 'Bpk. Ustadz Munawir', phone: '085329871011', address: 'Kompleks Ponpes Miftahul Huda' },
    { nis: '5202412', nisn: '0112345612', name: 'Dina Maulida Hasanah', gender: 'P' as const, class: 'VII' as const, parent: 'Ibu Sri Wahyuni', phone: '081329124012', address: 'Dusun Pangawaren, Karangpucung' },
    { nis: '5202413', nisn: '0112345613', name: 'M. Dzaky Habiburrahman', gender: 'L' as const, class: 'VII' as const, parent: 'Bpk. Agus Santoso', phone: '081298456013', address: 'Desa Ciruyung, Karangpucung' },
    { nis: '5202414', nisn: '0112345614', name: 'Tsabita Nailatul Izzah', gender: 'P' as const, class: 'VII' as const, parent: 'Bpk. Teguh Wibowo', phone: '085712398014', address: 'Dusun Karanganyar, Karangpucung' },

    // KELAS VIII (14 Siswa)
    { nis: '5202301', nisn: '0102345615', name: 'Abdullah Azzam Mustofa', gender: 'L' as const, class: 'VIII' as const, parent: 'H. Mahmudin', phone: '081329456015', address: 'Desa Ciporos RT 01/02' },
    { nis: '5202302', nisn: '0102345616', name: 'Anindya Kirana Larasati', gender: 'P' as const, class: 'VIII' as const, parent: 'Bpk. Joko Purnomo', phone: '081299887016', address: 'Desa Tayem RT 04/01' },
    { nis: '5202303', nisn: '0102345617', name: 'Farhan Dwi Saputra', gender: 'L' as const, class: 'VIII' as const, parent: 'Bpk. Sukirman', phone: '085811223017', address: 'Dusun Babakan Karangpucung' },
    { nis: '5202304', nisn: '0102345618', name: 'Ghaida Nurul Ilmi', gender: 'P' as const, class: 'VIII' as const, parent: 'Bpk. Haryanto', phone: '082133445018', address: 'Desa Pamulihan' },
    { nis: '5202305', nisn: '0102345619', name: 'Habibie Daniswara', gender: 'L' as const, class: 'VIII' as const, parent: 'Ibu Rohimah', phone: '081344556019', address: 'Desa Sindangbarang' },
    { nis: '5202306', nisn: '0102345620', name: 'Intan Permata Sari', gender: 'P' as const, class: 'VIII' as const, parent: 'Bpk. Yudi Kurniawan', phone: '085277889020', address: 'Dusun Karanganyar RT 03' },
    { nis: '5202307', nisn: '0102345621', name: 'Khafidz Maulana Yusuf', gender: 'L' as const, class: 'VIII' as const, parent: 'Bpk. Kuswanto', phone: '081288776021', address: 'Desa Bengbulang' },
    { nis: '5202308', nisn: '0102345622', name: 'Laila Munawwaroh', gender: 'P' as const, class: 'VIII' as const, parent: 'Ibu Endang Suryati', phone: '085799881022', address: 'Desa Cidadap' },
    { nis: '5202309', nisn: '0102345623', name: 'Naufal Aditya Pratama', gender: 'L' as const, class: 'VIII' as const, parent: 'Bpk. Heri Siswanto', phone: '082266778023', address: 'Desa Ciporos RT 03' },
    { nis: '5202310', nisn: '0102345624', name: 'Raihana Qanita', gender: 'P' as const, class: 'VIII' as const, parent: 'Bpk. Syafruddin', phone: '081399001024', address: 'Karangpucung Kota' },
    { nis: '5202311', nisn: '0102345625', name: 'Salman Al-Farisi', gender: 'L' as const, class: 'VIII' as const, parent: 'Bpk. Basuki Rahmat', phone: '085355443025', address: 'Kompleks Pesantren Miftahul Huda' },
    { nis: '5202312', nisn: '0102345626', name: 'Syifa Nur Anggraini', gender: 'P' as const, class: 'VIII' as const, parent: 'Ibu Ratna Juwita', phone: '081211229026', address: 'Desa Tayem Timur' },
    { nis: '5202313', nisn: '0102345627', name: 'Wildan Mukhollad', gender: 'L' as const, class: 'VIII' as const, parent: 'Bpk. Gunawan', phone: '085733221027', address: 'Desa Pangawaren' },
    { nis: '5202314', nisn: '0102345628', name: 'Yasmin Maritza', gender: 'P' as const, class: 'VIII' as const, parent: 'Bpk. Anwar Sanusi', phone: '082177665028', address: 'Desa Pamulihan RT 05' },

    // KELAS IX (13 Siswa)
    { nis: '5202201', nisn: '0092345629', name: 'Aditya Bagus Nugroho', gender: 'L' as const, class: 'IX' as const, parent: 'Bpk. Wawan Setiawan', phone: '081399882029', address: 'Desa Ciporos RT 05/01' },
    { nis: '5202202', nisn: '0092345630', name: 'Balqis Humaira', gender: 'P' as const, class: 'IX' as const, parent: 'Bpk. Drs. H. Subagio', phone: '081233441030', address: 'Karangpucung Indah No. 12' },
    { nis: '5202203', nisn: '0092345631', name: 'Danial Ihsan Rabbani', gender: 'L' as const, class: 'IX' as const, parent: 'Bpk. Rudi Hartono', phone: '085811334031', address: 'Dusun Karanganyar' },
    { nis: '5202204', nisn: '0092345632', name: 'Fatimah Az-Zahra', gender: 'P' as const, class: 'IX' as const, parent: 'Ibu Maryamah', phone: '082144556032', address: 'Dusun Babakan Karangpucung' },
    { nis: '5202205', nisn: '0092345633', name: 'Irfan Hakim Maulana', gender: 'L' as const, class: 'IX' as const, parent: 'Bpk. Taufik Hidayat', phone: '081377889033', address: 'Desa Sindangbarang' },
    { nis: '5202206', nisn: '0092345634', name: 'Khansa Naura Mumtazah', gender: 'P' as const, class: 'IX' as const, parent: 'Bpk. Ir. Kusumo', phone: '085299001034', address: 'Desa Tayem' },
    { nis: '5202207', nisn: '0092345635', name: 'Lukman Hakim Assidiq', gender: 'L' as const, class: 'IX' as const, parent: 'Bpk. H. Masruri', phone: '081255667035', address: 'Desa Bengbulang' },
    { nis: '5202208', nisn: '0092345636', name: 'Maryam Qonitatun', gender: 'P' as const, class: 'IX' as const, parent: 'Ibu Siti Aminah', phone: '085788992036', address: 'Desa Cidadap' },
    { nis: '5202209', nisn: '0092345637', name: 'Rasyid Ridha', gender: 'L' as const, class: 'IX' as const, parent: 'Bpk. Ahmad Sobari', phone: '082233114037', address: 'Desa Ciporos RT 02' },
    { nis: '5202210', nisn: '0092345638', name: 'Safira Salsabila', gender: 'P' as const, class: 'IX' as const, parent: 'Bpk. Budi Darmawan', phone: '081366554038', address: 'Karangpucung Permai' },
    { nis: '5202211', nisn: '0092345639', name: 'Taufiqurrahman Al-Ghifari', gender: 'L' as const, class: 'IX' as const, parent: 'Bpk. H. Sukron', phone: '085311229039', address: 'Dusun Pangawaren' },
    { nis: '5202212', nisn: '0092345640', name: 'Zahratun Nisa', gender: 'P' as const, class: 'IX' as const, parent: 'Ibu Hj. Masitoh', phone: '081277663040', address: 'Desa Pamulihan' },
    { nis: '5202213', nisn: '0092345641', name: 'Zidan Al-Farizi', gender: 'L' as const, class: 'IX' as const, parent: 'Bpk. Joko Susilo', phone: '085844556041', address: 'Dusun Karanganyar RT 01' },
  ];

  // Year 2026/2027. Months: Juli 2026 to Juni 2027
  // Current month is Oktober 2026 (index 3).
  // Let's seed realistic payment status: most students paid Juli, Agustus, September, and a healthy portion paid Oktober, some have 1-2 months tunggakan.
  return rawList.map((st, i) => {
    const studentId = `std-${st.nis}`;
    const monthlyFee = 150000; // Rp 150.000 / bln

    // Patterns of payment so some are fully paid through Oktober, some owe Oktober, some owe Sept & Oct
    let paidUpToIndex = 3; // Juli, Aug, Sept, Okt lunas
    if (i % 5 === 0) {
      paidUpToIndex = 2; // Juli, Aug, Sept lunas. Okt belum lunas.
    } else if (i % 7 === 0) {
      paidUpToIndex = 1; // Juli, Aug lunas. Sept & Okt belum lunas.
    } else if (i === 13 || i === 27) {
      paidUpToIndex = 4; // Juli, Aug, Sept, Okt, Nov lunas (membayar lebih awal).
    }

    const sppMonths: SppMonthRecord[] = MONTH_NAMES_ACADEMIC.map((mName, mIdx) => {
      const year = mIdx <= 5 ? 2026 : 2027;
      const isPaid = mIdx <= paidUpToIndex;
      return {
        monthIndex: mIdx,
        monthName: `${mName} ${year}`,
        year,
        status: isPaid ? 'LUNAS' : 'BELUM_BAYAR',
        amount: monthlyFee,
        paidAmount: isPaid ? monthlyFee : 0,
        paymentDate: isPaid ? `2026-${String(mIdx + 7).padStart(2, '0')}-10 09:30:00` : undefined,
        receiptNo: isPaid ? `KW-SPP-2026${String(mIdx + 1).padStart(2, '0')}-${st.nis}` : undefined,
        paymentMethod: isPaid ? (mIdx % 3 === 0 ? 'Transfer Bank' : 'Tunai / Kasir TU') : undefined,
        notes: isPaid ? 'Pembayaran tepat waktu' : undefined
      };
    });

    const otherFees: StudentOtherFee[] = [
      {
        id: `fee-dsp-${st.nis}`,
        feeName: 'DSP / Uang Gedung & Pengembangan',
        totalTarget: 750000,
        paidAmount: i % 3 === 0 ? 750000 : 500000,
        status: i % 3 === 0 ? 'LUNAS' : 'SEBAGIAN'
      },
      {
        id: `fee-kitab-${st.nis}`,
        feeName: 'Paket Buku & Kitab Pesantren',
        totalTarget: 300000,
        paidAmount: 300000,
        status: 'LUNAS'
      },
      {
        id: `fee-infaq-${st.nis}`,
        feeName: 'Infaq Sarana Ibadah & Tahfidz',
        totalTarget: 100000,
        paidAmount: i % 2 === 0 ? 100000 : 50000,
        status: i % 2 === 0 ? 'LUNAS' : 'SEBAGIAN'
      }
    ];

    return {
      id: studentId,
      nis: st.nis,
      nisn: st.nisn,
      name: st.name,
      gender: st.gender,
      class: st.class,
      academicYear: '2026/2027',
      parentName: st.parent,
      parentPhone: st.phone,
      address: st.address,
      monthlyFee,
      sppMonths,
      otherFees,
      joinedDate: '2024-07-15'
    };
  });
}

function generateInitialPayments(students: Student[]): PaymentTransaction[] {
  const transactions: PaymentTransaction[] = [];
  let txCounter = 100;

  // Generate real recent transactions for September and October 2026
  students.forEach((st) => {
    // September transaction
    if (st.sppMonths[2].status === 'LUNAS') {
      txCounter++;
      transactions.push({
        id: `TX-202609-${txCounter}`,
        receiptNo: st.sppMonths[2].receiptNo || `KW-SPP-202609-${st.nis}`,
        studentId: st.id,
        studentName: st.name,
        studentNis: st.nis,
        studentNisn: st.nisn,
        studentClass: `Kelas ${st.class}`,
        paymentCategory: 'SPP_BULANAN',
        categoryLabel: 'Iuran Bulanan SPP',
        monthNames: ['September 2026'],
        amount: st.monthlyFee,
        paymentMethod: st.sppMonths[2].paymentMethod || 'Tunai / Kasir TU',
        officerName: 'Ustadzah Siti Munawarah, S.Pd (TU)',
        timestamp: '2026-09-08T09:15:00.000Z',
        notes: 'Lunas SPP September'
      });
    }

    // October transaction
    if (st.sppMonths[3].status === 'LUNAS') {
      txCounter++;
      transactions.push({
        id: `TX-202610-${txCounter}`,
        receiptNo: st.sppMonths[3].receiptNo || `KW-SPP-202610-${st.nis}`,
        studentId: st.id,
        studentName: st.name,
        studentNis: st.nis,
        studentNisn: st.nisn,
        studentClass: `Kelas ${st.class}`,
        paymentCategory: 'SPP_BULANAN',
        categoryLabel: 'Iuran Bulanan SPP',
        monthNames: ['Oktober 2026'],
        amount: st.monthlyFee,
        paymentMethod: st.sppMonths[3].paymentMethod || 'Tunai / Kasir TU',
        officerName: 'Ustadzah Siti Munawarah, S.Pd (TU)',
        timestamp: '2026-10-06T10:45:00.000Z',
        notes: 'Lunas SPP Oktober'
      });
    }
  });

  // Add some voluntary donations / Infaq Pembangunan
  transactions.push({
    id: 'TX-INFAQ-001',
    receiptNo: 'KW-INF-202610-01',
    studentId: 'std-5202401',
    studentName: 'Muhammad Alif Fathurrahman',
    studentNis: '5202401',
    studentNisn: '0112345601',
    studentClass: 'Kelas VII',
    paymentCategory: 'INFAQ_SUKARELA',
    categoryLabel: 'Infaq Sukarela Pembangunan Masjid Pesantren',
    amount: 250000,
    paymentMethod: 'Tunai / Kasir TU',
    officerName: 'Ustadzah Siti Munawarah, S.Pd (TU)',
    timestamp: '2026-10-12T11:20:00.000Z',
    notes: 'Infaq dari H. Suwarto untuk pembangunan sarana santri'
  });

  transactions.push({
    id: 'TX-INFAQ-002',
    receiptNo: 'KW-INF-202610-02',
    studentId: 'std-5202202',
    studentName: 'Balqis Humaira',
    studentNis: '5202202',
    studentNisn: '0092345630',
    studentClass: 'Kelas IX',
    paymentCategory: 'INFAQ_SUKARELA',
    categoryLabel: 'Sumbangan Sukarela Ekstrakurikuler Robotik & Tahfidz',
    amount: 200000,
    paymentMethod: 'Transfer Bank',
    officerName: 'Ustadzah Siti Munawarah, S.Pd (TU)',
    timestamp: '2026-10-15T08:30:00.000Z',
    notes: 'Sumbangan sukarela wali murid Bpk Drs. H. Subagio'
  });

  return transactions;
}

function generateInitialCashflow(payments: PaymentTransaction[]): CashflowEntry[] {
  const entries: CashflowEntry[] = [];

  // Transform some payments into income entries
  payments.slice(0, 15).forEach((p) => {
    entries.push({
      id: `CASH-IN-${p.id}`,
      type: 'INCOME',
      category: p.paymentCategory === 'INFAQ_SUKARELA' ? 'Infaq / Sumbangan Sukarela' : 'Penerimaan SPP Siswa',
      description: `${p.categoryLabel} an. ${p.studentName} (${p.studentClass})`,
      amount: p.amount,
      date: p.timestamp.split('T')[0],
      officerName: p.officerName,
      referenceReceiptNo: p.receiptNo
    });
  });

  // Operating Expenses
  entries.push(
    {
      id: 'EXP-202610-01',
      type: 'EXPENSE',
      category: 'Listrik & Utilitas',
      description: 'Pembayaran Token Listrik Gedung SMP IT & Pesantren Miftahul Huda',
      amount: 450000,
      date: '2026-10-03',
      officerName: 'Bendahara Sekolah'
    },
    {
      id: 'EXP-202610-02',
      type: 'EXPENSE',
      category: 'ATK & Fotokopi',
      description: 'Pengadaan Kertas HVS, Tinta Printer TU, dan Penggandaan Modul Santri',
      amount: 320000,
      date: '2026-10-07',
      officerName: 'Bendahara Sekolah'
    },
    {
      id: 'EXP-202610-03',
      type: 'EXPENSE',
      category: 'Kegiatan Santri',
      description: 'Konsumsi & Sertifikat Lomba Tahfidz Al-Qur\'an Juz 30 Antar Kelas',
      amount: 500000,
      date: '2026-10-14',
      officerName: 'Bendahara Sekolah'
    },
    {
      id: 'EXP-202610-04',
      type: 'EXPENSE',
      category: 'Internet & WiFi',
      description: 'Langganan Internet Fiber Optik untuk Lab Komputer dan Administrasi TU',
      amount: 350000,
      date: '2026-10-10',
      officerName: 'Bendahara Sekolah'
    }
  );

  return entries;
}

let dbInstance: AppDatabase | null = null;

export function getDatabase(): AppDatabase {
  if (dbInstance) {
    return dbInstance;
  }

  // Check if saved on disk
  if (fs.existsSync(DATA_FILE_PATH)) {
    try {
      const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      dbInstance = JSON.parse(data);
      if (dbInstance && dbInstance.students && dbInstance.students.length === 41) {
        return dbInstance;
      }
    } catch (e) {
      console.warn('Failed to parse existing data file, re-seeding default database', e);
    }
  }

  // Initial seeding
  const students = generateInitialStudents();
  const payments = generateInitialPayments(students);
  const cashflow = generateInitialCashflow(payments);

  dbInstance = {
    schoolInfo: {
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
    },
    students,
    payments,
    cashflow
  };

  saveDatabase(dbInstance);
  return dbInstance;
}

export function saveDatabase(data: AppDatabase) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to disk:', err);
  }
}
