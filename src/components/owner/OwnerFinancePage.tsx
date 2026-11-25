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
import { ExpenseCategory, ExpenseRecord, Transaction } from '../../types';

interface OwnerFinancePageProps {
  transactions: Transaction[];
  expenses: ExpenseRecord[];
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Bahan baku',
  'Operasional',
  'Transportasi',
  'Perawatan',
];

export const OwnerFinancePage: React.FC<OwnerFinancePageProps> = ({
  transactions,
  expenses,
}) => {
  const todayIso = useMemo(() => getTodayWibIsoDate(), []);
  const [periodPreset, setPeriodPreset] = useState<'7days' | 'today' | '30days'>(
    '7days',
  );
  const [startDate, setStartDate] = useState<string>(() =>
    addDaysIso(todayIso, -6),
  );
  const [endDate, setEndDate] = useState<string>(() => todayIso);
  const [scope, setScope] = useState<string>('Seluruh usaha');

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
    setScope('Seluruh usaha');
  };

  const filteredTx = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.status !== 'Berhasil') return false;
      const matchScope = scope === 'Seluruh usaha' || tx.cartCode === scope;
      const matchStart = !startDate || tx.dateIso >= startDate;
      const matchEnd = !endDate || tx.dateIso <= endDate;
      return matchScope && matchStart && matchEnd;
    });
  }, [transactions, scope, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((ex) => {
      const matchStart = !startDate || ex.dateIso >= startDate;
      const matchEnd = !endDate || ex.dateIso <= endDate;
      return matchStart && matchEnd;
    });
  }, [expenses, startDate, endDate]);

  const summary = useMemo(() => {
    const income = filteredTx.reduce((s, t) => s + t.total, 0);
    const expense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const net = income - expense;
    return {
      income,
      expense,
      net,
      txCount: filteredTx.length,
      expenseCount: filteredExpenses.length,
    };
  }, [filteredTx, filteredExpenses]);

  const categoryBreakdown = useMemo(() => {
    const maxCat = Math.max(
      1,
      ...EXPENSE_CATEGORIES.map((cat) =>
        filteredExpenses
          .filter((e) => e.category === cat)
          .reduce((s, e) => s + e.amount, 0),
      ),
    );
    return EXPENSE_CATEGORIES.map((cat) => {
      const total = filteredExpenses
        .filter((e) => e.category === cat)
        .reduce((s, e) => s + e.amount, 0);
      return {
        category: cat,
        total,
        pct: total > 0 ? Math.max(8, Math.round((total / maxCat) * 100)) : 0,
      };
    });
  }, [filteredExpenses]);

  const dailyRows = useMemo(() => {
    const start = startDate || todayIso;
    const end = endDate && endDate >= start ? endDate : start;
    const rows: {
      dateIso: string;
      label: string;
      shortLabel: string;
      income: number;
      expense: number;
      net: number;
    }[] = [];

    let cur = start;
    for (let i = 0; i < 31; i++) {
      const income = filteredTx
        .filter((t) => t.dateIso === cur)
        .reduce((s, t) => s + t.total, 0);
      const expense = filteredExpenses
        .filter((e) => e.dateIso === cur)
        .reduce((s, e) => s + e.amount, 0);
      rows.push({
        dateIso: cur,
        label: formatShortIndoDate(cur, true),
        shortLabel: cur.slice(5).split('-').reverse().join('/'),
        income,
        expense,
        net: income - expense,
      });
      if (cur >= end) break;
      cur = addDaysIso(cur, 1);
    }
    return rows;
  }, [filteredTx, filteredExpenses, startDate, endDate, todayIso]);

  const maxFlowVal = Math.max(
    1,
    ...dailyRows.map((r) => Math.max(r.income, r.expense)),
  );

  const handleDownloadCsv = () => {
    exportToCsv(
      `ringkasan-keuangan-${startDate}-${endDate}.csv`,
      ['Tanggal', 'Pemasukan', 'Pengeluaran', 'Saldo Bersih'],
      dailyRows.map((r) => [r.dateIso, r.income, r.expense, r.net]),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[36px] font-semibold tracking-tight text-[#171614]">
            Ringkasan keuangan
          </h1>
          <p className="text-sm text-[#6E6659] mt-1">
            Evaluasi pemasukan, pengeluaran, dan saldo bersih usaha dalam satu
            ringkasan.
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
              Cakupan
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614] focus:outline-none"
            >
              <option value="Seluruh usaha">Seluruh usaha</option>
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

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Total pemasukan</span>
            <Wallet className="w-4 h-4 text-[#8E8371]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {formatRupiah(summary.income)}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2 tabular-nums">
            {summary.txCount} transaksi • penjualan berhasil
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Total pengeluaran</span>
            <Receipt className="w-4 h-4 text-[#8E8371]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {formatRupiah(summary.expense)}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2 tabular-nums">
            {summary.expenseCount} catatan • pengeluaran usaha
          </div>
        </div>

        <div className="rounded-2xl bg-[#1D1B18] text-[#FAF8F3] p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#B8A88A]">
            <span>Saldo bersih</span>
            <TrendingUp className="w-4 h-4 text-[#D2B98B]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight mt-2 tabular-nums">
            {formatRupiah(summary.net)}
          </div>
          <div className="text-[11px] text-[#D2B98B] mt-2">
            Pemasukan – pengeluaran
          </div>
        </div>
      </div>

      {/* Chart + Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#171614]">
                Arus keuangan harian
              </h2>
              <p className="text-xs text-[#7B7263] mt-0.5 tabular-nums">
                {formatIndoDateLabel(startDate)} – {formatIndoDateLabel(endDate)}
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-[#5C5549]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#1D1B18]" />
                Pemasukan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#D2C2A1]" />
                Pengeluaran
              </span>
            </div>
          </div>

          <div className="mt-6 h-44 flex items-end justify-between gap-2 border-b border-[#E5DFD0] pb-2 pt-6">
            {dailyRows.slice(-10).map((row) => {
              const incPct =
                row.income > 0
                  ? Math.max(10, Math.round((row.income / maxFlowVal) * 100))
                  : 4;
              const expPct =
                row.expense > 0
                  ? Math.max(8, Math.round((row.expense / maxFlowVal) * 100))
                  : 4;
              return (
                <div
                  key={row.dateIso}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                >
                  {row.income > 0 && (
                    <span className="text-[10px] font-mono text-[#6E6659] mb-1 tabular-nums">
                      {formatShortCurrency(row.income)}
                    </span>
                  )}
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div
                      style={{ height: `${incPct}%` }}
                      className={`w-4 sm:w-5 rounded-t-md ${
                        row.income > 0 ? 'bg-[#1D1B18]' : 'bg-[#EFECE4]'
                      }`}
                    />
                    <div
                      style={{ height: `${expPct}%` }}
                      className={`w-2.5 sm:w-3 rounded-t-md ${
                        row.expense > 0 ? 'bg-[#D2C2A1]' : 'bg-[#F3EFE6]'
                      }`}
                    />
                  </div>
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

        <section className="lg:col-span-5 rounded-3xl border border-[#E4DEC9] bg-white/75 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[#171614]">
            Pengeluaran per kategori
          </h2>
          <p className="text-xs text-[#7B7263] mt-0.5 tabular-nums">
            {EXPENSE_CATEGORIES.length} kategori • {summary.expenseCount} catatan
          </p>

          <div className="mt-5 space-y-4">
            {categoryBreakdown.map((item, idx) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#171614]">
                    {item.category}
                  </span>
                  <span className="font-semibold text-[#171614] tabular-nums">
                    {formatRupiah(item.total)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EFECE4] overflow-hidden">
                  <div
                    style={{ width: `${item.pct}%` }}
                    className={`h-full rounded-full transition-all ${
                      idx === 0 ? 'bg-[#1D1B18]' : 'bg-[#D2C2A1]'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Daily Financial Table */}
      <section className="rounded-3xl border border-[#E4DEC9] bg-white/75 overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#171614]">
            Rincian keuangan harian
          </h2>
          <span className="text-xs text-[#7B7263] tabular-nums">
            {dailyRows.length} hari
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead>
              <tr className="border-y border-[#E5DFD0] bg-[#FAF8F3] text-[10px] font-mono text-[#8E8371] uppercase">
                <th className="py-3 px-5 sm:px-6">TANGGAL</th>
                <th className="py-3 px-4 text-right">PEMASUKAN</th>
                <th className="py-3 px-4 text-right">PENGELUARAN</th>
                <th className="py-3 px-5 sm:px-6 text-right">SALDO BERSIH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DA] text-xs sm:text-sm">
              {dailyRows.map((row) => (
                <tr key={row.dateIso} className="hover:bg-[#FAF8F3]">
                  <td className="py-3 px-5 sm:px-6 font-medium text-[#171614]">
                    {row.label}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {formatRupiah(row.income)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {formatRupiah(row.expense)}
                  </td>
                  <td className="py-3 px-5 sm:px-6 text-right font-semibold text-[#171614] tabular-nums">
                    {formatRupiah(row.net)}
                  </td>
                </tr>
              ))}
              <tr className="bg-[#EFECE4] font-semibold text-[#171614]">
                <td className="py-3.5 px-5 sm:px-6">Total periode</td>
                <td className="py-3.5 px-4 text-right tabular-nums">
                  {formatRupiah(summary.income)}
                </td>
                <td className="py-3.5 px-4 text-right tabular-nums">
                  {formatRupiah(summary.expense)}
                </td>
                <td className="py-3.5 px-5 sm:px-6 text-right tabular-nums">
                  {formatRupiah(summary.net)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
