export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateTimeIndo(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateStr;
  }
}

// Terbilang dalam Bahasa Indonesia (misal: 150000 -> Seratus Lima Puluh Ribu Rupiah)
export function terbilang(n: number): string {
  if (isNaN(n) || n === 0) return 'Nol Rupiah';

  const satuan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  function convert(val: number): string {
    if (val < 12) {
      return satuan[val];
    } else if (val < 20) {
      return convert(val - 10) + ' Belas';
    } else if (val < 100) {
      return convert(Math.floor(val / 10)) + ' Puluh ' + convert(val % 10);
    } else if (val < 200) {
      return 'Seratus ' + convert(val - 100);
    } else if (val < 1000) {
      return convert(Math.floor(val / 100)) + ' Ratus ' + convert(val % 100);
    } else if (val < 2000) {
      return 'Seribu ' + convert(val - 1000);
    } else if (val < 1000000) {
      return convert(Math.floor(val / 1000)) + ' Ribu ' + convert(val % 1000);
    } else if (val < 1000000000) {
      return convert(Math.floor(val / 1000000)) + ' Juta ' + convert(val % 1000000);
    } else if (val < 1000000000000) {
      return convert(Math.floor(val / 1000000000)) + ' Miliar ' + convert(val % 1000000000);
    }
    return '';
  }

  const result = convert(Math.floor(Math.abs(n))).replace(/\s+/g, ' ').trim();
  return `${result} Rupiah`;
}

// Clean CSV / Excel export with UTF-8 BOM so Excel opens with proper Indonesian formatting
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processCell = (val: string | number) => {
    let str = String(val ?? '');
    str = str.replace(/"/g, '""');
    if (str.search(/("|,|\n)/g) >= 0) {
      str = `"${str}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(processCell).join(';'),
    ...rows.map((row) => row.map(processCell).join(';'))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function cleanPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

export function createBillingWhatsAppLink(params: {
  phone: string;
  studentName: string;
  className: string;
  parentName: string;
  unpaidMonths: string[];
  totalTunggakan: number;
}): string {
  const phone = cleanPhoneForWhatsApp(params.phone);
  const monthListStr = params.unpaidMonths.length > 0 ? params.unpaidMonths.join(', ') : 'Oktober 2026';
  
  const message = `*PEMBERITAHUAN ADMINISTRASI SPP*\n` +
    `*SMP IT MIFTAHUL HUDA 520 KARANGPUCUNG*\n` +
    `_Jl. Pesantren Miftahul Huda No. 520, Karangpucung, Cilacap_\n\n` +
    `Kepada Yth. Wali Murid:\n` +
    `*${params.parentName}*\n` +
    `(Wali dari: ${params.studentName} - ${params.className})\n\n` +
    `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\n` +
    `Semoga Bapak/Ibu sekeluarga senantiasa dalam limpahan berkah dan kesehatan Allah SWT.\n\n` +
    `Kami sampaikan informasi tagihan iuran SPP ananda:\n` +
    `• Nama Siswa: *${params.studentName}*\n` +
    `• Kelas: *${params.className}*\n` +
    `• Bulan Belum Lunas: *${monthListStr}*\n` +
    `• Total Tagihan SPP: *${formatRupiah(params.totalTunggakan)}*\n\n` +
    `Pembayaran dapat dilakukan melalui:\n` +
    `1. Kasir / Tata Usaha (TU) SMP IT Miftahul Huda (Senin - Sabtu)\n` +
    `2. Transfer Bank BSI No. Rekening: *7152052026* an. *SMP IT MIFTAHUL HUDA 520*\n\n` +
    `Setelah melakukan pembayaran transfer, mohon konfirmasikan bukti transfer kepada kami.\n` +
    `Jazakumullah Khairan Katsiran.\n\n` +
    `Wassalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
    `_Hormat kami,_\n` +
    `*Tata Usaha & Keuangan SMP IT Miftahul Huda 520*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
