import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Boxes,
  CheckCircle2,
  PackagePlus,
  XCircle,
} from 'lucide-react';
import { formatDecimalId, RIDER_ACCOUNTS } from '../../data/mockData';
import {
  AllocationHistoryItem,
  CartWorkspaceData,
  CentralStockItem,
  IngredientId,
  Product,
  StockRequest,
  StockRequestStatus,
} from '../../types';

interface OwnerAllocationPageProps {
  requests: StockRequest[];
  centralStock: CentralStockItem[];
  carts: Record<string, CartWorkspaceData>;
  products: Product[];
  allocationHistory: AllocationHistoryItem[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onDirectAllocateBundle: (riderId: string) => void;
  onDirectAllocateCustom: (payload: {
    riderId: string;
    itemType: 'ingredient' | 'cups';
    ingredientId?: IngredientId;
    productId?: string;
    qty: number;
  }) => void;
  onRestockCentral: () => void;
}

export const OwnerAllocationPage: React.FC<OwnerAllocationPageProps> = ({
  requests,
  centralStock,
  carts,
  products,
  allocationHistory,
  onApproveRequest,
  onRejectRequest,
  onDirectAllocateBundle,
  onDirectAllocateCustom,
  onRestockCentral,
}) => {
  const [statusTab, setStatusTab] = useState<'Semua' | StockRequestStatus>(
    'Semua',
  );
  const [selectedReqId, setSelectedReqId] = useState<string>(
    requests.find((r) => r.status === 'Menunggu')?.id ?? requests[0]?.id ?? '',
  );
  const [rejectionReason, setRejectionReason] = useState('');

  // Direct allocation panel state
  const [directRiderId, setDirectRiderId] = useState<string>('rider-03');
  const [directType, setDirectType] = useState<'ingredient' | 'cups'>('cups');
  const [directIngId, setDirectIngId] = useState<IngredientId>('coffee');
  const [directProductId, setDirectProductId] = useState<string>(
    products[0]?.id ?? 'kopi-susu-gula-aren',
  );
  const [directQty, setDirectQty] = useState<string>('20');

  const counts = useMemo(() => {
    const waiting = requests.filter((r) => r.status === 'Menunggu').length;
    const approved = allocationHistory.filter(
      (h) => h.status === 'Disetujui',
    ).length;
    const rejected = allocationHistory.filter(
      (h) => h.status === 'Ditolak',
    ).length;

    let lowPoints = centralStock.filter(
      (c) => c.available <= c.minThreshold,
    ).length;
    Object.values(carts).forEach((cart) => {
      if (cart.ingredients.some((i) => i.remaining <= i.lowThreshold)) {
        lowPoints += 1;
      }
    });
    return { waiting, approved, rejected, lowPoints };
  }, [requests, allocationHistory, centralStock, carts]);

  const filteredRequests = useMemo(() => {
    if (statusTab === 'Semua') return requests;
    return requests.filter((r) => r.status === statusTab);
  }, [requests, statusTab]);

  const activeRequest = useMemo(() => {
    return (
      requests.find((r) => r.id === selectedReqId) ??
      requests.find((r) => r.status === 'Menunggu') ??
      requests[0] ??
      null
    );
  }, [requests, selectedReqId]);

  const previewMeta = useMemo(() => {
    if (!activeRequest) return null;
    const targetCart = carts[activeRequest.riderId];
    if (activeRequest.itemType === 'ingredient' && activeRequest.ingredientId) {
      const central = centralStock.find(
        (c) => c.id === activeRequest.ingredientId,
      );
      const cartIng = targetCart?.ingredients.find(
        (i) => i.id === activeRequest.ingredientId,
      );
      const centralBefore = central?.available ?? 0;
      const cartBefore = cartIng?.remaining ?? 0;
      return {
        centralBefore,
        centralAfter: Math.max(0, centralBefore - activeRequest.qty),
        cartBefore,
        cartAfter: cartBefore + activeRequest.qty,
        unit: activeRequest.unit,
        hasEnoughCentral: centralBefore >= activeRequest.qty,
      };
    }

    const centralCups = centralStock.find((c) => c.id === 'cups');
    const centralBefore = centralCups?.available ?? 0;
    const cartBefore = activeRequest.productId
      ? (targetCart?.productStocks[activeRequest.productId] ?? 0)
      : 0;
    return {
      centralBefore,
      centralAfter: Math.max(0, centralBefore - activeRequest.qty),
      cartBefore,
      cartAfter: cartBefore + activeRequest.qty,
      unit: 'cup',
      hasEnoughCentral: centralBefore >= activeRequest.qty,
    };
  }, [activeRequest, carts, centralStock]);

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseFloat(directQty);
    if (!numeric || numeric <= 0) return;
    onDirectAllocateCustom({
      riderId: directRiderId,
      itemType: directType,
      ingredientId: directType === 'ingredient' ? directIngId : undefined,
      productId: directType === 'cups' ? directProductId : undefined,
      qty: directType === 'cups' ? Math.round(numeric) : numeric,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[36px] font-semibold tracking-tight text-[#171614]">
            Manajemen alokasi stok
          </h1>
          <p className="text-sm text-[#6E6659] mt-1">
            Tinjau permintaan dari Website Riders atau alokasikan stok langsung
            ke gerobak.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDirectAllocateBundle(directRiderId)}
          className="self-start sm:self-center rounded-full bg-[#1D1B18] hover:bg-[#2F2B25] text-[#FAF8F3] px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <PackagePlus className="w-3.5 h-3.5" />
          <span>Alokasi paket standar ke {carts[directRiderId]?.cartCode ?? 'G-03'}</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#1D1B18] text-[#FAF8F3] p-5">
          <div className="text-xs text-[#B8A88A]">Permintaan menunggu</div>
          <div className="text-3xl font-semibold mt-2 tabular-nums">
            {counts.waiting}
          </div>
          <div className="text-[11px] text-[#D2B98B] mt-2">
            Perlu ditinjau owner
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5">
          <div className="text-xs text-[#6E6659]">Disetujui / dialokasikan</div>
          <div className="text-3xl font-semibold text-[#171614] mt-2 tabular-nums">
            {counts.approved}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Stok gerobak diperbarui otomatis
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5">
          <div className="text-xs text-[#6E6659]">Ditolak hari ini</div>
          <div className="text-3xl font-semibold text-[#171614] mt-2 tabular-nums">
            {counts.rejected}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Keterangan tersimpan
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5">
          <div className="text-xs text-[#6E6659]">Titik stok menipis</div>
          <div className="text-3xl font-semibold text-[#171614] mt-2 tabular-nums">
            {counts.lowPoints}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Pusat &amp; gerobak operasional
          </div>
        </div>
      </div>

      {/* Notification Banner if pending */}
      {counts.waiting > 0 && (
        <div className="rounded-2xl border border-[#DECFA8] bg-[#F5EFE2] px-4 py-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-[#8A7553] shrink-0" />
            <div>
              <strong className="text-[#171614]">
                {counts.waiting} permintaan stok menunggu tindakan Anda
              </strong>
              <span className="text-[#6E6659] ml-2">
                Diterima langsung dari Website Riders.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Split: Rider Requests Table + Review / Direct Allocation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Requests Table */}
        <section className="lg:col-span-7 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-[#171614]">
              Permintaan stok rider
            </h2>

            <div className="flex flex-wrap gap-1.5">
              {(
                ['Semua', 'Menunggu', 'Disetujui', 'Ditolak'] as const
              ).map((tab) => {
                const active = statusTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusTab(tab)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#1D1B18] text-[#FAF8F3]'
                        : 'bg-[#EFECE4] text-[#5C5549]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="border-y border-[#E5DFD0] bg-[#FAF8F3] text-[10px] font-mono text-[#8E8371] uppercase">
                  <th className="py-2.5 px-3">RIDER / GEROBAK</th>
                  <th className="py-2.5 px-3">BAHAN / ITEM</th>
                  <th className="py-2.5 px-3">JUMLAH</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DA] text-xs">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-[#7B7263]"
                    >
                      Belum ada permintaan stok dari rider. Anda tetap bisa
                      mengalokasikan stok langsung di panel kanan.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedReqId(req.id)}
                      className={`cursor-pointer ${
                        activeRequest?.id === req.id
                          ? 'bg-[#F5EFE2]'
                          : 'hover:bg-[#FAF8F3]'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#171614]">
                          {req.riderName}
                        </div>
                        <div className="text-[11px] text-[#7B7263] font-mono">
                          {req.cartCode} • {req.id}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-[#171614]">
                        {req.itemName}
                      </td>
                      <td className="py-3 px-3 tabular-nums">
                        {formatDecimalId(req.qty)} {req.unit}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            req.status === 'Disetujui'
                              ? 'bg-[#E6EFE8] text-[#2E6B47]'
                              : req.status === 'Ditolak'
                                ? 'bg-red-50 text-[#9B1C1C]'
                                : 'bg-[#F5E8D6] text-[#9C5D24]'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReqId(req.id);
                          }}
                          className={`rounded-full px-3.5 py-1 text-[11px] font-semibold ${
                            req.status === 'Menunggu'
                              ? 'bg-[#1D1B18] text-[#FAF8F3]'
                              : 'border border-[#DFD9C9] bg-white text-[#171614]'
                          }`}
                        >
                          {req.status === 'Menunggu' ? 'Tinjau' : 'Detail'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: Review Request OR Direct Allocation */}
        <aside className="lg:col-span-5 space-y-4">
          {activeRequest && (
            <div className="rounded-3xl border border-[#E4DEC9] bg-[#F7F4EC] p-5 sm:p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-[#171614]">
                  Tinjau permintaan
                </h2>
                <p className="text-xs font-mono text-[#8A7553] mt-0.5">
                  {activeRequest.id} • {activeRequest.status}
                </p>
              </div>

              <div className="border-t border-[#E5DFD0] pt-3">
                <div className="text-sm font-semibold text-[#171614]">
                  {activeRequest.riderName} • {activeRequest.cartCode}
                </div>
                <div className="text-xs text-[#6E6659] mt-0.5">
                  {activeRequest.itemName} • diajukan{' '}
                  {activeRequest.requestedAtLabel}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#E5DFD0] px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-[#6E6659]">Jumlah diminta</span>
                <span className="font-semibold text-[#171614] tabular-nums">
                  {formatDecimalId(activeRequest.qty)} {activeRequest.unit}
                </span>
              </div>

              {previewMeta && (
                <div className="rounded-2xl bg-[#EFECE4] p-4 space-y-2 text-xs">
                  <div className="text-[11px] text-[#7B7263]">
                    Pratinjau alokasi otomatis setelah disetujui
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="text-[11px] text-[#7B7263]">Pusat</div>
                      <div className="font-semibold text-[#171614] tabular-nums">
                        {formatDecimalId(previewMeta.centralBefore)} →{' '}
                        {formatDecimalId(previewMeta.centralAfter)}{' '}
                        {previewMeta.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#7B7263]">
                        Gerobak {activeRequest.cartCode}
                      </div>
                      <div className="font-semibold text-[#171614] tabular-nums">
                        {formatDecimalId(previewMeta.cartBefore)} →{' '}
                        {formatDecimalId(previewMeta.cartAfter)}{' '}
                        {previewMeta.unit}
                      </div>
                    </div>
                  </div>
                  {!previewMeta.hasEnoughCentral && (
                    <div className="text-[11px] text-[#9B1C1C] flex items-center gap-1 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Stok pusat tidak mencukupi. Tambah stok pusat dulu.</span>
                    </div>
                  )}
                </div>
              )}

              {activeRequest.status === 'Menunggu' && (
                <>
                  <div>
                    <label className="block text-xs text-[#6E6659] mb-1.5">
                      Alasan penolakan (wajib jika ditolak)
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Tuliskan alasan penolakan"
                      className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-xs text-[#171614] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={!rejectionReason.trim()}
                      onClick={() => {
                        onRejectRequest(
                          activeRequest.id,
                          rejectionReason.trim(),
                        );
                        setRejectionReason('');
                      }}
                      className="rounded-full border border-[#DFD9C9] bg-white hover:bg-red-50 hover:text-[#9B1C1C] disabled:opacity-40 px-5 py-2.5 text-xs font-semibold transition-colors"
                    >
                      Tolak
                    </button>
                    <button
                      type="button"
                      disabled={!previewMeta?.hasEnoughCentral}
                      onClick={() => onApproveRequest(activeRequest.id)}
                      className="flex-1 rounded-full bg-[#1D1B18] hover:bg-[#2F2B25] disabled:opacity-40 text-[#FAF8F3] py-2.5 px-5 text-xs font-semibold transition-colors"
                    >
                      Setujui permintaan
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Direct Allocation Form */}
          <form
            onSubmit={handleDirectSubmit}
            className="rounded-3xl border border-[#E4DEC9] bg-white/85 p-5 sm:p-6 space-y-3.5"
          >
            <div>
              <h2 className="text-base font-semibold text-[#171614]">
                Alokasi langsung ke gerobak
              </h2>
              <p className="text-xs text-[#7B7263] mt-0.5">
                Tambahkan stok cup menu atau bahan baku dari pusat langsung ke
                gerobak rider.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-[#7B7263] mb-1">
                  Target gerobak
                </label>
                <select
                  value={directRiderId}
                  onChange={(e) => setDirectRiderId(e.target.value)}
                  className="w-full rounded-xl border border-[#DFD9C9] bg-[#FAF8F3] px-3 py-2 text-xs font-medium text-[#171614]"
                >
                  {RIDER_ACCOUNTS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.shortCartCode} ({r.firstName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#7B7263] mb-1">
                  Jenis alokasi
                </label>
                <select
                  value={directType}
                  onChange={(e) => {
                    const next = e.target.value as 'ingredient' | 'cups';
                    setDirectType(next);
                    setDirectQty(next === 'cups' ? '20' : '2');
                  }}
                  className="w-full rounded-xl border border-[#DFD9C9] bg-[#FAF8F3] px-3 py-2 text-xs font-medium text-[#171614]"
                >
                  <option value="cups">Cup produk kasir</option>
                  <option value="ingredient">Bahan baku</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2.5 items-end">
              <div className="col-span-8">
                <label className="block text-[11px] text-[#7B7263] mb-1">
                  {directType === 'cups' ? 'Menu produk' : 'Bahan baku'}
                </label>
                {directType === 'cups' ? (
                  <select
                    value={directProductId}
                    onChange={(e) => setDirectProductId(e.target.value)}
                    className="w-full rounded-xl border border-[#DFD9C9] bg-[#FAF8F3] px-3 py-2 text-xs font-medium text-[#171614]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={directIngId}
                    onChange={(e) =>
                      setDirectIngId(e.target.value as IngredientId)
                    }
                    className="w-full rounded-xl border border-[#DFD9C9] bg-[#FAF8F3] px-3 py-2 text-xs font-medium text-[#171614]"
                  >
                    <option value="coffee">Biji kopi (kg)</option>
                    <option value="milk">Susu segar (liter)</option>
                    <option value="palmSugar">Gula aren (liter)</option>
                  </select>
                )}
              </div>

              <div className="col-span-4">
                <label className="block text-[11px] text-[#7B7263] mb-1">
                  Jumlah
                </label>
                <input
                  type="number"
                  min="0.1"
                  step={directType === 'cups' ? '1' : '0.1'}
                  value={directQty}
                  onChange={(e) => setDirectQty(e.target.value)}
                  className="w-full rounded-xl border border-[#DFD9C9] bg-[#FAF8F3] px-3 py-2 text-xs font-semibold text-[#171614] tabular-nums"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#1D1B18] hover:bg-[#2F2B25] text-[#FAF8F3] py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Kirim stok ke gerobak</span>
            </button>
          </form>
        </aside>
      </div>

      {/* Middle 2-Column: Central Warehouse + Per-Cart Stock Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-5 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#171614]">
                Persediaan pusat
              </h2>
              <p className="text-xs text-[#7B7263] mt-0.5">
                Stok utama sebelum didistribusikan ke gerobak
              </p>
            </div>
            <button
              type="button"
              onClick={onRestockCentral}
              className="rounded-full border border-[#DFD9C9] bg-[#FAF8F3] hover:bg-[#EFECE4] px-3 py-1.5 text-[11px] font-semibold text-[#171614] whitespace-nowrap"
            >
              + Isi stok pusat
            </button>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-y border-[#E5DFD0] bg-[#FAF8F3] text-[10px] font-mono text-[#8E8371] uppercase">
                <th className="py-2.5 px-2">BAHAN BAKU</th>
                <th className="py-2.5 px-2">TERSEDIA</th>
                <th className="py-2.5 px-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DA]">
              {centralStock.map((item) => {
                const isLow = item.available <= item.minThreshold;
                return (
                  <tr key={item.id}>
                    <td className="py-3 px-2">
                      <div className="font-semibold text-[#171614]">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#7B7263] tabular-nums">
                        Min. {item.minThreshold} {item.unit}
                      </div>
                    </td>
                    <td className="py-3 px-2 font-semibold text-[#171614] tabular-nums">
                      {formatDecimalId(item.available)} {item.unit}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span
                        className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-medium ${
                          isLow
                            ? 'bg-[#F5E8D6] text-[#9C5D24]'
                            : 'bg-[#E6EFE8] text-[#2E6B47]'
                        }`}
                      >
                        {isLow ? 'Menipis' : 'Aman'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="lg:col-span-7 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#171614]">
              Stok setiap gerobak
            </h2>
            <p className="text-xs text-[#7B7263] mt-0.5">
              Terhubung langsung dengan Website Riders
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px] text-xs">
              <thead>
                <tr className="border-y border-[#E5DFD0] bg-[#FAF8F3] text-[10px] font-mono text-[#8E8371] uppercase">
                  <th className="py-2.5 px-2">GEROBAK</th>
                  <th className="py-2.5 px-2">BIJI KOPI</th>
                  <th className="py-2.5 px-2">SUSU SEGAR</th>
                  <th className="py-2.5 px-2">GULA AREN</th>
                  <th className="py-2.5 px-2">TOTAL CUP MENU</th>
                  <th className="py-2.5 px-2 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DA]">
                {RIDER_ACCOUNTS.map((riderAcc) => {
                  const cart = carts[riderAcc.id];
                  const coffee =
                    cart?.ingredients.find((i) => i.id === 'coffee')?.remaining ??
                    0;
                  const milk =
                    cart?.ingredients.find((i) => i.id === 'milk')?.remaining ??
                    0;
                  const sugar =
                    cart?.ingredients.find((i) => i.id === 'palmSugar')
                      ?.remaining ?? 0;
                  const totalCups = Object.values(
                    cart?.productStocks ?? {},
                  ).reduce((s, v) => s + v, 0);
                  const isEmpty = coffee === 0 && milk === 0 && totalCups === 0;
                  const isLow =
                    !isEmpty &&
                    (coffee <= 0.8 || milk <= 1.5 || totalCups <= 10);

                  return (
                    <tr key={riderAcc.id}>
                      <td className="py-3.5 px-2 font-semibold text-[#171614]">
                        {riderAcc.shortCartCode}
                        <span className="block text-[11px] font-normal text-[#7B7263]">
                          {riderAcc.firstName}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 tabular-nums">
                        {formatDecimalId(coffee)} kg
                      </td>
                      <td className="py-3.5 px-2 tabular-nums">
                        {formatDecimalId(milk)} L
                      </td>
                      <td className="py-3.5 px-2 tabular-nums">
                        {formatDecimalId(sugar)} L
                      </td>
                      <td className="py-3.5 px-2 font-semibold tabular-nums">
                        {totalCups} cup
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <span
                          className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-medium ${
                            isEmpty
                              ? 'bg-[#EFECE4] text-[#6E6659]'
                              : isLow
                                ? 'bg-[#F5E8D6] text-[#9C5D24]'
                                : 'bg-[#E6EFE8] text-[#2E6B47]'
                          }`}
                        >
                          {isEmpty ? 'Kosong (0)' : isLow ? 'Menipis' : 'Aman'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Allocation History Table */}
      <section className="rounded-3xl border border-[#E4DEC9] bg-white/75 overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4">
          <h2 className="text-lg font-semibold text-[#171614]">
            Riwayat alokasi stok
          </h2>
          <p className="text-xs text-[#7B7263] mt-0.5">
            Catatan alokasi stok pusat ke gerobak dan riwayat persetujuan
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px] text-xs">
            <thead>
              <tr className="border-y border-[#E5DFD0] bg-[#FAF8F3] text-[10px] font-mono text-[#8E8371] uppercase">
                <th className="py-3 px-5">WAKTU DIPROSES</th>
                <th className="py-3 px-3">RIDER / GEROBAK</th>
                <th className="py-3 px-3">BAHAN / ITEM</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">STOK PUSAT</th>
                <th className="py-3 px-3">STOK GEROBAK</th>
                <th className="py-3 px-5 text-right">KETERANGAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DA]">
              {allocationHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-[#7B7263]"
                  >
                    Belum ada riwayat alokasi stok hari ini.
                  </td>
                </tr>
              ) : (
                allocationHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3.5 px-5 tabular-nums text-[#5C5549]">
                      {item.processedAtLabel}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#171614]">
                        {item.riderName}
                      </div>
                      <div className="text-[11px] text-[#7B7263]">
                        {item.cartCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#171614]">
                      {item.itemSummary}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          item.status === 'Disetujui'
                            ? 'bg-[#E6EFE8] text-[#2E6B47]'
                            : 'bg-red-50 text-[#9B1C1C]'
                        }`}
                      >
                        {item.status === 'Disetujui' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 tabular-nums">
                      {item.centralChangeLabel}
                    </td>
                    <td className="py-3.5 px-3 tabular-nums">
                      {item.cartChangeLabel}
                    </td>
                    <td className="py-3.5 px-5 text-right text-[#6E6659]">
                      {item.note}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
