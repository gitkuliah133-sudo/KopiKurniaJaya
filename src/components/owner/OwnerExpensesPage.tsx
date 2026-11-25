import React, { useMemo, useState } from 'react';
import { Calendar, Download, Plus, Receipt, TrendingUp, Wallet } from 'lucide-react';
import {
  addDaysIso,
  exportToCsv,
  formatRupiah,
  formatShortIndoDate,
  getTodayWibIsoDate,
} from '../../data/mockData';
import { ExpenseCategory, ExpenseRecord } from '../../types';

interface OwnerExpensesPageProps {
  expenses: ExpenseRecord[];
  onOpenExpenseModal: () => void;
}

export const OwnerExpensesPage: React.FC<OwnerExpensesPageProps> = ({
  expenses,
  onOpenExpenseModal,
}) => {
  const todayIso = useMemo(() => getTodayWibIsoDate(), []);
  const [periodPreset, setPeriodPreset] = useState<'7days' | 'today' | 'all'>(
    '7days',
  );
  const [startDate, setStartDate] = useState<string>(() =>
    addDaysIso(todayIso, -6),
  );
  const [endDate, setEndDate] = useState<string>(() => todayIso);
  const [categoryFilter, setCategoryFilter] = useState<
    'Semua' | ExpenseCategory
  >('Semua');

  const handlePresetChange = (preset: '7days' | 'today' | 'all') => {
    setPeriodPreset(preset);
    if (preset === 'today') {
      setStartDate(todayIso);
      setEndDate(todayIso);
    } else if (preset === '7days') {
      setStartDate(addDaysIso(todayIso, -6));
      setEndDate(todayIso);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleReset = () => {
    setPeriodPreset('7days');
    setStartDate(addDaysIso(todayIso, -6));
    setEndDate(todayIso);
    setCategoryFilter('Semua');
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((ex) => {
      const matchCat =
        categoryFilter === 'Semua' || ex.category === categoryFilter;
      const matchStart = !startDate || ex.dateIso >= startDate;
      const matchEnd = !endDate || ex.dateIso <= endDate;
      return matchCat && matchStart && matchEnd;
    });
  }, [expenses, categoryFilter, startDate, endDate]);

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses],
  );
  const avgAmount =
    filteredExpenses.length > 0
      ? Math.round(totalAmount / filteredExpenses.length)
      : 0;

  const handleDownloadCsv = () => {
    exportToCsv(
      `pengeluaran-kkj-${todayIso}.csv`,
      ['Tanggal', 'Kategori', 'Nama Pengeluaran', 'Metode', 'Dicatat Oleh', 'Nominal'],
      filteredExpenses.map((e) => [
        e.dateIso,
        e.category,
        e.name,
        e.method,
        e.recordedBy,
        e.amount,
      ]),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[36px] font-semibold tracking-tight text-[#171614]">
            Pencatatan pengeluaran
          </h1>
          <p className="text-sm text-[#6E6659] mt-1">
            Pantau biaya operasional usaha berdasarkan periode yang Anda pilih.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenExpenseModal}
          className="self-start sm:self-center rounded-full bg-[#1D1B18] hover:bg-[#2F2B25] text-[#FAF8F3] px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah pengeluaran</span>
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
              handlePresetChange(e.target.value as '7days' | 'today' | 'all')
            }
            className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614] focus:outline-none"
          >
            <option value="today">Hari ini</option>
            <option value="7days">7 hari terakhir</option>
            <option value="all">Semua tanggal</option>
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
              Kategori
            </label>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as 'Semua' | ExpenseCategory)
              }
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614] focus:outline-none"
            >
              <option value="Semua">Semua kategori</option>
              <option value="Bahan baku">Bahan baku</option>
              <option value="Operasional">Operasional</option>
              <option value="Transportasi">Transportasi</option>
              <option value="Perawatan">Perawatan</option>
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
          <div className="flex items-center justify-between text-xs text-[#B8A88A]">
            <span>Total pengeluaran</span>
            <Wallet className="w-4 h-4 text-[#D2B98B]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight mt-2 tabular-nums">
            {formatRupiah(totalAmount)}
          </div>
          <div className="text-[11px] text-[#FAF8F3]/65 mt-2">
            Periode terpilih
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Jumlah catatan</span>
            <Receipt className="w-4 h-4 text-[#8E8371]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {filteredExpenses.length}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Catatan pengeluaran tercatat
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Rata-rata transaksi</span>
            <TrendingUp className="w-4 h-4 text-[#8E8371]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {formatRupiah(avgAmount)}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2 tabular-nums">
            Total ÷ transaksi
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <section className="rounded-3xl border border-[#E4DEC9] bg-white/75 overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#171614]">
              Rincian pengeluaran
            </h2>
            <p className="text-xs text-[#7B7263] mt-0.5 tabular-nums">
              {filteredExpenses.length} catatan pengeluaran
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="rounded-full border border-[#DFD9C9] bg-white hover:bg-[#EFECE4] px-3.5 py-2 text-xs font-semibold text-[#171614] inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh laporan</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-y border-[#E5DFD0] bg-[#FAF8F3] text-[10px] font-mono text-[#8E8371] uppercase">
                <th className="py-3 px-5 sm:px-6">TANGGAL</th>
                <th className="py-3 px-4">KATEGORI</th>
                <th className="py-3 px-4">NAMA PENGELUARAN</th>
                <th className="py-3 px-4">METODE</th>
                <th className="py-3 px-4">DICATAT OLEH</th>
                <th className="py-3 px-5 sm:px-6 text-right">NOMINAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DA] text-xs sm:text-sm">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-[#7B7263]"
                  >
                    Belum ada catatan pengeluaran. Klik tombol{' '}
                    <strong className="text-[#171614]">
                      Tambah pengeluaran
                    </strong>{' '}
                    untuk mulai mencatat biaya operasional.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((ex) => (
                  <tr key={ex.id} className="hover:bg-[#FAF8F3]">
                    <td className="py-3.5 px-5 sm:px-6 tabular-nums text-[#5C5549]">
                      {formatShortIndoDate(ex.dateIso)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-full bg-[#EFECE4] px-3 py-1 text-xs font-medium text-[#5C5549]">
                        {ex.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#171614]">
                        {ex.name}
                      </div>
                      {ex.note && (
                        <div className="text-[11px] text-[#7B7263]">
                          {ex.note}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#5C5549]">{ex.method}</td>
                    <td className="py-3.5 px-4 text-[#5C5549]">
                      {ex.recordedBy}
                    </td>
                    <td className="py-3.5 px-5 sm:px-6 text-right font-semibold text-[#171614] tabular-nums">
                      {formatRupiah(ex.amount)}
                    </td>
                  </tr>
                ))
              )}
              {filteredExpenses.length > 0 && (
                <tr className="bg-[#EFECE4] font-semibold text-[#171614]">
                  <td colSpan={4} className="py-3.5 px-5 sm:px-6">
                    Total pengeluaran
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#6E6659] tabular-nums">
                    {filteredExpenses.length} transaksi
                  </td>
                  <td className="py-3.5 px-5 sm:px-6 text-right tabular-nums">
                    {formatRupiah(totalAmount)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
