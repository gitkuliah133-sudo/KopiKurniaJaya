export type TabId = 'beranda' | 'riwayat' | 'stok';

export type OwnerTabId =
  | 'dashboard'
  | 'laporan-penjualan'
  | 'pengeluaran'
  | 'transaksi'
  | 'keuangan'
  | 'produk'
  | 'alokasi-stok'
  | 'proyeksi-stok'
  | 'absensi';

export type AccountRoleType = 'rider' | 'owner';

export type PaymentMethod = 'Tunai' | 'QRIS';

export type ProductCategory = 'KOPI' | 'NON-KOPI';

export interface UserAccount {
  id: string;
  roleType: AccountRoleType;
  name: string;
  firstName: string;
  role: string;
  cartLabel: string;
  cartCode: string;
  shortCartCode: string; // e.g. 'G-03', 'G-01', 'PUSAT'
  email: string;
  username: string;
  password: string;
  accountTypeLabel: string;
}

export type RiderAccount = UserAccount;

export interface ProductRecipe {
  coffeeKg: number;
  milkL: number;
  palmSugarL: number;
}

export interface Product {
  id: string;
  code: string;
  category: ProductCategory;
  name: string;
  description: string;
  price: number;
  active: boolean;
  recipe: ProductRecipe;
}

export interface ProductWithStock extends Product {
  stock: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  category: ProductCategory;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  time: string;
  hourBucket: string; // e.g. '10.00'
  dateIso: string;
  dateLabel: string;
  riderId: string;
  riderName: string;
  cartCode: string; // e.g. 'G-03'
  totalCups: number;
  method: PaymentMethod;
  total: number;
  cashReceived?: number;
  change?: number;
  status: 'Berhasil' | 'Gagal';
  items: TransactionItem[];
}

export type IngredientId = 'coffee' | 'milk' | 'palmSugar';

export interface IngredientStock {
  id: IngredientId;
  name: string;
  unit: 'kg' | 'liter';
  remaining: number;
  usedToday: number;
  lowThreshold: number;
  weeklyUsage: number;
  tomorrowTarget: number;
}

export interface CentralStockItem {
  id: IngredientId | 'cups';
  name: string;
  unit: 'kg' | 'liter' | 'pcs';
  available: number;
  minThreshold: number;
}

export type StockMovementType = 'Penjualan' | 'Alokasi awal';

export interface StockMovement {
  id: string;
  time: string;
  dateIso: string;
  ingredientId: IngredientId;
  ingredientName: string;
  unit: 'kg' | 'liter';
  type: StockMovementType;
  delta: number;
  balance: number;
}

export interface ShiftState {
  isActive: boolean;
  hasStartedToday: boolean;
  startDateIso: string | null;
  startTimeLabel: string | null;
  startTimestampMs: number | null;
  lastSyncedLabel: string | null;
  endedAtLabel?: string | null;
}

export interface CartWorkspaceData {
  riderId: string;
  cartCode: string; // 'G-03' | 'G-01'
  cartLabel: string; // 'Gerobak 03' | 'Gerobak 01'
  productStocks: Record<string, number>;
  cart: Record<string, number>;
  ingredients: IngredientStock[];
  movements: StockMovement[];
  shift: ShiftState;
}

export type ExpenseCategory =
  | 'Bahan baku'
  | 'Operasional'
  | 'Transportasi'
  | 'Perawatan';

export type ExpensePaymentMethod = 'Tunai' | 'Transfer Bank' | 'QRIS';

export interface ExpenseRecord {
  id: string;
  dateIso: string;
  category: ExpenseCategory;
  name: string;
  amount: number;
  method: ExpensePaymentMethod;
  recordedBy: string;
  note?: string;
}

export type StockRequestStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

export interface StockRequest {
  id: string;
  riderId: string;
  riderName: string;
  cartCode: string; // 'G-03' | 'G-01'
  itemType: 'ingredient' | 'cups';
  ingredientId?: IngredientId;
  productId?: string;
  itemName: string;
  unit: 'kg' | 'liter' | 'cup';
  qty: number;
  requestedAtLabel: string;
  dateIso: string;
  status: StockRequestStatus;
  rejectionReason?: string;
}

export interface AllocationHistoryItem {
  id: string;
  processedAtLabel: string;
  dateIso: string;
  riderName: string;
  cartCode: string;
  itemSummary: string;
  status: 'Disetujui' | 'Ditolak';
  centralChangeLabel: string;
  cartChangeLabel: string;
  note: string;
}

export interface AttendanceRecord {
  id: string;
  riderId: string;
  riderName: string;
  cartCode: string;
  dateIso: string;
  startTimeLabel: string;
  endTimeLabel: string | null;
  startTimestampMs: number;
  endTimestampMs: number | null;
  durationMinutes: number;
  status: 'Berlangsung' | 'Selesai';
}
