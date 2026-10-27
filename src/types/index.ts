export interface SppMonthRecord {
  monthIndex: number;
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
  currentMonthStatus?: 'LUNAS' | 'BELUM_BAYAR';
  currentMonthName?: string;
  unpaidMonthsToDate?: number;
  totalTunggakan?: number;
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
  monthNames?: string[];
  amount: number;
  paymentMethod: 'Tunai / Kasir TU' | 'Transfer Bank' | 'QRIS' | 'Tabungan Siswa';
  officerName: string;
  timestamp: string;
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

export interface SchoolInfo {
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
  currentMonthIndex: number;
}

export interface UserAuth {
  id: string;
  role: 'admin' | 'student';
  name: string;
  title?: string;
  nis?: string;
  nisn?: string;
  class?: string;
  parentName?: string;
  monthlyFee?: number;
}
