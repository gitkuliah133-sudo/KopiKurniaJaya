import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Minus,
  Play,
  Plus,
  QrCode,
  Search,
  Wallet,
  X,
} from 'lucide-react';
import {
  formatDurationFull,
  formatIndoDateLabel,
  formatInputDots,
  formatRupiah,
  getTodayWibIsoDate,
} from '../data/mockData';
import {
  PaymentMethod,
  ProductWithStock,
  RiderAccount,
  ShiftState,
  Transaction,
} from '../types';
import { EspressoBackdrop } from './EspressoBackdrop';

interface HomePOSViewProps {
  rider: RiderAccount;
  products: ProductWithStock[];
  cart: Record<string, number>;
  nextOrderId: string;
  shift: ShiftState;
  elapsedMinutes: number;
  transactions: Transaction[];
  onUpdateCartQty: (productId: string, delta: number) => void;
  onResetCart: () => void;
  onCompletePayment: (
    method: PaymentMethod,
    cashReceived?: number,
  ) => void;
  onStartShift: () => void;
  onEndShift: () => void;
}

type CategoryFilter = 'Semua' | 'KOPI' | 'NON-KOPI';

export const HomePOSView: React.FC<HomePOSViewProps> = ({
  rider,
  products,
  cart,
  nextOrderId,
  shift,
  elapsedMinutes,
  transactions,
  onUpdateCartQty,
  onResetCart,
  onCompletePayment,
  onStartShift,
  onEndShift,
}) => {
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [showDenomPicker, setShowDenomPicker] = useState<boolean>(false);
  const [showEndShiftModal, setShowEndShiftModal] = useState<boolean>(false);

  const todayDateLabel = useMemo(
    () => formatIndoDateLabel(getTodayWibIsoDate(), true),
    [],
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchCategory =
        categoryFilter === 'Semua' || p.category === categoryFilter;
      const matchSearch = !q || p.name.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [products, categoryFilter, searchQuery]);

  const cartItems = useMemo(() => {
    return products
      .filter((p) => (cart[p.id] ?? 0) > 0)
      .map((p) => {
        const qty = cart[p.id] ?? 0;
        return {
          product: p,
          qty,
          subtotal: qty * p.price,
        };
      });
  }, [products, cart]);

  const totalCups = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems],
  );
  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.subtotal, 0),
    [cartItems],
  );

  const totalAvailableStock = useMemo(
    () => products.reduce((sum, p) => sum + p.stock, 0),
    [products],
  );

  const effectiveCash = cashReceived;
  const changeAmount = effectiveCash - totalAmount;
  const isCashSufficient =
    paymentMethod === 'QRIS' || (totalAmount > 0 && effectiveCash >= totalAmount);

  const canCheckout =
    shift.isActive && totalCups > 0 && totalAmount > 0 && isCashSufficient;

  const quickDenominations = useMemo(() => {
    const candidates = new Set<number>();
    if (totalAmount > 0) candidates.add(totalAmount);
    [20000, 50000, 60000, 100000].forEach((val) => {
      if (val >= totalAmount || totalAmount === 0) {
        candidates.add(val);
      }
    });
    return Array.from(candidates).sort((a, b) => a - b).slice(0, 4);
  }, [totalAmount]);

  const shiftStats = useMemo(() => {
    const totalSales = transactions.reduce((s, t) => s + t.total, 0);
    const totalSoldCups = transactions.reduce((s, t) => s + t.totalCups, 0);
    const cashTotal = transactions
      .filter((t) => t.method === 'Tunai')
      .reduce((s, t) => s + t.total, 0);
    const qrisTotal = transactions
      .filter((t) => t.method === 'QRIS')
      .reduce((s, t) => s + t.total, 0);
    return {
      totalSales,
      count: transactions.length,
      totalSoldCups,
      cashTotal,
      qrisTotal,
    };
  }, [transactions]);

  const handleCashInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    setCashReceived(rawDigits ? parseInt(rawDigits, 10) : 0);
  };

  const handleCheckout = () => {
    if (!canCheckout) return;
    onCompletePayment(
      paymentMethod,
      paymentMethod === 'Tunai' ? effectiveCash : undefined,
    );
    setCashReceived(0);
    setShowDenomPicker(false);
  };

  const statusText = shift.isActive
    ? 'Sedang beroperasi'
    : shift.hasStartedToday
      ? 'Operasional berakhir'
      : 'Belum beroperasi';

  const statusDotClass = shift.isActive
    ? 'bg-[#2E6B47]'
    : shift.hasStartedToday
      ? 'bg-[#B45309]'
      : 'bg-[#8E8371]';

  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-[#181613] text-[#FAF8F3] px-6 py-8 sm:px-9 sm:py-10 shadow-sm">
        <EspressoBackdrop variant="hero" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-6 bg-[#B8A88A]/70" aria-hidden="true" />
              <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] text-[#B8A88A] uppercase">
                KKJ EXPRESS / RIDER WORKSPACE
              </span>
            </div>

            <h1 className="text-3xl sm:text-[44px] font-semibold tracking-tight leading-[1.1] text-[#FAF8F3]">
              Selamat pagi, {rider.firstName}.
            </h1>
            <p className="text-sm sm:text-base text-[#FAF8F3]/75 mt-2.5">
              Siap menyajikan kopi terbaik hari ini?
            </p>
          </div>

          <div className="self-start rounded-2xl border border-[#FAF8F3]/12 bg-[#1D1B18]/75 backdrop-blur-xs px-4 py-3 text-left sm:text-right shrink-0">
            <div className="text-xs sm:text-sm font-semibold text-[#FAF8F3] capitalize tabular-nums">
              {todayDateLabel}
            </div>
            <div className="text-[11px] text-[#FAF8F3]/65 mt-0.5 tabular-nums">
              {shift.lastSyncedLabel
                ? `Terakhir disinkronkan ${shift.lastSyncedLabel}`
                : 'Belum ada aktivitas hari ini'}
            </div>
          </div>
        </div>
      </section>

      {/* Operational Status Bar */}
      <section
        aria-label="Status operasional shift"
        className="rounded-2xl lg:rounded-full border border-[#E4DEC9] bg-[#FAF8F3] px-5 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-[13px]">
          <div className="flex items-center gap-2.5 font-semibold text-[#171614] pr-2 lg:border-r lg:border-[#DFD8C8]">
            <span
              className={`h-2 w-2 rounded-full ${statusDotClass}`}
              aria-hidden="true"
            />
            <span>{statusText}</span>
          </div>

          <div className="font-mono text-xs text-[#6E6659] tabular-nums">
            <span className="text-[#968C7B]">Mulai kerja</span>{' '}
            <span className="text-[#171614] font-medium">
              {shift.startTimeLabel ?? 'Belum dimulai'}
            </span>
          </div>

          <div className="font-mono text-xs text-[#6E6659] tabular-nums">
            <span className="text-[#968C7B]">Durasi</span>{' '}
            <span className="text-[#171614] font-medium">
              {shift.hasStartedToday ? formatDurationFull(elapsedMinutes) : '0 menit'}
            </span>
          </div>

          <div className="font-mono text-xs text-[#6E6659]">
            {shift.isActive
              ? 'Sesi pertama hari ini tercatat'
              : shift.hasStartedToday
                ? `Ditutup pukul ${shift.endedAtLabel ?? '-'}`
                : 'Klik Mulai operasional untuk mulai bekerja'}
          </div>
        </div>

        <div className="flex justify-end shrink-0">
          {shift.isActive ? (
            <button
              type="button"
              onClick={() => setShowEndShiftModal(true)}
              className="rounded-full bg-[#9B1C1C] hover:bg-[#7F1D1D] lg:bg-[#1D1B18] lg:hover:bg-[#2F2B25] text-[#FAF8F3] text-xs font-semibold px-5 py-2.5 transition-colors whitespace-nowrap"
            >
              Akhiri operasional
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartShift}
              className="rounded-full bg-[#2E6B47] hover:bg-[#235437] text-[#FAF8F3] text-xs font-semibold px-5 py-2.5 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {shift.hasStartedToday
                  ? 'Mulai operasional kembali'
                  : 'Mulai operasional'}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* Main 2-Column POS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Catalog */}
        <section className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#171614]">
                Buat pesanan
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6659] mt-0.5">
                {totalAvailableStock === 0
                  ? 'Stok gerobak masih 0 cup, menunggu alokasi stok dari Owner.'
                  : 'Pilih produk untuk ditambahkan ke pesanan.'}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                className="w-4 h-4 text-[#8A806E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk..."
                aria-label="Cari nama produk"
                className="w-full rounded-full border border-[#DFD9C9] bg-white/80 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#171614] placeholder:text-[#8E8474] focus:outline-none focus:border-[#9E8C6C]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A806E] hover:text-[#171614]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter + Count */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(
                [
                  { id: 'Semua', label: 'Semua produk' },
                  { id: 'KOPI', label: 'Kopi' },
                  { id: 'NON-KOPI', label: 'Non-kopi' },
                ] as { id: CategoryFilter; label: string }[]
              ).map((tab) => {
                const active = categoryFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#1D1B18] text-[#FAF8F3]'
                        : 'bg-white border border-[#E4DEC9] text-[#5C5549] hover:border-[#BEB49F] hover:text-[#171614]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-[#7B7263] tabular-nums">
              {filteredProducts.length} produk tersedia
            </span>
          </div>

          {/* Product Cards */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-[#E4DEC9] bg-[#F3EFE6] p-10 text-center">
              <p className="text-sm font-medium text-[#171614]">
                Produk tidak ditemukan
              </p>
              <p className="text-xs text-[#6E6659] mt-1">
                Ubah kata kunci pencarian atau pilih kategori semua produk.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('Semua');
                }}
                className="mt-4 rounded-full bg-[#1D1B18] text-[#FAF8F3] text-xs font-medium px-4 py-2"
              >
                Tampilkan semua produk
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredProducts.map((product) => {
                const qty = cart[product.id] ?? 0;
                const isSelected = qty > 0;
                const isOutOfStock = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[138px] transition-all border ${
                      isSelected
                        ? 'bg-[#EFECE4] border-[#9E8C6C] shadow-xs'
                        : 'bg-[#F3EFE6]/90 border-[#E5DFD0] hover:border-[#C7BDA9]'
                    } ${isOutOfStock ? 'opacity-70' : ''}`}
                  >
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.14em] text-[#8E8371] uppercase">
                        {product.category}
                      </div>
                      <h3 className="text-base font-semibold text-[#171614] mt-1 leading-snug">
                        {product.name}
                      </h3>
                      <div
                        className={`text-xs mt-1 tabular-nums ${
                          product.stock <= 5
                            ? 'text-[#9C5D24] font-medium'
                            : 'text-[#7B7263]'
                        }`}
                      >
                        Stok {product.stock} cup
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-5">
                      <span className="text-sm sm:text-[15px] font-semibold text-[#171614] tabular-nums">
                        {formatRupiah(product.price)}
                      </span>

                      {qty > 0 ? (
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#1D1B18] text-[#FAF8F3] px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(product.id, -1)}
                            aria-label={`Kurangi ${product.name}`}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#FAF8F3]/15 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="min-w-[18px] text-center text-xs font-semibold tabular-nums">
                            {qty}
                          </span>
                          <button
                            type="button"
                            disabled={qty >= product.stock}
                            onClick={() => onUpdateCartQty(product.id, 1)}
                            aria-label={`Tambah ${product.name}`}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#FAF8F3]/15 disabled:opacity-40 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isOutOfStock || !shift.isActive}
                          onClick={() => onUpdateCartQty(product.id, 1)}
                          aria-label={`Tambahkan ${product.name}`}
                          title={
                            !shift.isActive
                              ? 'Klik Mulai operasional terlebih dahulu'
                              : isOutOfStock
                                ? 'Stok 0 cup (menunggu alokasi owner)'
                                : `Tambahkan ${product.name}`
                          }
                          className="w-8 h-8 rounded-full bg-[#FAF8F3] border border-[#DDD6C4] hover:border-[#1D1B18] hover:bg-white text-[#171614] flex items-center justify-center disabled:opacity-40 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Current Order Dark Panel */}
        <aside className="lg:col-span-5 xl:col-span-4 rounded-3xl bg-[#1D1B18] text-[#FAF8F3] p-5 sm:p-6 shadow-lg lg:sticky lg:top-24">
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#FAF8F3]/10">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Pesanan saat ini
              </h2>
              <p className="font-mono text-xs text-[#B8A88A] mt-1 tabular-nums">
                {nextOrderId} • {totalCups} cup
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetCart();
                setCashReceived(0);
              }}
              disabled={totalCups === 0}
              className="text-xs font-medium text-[#B8A88A] hover:text-[#FAF8F3] disabled:opacity-40 transition-colors py-1 px-2"
            >
              Reset
            </button>
          </div>

          {/* Order Items */}
          <div className="py-4 border-b border-[#FAF8F3]/10 space-y-3.5 min-h-[112px]">
            {cartItems.length === 0 ? (
              <div className="py-5 text-center text-xs text-[#FAF8F3]/55 leading-relaxed">
                {!shift.isActive
                  ? 'Klik tombol Mulai operasional untuk mulai menerima pesanan.'
                  : totalAvailableStock === 0
                    ? 'Stok produk masih 0 cup. Menunggu alokasi stok dari dashboard Owner.'
                    : 'Belum ada item dipilih. Tekan tombol + pada produk di sebelah kiri untuk membuat pesanan.'}
              </div>
            ) : (
              cartItems.map(({ product, qty, subtotal }) => (
                <div
                  key={product.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-medium text-[#FAF8F3]">
                      {product.name}
                    </div>
                    <div className="text-xs text-[#FAF8F3]/55 tabular-nums mt-0.5">
                      {qty} × {formatRupiah(product.price)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[#FAF8F3] tabular-nums whitespace-nowrap">
                    {formatRupiah(subtotal)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="py-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#FAF8F3]/65 tabular-nums">
              <span>Subtotal ({totalCups} cup)</span>
              <span>{formatRupiah(totalAmount)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-[#FAF8F3]">
                Total pembayaran
              </span>
              <span className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#FAF8F3] tabular-nums">
                {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method Toggle */}
          <div className="mt-1">
            <div className="text-xs font-medium text-[#FAF8F3]/75 mb-2">
              Metode pembayaran
            </div>
            <div className="grid grid-cols-2 rounded-full bg-[#2C2823] p-1">
              {(['Tunai', 'QRIS'] as PaymentMethod[]).map((method) => {
                const active = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-full py-2 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[#F5F2EB] text-[#171614] shadow-xs'
                        : 'text-[#FAF8F3]/70 hover:text-[#FAF8F3]'
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Specific Section */}
          {paymentMethod === 'Tunai' ? (
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="cash-received-input"
                  className="text-[#FAF8F3]/75"
                >
                  Uang diterima{' '}
                  <span className="text-[#FAF8F3]/45">
                    • klik untuk memilih nominal
                  </span>
                </label>
              </div>

              <div className="relative flex items-center rounded-2xl border border-[#B8A88A]/40 bg-[#24211D] px-4 py-3 focus-within:border-[#D2B98B]">
                <span className="text-xs font-medium text-[#B8A88A] mr-2.5">
                  Rp
                </span>
                <input
                  id="cash-received-input"
                  type="text"
                  inputMode="numeric"
                  value={formatInputDots(cashReceived)}
                  onFocus={() => setShowDenomPicker(true)}
                  onClick={() => setShowDenomPicker(true)}
                  onChange={handleCashInputChange}
                  placeholder="0"
                  className="w-full bg-transparent text-base font-semibold text-[#FAF8F3] placeholder:text-[#FAF8F3]/35 focus:outline-none tabular-nums"
                />
                <Wallet
                  className="w-4 h-4 text-[#B8A88A]/70 shrink-0"
                  aria-hidden="true"
                />
              </div>

              {(showDenomPicker || totalAmount > 0) && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {quickDenominations.map((amount) => {
                    const isExact = amount === totalAmount && totalAmount > 0;
                    const isActive = cashReceived === amount && amount > 0;
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setCashReceived(amount)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-medium tabular-nums transition-colors ${
                          isActive
                            ? 'bg-[#D2B98B] text-[#171614] font-semibold'
                            : 'bg-[#2B2722] text-[#FAF8F3]/80 hover:bg-[#38332C]'
                        }`}
                      >
                        {isExact
                          ? `Uang pas (${formatRupiah(amount)})`
                          : formatRupiah(amount)}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="rounded-xl bg-[#2B2722] px-4 py-2.5 flex items-center justify-between text-xs tabular-nums">
                <span className="text-[#B8A88A]">Kembalian</span>
                {totalAmount === 0 ? (
                  <span className="font-semibold text-[#FAF8F3]/60">Rp0</span>
                ) : changeAmount >= 0 ? (
                  <span className="font-semibold text-[#FAF8F3]">
                    {formatRupiah(changeAmount)}
                  </span>
                ) : (
                  <span className="font-semibold text-amber-300">
                    Kurang {formatRupiah(Math.abs(changeAmount))}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-[#FAF8F3]/12 bg-[#25221E] p-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-[#FAF8F3] p-2 flex items-center justify-center shrink-0">
                  <QrCode className="w-16 h-16 text-[#171614]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] tracking-wider text-[#B8A88A] uppercase">
                    QRIS • {rider.cartCode}
                  </div>
                  <div className="text-sm font-semibold text-[#FAF8F3] mt-0.5 tabular-nums">
                    Tagihan {formatRupiah(totalAmount)}
                  </div>
                  <p className="text-[11px] text-[#FAF8F3]/65 mt-1 leading-relaxed">
                    Minta pelanggan memindai kode QRIS gerobak, lalu konfirmasi
                    setelah pembayaran masuk.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Complete Order CTA */}
          <button
            type="button"
            disabled={!canCheckout}
            onClick={handleCheckout}
            className="w-full mt-4 rounded-full bg-[#F5F2EB] hover:bg-[#FAF8F3] disabled:bg-[#F5F2EB]/30 disabled:text-[#171614]/50 text-[#171614] font-semibold text-sm py-3.5 px-6 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesaikan pembayaran</span>
          </button>

          {!shift.isActive && (
            <p className="mt-2.5 text-center text-[11px] text-[#B8A88A]">
              {shift.hasStartedToday
                ? 'Operasional telah diakhiri. Aktifkan shift untuk menerima pesanan baru.'
                : 'Klik Mulai operasional di atas untuk memulai sesi kerja hari ini.'}
            </p>
          )}
        </aside>
      </div>

      {/* End Shift Confirmation & Summary Modal */}
      {showEndShiftModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#FAF8F3] border border-[#DFD9C9] p-6 text-[#171614] shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] tracking-[0.16em] text-[#8A7E6B] uppercase">
                  {rider.cartCode} / REKAP SHIFT
                </span>
                <h3 className="text-xl font-semibold mt-1">
                  Akhiri operasional hari ini?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEndShiftModal(false)}
                aria-label="Tutup"
                className="rounded-full p-1.5 text-[#6E6659] hover:bg-[#EFECE4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6E6659] mt-2 leading-relaxed">
              Berikut ringkasan penjualan sementara untuk shift{' '}
              <strong className="text-[#171614]">{rider.name}</strong> sejak{' '}
              {shift.startTimeLabel ?? '-'}:
            </p>

            <div className="mt-4 rounded-2xl bg-[#EFECE4] p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6E6659]">Total penjualan</span>
                <span className="font-bold text-sm tabular-nums">
                  {formatRupiah(shiftStats.totalSales)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6659]">Transaksi berhasil</span>
                <span className="font-semibold tabular-nums">
                  {shiftStats.count} transaksi ({shiftStats.totalSoldCups} cup)
                </span>
              </div>
              <div className="border-t border-[#DED8C8] pt-2 flex justify-between">
                <span className="text-[#6E6659]">Tunai</span>
                <span className="font-medium tabular-nums">
                  {formatRupiah(shiftStats.cashTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6659]">QRIS</span>
                <span className="font-medium tabular-nums">
                  {formatRupiah(shiftStats.qrisTotal)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowEndShiftModal(false)}
                className="rounded-full border border-[#D8D1C1] px-4 py-2 text-xs font-semibold text-[#5C5549] hover:bg-[#EFECE4]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onEndShift();
                  setShowEndShiftModal(false);
                }}
                className="rounded-full bg-[#9B1C1C] hover:bg-[#7F1D1D] text-white px-5 py-2 text-xs font-semibold transition-colors"
              >
                Konfirmasi akhiri shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
