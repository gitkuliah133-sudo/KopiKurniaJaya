import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  Receipt,
  Search,
  Wallet,
  X,
  XCircle,
} from 'lucide-react';
import {
  exportToCsv,
  formatRupiah,
  getTodayWibIsoDate,
} from '../../data/mockData';
import { PaymentMethod, Transaction } from '../../types';

interface OwnerTransactionsPageProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
}

export const OwnerTransactionsPage: React.FC<OwnerTransactionsPageProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const [dateFilter, setDateFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<'Semua' | PaymentMethod>(
    'Semua',
  );
  const [statusFilter, setStatusFilter] = useState<
    'Semua' | 'Berhasil' | 'Gagal'
  >('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTx = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchDate = !dateFilter || tx.dateIso === dateFilter;
      const matchMethod = methodFilter === 'Semua' || tx.method === methodFilter;
      const matchStatus = statusFilter === 'Semua' || tx.status === statusFilter;
      const matchQuery =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        tx.riderName.toLowerCase().includes(q) ||
        tx.cartCode.toLowerCase().includes(q);
      return matchDate && matchMethod && matchStatus && matchQuery;
    });
  }, [transactions, dateFilter, methodFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const success = filteredTx.filter((t) => t.status === 'Berhasil');
    const failed = filteredTx.filter((t) => t.status === 'Gagal');
    const totalValue = success.reduce((s, t) => s + t.total, 0);
    const totalCount = filteredTx.length;
    const successRate =
      totalCount > 0 ? ((success.length / totalCount) * 100).toFixed(1) : '0';
    const failRate =
      totalCount > 0 ? ((failed.length / totalCount) * 100).toFixed(1) : '0';

    return {
      totalCount,
      totalValue,
      successCount: success.length,
      failedCount: failed.length,
      successRate,
      failRate,
    };
  }, [filteredTx]);

  const handleDownloadCsv = () => {
    exportToCsv(
      `manajemen-transaksi-${dateFilter || getTodayWibIsoDate()}.csv`,
      ['ID Transaksi', 'Tanggal', 'Waktu', 'Rider', 'Gerobak', 'Pembayaran', 'Total', 'Status'],
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[36px] font-semibold tracking-tight text-[#171614]">
            Manajemen Transaksi
          </h1>
          <p className="text-sm text-[#6E6659] mt-1">
            Pantau riwayat penjualan seluruh gerobak dan evaluasi setiap
            transaksi.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="self-start sm:self-center rounded-full border border-[#DFD9C9] bg-white hover:bg-[#EFECE4] px-4 py-2.5 text-xs font-semibold text-[#171614] inline-flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh Laporan</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-3xl border border-[#E4DEC9] bg-white/75 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <div className="lg:col-span-4">
          <label className="block text-[11px] text-[#7B7263] mb-1.5">
            Tanggal transaksi
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="w-3.5 h-3.5 text-[#6E6659] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] pl-9 pr-3 py-2 text-xs font-medium text-[#171614] tabular-nums focus:outline-none"
              />
            </div>
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="text-xs font-medium text-[#8A7553] hover:text-[#171614] px-2"
              >
                Semua
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[11px] text-[#7B7263] mb-1.5">
            Metode pembayaran
          </label>
          <select
            value={methodFilter}
            onChange={(e) =>
              setMethodFilter(e.target.value as 'Semua' | PaymentMethod)
            }
            className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614] focus:outline-none"
          >
            <option value="Semua">Semua metode</option>
            <option value="Tunai">Tunai</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[11px] text-[#7B7263] mb-1.5">
            Status transaksi
          </label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'Semua' | 'Berhasil' | 'Gagal')
            }
            className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614] focus:outline-none"
          >
            <option value="Semua">Semua status</option>
            <option value="Berhasil">Berhasil</option>
            <option value="Gagal">Gagal</option>
          </select>
        </div>

        <div className="lg:col-span-2 text-xs">
          <div className="text-[11px] text-[#7B7263]">Cakupan transaksi</div>
          <div className="font-semibold text-[#171614] mt-1">
            Seluruh gerobak
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Total transaksi</span>
            <Receipt className="w-4 h-4 text-[#8E8371]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {stats.totalCount}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Seluruh gerobak • periode terpilih
          </div>
        </div>

        <div className="rounded-2xl bg-[#1D1B18] text-[#FAF8F3] p-5">
          <div className="flex items-center justify-between text-xs text-[#B8A88A]">
            <span>Total nilai penjualan</span>
            <Wallet className="w-4 h-4 text-[#D2B98B]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight mt-2 tabular-nums">
            {formatRupiah(stats.totalValue)}
          </div>
          <div className="text-[11px] text-[#D2B98B] mt-2">
            Hanya transaksi berhasil
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Transaksi berhasil</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E6B47]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {stats.successCount}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2 tabular-nums">
            {stats.successRate}% dari total transaksi
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Transaksi gagal</span>
            <XCircle className="w-4 h-4 text-[#9B1C1C]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {stats.failedCount}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2 tabular-nums">
            {stats.failRate}% dari total transaksi
          </div>
        </div>
      </div>

      {/* Table */}
      <section className="rounded-3xl border border-[#E4DEC9] bg-white/75 overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#171614]">
              Riwayat transaksi
            </h2>
            <p className="text-xs text-[#7B7263] mt-0.5 tabular-nums">
              Seluruh gerobak • {filteredTx.length} transaksi pada periode
              terpilih
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8A806E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID transaksi atau nama rider"
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] pl-10 pr-8 py-2 text-xs text-[#171614] placeholder:text-[#8E8474] focus:outline-none focus:border-[#9E8C6C]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A806E] hover:text-[#171614]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-y border-[#E5DFD0] bg-[#FAF8F3] text-[10px] font-mono text-[#8E8371] uppercase">
                <th className="py-3 px-5 sm:px-6">ID TRANSAKSI</th>
                <th className="py-3 px-3">TANGGAL &amp; WAKTU</th>
                <th className="py-3 px-3">NAMA RIDER</th>
                <th className="py-3 px-3">GEROBAK</th>
                <th className="py-3 px-3">PEMBAYARAN</th>
                <th className="py-3 px-3">TOTAL PEMBAYARAN</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-5 sm:px-6 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DA] text-xs sm:text-sm">
              {filteredTx.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-xs text-[#7B7263]"
                  >
                    Belum ada transaksi dari gerobak pada filter terpilih.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAF8F3]">
                    <td className="py-3.5 px-5 sm:px-6 font-semibold text-[#171614] tabular-nums">
                      {tx.id}
                    </td>
                    <td className="py-3.5 px-3 tabular-nums">
                      <div className="text-[#171614]">{tx.dateLabel}</div>
                      <div className="text-[11px] text-[#7B7263]">
                        {tx.time}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#171614]">
                      {tx.riderName}
                    </td>
                    <td className="py-3.5 px-3 text-[#5C5549]">
                      {tx.cartCode}
                    </td>
                    <td className="py-3.5 px-3">
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
                    <td className="py-3.5 px-3 font-semibold text-[#171614] tabular-nums">
                      {formatRupiah(tx.total)}
                    </td>
                    <td className="py-3.5 px-3">
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
                    <td className="py-3.5 px-5 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectTransaction(tx)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A7553] hover:text-[#171614] whitespace-nowrap"
                      >
                        <span>Lihat Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
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
