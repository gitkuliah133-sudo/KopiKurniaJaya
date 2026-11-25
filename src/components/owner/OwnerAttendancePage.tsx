import React, { useMemo, useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import {
  addDaysIso,
  exportToCsv,
  formatDurationLabel,
  formatShortIndoDate,
  getTodayWibIsoDate,
  RIDER_ACCOUNTS,
} from '../../data/mockData';
import { AttendanceRecord } from '../../types';

interface OwnerAttendancePageProps {
  attendanceRecords: AttendanceRecord[];
}

export const OwnerAttendancePage: React.FC<OwnerAttendancePageProps> = ({
  attendanceRecords,
}) => {
  const todayIso = useMemo(() => getTodayWibIsoDate(), []);
  const [periodPreset, setPeriodPreset] = useState<'7days' | 'today' | 'all'>(
    '7days',
  );
  const [startDate, setStartDate] = useState<string>(() =>
    addDaysIso(todayIso, -6),
  );
  const [endDate, setEndDate] = useState<string>(() => todayIso);
  const [riderFilter, setRiderFilter] = useState<string>('Semua');

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
    setRiderFilter('Semua');
  };

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      const matchRider = riderFilter === 'Semua' || rec.riderId === riderFilter;
      const matchStart = !startDate || rec.dateIso >= startDate;
      const matchEnd = !endDate || rec.dateIso <= endDate;
      return matchRider && matchStart && matchEnd;
    });
  }, [attendanceRecords, riderFilter, startDate, endDate]);

  const stats = useMemo(() => {
    const ongoing = filteredRecords.filter((r) => r.status === 'Berlangsung');
    const finished = filteredRecords.filter((r) => r.status === 'Selesai');
    const finishedMinutes = finished.reduce((s, r) => s + r.durationMinutes, 0);
    const totalMinutes = filteredRecords.reduce((s, r) => {
      if (r.status === 'Berlangsung') {
        const liveMins = Math.max(
          0,
          Math.floor((Date.now() - r.startTimestampMs) / 60000),
        );
        return s + liveMins;
      }
      return s + r.durationMinutes;
    }, 0);
    const avgMinutes =
      finished.length > 0 ? Math.round(finishedMinutes / finished.length) : 0;

    return {
      totalCount: filteredRecords.length,
      finishedCount: finished.length,
      ongoingCount: ongoing.length,
      totalMinutes,
      avgMinutes,
    };
  }, [filteredRecords]);

  const handleDownloadCsv = () => {
    exportToCsv(
      `absensi-rider-${todayIso}.csv`,
      ['Nama Rider', 'Gerobak', 'Tanggal', 'Mulai Operasional', 'Selesai Operasional', 'Durasi (menit)', 'Status'],
      filteredRecords.map((r) => [
        r.riderName,
        r.cartCode,
        r.dateIso,
        r.startTimeLabel,
        r.endTimeLabel ?? '-',
        r.durationMinutes,
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
            Laporan absensi riders
          </h1>
          <p className="text-sm text-[#6E6659] mt-1">
            Pantau kehadiran dan waktu operasional rider berdasarkan sesi kerja
            yang dimulai.
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
            Periode
          </label>
          <select
            value={periodPreset}
            onChange={(e) =>
              handlePresetChange(e.target.value as '7days' | 'today' | 'all')
            }
            className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614]"
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
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] pl-9 pr-3 py-2 text-xs font-medium text-[#171614] tabular-nums"
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
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] pl-9 pr-3 py-2 text-xs font-medium text-[#171614] tabular-nums"
            />
          </div>
        </div>

        <div className="lg:col-span-3 flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-[11px] text-[#7B7263] mb-1.5">
              Rider
            </label>
            <select
              value={riderFilter}
              onChange={(e) => setRiderFilter(e.target.value)}
              className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614]"
            >
              <option value="Semua">Semua rider</option>
              {RIDER_ACCOUNTS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.shortCartCode})
                </option>
              ))}
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
          <div className="text-xs text-[#B8A88A]">Jumlah kehadiran</div>
          <div className="text-3xl font-semibold mt-2 tabular-nums">
            {stats.totalCount} kehadiran
          </div>
          <div className="text-[11px] text-[#D2B98B] mt-2 tabular-nums">
            {stats.finishedCount} selesai • {stats.ongoingCount} berlangsung
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="text-xs text-[#6E6659]">Total durasi kerja</div>
          <div className="text-3xl font-semibold text-[#171614] mt-2 tabular-nums">
            {formatDurationLabel(stats.totalMinutes)}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Akumulasi sesi operasional rider
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="text-xs text-[#6E6659]">Rata-rata durasi</div>
          <div className="text-3xl font-semibold text-[#171614] mt-2 tabular-nums">
            {formatDurationLabel(stats.avgMinutes)}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Rata-rata per sesi operasional selesai
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <section className="rounded-3xl border border-[#E4DEC9] bg-white/75 overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#171614]">
              Riwayat absensi
            </h2>
            <p className="text-xs text-[#7B7263] mt-0.5 tabular-nums">
              {filteredRecords.length} catatan kehadiran
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px] text-xs sm:text-sm">
            <thead>
              <tr className="border-y border-[#E5DFD0] bg-[#FAF8F3] text-[10px] font-mono text-[#8E8371] uppercase">
                <th className="py-3 px-5">NAMA RIDER</th>
                <th className="py-3 px-3">TANGGAL</th>
                <th className="py-3 px-3">MULAI OPERASIONAL</th>
                <th className="py-3 px-3">SELESAI OPERASIONAL</th>
                <th className="py-3 px-3">DURASI KERJA</th>
                <th className="py-3 px-5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DA]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-[#7B7263]"
                  >
                    Belum ada catatan absensi. Jam mulai kerja tercatat otomatis
                    saat rider menekan tombol{' '}
                    <strong className="text-[#171614]">
                      Mulai operasional
                    </strong>{' '}
                    di Website Riders.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isLive = rec.status === 'Berlangsung';
                  const liveMinutes = isLive
                    ? Math.max(
                        0,
                        Math.floor((Date.now() - rec.startTimestampMs) / 60000),
                      )
                    : rec.durationMinutes;

                  return (
                    <tr
                      key={rec.id}
                      className={isLive ? 'bg-[#F5EFE2]' : 'hover:bg-[#FAF8F3]'}
                    >
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-[#171614]">
                          {rec.riderName}
                        </div>
                        <div className="text-[11px] font-mono text-[#7B7263]">
                          {rec.cartCode}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 tabular-nums">
                        {formatShortIndoDate(rec.dateIso, true)}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs tabular-nums">
                        {rec.startTimeLabel}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs tabular-nums">
                        {rec.endTimeLabel ?? '–'}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#8A7553] tabular-nums">
                        {formatDurationLabel(liveMinutes)}
                        {isLive ? '*' : ''}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span
                          className={`inline-block rounded-full px-3.5 py-1 text-xs font-medium ${
                            isLive
                              ? 'bg-[#EFECE4] text-[#8A7553]'
                              : 'bg-[#E6EFE8] text-[#2E6B47]'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
