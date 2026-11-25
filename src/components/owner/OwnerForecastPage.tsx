import React, { useMemo, useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import {
  addDaysIso,
  exportToCsv,
  formatDecimalId,
  formatShortIndoDate,
  getTodayWibIsoDate,
} from '../../data/mockData';
import {
  CartWorkspaceData,
  CentralStockItem,
  IngredientId,
  Transaction,
} from '../../types';

interface OwnerForecastPageProps {
  centralStock: CentralStockItem[];
  carts: Record<string, CartWorkspaceData>;
  transactions: Transaction[];
}

export const OwnerForecastPage: React.FC<OwnerForecastPageProps> = ({
  centralStock,
  carts,
  transactions,
}) => {
  const todayIso = useMemo(() => getTodayWibIsoDate(), []);
  const [horizonDays, setHorizonDays] = useState<7 | 14>(7);
  const [startDate, setStartDate] = useState<string>(() => todayIso);
  const [endDate, setEndDate] = useState<string>(() =>
    addDaysIso(todayIso, 6),
  );
  const [scope, setScope] = useState<'pusat' | 'rider-01' | 'rider-03'>('pusat');
  const [selectedIngredient, setSelectedIngredient] =
    useState<IngredientId>('coffee');

  const handleHorizonChange = (days: 7 | 14) => {
    setHorizonDays(days);
    setEndDate(addDaysIso(startDate || todayIso, days - 1));
  };

  const handleReset = () => {
    setHorizonDays(7);
    setStartDate(todayIso);
    setEndDate(addDaysIso(todayIso, 6));
    setScope('pusat');
  };

  const dailyAvgUsage = useMemo(() => {
    const targetCarts =
      scope === 'pusat'
        ? Object.values(carts)
        : carts[scope]
          ? [carts[scope]]
          : [];
    const coffeeUsed = targetCarts.reduce(
      (s, c) =>
        s + (c.ingredients.find((i) => i.id === 'coffee')?.usedToday ?? 0),
      0,
    );
    const milkUsed = targetCarts.reduce(
      (s, c) =>
        s + (c.ingredients.find((i) => i.id === 'milk')?.usedToday ?? 0),
      0,
    );
    const sugarUsed = targetCarts.reduce(
      (s, c) =>
        s + (c.ingredients.find((i) => i.id === 'palmSugar')?.usedToday ?? 0),
      0,
    );
    const cupsSold = transactions
      .filter((t) => t.status === 'Berhasil')
      .reduce((s, t) => s + t.totalCups, 0);

    return {
      coffee: coffeeUsed > 0 ? coffeeUsed : 0,
      milk: milkUsed > 0 ? milkUsed : 0,
      palmSugar: sugarUsed > 0 ? sugarUsed : 0,
      cups: cupsSold,
    };
  }, [carts, scope, transactions]);

  const forecastRows = useMemo(() => {
    const getStockAvailable = (id: IngredientId | 'cups') => {
      if (scope === 'pusat') {
        return centralStock.find((c) => c.id === id)?.available ?? 0;
      }
      const cart = carts[scope];
      if (!cart) return 0;
      if (id === 'cups') {
        return Object.values(cart.productStocks).reduce((s, v) => s + v, 0);
      }
      return cart.ingredients.find((i) => i.id === id)?.remaining ?? 0;
    };

    const items: {
      id: IngredientId | 'cups';
      name: string;
      unit: string;
      stock: number;
      estimated: number;
      targetWithSafety: number;
      addRecommended: number;
      status: 'Aman' | 'Perlu tambah' | 'Prioritas';
    }[] = [
      {
        id: 'coffee',
        name: 'Biji kopi',
        unit: 'kg',
        stock: getStockAvailable('coffee'),
        estimated: Math.round(dailyAvgUsage.coffee * horizonDays * 10) / 10,
        targetWithSafety: 0,
        addRecommended: 0,
        status: 'Aman',
      },
      {
        id: 'milk',
        name: 'Susu segar',
        unit: 'L',
        stock: getStockAvailable('milk'),
        estimated: Math.round(dailyAvgUsage.milk * horizonDays * 10) / 10,
        targetWithSafety: 0,
        addRecommended: 0,
        status: 'Aman',
      },
      {
        id: 'palmSugar',
        name: 'Gula aren',
        unit: 'L',
        stock: getStockAvailable('palmSugar'),
        estimated: Math.round(dailyAvgUsage.palmSugar * horizonDays * 10) / 10,
        targetWithSafety: 0,
        addRecommended: 0,
        status: 'Aman',
      },
      {
        id: 'cups',
        name: 'Kemasan cup',
        unit: 'pcs',
        stock: getStockAvailable('cups'),
        estimated: Math.round(dailyAvgUsage.cups * horizonDays),
        targetWithSafety: 0,
        addRecommended: 0,
        status: 'Aman',
      },
    ];

    return items.map((row) => {
      const target =
        row.unit === 'pcs'
          ? Math.ceil(row.estimated * 1.1)
          : Math.ceil(row.estimated * 1.1 * 10) / 10;
      const add =
        row.unit === 'pcs'
          ? Math.max(0, target - row.stock)
          : Math.max(0, Math.round((target - row.stock) * 10) / 10);
      const status: 'Aman' | 'Perlu tambah' | 'Prioritas' =
        row.stock <= 0 && target > 0
          ? 'Prioritas'
          : add > 0
            ? 'Perlu tambah'
            : 'Aman';
      return {
        ...row,
        targetWithSafety: target,
        addRecommended: add,
        status,
      };
    });
  }, [centralStock, carts, scope, dailyAvgUsage, horizonDays]);

  const needRestockCount = forecastRows.filter(
    (r) => r.addRecommended > 0 || r.stock <= 0,
  ).length;
  const coffeeEstimate =
    forecastRows.find((r) => r.id === 'coffee')?.estimated ?? 0;

  const trendBars = useMemo(() => {
    const rate = dailyAvgUsage[selectedIngredient];
    const bars: { label: string; value: number; isForecast: boolean }[] = [];
    for (let i = 4; i >= 1; i--) {
      const d = addDaysIso(todayIso, -i);
      bars.push({
        label: d.slice(5).split('-').reverse().join('/'),
        value: 0,
        isForecast: false,
      });
    }
    bars.push({
      label: todayIso.slice(5).split('-').reverse().join('/'),
      value: rate,
      isForecast: false,
    });
    for (let i = 1; i <= 5; i++) {
      const d = addDaysIso(todayIso, i);
      bars.push({
        label: d.slice(5).split('-').reverse().join('/'),
        value: rate,
        isForecast: true,
      });
    }
    return bars;
  }, [dailyAvgUsage, selectedIngredient, todayIso]);

  const maxBar = Math.max(1, ...trendBars.map((b) => b.value));

  const handleDownloadCsv = () => {
    exportToCsv(
      `proyeksi-stok-${todayIso}.csv`,
      ['Bahan Baku', 'Stok Tersedia', 'Estimasi Kebutuhan', 'Target +10%', 'Rekomendasi Tambahan', 'Status'],
      forecastRows.map((r) => [
        r.name,
        `${r.stock} ${r.unit}`,
        `${r.estimated} ${r.unit}`,
        `${r.targetWithSafety} ${r.unit}`,
        `+${r.addRecommended} ${r.unit}`,
        r.status,
      ]),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[36px] font-semibold tracking-tight text-[#171614]">
            Forecasting kebutuhan stok
          </h1>
          <p className="text-sm text-[#6E6659] mt-1">
            Rencanakan pengadaan bahan baku berdasarkan penjualan dan penggunaan
            stok aktual.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="self-start sm:self-center rounded-full border border-[#DFD9C9] bg-white hover:bg-[#EFECE4] px-4 py-2.5 text-xs font-semibold text-[#171614] inline-flex items-center gap-2 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh laporan</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-3xl border border-[#E4DEC9] bg-white/75 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <div className="lg:col-span-3">
          <label className="block text-[11px] text-[#7B7263] mb-1.5">
            Periode forecasting
          </label>
          <select
            value={horizonDays}
            onChange={(e) =>
              handleHorizonChange(Number(e.target.value) as 7 | 14)
            }
            className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614]"
          >
            <option value={7}>7 hari ke depan</option>
            <option value={14}>14 hari ke depan</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[11px] text-[#7B7263] mb-1.5">
            Tanggal mulai proyeksi
          </label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-[#6E6659] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] pl-9 pr-3 py-2 text-xs font-medium text-[#171614] tabular-nums"
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[11px] text-[#7B7263] mb-1.5">
            Tanggal akhir proyeksi
          </label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-[#6E6659] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] pl-9 pr-3 py-2 text-xs font-medium text-[#171614] tabular-nums"
            />
          </div>
        </div>

        <div className="lg:col-span-3 flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-[11px] text-[#7B7263] mb-1.5">
              Cakupan stok
            </label>
            <select
              value={scope}
              onChange={(e) =>
                setScope(e.target.value as 'pusat' | 'rider-01' | 'rider-03')
              }
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614]"
            >
              <option value="pusat">Stok pusat</option>
              <option value="rider-01">Gerobak G-01</option>
              <option value="rider-03">Gerobak G-03</option>
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

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#1D1B18] text-[#FAF8F3] p-5 sm:p-6">
          <div className="text-xs text-[#B8A88A]">Bahan perlu ditambah</div>
          <div className="text-3xl font-semibold mt-2 tabular-nums">
            {needRestockCount} bahan
          </div>
          <div className="text-[11px] text-[#D2B98B] mt-2">
            Dari {forecastRows.length} jenis bahan &amp; perlengkapan
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="text-xs text-[#6E6659]">Estimasi biji kopi</div>
          <div className="text-3xl font-semibold text-[#171614] mt-2 tabular-nums">
            {formatDecimalId(coffeeEstimate)} kg
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2 tabular-nums">
            Kebutuhan {horizonDays} hari ke depan
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="text-xs text-[#6E6659]">Stok pengaman</div>
          <div className="text-3xl font-semibold text-[#171614] mt-2 tabular-nums">
            10%
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Cadangan di luar estimasi kebutuhan
          </div>
        </div>
      </div>

      {/* Trend Chart + Projection Basis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-8 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#171614]">
                Tren penggunaan bahan baku
              </h2>
              <p className="text-xs text-[#7B7263] mt-0.5">
                Historis &amp; proyeksi penggunaan harian
              </p>
            </div>

            <select
              value={selectedIngredient}
              onChange={(e) =>
                setSelectedIngredient(e.target.value as IngredientId)
              }
              className="rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-1.5 text-xs font-medium text-[#171614]"
            >
              <option value="coffee">Biji kopi</option>
              <option value="milk">Susu segar</option>
              <option value="palmSugar">Gula aren</option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-end gap-4 text-[11px] text-[#5C5549]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#D2C2A1]" />
              Historis
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#1D1B18]" />
              Proyeksi
            </span>
          </div>

          <div className="mt-3 h-40 flex items-end justify-between gap-2 border-b border-[#E5DFD0] pb-2 pt-4">
            {trendBars.map((bar, i) => {
              const pct =
                bar.value > 0
                  ? Math.max(12, Math.round((bar.value / maxBar) * 100))
                  : 4;
              return (
                <div
                  key={`${bar.label}-${i}`}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                >
                  <div
                    style={{ height: `${pct}%` }}
                    className={`w-full max-w-[30px] rounded-t-md ${
                      bar.value === 0
                        ? 'bg-[#EFECE4]'
                        : bar.isForecast
                          ? 'bg-[#1D1B18]'
                          : 'bg-[#D2C2A1]'
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between gap-2 pt-2 text-[10px] font-mono text-[#7B7263] tabular-nums">
            {trendBars.map((bar, i) => (
              <span key={`${bar.label}-${i}`} className="flex-1 text-center">
                {bar.label}
              </span>
            ))}
          </div>
        </section>

        <aside className="lg:col-span-4 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#171614]">
              Dasar proyeksi
            </h2>
            <p className="text-xs text-[#7B7263] mt-0.5">
              Historis penjualan &amp; penggunaan stok
            </p>
          </div>

          <div className="border-t border-[#ECE7DA] pt-3 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#7B7263]">Metode</span>
              <span className="font-semibold text-[#171614]">
                Pemakaian aktual harian
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7B7263]">Data acuan</span>
              <span className="font-semibold text-[#171614] tabular-nums">
                {formatShortIndoDate(todayIso)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7B7263]">Stok pengaman</span>
              <span className="font-semibold text-[#171614]">
                10% dari estimasi
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#8A7553] leading-relaxed pt-2 border-t border-[#ECE7DA]">
            Proyeksi dihitung otomatis dari transaksi aktual di Website Riders.
            Saat penjualan masih 0, estimasi dimulai dari 0.
          </p>
        </aside>
      </div>

      {/* Recommendations Table */}
      <section className="rounded-3xl border border-[#E4DEC9] bg-white/75 overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#171614]">
            Estimasi &amp; rekomendasi kebutuhan
          </h2>
          <span className="text-xs text-[#7B7263] tabular-nums">
            {formatShortIndoDate(startDate)} – {formatShortIndoDate(endDate)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px] text-xs sm:text-sm">
            <thead>
              <tr className="border-y border-[#E5DFD0] bg-[#FAF8F3] text-[10px] font-mono text-[#8E8371] uppercase">
                <th className="py-3 px-5">BAHAN BAKU</th>
                <th className="py-3 px-3">STOK TERSEDIA</th>
                <th className="py-3 px-3">ESTIMASI {horizonDays} HARI</th>
                <th className="py-3 px-3">TARGET +10%</th>
                <th className="py-3 px-3">REKOMENDASI TAMBAHAN</th>
                <th className="py-3 px-5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DA]">
              {forecastRows.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAF8F3]">
                  <td className="py-3.5 px-5 font-semibold text-[#171614]">
                    {row.name}
                  </td>
                  <td className="py-3.5 px-3 tabular-nums">
                    {formatDecimalId(row.stock)} {row.unit}
                  </td>
                  <td className="py-3.5 px-3 tabular-nums">
                    {formatDecimalId(row.estimated)} {row.unit}
                  </td>
                  <td className="py-3.5 px-3 font-medium tabular-nums">
                    {formatDecimalId(row.targetWithSafety)} {row.unit}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#8A7553] tabular-nums">
                    +{formatDecimalId(row.addRecommended)} {row.unit}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span
                      className={`inline-block rounded-full px-3.5 py-0.5 text-[11px] font-medium ${
                        row.status === 'Prioritas'
                          ? 'bg-red-50 text-[#9B1C1C]'
                          : row.status === 'Perlu tambah'
                            ? 'bg-[#F5E8D6] text-[#9C5D24]'
                            : 'bg-[#E6EFE8] text-[#2E6B47]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
