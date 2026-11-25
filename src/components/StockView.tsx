import React, { useMemo, useState } from 'react';
import { Calendar, ChevronDown, Plus, Send, X } from 'lucide-react';
import {
  formatDecimalId,
  formatIndoDateLabel,
  getTodayWibIsoDate,
} from '../data/mockData';
import {
  IngredientId,
  IngredientStock,
  ProductWithStock,
  RiderAccount,
  StockMovement,
  StockRequest,
} from '../types';

interface StockViewProps {
  rider: RiderAccount;
  ingredients: IngredientStock[];
  products: ProductWithStock[];
  movements: StockMovement[];
  requests: StockRequest[];
  lastSyncedLabel: string | null;
  onSubmitStockRequest: (payload: {
    itemType: 'ingredient' | 'cups';
    ingredientId?: IngredientId;
    productId?: string;
    itemName: string;
    unit: 'kg' | 'liter' | 'cup';
    qty: number;
  }) => void;
}

type MovementFilter = 'Semua pergerakan' | 'Penjualan' | 'Alokasi awal';

export const StockView: React.FC<StockViewProps> = ({
  rider,
  ingredients,
  products,
  movements,
  requests,
  lastSyncedLabel,
  onSubmitStockRequest,
}) => {
  const [selectedDateIso, setSelectedDateIso] = useState<string>(() =>
    getTodayWibIsoDate(),
  );
  const [movementFilter, setMovementFilter] =
    useState<MovementFilter>('Semua pergerakan');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqType, setReqType] = useState<'ingredient' | 'cups'>('ingredient');
  const [reqIngredientId, setReqIngredientId] =
    useState<IngredientId>('coffee');
  const [reqProductId, setReqProductId] = useState<string>(
    products[0]?.id ?? 'kopi-susu-gula-aren',
  );
  const [reqQty, setReqQty] = useState<string>('2');

  const lowStockCount = useMemo(
    () =>
      ingredients.filter((item) => item.remaining <= item.lowThreshold).length,
    [ingredients],
  );

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchDate = !selectedDateIso || m.dateIso === selectedDateIso;
      const matchType =
        movementFilter === 'Semua pergerakan' || m.type === movementFilter;
      return matchDate && matchType;
    });
  }, [movements, selectedDateIso, movementFilter]);

  const myRequests = useMemo(
    () => requests.filter((r) => r.riderId === rider.id),
    [requests, rider.id],
  );

  const selectedDateLabel = selectedDateIso
    ? formatIndoDateLabel(selectedDateIso)
    : 'Semua tanggal';

  const tomorrowDateLabel = useMemo(() => {
    const baseIso = selectedDateIso || getTodayWibIsoDate();
    const [y, m, d] = baseIso.split('-').map((n) => parseInt(n, 10));
    if (!y || !m || !d) return 'Besok';
    const nextDay = new Date(Date.UTC(y, m - 1, d + 1, 12, 0, 0));
    const nextIso = nextDay.toISOString().slice(0, 10);
    return formatIndoDateLabel(nextIso);
  }, [selectedDateIso]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericQty = parseFloat(reqQty);
    if (!numericQty || numericQty <= 0) return;

    if (reqType === 'ingredient') {
      const ing = ingredients.find((i) => i.id === reqIngredientId);
      if (!ing) return;
      onSubmitStockRequest({
        itemType: 'ingredient',
        ingredientId: ing.id,
        itemName: ing.name,
        unit: ing.unit,
        qty: numericQty,
      });
    } else {
      const prod = products.find((p) => p.id === reqProductId);
      if (!prod) return;
      onSubmitStockRequest({
        itemType: 'cups',
        productId: prod.id,
        itemName: `Cup ${prod.name}`,
        unit: 'cup',
        qty: Math.round(numericQty),
      });
    }
    setShowRequestModal(false);
    setReqQty('2');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="font-mono text-[11px] tracking-[0.16em] text-[#8E8371] uppercase">
            {rider.cartCode} &nbsp;/&nbsp; PERSEDIAAN
          </div>
          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="rounded-full bg-[#1D1B18] hover:bg-[#2E2A25] text-[#FAF8F3] px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajukan permintaan stok</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-[40px] font-semibold tracking-tight text-[#171614]">
              Stok gerobak
            </h1>
            <p className="text-sm text-[#6E6659] mt-1">
              Pantau persediaan dan ajukan permintaan stok ke dashboard Owner.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="relative">
              <Calendar
                className="w-4 h-4 text-[#6E6659] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="date"
                value={selectedDateIso}
                onChange={(e) => setSelectedDateIso(e.target.value)}
                aria-label="Pilih tanggal stok"
                className="rounded-full border border-[#DFD9C9] bg-white/85 pl-10 pr-4 py-2.5 text-sm text-[#171614] focus:outline-none focus:border-[#9E8C6C] tabular-nums"
              />
            </div>
            {selectedDateIso && (
              <button
                type="button"
                onClick={() => setSelectedDateIso('')}
                className="rounded-full border border-[#DFD9C9] bg-white/85 hover:bg-[#EFECE4] px-3 py-2.5 text-xs font-medium text-[#5C5549] whitespace-nowrap transition-colors"
              >
                Semua
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="text-3xl sm:text-[34px] font-semibold tracking-tight text-[#171614] tabular-nums">
            {ingredients.length}
          </div>
          <div className="text-xs text-[#6E6659] mt-2">Bahan dipantau</div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div
            className={`text-3xl sm:text-[34px] font-semibold tracking-tight tabular-nums ${
              lowStockCount > 0 ? 'text-[#A66323]' : 'text-[#2E6B47]'
            }`}
          >
            {lowStockCount}
          </div>
          <div className="text-xs text-[#6E6659] mt-2">
            Stok kosong / menipis
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="text-2xl sm:text-[30px] font-semibold tracking-tight text-[#171614] tabular-nums">
            {lastSyncedLabel ?? 'Belum ada'}
          </div>
          <div className="text-xs text-[#6E6659] mt-2">
            Sinkronisasi terakhir
          </div>
        </div>
      </div>

      {/* Rider Submitted Stock Requests */}
      {myRequests.length > 0 && (
        <section className="rounded-3xl border border-[#E4DEC9] bg-[#F3EFE6] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-base font-semibold text-[#171614]">
              Status permintaan stok ke Owner
            </h2>
            <span className="text-xs text-[#7B7263] tabular-nums">
              {myRequests.length} pengajuan
            </span>
          </div>
          <div className="space-y-2">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl bg-white/80 border border-[#E5DFD0] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-mono text-[#8E8371] mr-2">
                    {req.id}
                  </span>
                  <span className="font-semibold text-[#171614]">
                    {req.itemName}
                  </span>
                  <span className="text-[#6E6659] ml-2 tabular-nums">
                    ({formatDecimalId(req.qty)} {req.unit})
                  </span>
                  {req.rejectionReason && (
                    <div className="text-[11px] text-[#9B1C1C] mt-0.5">
                      Alasan: {req.rejectionReason}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#7B7263] tabular-nums">
                    {req.requestedAtLabel}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 font-medium ${
                      req.status === 'Disetujui'
                        ? 'bg-[#E6EFE8] text-[#2E6B47]'
                        : req.status === 'Ditolak'
                          ? 'bg-red-100 text-[#9B1C1C]'
                          : 'bg-[#F5E8D6] text-[#9C5D24]'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Current Stock Table */}
      <section className="rounded-3xl border border-[#E4DEC9] bg-white/75 overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4">
          <h2 className="text-xl font-semibold text-[#171614]">
            Kondisi stok saat ini
          </h2>
          <p className="text-xs text-[#7B7263] mt-0.5">
            Persediaan awal dimulai dari 0 hingga ditambahkan oleh dashboard
            Owner.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead>
              <tr className="bg-[#EFECE4] border-y border-[#E5DFD0] text-xs font-medium text-[#6E6659]">
                <th className="py-3 px-5 sm:px-6">Bahan baku</th>
                <th className="py-3 px-4">Stok tersisa</th>
                <th className="py-3 px-4">Dipakai hari ini</th>
                <th className="py-3 px-5 sm:px-6 text-right">Kondisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DA] text-sm">
              {ingredients.map((item) => {
                const isEmpty = item.remaining <= 0;
                const isLow = item.remaining <= item.lowThreshold;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FAF8F3] transition-colors"
                  >
                    <td className="py-3.5 px-5 sm:px-6 font-medium text-[#171614]">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#171614] tabular-nums">
                      {formatDecimalId(item.remaining)} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-[#6E6659] tabular-nums">
                      {formatDecimalId(item.usedToday)} {item.unit}
                    </td>
                    <td className="py-3.5 px-5 sm:px-6 text-right">
                      <span
                        className={`inline-block rounded-full px-3.5 py-1 text-xs font-medium ${
                          isEmpty || isLow
                            ? 'bg-[#F5E8D6] text-[#9C5D24]'
                            : 'bg-[#E6EFE8] text-[#2E6B47]'
                        }`}
                      >
                        {isEmpty ? 'Kosong' : isLow ? 'Menipis' : 'Aman'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dark Tomorrow's Stock Recommendation Panel */}
      <section className="rounded-3xl bg-[#1D1B18] text-[#FAF8F3] p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-[#FAF8F3]">
              Rekomendasi stok besok
            </h2>
            <p className="text-xs text-[#FAF8F3]/60 mt-1">
              Estimasi kebutuhan gerobak berdasarkan target harian dari Owner.
            </p>
          </div>
          <span className="self-start rounded-full bg-[#2C2924] border border-[#FAF8F3]/10 px-3.5 py-1.5 text-xs font-medium text-[#FAF8F3]/85 whitespace-nowrap tabular-nums">
            {tomorrowDateLabel}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead>
              <tr className="border-b border-[#FAF8F3]/10 text-xs font-medium text-[#9B9182]">
                <th className="py-2.5 pr-4">Bahan baku</th>
                <th className="py-2.5 px-4">Pemakaian 7 hari</th>
                <th className="py-2.5 px-4">Target besok</th>
                <th className="py-2.5 pl-4 text-right">Tambah stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF8F3]/8 text-sm">
              {ingredients.map((item) => {
                const addNeeded = Math.max(0, item.tomorrowTarget - item.remaining);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FAF8F3]/[0.03] transition-colors"
                  >
                    <td className="py-3.5 px-3 font-medium text-[#FAF8F3] rounded-l-xl">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-[#FAF8F3]/75 tabular-nums">
                      {formatDecimalId(item.weeklyUsage)} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#FAF8F3] tabular-nums">
                      {formatDecimalId(item.tomorrowTarget)} {item.unit}
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold text-[#D2B98B] tabular-nums rounded-r-xl">
                      +{formatDecimalId(addNeeded)} {item.unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stock Movement History Table */}
      <section className="rounded-3xl border border-[#E4DEC9] bg-white/75 overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#171614]">
              Riwayat pergerakan stok
            </h2>
            <p className="text-xs text-[#7B7263] mt-0.5 tabular-nums">
              {selectedDateLabel}
            </p>
          </div>

          <div className="relative self-start sm:self-center">
            <select
              value={movementFilter}
              onChange={(e) =>
                setMovementFilter(e.target.value as MovementFilter)
              }
              aria-label="Filter jenis pergerakan stok"
              className="appearance-none rounded-full border border-[#DFD9C9] bg-[#FAF8F3] pl-4 pr-9 py-2 text-xs font-medium text-[#171614] focus:outline-none focus:border-[#9E8C6C]"
            >
              <option value="Semua pergerakan">Semua pergerakan</option>
              <option value="Penjualan">Penjualan</option>
              <option value="Alokasi awal">Alokasi awal</option>
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 text-[#6E6659] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead>
              <tr className="bg-[#EFECE4] border-y border-[#E5DFD0] text-xs font-medium text-[#6E6659]">
                <th className="py-3 px-5 sm:px-6">Waktu</th>
                <th className="py-3 px-4">Bahan baku</th>
                <th className="py-3 px-4">Pergerakan</th>
                <th className="py-3 px-5 sm:px-6 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DA] text-sm">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-xs text-[#7B7263]"
                  >
                    Belum ada pergerakan stok. Stok akan tercatat setelah ada
                    alokasi dari Owner atau transaksi penjualan.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isInitial = mov.type === 'Alokasi awal';
                  const sign = mov.delta >= 0 ? '+' : '-';
                  return (
                    <tr
                      key={mov.id}
                      className="hover:bg-[#FAF8F3] transition-colors"
                    >
                      <td className="py-3.5 px-5 sm:px-6 font-mono text-xs text-[#6E6659] tabular-nums">
                        {mov.time}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#171614]">
                        {mov.ingredientName}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-xs font-medium tabular-nums ${
                          isInitial ? 'text-[#2E6B47]' : 'text-[#6E6659]'
                        }`}
                      >
                        {mov.type} • {sign}
                        {formatDecimalId(Math.abs(mov.delta))} {mov.unit}
                      </td>
                      <td className="py-3.5 px-5 sm:px-6 text-right font-semibold text-[#171614] tabular-nums">
                        {formatDecimalId(mov.balance)} {mov.unit}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Request Stock Modal */}
      {showRequestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleRequestSubmit}
            className="w-full max-w-md rounded-3xl bg-[#FAF8F3] border border-[#DFD9C9] p-6 text-[#171614] shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] tracking-[0.16em] text-[#8E8371] uppercase">
                  {rider.cartCode} / PERMINTAAN STOK
                </div>
                <h3 className="text-xl font-semibold mt-1">
                  Ajukan permintaan stok
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="rounded-full p-1.5 text-[#6E6659] hover:bg-[#EFECE4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
                Jenis permintaan
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-[#EFECE4]">
                <button
                  type="button"
                  onClick={() => {
                    setReqType('ingredient');
                    setReqQty('2');
                  }}
                  className={`rounded-full py-2 text-xs font-semibold transition-colors ${
                    reqType === 'ingredient'
                      ? 'bg-[#1D1B18] text-[#FAF8F3]'
                      : 'text-[#6E6659]'
                  }`}
                >
                  Bahan baku
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReqType('cups');
                    setReqQty('20');
                  }}
                  className={`rounded-full py-2 text-xs font-semibold transition-colors ${
                    reqType === 'cups'
                      ? 'bg-[#1D1B18] text-[#FAF8F3]'
                      : 'text-[#6E6659]'
                  }`}
                >
                  Cup produk siap jual
                </button>
              </div>
            </div>

            {reqType === 'ingredient' ? (
              <div>
                <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
                  Pilih bahan baku
                </label>
                <select
                  value={reqIngredientId}
                  onChange={(e) =>
                    setReqIngredientId(e.target.value as IngredientId)
                  }
                  className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] focus:outline-none focus:border-[#9E8C6C]"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
                  Pilih produk menu
                </label>
                <select
                  value={reqProductId}
                  onChange={(e) => setReqProductId(e.target.value)}
                  className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] focus:outline-none focus:border-[#9E8C6C]"
                >
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (Stok saat ini: {prod.stock} cup)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
                Jumlah diminta (
                {reqType === 'cups'
                  ? 'cup'
                  : ingredients.find((i) => i.id === reqIngredientId)?.unit ??
                    'unit'}
                )
              </label>
              <input
                type="number"
                step={reqType === 'cups' ? '1' : '0.1'}
                min="0.1"
                required
                value={reqQty}
                onChange={(e) => setReqQty(e.target.value)}
                className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] focus:outline-none focus:border-[#9E8C6C] tabular-nums"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="rounded-full border border-[#D8D1C1] px-4 py-2 text-xs font-semibold text-[#5C5549] hover:bg-[#EFECE4]"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#1D1B18] hover:bg-[#2F2B25] text-[#FAF8F3] px-5 py-2 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim ke Owner</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
