import {
  AllocationHistoryItem,
  AttendanceRecord,
  CartWorkspaceData,
  CentralStockItem,
  ExpenseRecord,
  IngredientStock,
  Product,
  ShiftState,
  StockRequest,
  Transaction,
  UserAccount,
} from '../types';

export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    id: 'owner-01',
    roleType: 'owner',
    name: 'Akun owner',
    firstName: 'Owner',
    role: 'Akses penuh',
    cartLabel: 'Pusat',
    cartCode: 'PUSAT',
    shortCartCode: 'PUSAT',
    email: 'owner@kkjexpress.id',
    username: 'owner.kkj',
    password: 'OwnerKKJ#2026',
    accountTypeLabel: 'Akun Owner (Manajemen Usaha)',
  },
  {
    id: 'rider-03',
    roleType: 'rider',
    name: 'Budi Santoso',
    firstName: 'Budi',
    role: 'Rider • Gerobak 03',
    cartLabel: 'Gerobak 03',
    cartCode: 'GEROBAK 03',
    shortCartCode: 'G-03',
    email: 'budi.rider03@kkjexpress.id',
    username: 'budi.gerobak03',
    password: 'KopiKKJ#03',
    accountTypeLabel: 'Akun Rider Utama (Gerobak 03)',
  },
  {
    id: 'rider-01',
    roleType: 'rider',
    name: 'Rina Kusuma',
    firstName: 'Rina',
    role: 'Rider • Gerobak 01',
    cartLabel: 'Gerobak 01',
    cartCode: 'GEROBAK 01',
    shortCartCode: 'G-01',
    email: 'rina.rider01@kkjexpress.id',
    username: 'rina.gerobak01',
    password: 'KopiKKJ#01',
    accountTypeLabel: 'Akun Rider Cadangan (Gerobak 01)',
  },
];

export const RIDER_ACCOUNTS = DEMO_ACCOUNTS.filter(
  (a) => a.roleType === 'rider',
);

export const OWNER_ACCOUNT = DEMO_ACCOUNTS[0];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'kopi-susu-gula-aren',
    code: 'KKJ-001',
    category: 'KOPI',
    name: 'Kopi Susu Gula Aren',
    description: 'Espresso, susu segar, dan gula aren.',
    price: 18000,
    active: true,
    recipe: { coffeeKg: 0.025, milkL: 0.18, palmSugarL: 0.06 },
  },
  {
    id: 'caffe-latte',
    code: 'KKJ-002',
    category: 'KOPI',
    name: 'Caffè Latte',
    description: 'Double shot espresso dengan steamed milk lembut.',
    price: 20000,
    active: true,
    recipe: { coffeeKg: 0.025, milkL: 0.2, palmSugarL: 0 },
  },
  {
    id: 'americano',
    code: 'KKJ-003',
    category: 'KOPI',
    name: 'Americano',
    description: 'Espresso khas KKJ dengan air mineral dingin atau panas.',
    price: 15000,
    active: true,
    recipe: { coffeeKg: 0.025, milkL: 0, palmSugarL: 0 },
  },
  {
    id: 'cappuccino',
    code: 'KKJ-004',
    category: 'KOPI',
    name: 'Cappuccino',
    description: 'Perpaduan seimbang espresso, susu segar, dan microfoam.',
    price: 20000,
    active: true,
    recipe: { coffeeKg: 0.025, milkL: 0.18, palmSugarL: 0 },
  },
  {
    id: 'chocolate',
    code: 'KKJ-005',
    category: 'NON-KOPI',
    name: 'Chocolate',
    description: 'Cokelat premium dengan susu segar dingin.',
    price: 18000,
    active: true,
    recipe: { coffeeKg: 0, milkL: 0.2, palmSugarL: 0.02 },
  },
  {
    id: 'matcha-latte',
    code: 'KKJ-006',
    category: 'NON-KOPI',
    name: 'Matcha Latte',
    description: 'Bubuk matcha pilihan dengan susu segar creamy.',
    price: 22000,
    active: true,
    recipe: { coffeeKg: 0, milkL: 0.2, palmSugarL: 0 },
  },
];

export function createZeroIngredients(): IngredientStock[] {
  return [
    {
      id: 'coffee',
      name: 'Biji kopi',
      unit: 'kg',
      remaining: 0,
      usedToday: 0,
      lowThreshold: 0.8,
      weeklyUsage: 0,
      tomorrowTarget: 2,
    },
    {
      id: 'milk',
      name: 'Susu segar',
      unit: 'liter',
      remaining: 0,
      usedToday: 0,
      lowThreshold: 1.5,
      weeklyUsage: 0,
      tomorrowTarget: 5,
    },
    {
      id: 'palmSugar',
      name: 'Gula aren',
      unit: 'liter',
      remaining: 0,
      usedToday: 0,
      lowThreshold: 0.7,
      weeklyUsage: 0,
      tomorrowTarget: 2,
    },
  ];
}

export function createZeroProductStocks(products: Product[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const p of products) {
    map[p.id] = 0;
  }
  return map;
}

export const INITIAL_SHIFT: ShiftState = {
  isActive: false,
  hasStartedToday: false,
  startDateIso: null,
  startTimeLabel: null,
  startTimestampMs: null,
  lastSyncedLabel: null,
  endedAtLabel: null,
};

export function createInitialCarts(
  products: Product[],
): Record<string, CartWorkspaceData> {
  return {
    'rider-03': {
      riderId: 'rider-03',
      cartCode: 'G-03',
      cartLabel: 'Gerobak 03',
      productStocks: createZeroProductStocks(products),
      cart: {},
      ingredients: createZeroIngredients(),
      movements: [],
      shift: { ...INITIAL_SHIFT },
    },
    'rider-01': {
      riderId: 'rider-01',
      cartCode: 'G-01',
      cartLabel: 'Gerobak 01',
      productStocks: createZeroProductStocks(products),
      cart: {},
      ingredients: createZeroIngredients(),
      movements: [],
      shift: { ...INITIAL_SHIFT },
    },
  };
}

export const INITIAL_CENTRAL_STOCK: CentralStockItem[] = [
  {
    id: 'coffee',
    name: 'Biji kopi',
    unit: 'kg',
    available: 15,
    minThreshold: 5,
  },
  {
    id: 'milk',
    name: 'Susu segar',
    unit: 'liter',
    available: 40,
    minThreshold: 15,
  },
  {
    id: 'palmSugar',
    name: 'Gula aren',
    unit: 'liter',
    available: 15,
    minThreshold: 5,
  },
  {
    id: 'cups',
    name: 'Kemasan cup',
    unit: 'pcs',
    available: 300,
    minThreshold: 100,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_EXPENSES: ExpenseRecord[] = [];
export const INITIAL_STOCK_REQUESTS: StockRequest[] = [];
export const INITIAL_ALLOCATION_HISTORY: AllocationHistoryItem[] = [];
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export function formatRupiah(amount: number): string {
  const safe = Math.round(amount);
  const abs = Math.abs(safe).toLocaleString('id-ID');
  return safe < 0 ? `-Rp${abs}` : `Rp${abs}`;
}

export function formatShortCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString('id-ID', {
      maximumFractionDigits: 2,
    })} jt`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)} rb`;
  }
  return `${amount}`;
}

export function formatInputDots(amount: number): string {
  if (!amount) return '';
  return Math.round(amount).toLocaleString('id-ID');
}

export function formatDecimalId(value: number, maxDecimals = 2): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString('id-ID', {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 1,
    maximumFractionDigits: maxDecimals,
  });
}

export function getNextTransactionId(
  transactions: Transaction[],
  cartPrefixNumber = '03',
): string {
  const prefix = cartPrefixNumber === '01' ? '01' : '03';
  let maxSeq = 0;
  for (const tx of transactions) {
    const match = tx.id.match(/^#KKJ-\d{2}(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSeq) maxSeq = num;
    }
  }
  const next = maxSeq + 1;
  const padded = String(next).padStart(2, '0');
  return `#KKJ-${prefix}${padded}`;
}

export function getTodayWibIsoDate(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parts.find((p) => p.type === 'year')?.value ?? '2026';
  const month = parts.find((p) => p.type === 'month')?.value ?? '11';
  const day = parts.find((p) => p.type === 'day')?.value ?? '25';
  return `${year}-${month}-${day}`;
}

export function addDaysIso(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return isoDate;
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays, 12, 0, 0));
  return dt.toISOString().slice(0, 10);
}

export function formatIndoDateLabel(
  isoDate: string,
  includeWeekday = false,
): string {
  if (!isoDate) return '-';
  const [y, m, d] = isoDate.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return isoDate;
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC',
    weekday: includeWeekday ? 'long' : undefined,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
}

export function formatShortIndoDate(
  isoDate: string,
  includeWeekday = false,
): string {
  if (!isoDate) return '-';
  const [y, m, d] = isoDate.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return isoDate;
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC',
    weekday: includeWeekday ? 'short' : undefined,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}

export function getCurrentWibTime(short = false): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return short ? `${hour}.${minute}` : `${hour}.${minute} WIB`;
}

export function getCurrentWibHourBucket(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '08';
  return `${hour}.00`;
}

export function formatDurationLabel(totalMinutes: number): string {
  const safe = Math.max(0, totalMinutes);
  const hrs = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hrs <= 0) return `${mins} m`;
  return `${hrs} j ${mins} m`;
}

export function formatDurationFull(totalMinutes: number): string {
  const safe = Math.max(0, totalMinutes);
  const hrs = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hrs <= 0) return `${mins} menit`;
  return `${hrs} jam ${mins} menit`;
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (cell: string | number) => {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((r) => r.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
