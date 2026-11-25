import React, { useMemo, useState } from 'react';
import { Calendar, Download, Receipt, TrendingUp, Wallet } from 'lucide-react';
import {
  addDaysIso,
  exportToCsv,
  formatIndoDateLabel,
  formatRupiah,
  formatShortCurrency,
  formatShortIndoDate,
  getTodayWibIsoDate,
} from '../../data/mockData';
import { Transaction } from '../../types';

interface OwnerSalesReportPageProps {
  transactions: Transaction[];
}

export const OwnerSalesReportPage: React.FC<OwnerSalesReportPageProps> = ({
  transactions,
}) => {
  const todayIso = useMemo(() => getTodayWibIsoDate(), []);
  const [periodPreset, setPeriodPreset] = useState<'7days' | 'today' | '30days'>('7days');
  const [startDate, setStartDate] = useState<string>(() => addDaysIso(todayIso, -6));
  const [endDate, setEndDate] = useState<string>(() => todayIso);
  const [cartFilter, setCartFilter] = useState<string>('Semua');

  const handlePresetChange = (preset: '7days' | 'today' | '30days') => {
    setPeriodPreset(preset);
    if (preset === 'today') {
      setStartDate(todayIso);
      setEndDate(todayIso);
    } else if (preset === '7days') {
      setStartDate(addDaysIso(todayIso, -6));
      setEndDate(todayIso);
    } else {
      setStartDate(addDaysIso(todayIso, -29));
      setEndDate(todayIso);
    }
  };

  const handleReset = () => {
    setPeriodPreset('7days');
    setStartDate(addDaysIso(todayIso, -6));
    setEndDate(todayIso);
    setCartFilter('Semua');
  };

  const filteredTx = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.status !== 'Berhasil') return false;
      const matchCart = cartFilter === 'Semua' || tx.cartCode === cartFilter;
      const matchStart = !startDate || tx.dateIso >= startDate;
      const matchEnd = !endDate || tx.dateIso <= endDate;
      return matchCart && matchStart && matchEnd;
    });
  }, [transactions, startDate, endDate, cartFilter]);

  const summary = useMemo(() => {
    const totalSales = filteredTx.reduce((s, t) => s + t.total, 0);
    const count = filteredTx.length;
    const avg = count > 0 ? Math.round(totalSales / count) : 0;
    const cash = filteredTx
      .filter((t) => t.method === 'Tunai')
      .reduce((s, t) => s + t.total, 0);
    const qris = filteredTx
      .filter((t) => t.method === 'QRIS')
      .reduce((s, t) => s + t.total, 0);
    const cashPct = totalSales > 0 ? Math.round((cash / totalSales) * 100) : 0;
    const qrisPct = totalSales > 0 ? 100 - cashPct : 0;

    return { totalSales, count, avg, cash, qris, cashPct, qrisPct };
  }, [filteredTx]);

  const dailyRows = useMemo(() => {
    const start = startDate || todayIso;
    const end = endDate && endDate >= start ? endDate : start;
    const rows: {
      dateIso: string;
      label: string;
      shortLabel: string;
      count: number;
      cash: number;
      qris: number;
      total: number;
    }[] = [];

    let cur = start;
    for (let i = 0; i < 31; i++) {
      const dayTx = filteredTx.filter((t) => t.dateIso === cur);
      const cash = dayTx
        .filter((t) => t.method === 'Tunai')
        .reduce((s, t) => s + t.total, 0);
      const qris = dayTx
        .filter((t) => t.method === 'QRIS')
        .reduce((s, t) => s + t.total, 0);
      rows.push({
        dateIso: cur,
        label: formatShortIndoDate(cur, true),
        shortLabel: cur.slice(5).split('-').reverse().join('/'),
        count: dayTx.length,
        cash,
        qris,
        total: cash + qris,
      });
      if (cur >= end) break;
      cur = addDaysIso(cur, 1);
    }
    return rows;
  }, [filteredTx, startDate, endDate, todayIso]);

  const maxDailySales = Math.max(1, ...dailyRows.map((r) => r.total));

  const handleDownloadCsv = () => {
    exportToCsv(
      `laporan-penjualan-${startDate}-${endDate}.csv`,
      ['Tanggal', 'Transaksi', 'Tunai', 'QRIS', 'Total Penjualan'],
      dailyRows.map((r) => [r.dateIso, r.count, r.cash, r.qris, r.total]),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[36px] font-semibold tracking-tight text-[#171614]">
            Laporan penjualan
          </h1>
          <p className="text-sm text-[#6E6659] mt-1">
            Evaluasi perkembangan penjualan usaha berdasarkan periode yang Anda
            pilih.
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

      {/* Filter Bar */}
      <div className="rounded-3xl border border-[#E4DEC9] bg-white/75 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <div className="lg:col-span-3">
          <label className="block text-[11px] text-[#7B7263] mb-1.5">
            Periode
          </label>
          <select
            value={periodPreset}
            onChange={(e) =>
              handlePresetChange(e.target.value as '7days' | 'today' | '30days')
            }
            className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614] focus:outline-none"
          >
            <option value="today">Hari ini</option>
            <option value="7days">7 hari terakhir</option>
            <option value="30days">30 hari terakhir</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[11px] text-[#7B7263] mb-1.5">
            Tanggal mulai
          </label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-[#6E6659] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] pl-9 pr-3 py-2 text-xs font-medium text-[#171614] tabular-nums focus:outline-none"
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[11px] text-[#7B7263] mb-1.5">
            Tanggal selesai
          </label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-[#6E6659] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] pl-9 pr-3 py-2 text-xs font-medium text-[#171614] tabular-nums focus:outline-none"
            />
          </div>
        </div>

        <div className="lg:col-span-3 flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-[11px] text-[#7B7263] mb-1.5">
              Gerobak
            </label>
            <select
              value={cartFilter}
              onChange={(e) => setCartFilter(e.target.value)}
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614] focus:outline-none"
            >
              <option value="Semua">Semua gerobak</option>
              <option value="G-01">G-01</option>
              <option value="G-03">G-03</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="mt-5 px-3 py-2 text-xs font-medium text-[#8A7553] hover:text-[#171614]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#1D1B18] text-[#FAF8F3] p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#B8A88A]">
            <span>Total penjualan</span>
            <Wallet className="w-4 h-4 text-[#D2B98B]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight mt-2 tabular-nums">
            {formatRupiah(summary.totalSales)}
          </div>
          <div className="text-[11px] text-[#FAF8F3]/65 mt-2 tabular-nums">
            {formatIndoDateLabel(startDate)} – {formatIndoDateLabel(endDate)}
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Jumlah transaksi</span>
            <Receipt className="w-4 h-4 text-[#8E8371]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {summary.count}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Hanya transaksi berhasil
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Rata-rata transaksi</span>
            <TrendingUp className="w-4 h-4 text-[#8E8371]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {formatRupiah(summary.avg)}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2 tabular-nums">
            Periode laporan • {dailyRows.length} hari
          </div>
        </div>
      </div>

      {/* Chart + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-8 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#171614]">
                Tren penjualan harian
              </h2>
              <p className="text-xs text-[#7B7263] mt-0.5 tabular-nums">
                {formatIndoDateLabel(startDate)} – {formatIndoDateLabel(endDate)}{' '}
                • {cartFilter === 'Semua' ? 'semua gerobak' : cartFilter}
              </p>
            </div>
          </div>

          <div className="mt-6 h-44 flex items-end justify-between gap-2 border-b border-[#E5DFD0] pb-2 pt-6">
            {dailyRows.slice(-10).map((row) => {
              const pct =
                row.total > 0
                  ? Math.max(12, Math.round((row.total / maxDailySales) * 100))
                  : 4;
              const isPeak = row.total > 0 && row.total === maxDailySales;
              return (
                <div
                  key={row.dateIso}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                >
                  {row.total > 0 && (
                    <span className="text-[10px] font-mono text-[#6E6659] mb-1 tabular-nums">
                      {formatShortCurrency(row.total)}
                    </span>
                  )}
                  <div
                    style={{ height: `${pct}%` }}
                    className={`w-full max-w-[38px] rounded-t-lg ${
                      row.total === 0
                        ? 'bg-[#EFECE4]'
                        : isPeak
                          ? 'bg-[#1D1B18]'
                          : 'bg-[#D2C2A1]'
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between gap-2 pt-2 text-[10px] font-mono text-[#7B7263] tabular-nums">
            {dailyRows.slice(-10).map((row) => (
              <span key={row.dateIso} className="flex-1 text-center">
                {row.shortLabel}
              </span>
            ))}
          </div>
        </section>

        <section className="lg:col-span-4 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#171614]">
              Metode pembayaran
            </h2>
            <p className="text-xs text-[#7B7263] mt-0.5">
              Kontribusi terhadap total penjualan
            </p>

            <div className="mt-6 h-2.5 w-full rounded-full bg-[#EFECE4] overflow-hidden flex">
              <div
                style={{ width: `${summary.cashPct}%` }}
                className="bg-[#C5AF84] h-full transition-all"
              />
              <div
                style={{ width: `${summary.qrisPct}%` }}
                className="bg-[#1D1B18] h-full transition-all"
              />
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full bg-[#EFECE4] px-3 py-1 font-medium text-[#171614]">
                    Tunai
                  </span>
                  <span className="text-[#7B7263] tabular-nums">
                    {summary.cashPct}%
                  </span>
                </div>
                <span className="font-semibold text-[#171614] tabular-nums">
                  {formatRupiah(summary.cash)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full bg-[#1D1B18] px-3 py-1 font-medium text-[#FAF8F3]">
                    QRIS
                  </span>
                  <span className="text-[#7B7263] tabular-nums">
                    {summary.qrisPct}%
                  </span>
                </div>
                <span className="font-semibold text-[#171614] tabular-nums">
                  {formatRupiah(summary.qris)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#8E8371] mt-6">
            Hanya transaksi berhasil pada periode terpilih.
          </p>
        </section>
      </div>

      {/* Daily Breakdown Table */}
      <section className="rounded-3xl border border-[#E4DEC9] bg-white/75 overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#171614]">
            Rincian penjualan harian
          </h2>
          <span className="text-xs text-[#7B7263] tabular-nums">
            {dailyRows.length} hari
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-y border-[#E5DFD0] bg-[#FAF8F3] text-[10px] font-mono text-[#8E8371] uppercase">
                <th className="py-3 px-5 sm:px-6">TANGGAL</th>
                <th className="py-3 px-4 text-right">TRANSAKSI</th>
                <th className="py-3 px-4 text-right">TUNAI</th>
                <th className="py-3 px-4 text-right">QRIS</th>
                <th className="py-3 px-5 sm:px-6 text-right">
                  TOTAL PENJUALAN
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DA] text-xs sm:text-sm">
              {dailyRows.map((row) => (
                <tr
                  key={row.dateIso}
                  className={
                    row.dateIso === todayIso
                      ? 'bg-[#F5EFE2]'
                      : 'hover:bg-[#FAF8F3]'
                  }
                >
                  <td className="py-3 px-5 sm:px-6 font-medium text-[#171614]">
                    <span>{row.label}</span>
                    {row.dateIso === todayIso && (
                      <span className="ml-2 text-[11px] text-[#8A7553]">
                        Hari ini
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {row.count}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {formatRupiah(row.cash)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {formatRupiah(row.qris)}
                  </td>
                  <td className="py-3 px-5 sm:px-6 text-right font-semibold text-[#171614] tabular-nums">
                    {formatRupiah(row.total)}
                  </td>
                </tr>
              ))}
              <tr className="bg-[#EFECE4] font-semibold text-[#171614]">
                <td className="py-3.5 px-5 sm:px-6">Total periode</td>
                <td className="py-3.5 px-4 text-right tabular-nums">
                  {summary.count}
                </td>
                <td className="py-3.5 px-4 text-right tabular-nums">
                  {formatRupiah(summary.cash)}
                </td>
                <td className="py-3.5 px-4 text-right tabular-nums">
                  {formatRupiah(summary.qris)}
                </td>
                <td className="py-3.5 px-5 sm:px-6 text-right tabular-nums">
                  {formatRupiah(summary.totalSales)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
