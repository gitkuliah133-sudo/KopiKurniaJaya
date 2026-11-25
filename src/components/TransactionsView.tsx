import React, { useMemo, useState } from 'react';
import { ArrowRight, Calendar, Search, X } from 'lucide-react';
import {
  formatIndoDateLabel,
  formatRupiah,
  getTodayWibIsoDate,
} from '../data/mockData';
import { PaymentMethod, RiderAccount, Transaction } from '../types';

interface TransactionsViewProps {
  rider: RiderAccount;
  transactions: Transaction[];
  lastSyncedLabel: string | null;
}

type MethodFilter = 'Semua' | PaymentMethod;

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  rider,
  transactions,
  lastSyncedLabel,
}) => {
  const [searchId, setSearchId] = useState('');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('Semua');
  const [selectedDateIso, setSelectedDateIso] = useState<string>(() =>
    getTodayWibIsoDate(),
  );
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const dateFilteredTransactions = useMemo(() => {
    if (!selectedDateIso) return transactions;
    return transactions.filter((tx) => tx.dateIso === selectedDateIso);
  }, [transactions, selectedDateIso]);

  const summary = useMemo(() => {
    const totalSales = dateFilteredTransactions.reduce(
      (sum, tx) => sum + tx.total,
      0,
    );
    const totalCups = dateFilteredTransactions.reduce(
      (sum, tx) => sum + tx.totalCups,
      0,
    );
    const cashTxs = dateFilteredTransactions.filter(
      (tx) => tx.method === 'Tunai',
    );
    const qrisTxs = dateFilteredTransactions.filter(
      (tx) => tx.method === 'QRIS',
    );

    return {
      totalSales,
      count: dateFilteredTransactions.length,
      totalCups,
      cashTotal: cashTxs.reduce((s, t) => s + t.total, 0),
      cashCount: cashTxs.length,
      qrisTotal: qrisTxs.reduce((s, t) => s + t.total, 0),
      qrisCount: qrisTxs.length,
    };
  }, [dateFilteredTransactions]);

  const filteredTransactions = useMemo(() => {
    const q = searchId.trim().toLowerCase();
    return dateFilteredTransactions.filter((tx) => {
      const matchMethod =
        methodFilter === 'Semua' || tx.method === methodFilter;
      const matchQuery =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        tx.items.some((it) => it.name.toLowerCase().includes(q));
      return matchMethod && matchQuery;
    });
  }, [dateFilteredTransactions, methodFilter, searchId]);

  const selectedDateDisplay = selectedDateIso
    ? formatIndoDateLabel(selectedDateIso)
    : 'Semua tanggal';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] text-[#8E8371] uppercase">
            {rider.cartCode} &nbsp;/&nbsp; PENJUALAN
          </div>
          <h1 className="text-3xl sm:text-[40px] font-semibold tracking-tight text-[#171614] mt-1">
            Riwayat transaksi
          </h1>
          <p className="text-sm text-[#6E6659] mt-1">
            Lihat kembali pesanan dan pembayaran yang telah selesai.
          </p>
        </div>

        <span className="rounded-full border border-[#E2DCCE] bg-[#EFECE4] px-3.5 py-1.5 text-xs font-medium text-[#6E6659] whitespace-nowrap shrink-0">
          Laporan harian
        </span>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-2xl bg-[#1D1B18] text-[#FAF8F3] p-5 sm:p-6">
          <div className="text-3xl sm:text-[34px] font-semibold tracking-tight tabular-nums">
            {formatRupiah(summary.totalSales)}
          </div>
          <div className="text-xs text-[#B8A88A] mt-2">Total penjualan</div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="text-3xl sm:text-[34px] font-semibold tracking-tight text-[#171614] tabular-nums">
            {summary.count}
          </div>
          <div className="text-xs text-[#6E6659] mt-2">
            Transaksi berhasil
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="text-3xl sm:text-[34px] font-semibold tracking-tight text-[#171614] tabular-nums">
            {summary.totalCups} cup
          </div>
          <div className="text-xs text-[#6E6659] mt-2">Produk terjual</div>
        </div>
      </div>

      {/* Payment Method Breakdown Bar */}
      <div className="rounded-2xl bg-[#F3EFE6] border border-[#E4DEC9] grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#DFD8C8]">
        <div className="p-4 sm:px-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs text-[#7B7263]">Tunai</div>
            <div className="text-xl sm:text-2xl font-semibold text-[#171614] mt-1 tabular-nums">
              {formatRupiah(summary.cashTotal)}
            </div>
          </div>
          <div className="text-xs text-[#7B7263] tabular-nums">
            {summary.cashCount} transaksi
          </div>
        </div>

        <div className="p-4 sm:px-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs text-[#7B7263]">QRIS</div>
            <div className="text-xl sm:text-2xl font-semibold text-[#171614] mt-1 tabular-nums">
              {formatRupiah(summary.qrisTotal)}
            </div>
          </div>
          <div className="text-xs text-[#7B7263] tabular-nums">
            {summary.qrisCount} transaksi
          </div>
        </div>
      </div>

      {/* Search & Date Picker Filters */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="relative sm:col-span-7">
            <Search
              className="w-4 h-4 text-[#8A806E] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Cari ID transaksi..."
              aria-label="Cari ID transaksi"
              className="w-full rounded-full border border-[#DFD9C9] bg-white/85 pl-10 pr-9 py-2.5 text-sm text-[#171614] placeholder:text-[#8E8474] focus:outline-none focus:border-[#9E8C6C]"
            />
            {searchId && (
              <button
                type="button"
                onClick={() => setSearchId('')}
                aria-label="Hapus pencarian transaksi"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A806E] hover:text-[#171614]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="sm:col-span-5 flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar
                className="w-4 h-4 text-[#6E6659] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="date"
                value={selectedDateIso}
                onChange={(e) => setSelectedDateIso(e.target.value)}
                aria-label="Filter tanggal transaksi"
                className="w-full rounded-full border border-[#DFD9C9] bg-white/85 pl-10 pr-4 py-2.5 text-sm text-[#171614] focus:outline-none focus:border-[#9E8C6C] tabular-nums"
              />
            </div>
            {selectedDateIso && (
              <button
                type="button"
                onClick={() => setSelectedDateIso('')}
                title="Tampilkan semua tanggal"
                className="rounded-full border border-[#DFD9C9] bg-white/85 hover:bg-[#EFECE4] px-3 py-2.5 text-xs font-medium text-[#5C5549] whitespace-nowrap transition-colors"
              >
                Semua
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(['Semua', 'Tunai', 'QRIS'] as MethodFilter[]).map((method) => {
              const active = methodFilter === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setMethodFilter(method)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#1D1B18] text-[#FAF8F3]'
                      : 'bg-white border border-[#E4DEC9] text-[#5C5549] hover:border-[#BEB49F]'
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-[#7B7263] tabular-nums">
            {lastSyncedLabel
              ? `Diperbarui ${lastSyncedLabel}`
              : 'Belum ada transaksi tercatat'}
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <section className="rounded-3xl border border-[#E4DEC9] bg-white/75 overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#171614]">
              Transaksi • {selectedDateDisplay}
            </h2>
            <p className="text-xs text-[#7B7263] mt-0.5 tabular-nums">
              {filteredTransactions.length} transaksi selesai • urutan terbaru
            </p>
          </div>
          <span className="text-xs text-[#7B7263] tabular-nums">
            {filteredTransactions.length} transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#EFECE4] border-y border-[#E5DFD0] text-xs font-medium text-[#6E6659]">
                <th className="py-3 px-5 sm:px-6">ID / waktu</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 sm:px-6 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DA] text-sm">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-xs text-[#7B7263]"
                  >
                    {transactions.length === 0
                      ? 'Belum ada transaksi pada sesi kerja pertama ini.'
                      : 'Tidak ada transaksi pada tanggal atau filter yang dipilih.'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#FAF8F3] transition-colors"
                  >
                    <td className="py-3.5 px-5 sm:px-6">
                      <div className="font-semibold text-[#171614] tabular-nums">
                        {tx.id}
                      </div>
                      <div className="text-xs text-[#7B7263] mt-0.5 tabular-nums">
                        {tx.time} • {tx.totalCups} cup
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5C5549]">{tx.method}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#171614] tabular-nums">
                      {formatRupiah(tx.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-full bg-[#E6EFE8] text-[#2E6B47] px-3 py-1 text-xs font-medium">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTx(tx)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A7553] hover:text-[#171614] transition-colors whitespace-nowrap"
                      >
                        <span>Lihat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 sm:px-6 py-3.5 border-t border-[#ECE7DA] bg-[#FAF8F3]/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[#7B7263] tabular-nums">
            Menampilkan {filteredTransactions.length} dari {transactions.length}{' '}
            transaksi
          </span>
          <span className="font-medium text-[#2E6B47]">
            {filteredTransactions.length > 0
              ? 'Seluruh pembayaran berhasil'
              : 'Siap mencatat transaksi baru'}
          </span>
        </div>
      </section>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#FAF8F3] border border-[#DFD9C9] p-6 text-[#171614] shadow-2xl">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5DFD0]">
              <div>
                <div className="font-mono text-[10px] tracking-[0.16em] text-[#8E8371] uppercase">
                  DETAIL TRANSAKSI • {rider.cartCode}
                </div>
                <h3 className="text-xl font-semibold mt-1 tabular-nums">
                  {selectedTx.id}
                </h3>
                <p className="text-xs text-[#6E6659] mt-0.5 tabular-nums">
                  {selectedTx.dateLabel} • {selectedTx.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                aria-label="Tutup rincian transaksi"
                className="rounded-full p-1.5 text-[#6E6659] hover:bg-[#EFECE4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 border-b border-[#E5DFD0]">
              <div className="text-xs font-semibold text-[#6E6659] uppercase font-mono tracking-wider">
                Rincian Item ({selectedTx.totalCups} cup)
              </div>
              {selectedTx.items.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div>
                    <div className="font-medium text-[#171614]">
                      {item.name}
                    </div>
                    <div className="text-xs text-[#7B7263] tabular-nums">
                      {item.qty} × {formatRupiah(item.unitPrice)}
                    </div>
                  </div>
                  <div className="font-semibold text-[#171614] tabular-nums">
                    {formatRupiah(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6E6659]">Metode pembayaran</span>
                <span className="font-semibold text-[#171614]">
                  {selectedTx.method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6659]">Status</span>
                <span className="inline-block rounded-full bg-[#E6EFE8] text-[#2E6B47] px-2.5 py-0.5 font-medium">
                  {selectedTx.status}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-[#ECE7DA]">
                <span>Total pembayaran</span>
                <span className="tabular-nums">
                  {formatRupiah(selectedTx.total)}
                </span>
              </div>
              {selectedTx.method === 'Tunai' &&
                selectedTx.cashReceived !== undefined && (
                  <>
                    <div className="flex justify-between text-[#6E6659]">
                      <span>Uang diterima</span>
                      <span className="tabular-nums">
                        {formatRupiah(selectedTx.cashReceived)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#6E6659]">
                      <span>Kembalian</span>
                      <span className="tabular-nums">
                        {formatRupiah(selectedTx.change ?? 0)}
                      </span>
                    </div>
                  </>
                )}
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="rounded-full bg-[#1D1B18] text-[#FAF8F3] text-xs font-semibold px-5 py-2.5 hover:bg-[#2F2B25] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
