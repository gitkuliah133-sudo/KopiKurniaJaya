import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { HomePOSView } from './components/HomePOSView';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { StockView } from './components/StockView';
import { TransactionsView } from './components/TransactionsView';
import { OwnerAllocationPage } from './components/owner/OwnerAllocationPage';
import { OwnerAttendancePage } from './components/owner/OwnerAttendancePage';
import { OwnerDashboardPage } from './components/owner/OwnerDashboardPage';
import { OwnerExpensesPage } from './components/owner/OwnerExpensesPage';
import { OwnerFinancePage } from './components/owner/OwnerFinancePage';
import { OwnerForecastPage } from './components/owner/OwnerForecastPage';
import { OwnerLayout } from './components/owner/OwnerLayout';
import {
  ExpenseModal,
  ProductModal,
  TransactionDetailModal,
} from './components/owner/OwnerModals';
import { OwnerProductsPage } from './components/owner/OwnerProductsPage';
import { OwnerSalesReportPage } from './components/owner/OwnerSalesReportPage';
import { OwnerTransactionsPage } from './components/owner/OwnerTransactionsPage';
import {
  createInitialCarts,
  DEMO_ACCOUNTS,
  formatDecimalId,
  formatIndoDateLabel,
  formatRupiah,
  getCurrentWibHourBucket,
  getCurrentWibTime,
  getNextTransactionId,
  getTodayWibIsoDate,
  INITIAL_ALLOCATION_HISTORY,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_CENTRAL_STOCK,
  INITIAL_EXPENSES,
  INITIAL_PRODUCTS,
  INITIAL_STOCK_REQUESTS,
  INITIAL_TRANSACTIONS,
  OWNER_ACCOUNT,
} from './data/mockData';
import {
  AllocationHistoryItem,
  AttendanceRecord,
  CartWorkspaceData,
  CentralStockItem,
  ExpenseRecord,
  IngredientId,
  OwnerTabId,
  PaymentMethod,
  Product,
  ProductCategory,
  ProductWithStock,
  StockMovement,
  StockRequest,
  TabId,
  Transaction,
  TransactionItem,
  UserAccount,
} from './types';

const STORAGE_KEY = 'kkj_express_unified_workspace_v3';
const REMEMBERED_ID_KEY = 'kkj_express_remembered_identifier';

interface UnifiedWorkspace {
  activeUserId: string | null;
  riderTab: TabId;
  ownerTab: OwnerTabId;
  products: Product[];
  carts: Record<string, CartWorkspaceData>;
  transactions: Transaction[];
  expenses: ExpenseRecord[];
  centralStock: CentralStockItem[];
  stockRequests: StockRequest[];
  allocationHistory: AllocationHistoryItem[];
  attendanceRecords: AttendanceRecord[];
  ownerLastSyncedLabel: string | null;
}

function getDefaultWorkspace(activeUserId: string | null = null): UnifiedWorkspace {
  const products = INITIAL_PRODUCTS.map((p) => ({
    ...p,
    recipe: { ...p.recipe },
  }));
  return {
    activeUserId,
    riderTab: 'beranda',
    ownerTab: 'dashboard',
    products,
    carts: createInitialCarts(products),
    transactions: INITIAL_TRANSACTIONS.map((t) => ({ ...t })),
    expenses: INITIAL_EXPENSES.map((e) => ({ ...e })),
    centralStock: INITIAL_CENTRAL_STOCK.map((c) => ({ ...c })),
    stockRequests: INITIAL_STOCK_REQUESTS.map((r) => ({ ...r })),
    allocationHistory: INITIAL_ALLOCATION_HISTORY.map((h) => ({ ...h })),
    attendanceRecords: INITIAL_ATTENDANCE_RECORDS.map((a) => ({ ...a })),
    ownerLastSyncedLabel: null,
  };
}

function loadWorkspace(): UnifiedWorkspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultWorkspace(null);
    const parsed = JSON.parse(raw) as Partial<UnifiedWorkspace>;
    if (!parsed || !Array.isArray(parsed.products) || !parsed.carts) {
      return getDefaultWorkspace(null);
    }
    const defaults = getDefaultWorkspace(null);
    return {
      ...defaults,
      ...parsed,
      products: parsed.products,
      carts: parsed.carts,
      transactions: parsed.transactions ?? [],
      expenses: parsed.expenses ?? [],
      centralStock: parsed.centralStock ?? defaults.centralStock,
      stockRequests: parsed.stockRequests ?? [],
      allocationHistory: parsed.allocationHistory ?? [],
      attendanceRecords: parsed.attendanceRecords ?? [],
    };
  } catch {
    return getDefaultWorkspace(null);
  }
}

export default function App() {
  const [workspace, setWorkspace] = useState<UnifiedWorkspace>(() =>
    loadWorkspace(),
  );
  const [rememberedIdentifier, setRememberedIdentifier] = useState<string>(
    () => {
      try {
        return localStorage.getItem(REMEMBERED_ID_KEY) ?? '';
      } catch {
        return '';
      }
    },
  );
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
  const [toast, setToast] = useState<{
    id: number;
    title: string;
    detail?: string;
  } | null>(null);

  // Owner modal states
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedTxModal, setSelectedTxModal] = useState<Transaction | null>(
    null,
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // Ignore storage quota errors
    }
  }, [workspace]);

  const activeUser: UserAccount | null = useMemo(() => {
    if (!workspace.activeUserId) return null;
    return (
      DEMO_ACCOUNTS.find((a) => a.id === workspace.activeUserId) ?? null
    );
  }, [workspace.activeUserId]);

  const activeRiderCart: CartWorkspaceData | null = useMemo(() => {
    if (!activeUser || activeUser.roleType !== 'rider') return null;
    return workspace.carts[activeUser.id] ?? null;
  }, [activeUser, workspace.carts]);

  useEffect(() => {
    const updateElapsed = () => {
      if (
        !activeRiderCart ||
        !activeRiderCart.shift.hasStartedToday ||
        !activeRiderCart.shift.startTimestampMs
      ) {
        setElapsedMinutes(0);
        return;
      }
      if (!activeRiderCart.shift.isActive) return;
      const diffMins = Math.floor(
        (Date.now() - activeRiderCart.shift.startTimestampMs) / 60000,
      );
      setElapsedMinutes(Math.max(0, diffMins));
    };
    updateElapsed();
    const timer = window.setInterval(updateElapsed, 30000);
    return () => window.clearInterval(timer);
  }, [activeRiderCart]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (title: string, detail?: string) => {
    setToast({ id: Date.now(), title, detail });
  };

  /* -------------------- Auth & Navigation -------------------- */
  const handleLogin = (account: UserAccount, rememberMe: boolean) => {
    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_ID_KEY, account.email);
        setRememberedIdentifier(account.email);
      } else {
        localStorage.removeItem(REMEMBERED_ID_KEY);
        setRememberedIdentifier('');
      }
    } catch {
      // Ignore storage errors
    }

    setWorkspace((prev) => ({
      ...prev,
      activeUserId: account.id,
      riderTab: 'beranda',
      ownerTab: 'dashboard',
    }));

    if (account.roleType === 'owner') {
      showToast('Masuk sebagai Owner', 'Akses penuh manajemen KKJ Express aktif.');
    } else {
      showToast(
        `Selamat datang, ${account.firstName}!`,
        'Klik Mulai operasional saat Anda siap memulai sesi hari ini.',
      );
    }
  };

  const handleSwitchAccount = (account: UserAccount) => {
    setWorkspace((prev) => ({
      ...prev,
      activeUserId: account.id,
      riderTab: 'beranda',
      ownerTab: 'dashboard',
    }));
    showToast(
      `Beralih ke ${account.name}`,
      account.roleType === 'owner'
        ? 'Membuka Dashboard Owner.'
        : `Aktif di ${account.cartLabel}.`,
    );
  };

  const handleLogout = () => {
    setWorkspace((prev) => ({
      ...prev,
      activeUserId: null,
    }));
  };

  const handleResetAllData = () => {
    const currentId = workspace.activeUserId;
    const fresh = getDefaultWorkspace(currentId);
    setWorkspace(fresh);
    setElapsedMinutes(0);
    showToast(
      'Data workspace direset',
      'Seluruh transaksi, stok gerobak, pengeluaran, dan absensi kembali ke 0.',
    );
  };

  /* -------------------- Rider POS & Shift Handlers -------------------- */
  const riderProductsWithStock: ProductWithStock[] = useMemo(() => {
    if (!activeRiderCart) return [];
    return workspace.products
      .filter((p) => p.active)
      .map((p) => ({
        ...p,
        stock: activeRiderCart.productStocks[p.id] ?? 0,
      }));
  }, [workspace.products, activeRiderCart]);

  const riderTransactions = useMemo(() => {
    if (!activeUser || activeUser.roleType !== 'rider') return [];
    return workspace.transactions.filter((tx) => tx.riderId === activeUser.id);
  }, [workspace.transactions, activeUser]);

  const nextOrderId = useMemo(() => {
    const cartNum = activeUser?.id === 'rider-01' ? '01' : '03';
    return getNextTransactionId(riderTransactions, cartNum);
  }, [riderTransactions, activeUser]);

  const handleUpdateCartQty = (productId: string, delta: number) => {
    if (!activeUser || activeUser.roleType !== 'rider') return;
    setWorkspace((prev) => {
      const cartData = prev.carts[activeUser.id];
      if (!cartData) return prev;
      const available = cartData.productStocks[productId] ?? 0;
      const currentQty = cartData.cart[productId] ?? 0;
      const nextQty = Math.max(0, Math.min(available, currentQty + delta));
      const nextCart = { ...cartData.cart };
      if (nextQty === 0) {
        delete nextCart[productId];
      } else {
        nextCart[productId] = nextQty;
      }

      return {
        ...prev,
        carts: {
          ...prev.carts,
          [activeUser.id]: {
            ...cartData,
            cart: nextCart,
          },
        },
      };
    });
  };

  const handleResetCart = () => {
    if (!activeUser || activeUser.roleType !== 'rider') return;
    setWorkspace((prev) => {
      const cartData = prev.carts[activeUser.id];
      if (!cartData) return prev;
      return {
        ...prev,
        carts: {
          ...prev.carts,
          [activeUser.id]: {
            ...cartData,
            cart: {},
          },
        },
      };
    });
  };

  const handleCompletePayment = (
    method: PaymentMethod,
    cashReceived?: number,
  ) => {
    if (!activeUser || activeUser.roleType !== 'rider') return;
    const timeWib = getCurrentWibTime(false);
    const timeShort = getCurrentWibTime(true);
    const hourBucket = getCurrentWibHourBucket();
    const todayIso = getTodayWibIsoDate();
    const todayLabel = formatIndoDateLabel(todayIso);

    setWorkspace((prev) => {
      const cartData = prev.carts[activeUser.id];
      if (!cartData) return prev;

      const orderItems: TransactionItem[] = [];
      let total = 0;
      let totalCups = 0;
      let coffeeUsed = 0;
      let milkUsed = 0;
      let palmSugarUsed = 0;

      const nextProductStocks = { ...cartData.productStocks };

      for (const product of prev.products) {
        const qty = cartData.cart[product.id] ?? 0;
        if (qty <= 0) continue;

        const subtotal = qty * product.price;
        total += subtotal;
        totalCups += qty;

        coffeeUsed += qty * product.recipe.coffeeKg;
        milkUsed += qty * product.recipe.milkL;
        palmSugarUsed += qty * product.recipe.palmSugarL;

        orderItems.push({
          productId: product.id,
          name: product.name,
          category: product.category,
          qty,
          unitPrice: product.price,
          subtotal,
        });

        nextProductStocks[product.id] = Math.max(
          0,
          (nextProductStocks[product.id] ?? 0) - qty,
        );
      }

      if (orderItems.length === 0) return prev;

      const cartNum = activeUser.id === 'rider-01' ? '01' : '03';
      const riderTxList = prev.transactions.filter(
        (t) => t.riderId === activeUser.id,
      );
      const txId = getNextTransactionId(riderTxList, cartNum);
      const change =
        method === 'Tunai' && cashReceived !== undefined
          ? Math.max(0, cashReceived - total)
          : undefined;

      const newTx: Transaction = {
        id: txId,
        time: timeWib,
        hourBucket,
        dateIso: todayIso,
        dateLabel: todayLabel,
        riderId: activeUser.id,
        riderName: activeUser.name,
        cartCode: activeUser.shortCartCode,
        totalCups,
        method,
        total,
        cashReceived: method === 'Tunai' ? cashReceived : undefined,
        change,
        status: 'Berhasil',
        items: orderItems,
      };

      const usageMap: Record<IngredientId, number> = {
        coffee: Math.round(coffeeUsed * 1000) / 1000,
        milk: Math.round(milkUsed * 1000) / 1000,
        palmSugar: Math.round(palmSugarUsed * 1000) / 1000,
      };

      const newMovements: StockMovement[] = [];
      const updatedIngredients = cartData.ingredients.map((ing) => {
        const deltaUsed = usageMap[ing.id] ?? 0;
        if (deltaUsed <= 0) return ing;

        const nextRemaining = Math.max(
          0,
          Math.round((ing.remaining - deltaUsed) * 100) / 100,
        );
        const nextUsedToday =
          Math.round((ing.usedToday + deltaUsed) * 100) / 100;

        newMovements.push({
          id: `mov-${Date.now()}-${ing.id}`,
          time: timeShort,
          dateIso: todayIso,
          ingredientId: ing.id,
          ingredientName: ing.name,
          unit: ing.unit,
          type: 'Penjualan',
          delta: -Math.round(deltaUsed * 100) / 100,
          balance: nextRemaining,
        });

        return {
          ...ing,
          remaining: nextRemaining,
          usedToday: nextUsedToday,
        };
      });

      const detailParts = [
        `${totalCups} cup`,
        formatRupiah(total),
        method === 'Tunai' && change !== undefined
          ? `Kembalian ${formatRupiah(change)}`
          : 'QRIS terkonfirmasi',
      ];
      showToast(`Transaksi ${txId} berhasil!`, detailParts.join(' • '));

      return {
        ...prev,
        transactions: [newTx, ...prev.transactions],
        ownerLastSyncedLabel: timeWib,
        carts: {
          ...prev.carts,
          [activeUser.id]: {
            ...cartData,
            productStocks: nextProductStocks,
            cart: {},
            ingredients: updatedIngredients,
            movements: [...newMovements, ...cartData.movements],
            shift: {
              ...cartData.shift,
              lastSyncedLabel: timeWib,
            },
          },
        },
      };
    });
  };

  const handleStartShift = () => {
    if (!activeUser || activeUser.roleType !== 'rider') return;
    const nowTime = getCurrentWibTime(false);
    const shortTime = getCurrentWibTime(true);
    const todayIso = getTodayWibIsoDate();

    setWorkspace((prev) => {
      const cartData = prev.carts[activeUser.id];
      if (!cartData) return prev;

      const isFirstStartToday =
        !cartData.shift.hasStartedToday ||
        cartData.shift.startDateIso !== todayIso;

      const startTimeLabel = isFirstStartToday
        ? nowTime
        : cartData.shift.startTimeLabel ?? nowTime;
      const startTimestampMs = isFirstStartToday
        ? Date.now()
        : cartData.shift.startTimestampMs ?? Date.now();

      // Sync AttendanceRecord for Owner Dashboard
      let nextAttendance = [...prev.attendanceRecords];
      const existingTodayIdx = nextAttendance.findIndex(
        (a) => a.riderId === activeUser.id && a.dateIso === todayIso,
      );
      if (existingTodayIdx === -1) {
        const newAtt: AttendanceRecord = {
          id: `att-${Date.now()}-${activeUser.id}`,
          riderId: activeUser.id,
          riderName: activeUser.name,
          cartCode: activeUser.shortCartCode,
          dateIso: todayIso,
          startTimeLabel: shortTime,
          endTimeLabel: null,
          startTimestampMs,
          endTimestampMs: null,
          durationMinutes: 0,
          status: 'Berlangsung',
        };
        nextAttendance = [newAtt, ...nextAttendance];
      } else {
        const existing = nextAttendance[existingTodayIdx];
        nextAttendance[existingTodayIdx] = {
          ...existing,
          endTimeLabel: null,
          endTimestampMs: null,
          status: 'Berlangsung',
        };
      }

      showToast(
        isFirstStartToday
          ? 'Operasional dimulai'
          : 'Operasional dilanjutkan',
        isFirstStartToday
          ? `Jam mulai kerja hari ini tercatat pukul ${startTimeLabel}.`
          : `Melanjutkan sesi sejak ${startTimeLabel}.`,
      );

      return {
        ...prev,
        attendanceRecords: nextAttendance,
        ownerLastSyncedLabel: nowTime,
        carts: {
          ...prev.carts,
          [activeUser.id]: {
            ...cartData,
            shift: {
              isActive: true,
              hasStartedToday: true,
              startDateIso: todayIso,
              startTimeLabel,
              startTimestampMs,
              endedAtLabel: null,
              lastSyncedLabel: nowTime,
            },
          },
        },
      };
    });
  };

  const handleEndShift = () => {
    if (!activeUser || activeUser.roleType !== 'rider') return;
    const endedTime = getCurrentWibTime(false);
    const shortEndTime = getCurrentWibTime(true);
    const todayIso = getTodayWibIsoDate();

    setWorkspace((prev) => {
      const cartData = prev.carts[activeUser.id];
      if (!cartData) return prev;

      const nextAttendance = prev.attendanceRecords.map((a) => {
        if (a.riderId === activeUser.id && a.dateIso === todayIso) {
          const endMs = Date.now();
          const durationMinutes = Math.max(
            1,
            Math.floor((endMs - a.startTimestampMs) / 60000),
          );
          return {
            ...a,
            endTimeLabel: shortEndTime,
            endTimestampMs: endMs,
            durationMinutes,
            status: 'Selesai' as const,
          };
        }
        return a;
      });

      showToast(
        'Operasional shift diakhiri',
        `Rekap penjualan tersimpan hingga pukul ${endedTime}.`,
      );

      return {
        ...prev,
        attendanceRecords: nextAttendance,
        ownerLastSyncedLabel: endedTime,
        carts: {
          ...prev.carts,
          [activeUser.id]: {
            ...cartData,
            shift: {
              ...cartData.shift,
              isActive: false,
              endedAtLabel: endedTime,
              lastSyncedLabel: endedTime,
            },
          },
        },
      };
    });
  };

  const handleSubmitStockRequest = (payload: {
    itemType: 'ingredient' | 'cups';
    ingredientId?: IngredientId;
    productId?: string;
    itemName: string;
    unit: 'kg' | 'liter' | 'cup';
    qty: number;
  }) => {
    if (!activeUser || activeUser.roleType !== 'rider') return;
    const nowTime = getCurrentWibTime(false);
    const todayIso = getTodayWibIsoDate();

    setWorkspace((prev) => {
      const seq = String(prev.stockRequests.length + 1).padStart(3, '0');
      const newReq: StockRequest = {
        id: `#REQ-${seq}`,
        riderId: activeUser.id,
        riderName: activeUser.name,
        cartCode: activeUser.shortCartCode,
        itemType: payload.itemType,
        ingredientId: payload.ingredientId,
        productId: payload.productId,
        itemName: payload.itemName,
        unit: payload.unit,
        qty: payload.qty,
        requestedAtLabel: nowTime,
        dateIso: todayIso,
        status: 'Menunggu',
      };

      showToast(
        `Permintaan ${newReq.id} terkirim ke Owner`,
        `${payload.itemName} (${formatDecimalId(payload.qty)} ${payload.unit}) menunggu persetujuan.`,
      );

      return {
        ...prev,
        stockRequests: [newReq, ...prev.stockRequests],
        ownerLastSyncedLabel: nowTime,
      };
    });
  };

  /* -------------------- Owner Actions -------------------- */
  const handleAddExpense = (
    expense: Omit<ExpenseRecord, 'id' | 'recordedBy'>,
  ) => {
    const nowTime = getCurrentWibTime(false);
    setWorkspace((prev) => {
      const newExpense: ExpenseRecord = {
        ...expense,
        id: `exp-${Date.now()}`,
        recordedBy: 'Owner',
      };
      showToast(
        'Pengeluaran tercatat',
        `${newExpense.name} (${formatRupiah(newExpense.amount)})`,
      );
      return {
        ...prev,
        expenses: [newExpense, ...prev.expenses],
        ownerLastSyncedLabel: nowTime,
      };
    });
  };

  const handleSaveProduct = (payload: {
    id?: string;
    name: string;
    category: ProductCategory;
    price: number;
    description: string;
    active: boolean;
  }) => {
    const nowTime = getCurrentWibTime(false);
    setWorkspace((prev) => {
      if (payload.id) {
        const updatedProducts = prev.products.map((p) =>
          p.id === payload.id
            ? {
                ...p,
                name: payload.name,
                category: payload.category,
                price: payload.price,
                description: payload.description,
                active: payload.active,
              }
            : p,
        );
        showToast(
          'Produk diperbarui',
          `${payload.name} (${formatRupiah(payload.price)}) tersinkron ke kasir Rider.`,
        );
        return {
          ...prev,
          products: updatedProducts,
          ownerLastSyncedLabel: nowTime,
        };
      }

      const nextCodeNum = String(prev.products.length + 1).padStart(3, '0');
      const newId = `${payload.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
      const newProduct: Product = {
        id: newId,
        code: `KKJ-${nextCodeNum}`,
        name: payload.name,
        category: payload.category,
        price: payload.price,
        description: payload.description,
        active: payload.active,
        recipe:
          payload.category === 'KOPI'
            ? { coffeeKg: 0.025, milkL: 0.18, palmSugarL: 0.02 }
            : { coffeeKg: 0, milkL: 0.2, palmSugarL: 0 },
      };

      const nextCarts = { ...prev.carts };
      Object.keys(nextCarts).forEach((riderId) => {
        nextCarts[riderId] = {
          ...nextCarts[riderId],
          productStocks: {
            ...nextCarts[riderId].productStocks,
            [newId]: 0,
          },
        };
      });

      showToast(
        'Produk baru ditambahkan',
        `${newProduct.name} langsung tersedia di katalog Rider.`,
      );

      return {
        ...prev,
        products: [...prev.products, newProduct],
        carts: nextCarts,
        ownerLastSyncedLabel: nowTime,
      };
    });
  };

  const handleToggleProductStatus = (productId: string) => {
    const nowTime = getCurrentWibTime(false);
    setWorkspace((prev) => {
      const target = prev.products.find((p) => p.id === productId);
      const updated = prev.products.map((p) =>
        p.id === productId ? { ...p, active: !p.active } : p,
      );
      if (target) {
        showToast(
          target.active ? 'Produk dinonaktifkan' : 'Produk diaktifkan',
          `${target.name} ${target.active ? 'disembunyikan dari' : 'ditampilkan di'} kasir Rider.`,
        );
      }
      return {
        ...prev,
        products: updated,
        ownerLastSyncedLabel: nowTime,
      };
    });
  };

  const handleApproveRequest = (requestId: string) => {
    const nowTime = getCurrentWibTime(false);
    const shortTime = getCurrentWibTime(true);
    const todayIso = getTodayWibIsoDate();

    setWorkspace((prev) => {
      const req = prev.stockRequests.find((r) => r.id === requestId);
      if (!req || req.status !== 'Menunggu') return prev;
      const targetCart = prev.carts[req.riderId];
      if (!targetCart) return prev;

      let centralBefore = 0;
      let centralAfter = 0;
      let cartBefore = 0;
      let cartAfter = 0;

      let nextCentral = prev.centralStock;
      let nextIngredients = targetCart.ingredients;
      let nextProductStocks = { ...targetCart.productStocks };
      let nextMovements = [...targetCart.movements];

      if (req.itemType === 'ingredient' && req.ingredientId) {
        const centralItem = prev.centralStock.find(
          (c) => c.id === req.ingredientId,
        );
        centralBefore = centralItem?.available ?? 0;
        if (centralBefore < req.qty) {
          showToast('Stok pusat tidak cukup', 'Isi stok pusat terlebih dahulu.');
          return prev;
        }
        centralAfter = Math.round((centralBefore - req.qty) * 100) / 100;

        nextCentral = prev.centralStock.map((c) =>
          c.id === req.ingredientId ? { ...c, available: centralAfter } : c,
        );

        nextIngredients = targetCart.ingredients.map((ing) => {
          if (ing.id !== req.ingredientId) return ing;
          cartBefore = ing.remaining;
          cartAfter = Math.round((ing.remaining + req.qty) * 100) / 100;
          return { ...ing, remaining: cartAfter };
        });

        nextMovements = [
          {
            id: `mov-${Date.now()}-${req.ingredientId}`,
            time: shortTime,
            dateIso: todayIso,
            ingredientId: req.ingredientId,
            ingredientName: req.itemName,
            unit: req.unit as 'kg' | 'liter',
            type: 'Alokasi awal',
            delta: req.qty,
            balance: cartAfter,
          },
          ...nextMovements,
        ];
      } else if (req.itemType === 'cups' && req.productId) {
        const centralCups = prev.centralStock.find((c) => c.id === 'cups');
        centralBefore = centralCups?.available ?? 0;
        if (centralBefore < req.qty) {
          showToast('Stok kemasan cup pusat tidak cukup', 'Isi stok pusat terlebih dahulu.');
          return prev;
        }
        centralAfter = centralBefore - req.qty;
        nextCentral = prev.centralStock.map((c) =>
          c.id === 'cups' ? { ...c, available: centralAfter } : c,
        );

        cartBefore = nextProductStocks[req.productId] ?? 0;
        cartAfter = cartBefore + req.qty;
        nextProductStocks[req.productId] = cartAfter;
      }

      const historyItem: AllocationHistoryItem = {
        id: `alloc-${Date.now()}`,
        processedAtLabel: `${formatIndoDateLabel(todayIso)}, ${nowTime}`,
        dateIso: todayIso,
        riderName: req.riderName,
        cartCode: req.cartCode,
        itemSummary: `${req.itemName} (${formatDecimalId(req.qty)} ${req.unit})`,
        status: 'Disetujui',
        centralChangeLabel: `${formatDecimalId(centralBefore)} → ${formatDecimalId(centralAfter)} ${req.unit}`,
        cartChangeLabel: `${formatDecimalId(cartBefore)} → ${formatDecimalId(cartAfter)} ${req.unit}`,
        note: `Permintaan ${req.id} disetujui Owner`,
      };

      showToast(
        `Permintaan ${req.id} disetujui`,
        `Stok ${req.cartCode} langsung bertambah ${formatDecimalId(req.qty)} ${req.unit}.`,
      );

      return {
        ...prev,
        centralStock: nextCentral,
        stockRequests: prev.stockRequests.map((r) =>
          r.id === requestId ? { ...r, status: 'Disetujui' } : r,
        ),
        allocationHistory: [historyItem, ...prev.allocationHistory],
        ownerLastSyncedLabel: nowTime,
        carts: {
          ...prev.carts,
          [req.riderId]: {
            ...targetCart,
            productStocks: nextProductStocks,
            ingredients: nextIngredients,
            movements: nextMovements,
            shift: {
              ...targetCart.shift,
              lastSyncedLabel: nowTime,
            },
          },
        },
      };
    });
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    const nowTime = getCurrentWibTime(false);
    const todayIso = getTodayWibIsoDate();

    setWorkspace((prev) => {
      const req = prev.stockRequests.find((r) => r.id === requestId);
      if (!req || req.status !== 'Menunggu') return prev;

      const historyItem: AllocationHistoryItem = {
        id: `alloc-${Date.now()}`,
        processedAtLabel: `${formatIndoDateLabel(todayIso)}, ${nowTime}`,
        dateIso: todayIso,
        riderName: req.riderName,
        cartCode: req.cartCode,
        itemSummary: `${req.itemName} (${formatDecimalId(req.qty)} ${req.unit})`,
        status: 'Ditolak',
        centralChangeLabel: 'Tetap',
        cartChangeLabel: 'Tetap',
        note: reason,
      };

      showToast(`Permintaan ${req.id} ditolak`, reason);

      return {
        ...prev,
        stockRequests: prev.stockRequests.map((r) =>
          r.id === requestId
            ? { ...r, status: 'Ditolak', rejectionReason: reason }
            : r,
        ),
        allocationHistory: [historyItem, ...prev.allocationHistory],
        ownerLastSyncedLabel: nowTime,
      };
    });
  };

  const handleDirectAllocateCustom = (payload: {
    riderId: string;
    itemType: 'ingredient' | 'cups';
    ingredientId?: IngredientId;
    productId?: string;
    qty: number;
  }) => {
    const nowTime = getCurrentWibTime(false);
    const shortTime = getCurrentWibTime(true);
    const todayIso = getTodayWibIsoDate();

    setWorkspace((prev) => {
      const targetCart = prev.carts[payload.riderId];
      const riderAcc = DEMO_ACCOUNTS.find((a) => a.id === payload.riderId);
      if (!targetCart || !riderAcc) return prev;

      if (payload.itemType === 'ingredient' && payload.ingredientId) {
        const centralItem = prev.centralStock.find(
          (c) => c.id === payload.ingredientId,
        );
        if (!centralItem || centralItem.available < payload.qty) {
          showToast('Stok pusat tidak mencukupi', 'Silakan isi stok pusat dulu.');
          return prev;
        }
        const centralBefore = centralItem.available;
        const centralAfter = Math.round((centralBefore - payload.qty) * 100) / 100;
        let cartBefore = 0;
        let cartAfter = 0;

        const nextIngredients = targetCart.ingredients.map((ing) => {
          if (ing.id !== payload.ingredientId) return ing;
          cartBefore = ing.remaining;
          cartAfter = Math.round((ing.remaining + payload.qty) * 100) / 100;
          return { ...ing, remaining: cartAfter };
        });

        const newMov: StockMovement = {
          id: `mov-${Date.now()}-${payload.ingredientId}`,
          time: shortTime,
          dateIso: todayIso,
          ingredientId: payload.ingredientId,
          ingredientName: centralItem.name,
          unit: centralItem.unit as 'kg' | 'liter',
          type: 'Alokasi awal',
          delta: payload.qty,
          balance: cartAfter,
        };

        const hist: AllocationHistoryItem = {
          id: `alloc-${Date.now()}`,
          processedAtLabel: `${formatIndoDateLabel(todayIso)}, ${nowTime}`,
          dateIso: todayIso,
          riderName: riderAcc.name,
          cartCode: riderAcc.shortCartCode,
          itemSummary: `${centralItem.name} (${formatDecimalId(payload.qty)} ${centralItem.unit})`,
          status: 'Disetujui',
          centralChangeLabel: `${formatDecimalId(centralBefore)} → ${formatDecimalId(centralAfter)} ${centralItem.unit}`,
          cartChangeLabel: `${formatDecimalId(cartBefore)} → ${formatDecimalId(cartAfter)} ${centralItem.unit}`,
          note: 'Alokasi langsung oleh Owner',
        };

        showToast(
          `Stok dikirim ke ${riderAcc.shortCartCode}`,
          `+${formatDecimalId(payload.qty)} ${centralItem.unit} ${centralItem.name}`,
        );

        return {
          ...prev,
          centralStock: prev.centralStock.map((c) =>
            c.id === payload.ingredientId ? { ...c, available: centralAfter } : c,
          ),
          allocationHistory: [hist, ...prev.allocationHistory],
          ownerLastSyncedLabel: nowTime,
          carts: {
            ...prev.carts,
            [payload.riderId]: {
              ...targetCart,
              ingredients: nextIngredients,
              movements: [newMov, ...targetCart.movements],
              shift: { ...targetCart.shift, lastSyncedLabel: nowTime },
            },
          },
        };
      }

      if (payload.itemType === 'cups' && payload.productId) {
        const centralCups = prev.centralStock.find((c) => c.id === 'cups');
        const product = prev.products.find((p) => p.id === payload.productId);
        if (!centralCups || !product || centralCups.available < payload.qty) {
          showToast('Stok kemasan cup pusat tidak mencukupi', 'Silakan isi stok pusat dulu.');
          return prev;
        }

        const centralBefore = centralCups.available;
        const centralAfter = centralBefore - payload.qty;
        const cartBefore = targetCart.productStocks[product.id] ?? 0;
        const cartAfter = cartBefore + payload.qty;

        const hist: AllocationHistoryItem = {
          id: `alloc-${Date.now()}`,
          processedAtLabel: `${formatIndoDateLabel(todayIso)}, ${nowTime}`,
          dateIso: todayIso,
          riderName: riderAcc.name,
          cartCode: riderAcc.shortCartCode,
          itemSummary: `Cup ${product.name} (${payload.qty} cup)`,
          status: 'Disetujui',
          centralChangeLabel: `${centralBefore} → ${centralAfter} pcs`,
          cartChangeLabel: `${cartBefore} → ${cartAfter} cup`,
          note: 'Alokasi cup menu oleh Owner',
        };

        showToast(
          `Stok cup dikirim ke ${riderAcc.shortCartCode}`,
          `+${payload.qty} cup ${product.name}`,
        );

        return {
          ...prev,
          centralStock: prev.centralStock.map((c) =>
            c.id === 'cups' ? { ...c, available: centralAfter } : c,
          ),
          allocationHistory: [hist, ...prev.allocationHistory],
          ownerLastSyncedLabel: nowTime,
          carts: {
            ...prev.carts,
            [payload.riderId]: {
              ...targetCart,
              productStocks: {
                ...targetCart.productStocks,
                [product.id]: cartAfter,
              },
              shift: { ...targetCart.shift, lastSyncedLabel: nowTime },
            },
          },
        };
      }

      return prev;
    });
  };

  const handleDirectAllocateBundle = (riderId: string) => {
    const nowTime = getCurrentWibTime(false);
    const shortTime = getCurrentWibTime(true);
    const todayIso = getTodayWibIsoDate();

    setWorkspace((prev) => {
      const targetCart = prev.carts[riderId];
      const riderAcc = DEMO_ACCOUNTS.find((a) => a.id === riderId);
      if (!targetCart || !riderAcc) return prev;

      const cupPerActiveProduct = 15;
      const activeProds = prev.products.filter((p) => p.active);
      const totalCupsNeeded = activeProds.length * cupPerActiveProduct;

      const bundleIng: Record<IngredientId, number> = {
        coffee: 2,
        milk: 4,
        palmSugar: 2,
      };

      const centralCups = prev.centralStock.find((c) => c.id === 'cups');
      if (!centralCups || centralCups.available < totalCupsNeeded) {
        showToast('Stok kemasan cup pusat kurang', 'Klik + Isi stok pusat terlebih dahulu.');
        return prev;
      }

      const nextCentral = prev.centralStock.map((c) => {
        if (c.id === 'cups') {
          return { ...c, available: Math.max(0, c.available - totalCupsNeeded) };
        }
        const used = bundleIng[c.id as IngredientId] ?? 0;
        return {
          ...c,
          available: Math.max(0, Math.round((c.available - used) * 100) / 100),
        };
      });

      const nextProductStocks = { ...targetCart.productStocks };
      activeProds.forEach((p) => {
        nextProductStocks[p.id] = (nextProductStocks[p.id] ?? 0) + cupPerActiveProduct;
      });

      const newMovs: StockMovement[] = [];
      const nextIngredients = targetCart.ingredients.map((ing) => {
        const add = bundleIng[ing.id] ?? 0;
        const nextBal = Math.round((ing.remaining + add) * 100) / 100;
        newMovs.push({
          id: `mov-${Date.now()}-${ing.id}`,
          time: shortTime,
          dateIso: todayIso,
          ingredientId: ing.id,
          ingredientName: ing.name,
          unit: ing.unit,
          type: 'Alokasi awal',
          delta: add,
          balance: nextBal,
        });
        return { ...ing, remaining: nextBal };
      });

      const hist: AllocationHistoryItem = {
        id: `alloc-${Date.now()}`,
        processedAtLabel: `${formatIndoDateLabel(todayIso)}, ${nowTime}`,
        dateIso: todayIso,
        riderName: riderAcc.name,
        cartCode: riderAcc.shortCartCode,
        itemSummary: `Paket operasional (${totalCupsNeeded} cup + 8 kg/L bahan)`,
        status: 'Disetujui',
        centralChangeLabel: `-${totalCupsNeeded} pcs, -8 kg/L`,
        cartChangeLabel: `+${cupPerActiveProduct} cup/menu`,
        note: 'Paket standar harian oleh Owner',
      };

      showToast(
        `Paket standar dialokasikan ke ${riderAcc.shortCartCode}`,
        `+${cupPerActiveProduct} cup per menu & bahan baku telah dikirim.`,
      );

      return {
        ...prev,
        centralStock: nextCentral,
        allocationHistory: [hist, ...prev.allocationHistory],
        ownerLastSyncedLabel: nowTime,
        carts: {
          ...prev.carts,
          [riderId]: {
            ...targetCart,
            productStocks: nextProductStocks,
            ingredients: nextIngredients,
            movements: [...newMovs, ...targetCart.movements],
            shift: { ...targetCart.shift, lastSyncedLabel: nowTime },
          },
        },
      };
    });
  };

  const handleRestockCentral = () => {
    const nowTime = getCurrentWibTime(false);
    setWorkspace((prev) => {
      const nextCentral = prev.centralStock.map((c) => {
        const add =
          c.id === 'cups' ? 200 : c.id === 'milk' ? 20 : 10;
        return { ...c, available: c.available + add };
      });
      showToast('Persediaan pusat ditambah', 'Stok bahan baku & kemasan pusat telah diisi ulang.');
      return {
        ...prev,
        centralStock: nextCentral,
        ownerLastSyncedLabel: nowTime,
      };
    });
  };

  /* -------------------- Render Routing -------------------- */
  if (!activeUser) {
    return (
      <LoginView
        onLogin={handleLogin}
        savedIdentifier={rememberedIdentifier}
      />
    );
  }

  const activeCartsCount = Object.values(workspace.carts).filter(
    (c) => c.shift.isActive,
  ).length;
  const totalCartsCount = Object.keys(workspace.carts).length;
  const pendingRequestsCount = workspace.stockRequests.filter(
    (r) => r.status === 'Menunggu',
  ).length;

  return (
    <>
      {activeUser.roleType === 'owner' ? (
        <OwnerLayout
          activeTab={workspace.ownerTab}
          onSelectTab={(tab) =>
            setWorkspace((prev) => ({ ...prev, ownerTab: tab }))
          }
          owner={OWNER_ACCOUNT}
          activeCartsCount={activeCartsCount}
          totalCartsCount={totalCartsCount}
          pendingRequestsCount={pendingRequestsCount}
          lastSyncedLabel={workspace.ownerLastSyncedLabel}
          onSwitchAccount={handleSwitchAccount}
          onResetAllData={handleResetAllData}
          onLogout={handleLogout}
        >
          {workspace.ownerTab === 'dashboard' && (
            <OwnerDashboardPage
              transactions={workspace.transactions}
              expenses={workspace.expenses}
              carts={workspace.carts}
              centralStock={workspace.centralStock}
              onNavigate={(tab) =>
                setWorkspace((prev) => ({ ...prev, ownerTab: tab }))
              }
              onOpenExpenseModal={() => setExpenseModalOpen(true)}
              onSelectTransaction={(tx) => setSelectedTxModal(tx)}
            />
          )}

          {workspace.ownerTab === 'laporan-penjualan' && (
            <OwnerSalesReportPage transactions={workspace.transactions} />
          )}

          {workspace.ownerTab === 'pengeluaran' && (
            <OwnerExpensesPage
              expenses={workspace.expenses}
              onOpenExpenseModal={() => setExpenseModalOpen(true)}
            />
          )}

          {workspace.ownerTab === 'transaksi' && (
            <OwnerTransactionsPage
              transactions={workspace.transactions}
              onSelectTransaction={(tx) => setSelectedTxModal(tx)}
            />
          )}

          {workspace.ownerTab === 'keuangan' && (
            <OwnerFinancePage
              transactions={workspace.transactions}
              expenses={workspace.expenses}
            />
          )}

          {workspace.ownerTab === 'produk' && (
            <OwnerProductsPage
              products={workspace.products}
              onOpenAddModal={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onOpenEditModal={(prod) => {
                setEditingProduct(prod);
                setProductModalOpen(true);
              }}
              onToggleProductStatus={handleToggleProductStatus}
            />
          )}

          {workspace.ownerTab === 'alokasi-stok' && (
            <OwnerAllocationPage
              requests={workspace.stockRequests}
              centralStock={workspace.centralStock}
              carts={workspace.carts}
              products={workspace.products}
              allocationHistory={workspace.allocationHistory}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
              onDirectAllocateBundle={handleDirectAllocateBundle}
              onDirectAllocateCustom={handleDirectAllocateCustom}
              onRestockCentral={handleRestockCentral}
            />
          )}

          {workspace.ownerTab === 'proyeksi-stok' && (
            <OwnerForecastPage
              centralStock={workspace.centralStock}
              carts={workspace.carts}
              transactions={workspace.transactions}
            />
          )}

          {workspace.ownerTab === 'absensi' && (
            <OwnerAttendancePage
              attendanceRecords={workspace.attendanceRecords}
            />
          )}
        </OwnerLayout>
      ) : (
        <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#171614]">
          <Navbar
            activeTab={workspace.riderTab}
            onSelectTab={(tab) =>
              setWorkspace((prev) => ({ ...prev, riderTab: tab }))
            }
            rider={activeUser}
            onSwitchAccount={handleSwitchAccount}
            onResetDemo={handleResetAllData}
            onLogout={handleLogout}
          />

          <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {activeRiderCart && workspace.riderTab === 'beranda' && (
              <HomePOSView
                rider={activeUser}
                products={riderProductsWithStock}
                cart={activeRiderCart.cart}
                nextOrderId={nextOrderId}
                shift={activeRiderCart.shift}
                elapsedMinutes={elapsedMinutes}
                transactions={riderTransactions}
                onUpdateCartQty={handleUpdateCartQty}
                onResetCart={handleResetCart}
                onCompletePayment={handleCompletePayment}
                onStartShift={handleStartShift}
                onEndShift={handleEndShift}
              />
            )}

            {activeRiderCart && workspace.riderTab === 'riwayat' && (
              <TransactionsView
                rider={activeUser}
                transactions={riderTransactions}
                lastSyncedLabel={activeRiderCart.shift.lastSyncedLabel}
              />
            )}

            {activeRiderCart && workspace.riderTab === 'stok' && (
              <StockView
                rider={activeUser}
                ingredients={activeRiderCart.ingredients}
                products={riderProductsWithStock}
                movements={activeRiderCart.movements}
                requests={workspace.stockRequests}
                lastSyncedLabel={activeRiderCart.shift.lastSyncedLabel}
                onSubmitStockRequest={handleSubmitStockRequest}
              />
            )}
          </main>

          <footer className="bg-[#181714] text-[#FAF8F3] mt-12">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xl font-medium tracking-tight">
                KKJ Express
              </div>
              <div className="sm:text-right">
                <div className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] text-[#B8A88A] uppercase">
                  KOPI TERUS MENGALIR. USAHA TETAP TERKENDALI.
                </div>
                <div className="text-[11px] text-[#FAF8F3]/50 mt-1">
                  © 2026 KKJ Express. Seluruh hak dilindungi.
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Owner Modals */}
      <ExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSave={handleAddExpense}
      />

      <ProductModal
        open={productModalOpen}
        editingProduct={editingProduct}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      <TransactionDetailModal
        transaction={selectedTxModal}
        onClose={() => setSelectedTxModal(null)}
      />

      {/* Shared Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-[#B8A88A]/35 bg-[#1D1B18] text-[#FAF8F3] px-4 py-3.5 shadow-2xl flex items-start gap-3"
        >
          <CheckCircle2
            className="w-5 h-5 text-[#6FCF97] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-semibold">
              {toast.title}
            </div>
            {toast.detail && (
              <div className="text-[11px] sm:text-xs text-[#FAF8F3]/75 mt-0.5 tabular-nums">
                {toast.detail}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="text-[#FAF8F3]/50 hover:text-[#FAF8F3] p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
