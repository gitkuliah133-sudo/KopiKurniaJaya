import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Download,
  Plus,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  addDaysIso,
  exportToCsv,
  formatDecimalId,
  formatRupiah,
  formatShortCurrency,
  getTodayWibIsoDate,
  RIDER_ACCOUNTS,
} from '../../data/mockData';
import {
  CartWorkspaceData,
  CentralStockItem,
  ExpenseRecord,
  OwnerTabId,
  Transaction,
} from '../../types';

interface OwnerDashboardPageProps {
  transactions: Transaction[];
  expenses: ExpenseRecord[];
  carts: Record<string, CartWorkspaceData>;
  centralStock: CentralStockItem[];
  onNavigate: (tab: OwnerTabId) => void;
  onOpenExpenseModal: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

const HOUR_BUCKETS = [
  '08.00',
  '09.00',
  '10.00',
  '11.00',
  '12.00',
  '13.00',
  '14.00',
  '15.00',
  '16.00',
  '17.00',
];

export const OwnerDashboardPage: React.FC<OwnerDashboardPageProps> = ({
  transactions,
  expenses,
  carts,
  centralStock,
  onNavigate,
  onOpenExpenseModal,
  onSelectTransaction,
}) => {
  const [periodMode, setPeriodMode] = useState<'today' | '7days' | 'all'>(
    'today',
  );
  const [selectedDateIso, setSelectedDateIso] = useState<string>(() =>
    getTodayWibIsoDate(),
  );
  const [cartFilter, setCartFilter] = useState<string>('Semua');
  const [trendMode, setTrendMode] = useState<'sales' | 'count'>('sales');
  const [hoveredHour, setHoveredHour] = useState<string | null>(null);

  const filteredTx = useMemo(() => {
    const min7DaysIso = addDaysIso(selectedDateIso || getTodayWibIsoDate(), -6);
    return transactions.filter((tx) => {
      const matchCart = cartFilter === 'Semua' || tx.cartCode === cartFilter;
      if (!matchCart) return false;
      if (periodMode === 'all') return true;
      if (periodMode === 'today') {
        return !selectedDateIso || tx.dateIso === selectedDateIso;
      }
      return (
        tx.dateIso >= min7DaysIso &&
        tx.dateIso <= (selectedDateIso || getTodayWibIsoDate())
      );
    });
  }, [transactions, periodMode, selectedDateIso, cartFilter]);

  const filteredExpenses = useMemo(() => {
    const min7DaysIso = addDaysIso(selectedDateIso || getTodayWibIsoDate(), -6);
    return expenses.filter((ex) => {
      if (periodMode === 'all') return true;
      if (periodMode === 'today') {
        return !selectedDateIso || ex.dateIso === selectedDateIso;
      }
      return (
        ex.dateIso >= min7DaysIso &&
        ex.dateIso <= (selectedDateIso || getTodayWibIsoDate())
      );
    });
  }, [expenses, periodMode, selectedDateIso]);

  const metrics = useMemo(() => {
    const successTx = filteredTx.filter((t) => t.status === 'Berhasil');
    const totalSales = successTx.reduce((s, t) => s + t.total, 0);
    const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const netBalance = totalSales - totalExpense;
    const cashSales = successTx
      .filter((t) => t.method === 'Tunai')
      .reduce((s, t) => s + t.total, 0);
    const qrisSales = successTx
      .filter((t) => t.method === 'QRIS')
      .reduce((s, t) => s + t.total, 0);
    const cashPct =
      totalSales > 0 ? Math.round((cashSales / totalSales) * 100) : 0;
    const qrisPct = totalSales > 0 ? 100 - cashPct : 0;

    return {
      totalSales,
      txCount: successTx.length,
      totalExpense,
      netBalance,
      cashSales,
      qrisSales,
      cashPct,
      qrisPct,
    };
  }, [filteredTx, filteredExpenses]);

  const hourlyData = useMemo(() => {
    const map = new Map<string, { sales: number; count: number }>();
    HOUR_BUCKETS.forEach((h) => map.set(h, { sales: 0, count: 0 }));

    filteredTx
      .filter((t) => t.status === 'Berhasil')
      .forEach((tx) => {
        const key = HOUR_BUCKETS.includes(tx.hourBucket)
          ? tx.hourBucket
          : HOUR_BUCKETS[0];
        const cur = map.get(key) ?? { sales: 0, count: 0 };
        map.set(key, { sales: cur.sales + tx.total, count: cur.count + 1 });
      });

    const list = HOUR_BUCKETS.map((hour) => ({
      hour,
      ...(map.get(hour) ?? { sales: 0, count: 0 }),
    }));
    const maxVal = Math.max(
      1,
      ...list.map((d) => (trendMode === 'sales' ? d.sales : d.count)),
    );
    return { list, maxVal };
  }, [filteredTx, trendMode]);

  const riderSummaryRows = useMemo(() => {
    return RIDER_ACCOUNTS.map((acc) => {
      const cartData = carts[acc.id];
      const sales = filteredTx
        .filter((t) => t.riderId === acc.id && t.status === 'Berhasil')
        .reduce((s, t) => s + t.total, 0);
      return {
        acc,
        isActive: cartData?.shift.isActive ?? false,
        hasStarted: cartData?.shift.hasStartedToday ?? false,
        startTimeLabel: cartData?.shift.startTimeLabel ?? null,
        sales,
      };
    });
  }, [carts, filteredTx]);

  const activeRidersCount = riderSummaryRows.filter((r) => r.isActive).length;

  const lowStockAlerts = useMemo(() => {
    const alerts: { label: string; detail: string }[] = [];
    centralStock.forEach((c) => {
      if (c.available <= c.minThreshold) {
        alerts.push({
          label: `${c.name} (Pusat)`,
          detail: `sisa ${formatDecimalId(c.available)} ${c.unit}`,
        });
      }
    });
    Object.values(carts).forEach((cartData) => {
      cartData.ingredients.forEach((ing) => {
        if (ing.remaining <= ing.lowThreshold) {
          alerts.push({
            label: `${ing.name} (${cartData.cartCode})`,
            detail: `sisa ${formatDecimalId(ing.remaining)} ${ing.unit}`,
          });
        }
      });
    });
    return alerts;
  }, [centralStock, carts]);

  const handleDownloadCsv = () => {
    exportToCsv(
      `kkj-dashboard-${selectedDateIso || 'semua'}.csv`,
      ['ID Transaksi', 'Tanggal', 'Waktu', 'Rider', 'Gerobak', 'Metode', 'Total', 'Status'],
      filteredTx.map((t) => [
        t.id,
        t.dateIso,
        t.time,
        t.riderName,
        t.cartCode,
        t.method,
        t.total,
        t.status,
      ]),
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[36px] font-semibold tracking-tight text-[#171614]">
            Dashboard penjualan
          </h1>
          <p className="text-sm text-[#6E6659] mt-1">
            Pantau penjualan, keuangan, dan operasional dalam satu tempat.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="self-start sm:self-center rounded-full border border-[#DFD9C9] bg-white hover:bg-[#EFECE4] px-4 py-2.5 text-xs font-semibold text-[#171614] inline-flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh laporan</span>
        </button>
      </div>

      {/* Filter Pills + Quick Add Expense */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={periodMode}
            onChange={(e) =>
              setPeriodMode(e.target.value as 'today' | '7days' | 'all')
            }
            aria-label="Pilih periode dashboard"
            className="rounded-full border border-[#DFD9C9] bg-white px-4 py-2 text-xs font-medium text-[#171614] focus:outline-none focus:border-[#9E8C6C]"
          >
            <option value="today">Hari ini</option>
            <option value="7days">7 hari terakhir</option>
            <option value="all">Semua tanggal</option>
          </select>

          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-[#6E6659] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={selectedDateIso}
              onChange={(e) => setSelectedDateIso(e.target.value)}
              aria-label="Pilih tanggal dashboard"
              className="rounded-full border border-[#DFD9C9] bg-white pl-9 pr-3.5 py-2 text-xs font-medium text-[#171614] focus:outline-none focus:border-[#9E8C6C] tabular-nums"
            />
          </div>

          <select
            value={cartFilter}
            onChange={(e) => setCartFilter(e.target.value)}
            aria-label="Filter gerobak"
            className="rounded-full border border-[#DFD9C9] bg-white px-4 py-2 text-xs font-medium text-[#171614] focus:outline-none focus:border-[#9E8C6C]"
          >
            <option value="Semua">Semua gerobak</option>
            <option value="G-01">G-01 (Rina)</option>
            <option value="G-03">G-03 (Budi)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onOpenExpenseModal}
          className="rounded-full bg-[#1D1B18] hover:bg-[#2F2B25] text-[#FAF8F3] px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Catat pengeluaran</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Total penjualan</span>
            <Wallet className="w-4 h-4 text-[#8E8371]" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {formatRupiah(metrics.totalSales)}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Penjualan berhasil pada periode
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Total transaksi</span>
            <Receipt className="w-4 h-4 text-[#8E8371]" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {metrics.txCount}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Pesanan terselesaikan
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Pengeluaran</span>
            <Download className="w-4 h-4 text-[#8E8371]" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {formatRupiah(metrics.totalExpense)}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Biaya operasional tercatat
          </div>
        </div>

        <div className="rounded-2xl bg-[#1D1B18] text-[#FAF8F3] p-5">
          <div className="flex items-center justify-between text-xs text-[#B8A88A]">
            <span>Saldo bersih</span>
            <TrendingUp className="w-4 h-4 text-[#D2B98B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2 tabular-nums">
            {formatRupiah(metrics.netBalance)}
          </div>
          <div className="text-[11px] text-[#D2B98B] mt-2">
            Pemasukan – pengeluaran
          </div>
        </div>
      </div>

      {/* Middle Row: Hourly Trend + Rider Operational Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Tren Penjualan Chart */}
        <section className="lg:col-span-7 xl:col-span-8 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#171614]">
                Tren penjualan
              </h2>
              <p className="text-xs text-[#7B7263] mt-0.5">
                Nilai {trendMode === 'sales' ? 'penjualan' : 'transaksi'} per
                jam • periode terpilih
              </p>
            </div>

            <div className="inline-flex rounded-full bg-[#EFECE4] p-1">
              <button
                type="button"
                onClick={() => setTrendMode('sales')}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                  trendMode === 'sales'
                    ? 'bg-white text-[#171614] shadow-xs'
                    : 'text-[#6E6659]'
                }`}
              >
                Penjualan
              </button>
              <button
                type="button"
                onClick={() => setTrendMode('count')}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                  trendMode === 'count'
                    ? 'bg-white text-[#171614] shadow-xs'
                    : 'text-[#6E6659]'
                }`}
              >
                Transaksi
              </button>
            </div>
          </div>

          <div className="mt-6 h-48 flex items-end justify-between gap-2 sm:gap-3 border-b border-[#E5DFD0] pb-2 pt-6">
            {hourlyData.list.map((d) => {
              const val = trendMode === 'sales' ? d.sales : d.count;
              const pct = val > 0 ? Math.max(10, Math.round((val / hourlyData.maxVal) * 100)) : 4;
              const isPeak = val > 0 && val === hourlyData.maxVal;
              const isHovered = hoveredHour === d.hour;

              return (
                <div
                  key={d.hour}
                  onMouseEnter={() => setHoveredHour(d.hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                  className="relative flex-1 flex flex-col items-center justify-end h-full group"
                >
                  {(isHovered || isPeak) && val > 0 && (
                    <div className="absolute -top-6 z-10 rounded-full bg-[#1D1B18] text-[#FAF8F3] px-2.5 py-0.5 text-[10px] font-medium whitespace-nowrap tabular-nums shadow-sm">
                      {trendMode === 'sales'
                        ? formatRupiah(d.sales)
                        : `${d.count} trx`}
                    </div>
                  )}
                  <div
                    style={{ height: `${pct}%` }}
                    className={`w-full max-w-[34px] rounded-t-lg transition-all ${
                      val === 0
                        ? 'bg-[#EFECE4]'
                        : isPeak || isHovered
                          ? 'bg-[#1D1B18]'
                          : 'bg-[#D2C2A1]'
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between gap-2 pt-2 text-[10px] font-mono text-[#7B7263] tabular-nums">
            {hourlyData.list.map((d) => (
              <span key={d.hour} className="flex-1 text-center">
                {d.hour}
              </span>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-[#ECE7DA] flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-[#7B7263]">Metode pembayaran</span>
            <div className="flex flex-wrap items-center gap-5 tabular-nums">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B59E76]" />
                <span className="text-[#6E6659]">Tunai</span>
                <strong className="text-[#171614]">
                  {formatRupiah(metrics.cashSales)} ({metrics.cashPct}%)
                </strong>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1D1B18]" />
                <span className="text-[#6E6659]">QRIS</span>
                <strong className="text-[#171614]">
                  {formatRupiah(metrics.qrisSales)} ({metrics.qrisPct}%)
                </strong>
              </span>
            </div>
          </div>
        </section>

        {/* Operasional Rider */}
        <section className="lg:col-span-5 xl:col-span-4 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-[#171614]">
                  Operasional rider
                </h2>
                <p className="text-xs text-[#7B7263] mt-0.5 tabular-nums">
                  {activeRidersCount} berjualan •{' '}
                  {riderSummaryRows.length - activeRidersCount} belum
                  beroperasi
                </p>
              </div>
              <span className="rounded-full bg-[#EFECE4] px-3 py-1 text-[11px] font-semibold text-[#171614] tabular-nums">
                {activeRidersCount} aktif
              </span>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8371] uppercase pb-2 border-b border-[#ECE7DA]">
                <span>RIDER / GEROBAK</span>
                <span>PENJUALAN</span>
              </div>
              <div className="divide-y divide-[#ECE7DA]">
                {riderSummaryRows.map(({ acc, isActive, hasStarted, startTimeLabel, sales }) => (
                  <div
                    key={acc.id}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-[#EFECE4] text-xs font-mono font-semibold text-[#6E6659] flex items-center justify-center shrink-0">
                        {acc.shortCartCode.replace('G-', '')}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#171614] truncate">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-[#7B7263] tabular-nums">
                          {acc.shortCartCode} •{' '}
                          {isActive
                            ? `Mulai ${startTimeLabel ?? '-'}`
                            : hasStarted
                              ? 'Shift selesai'
                              : 'Belum mulai'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-[#171614] tabular-nums whitespace-nowrap">
                      {formatRupiah(sales)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('absensi')}
            className="mt-4 pt-3 border-t border-[#ECE7DA] flex items-center justify-between text-xs font-semibold text-[#171614] hover:text-[#8A7553] transition-colors"
          >
            <span>Lihat laporan absensi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>

      {/* Bottom Row: Latest Transactions + Stock Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Transaksi Terbaru */}
        <section className="lg:col-span-7 xl:col-span-8 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#171614]">
                Transaksi terbaru
              </h2>
              <p className="text-xs text-[#7B7263] mt-0.5">
                Aktivitas penjualan dari seluruh gerobak
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('transaksi')}
              className="text-xs font-semibold text-[#8A7553] hover:text-[#171614] inline-flex items-center gap-1"
            >
              <span>Lihat semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="bg-[#EFECE4] text-[10px] font-mono text-[#6E6659] uppercase">
                  <th className="py-2.5 px-3 rounded-l-xl">ID / WAKTU</th>
                  <th className="py-2.5 px-3">RIDER</th>
                  <th className="py-2.5 px-3">METODE</th>
                  <th className="py-2.5 px-3">TOTAL</th>
                  <th className="py-2.5 px-3 rounded-r-xl text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DA] text-xs">
                {filteredTx.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-[#7B7263]"
                    >
                      Belum ada transaksi tercatat pada periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredTx.slice(0, 5).map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="hover:bg-[#FAF8F3] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#171614] tabular-nums">
                          {tx.id}
                        </div>
                        <div className="text-[11px] text-[#7B7263] tabular-nums">
                          {tx.time}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#171614]">
                          {tx.riderName}
                        </div>
                        <div className="text-[11px] text-[#7B7263]">
                          {tx.cartCode}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            tx.method === 'QRIS'
                              ? 'bg-[#1D1B18] text-[#FAF8F3]'
                              : 'bg-[#EFECE4] text-[#171614]'
                          }`}
                        >
                          {tx.method}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#171614] tabular-nums">
                        {formatRupiah(tx.total)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            tx.status === 'Berhasil'
                              ? 'bg-[#E6EFE8] text-[#2E6B47]'
                              : 'bg-red-50 text-[#9B1C1C]'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Persediaan Stok */}
        <section className="lg:col-span-5 xl:col-span-4 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-[#171614]">
                  Persediaan stok
                </h2>
                <p className="text-xs text-[#7B7263] mt-0.5">
                  Segera cek ketersediaan bahan baku.
                </p>
              </div>
              <span className="rounded-full bg-[#EFECE4] px-3 py-1 text-[11px] font-medium text-[#9C5D24] tabular-nums">
                {lowStockAlerts.length} menipis
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {lowStockAlerts.length === 0 ? (
                <div className="text-xs text-[#2E6B47] py-2">
                  Seluruh persediaan pusat &amp; gerobak berada di batas aman.
                </div>
              ) : (
                lowStockAlerts.slice(0, 3).map((item, i) => (
                  <div
                    key={`${item.label}-${i}`}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="flex items-center gap-2 text-[#171614] font-medium truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="text-[#9C5D24] tabular-nums whitespace-nowrap">
                      {item.detail}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('alokasi-stok')}
              className="mt-4 w-full pt-3 border-t border-[#ECE7DA] flex items-center justify-between text-xs font-semibold text-[#171614] hover:text-[#8A7553] transition-colors"
            >
              <span>Atur alokasi stok</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-[#EFECE4] border border-[#E2DCCE] p-4">
            <div className="flex items-center justify-between text-xs text-[#6E6659]">
              <span>Proyeksi kebutuhan</span>
              <span>Besok</span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div>
                <div className="text-xl font-semibold text-[#171614] tabular-nums">
                  {Math.max(0, metrics.txCount * 2)} porsi
                </div>
                <div className="text-[11px] text-[#7B7263]">
                  Estimasi dari aktivitas operasional
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('proyeksi-stok')}
                className="text-xs font-semibold text-[#8A7553] hover:text-[#171614] whitespace-nowrap"
              >
                Lihat proyeksi →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
