import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  Coffee,
  CreditCard,
  LayoutGrid,
  LogOut,
  Menu,
  PackageCheck,
  Receipt,
  RotateCcw,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { RIDER_ACCOUNTS } from '../../data/mockData';
import { OwnerTabId, UserAccount } from '../../types';

interface OwnerLayoutProps {
  activeTab: OwnerTabId;
  onSelectTab: (tab: OwnerTabId) => void;
  owner: UserAccount;
  activeCartsCount: number;
  totalCartsCount: number;
  pendingRequestsCount: number;
  lastSyncedLabel: string | null;
  onSwitchAccount: (account: UserAccount) => void;
  onResetAllData: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const UTAMA_NAV: { id: OwnerTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'laporan-penjualan', label: 'Laporan penjualan', icon: TrendingUp },
  { id: 'pengeluaran', label: 'Pengeluaran', icon: CreditCard },
  { id: 'transaksi', label: 'Transaksi', icon: Receipt },
];

const KELOLA_NAV: { id: OwnerTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'keuangan', label: 'Keuangan', icon: Wallet },
  { id: 'produk', label: 'Produk & harga', icon: Coffee },
  { id: 'alokasi-stok', label: 'Alokasi stok', icon: Boxes },
  { id: 'proyeksi-stok', label: 'Proyeksi stok', icon: BarChart3 },
  { id: 'absensi', label: 'Absensi rider', icon: Users },
];

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({
  activeTab,
  onSelectTab,
  owner,
  activeCartsCount,
  totalCartsCount,
  pendingRequestsCount,
  lastSyncedLabel,
  onSwitchAccount,
  onResetAllData,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const renderNavContent = (onItemClick?: () => void) => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand */}
        <div className="px-6 pt-6 pb-5">
          <div className="text-xl tracking-tight text-[#171614] whitespace-nowrap leading-none">
            <strong className="font-bold">KKJ</strong>{' '}
            <span className="font-normal">Express</span>
          </div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-[#8A7E6B] uppercase mt-1.5">
            COFFEE &nbsp;/&nbsp; POINT OF SALE
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="px-4 space-y-6">
          <div>
            <div className="px-3 mb-2 font-mono text-[10px] tracking-[0.16em] text-[#9B9182] uppercase">
              UTAMA
            </div>
            <div className="space-y-1">
              {UTAMA_NAV.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      onItemClick?.();
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs sm:text-[13px] transition-colors ${
                      active
                        ? 'bg-[#1D1B18] text-[#FAF8F3] font-semibold'
                        : 'text-[#5C5549] hover:bg-[#EFECE4] hover:text-[#171614] font-medium'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 font-mono text-[10px] tracking-[0.16em] text-[#9B9182] uppercase">
              KELOLA USAHA
            </div>
            <div className="space-y-1">
              {KELOLA_NAV.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      onItemClick?.();
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-full text-xs sm:text-[13px] transition-colors ${
                      active
                        ? 'bg-[#1D1B18] text-[#FAF8F3] font-semibold'
                        : 'text-[#5C5549] hover:bg-[#EFECE4] hover:text-[#171614] font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.id === 'alokasi-stok' && pendingRequestsCount > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                          active
                            ? 'bg-[#D2B98B] text-[#171614]'
                            : 'bg-[#1D1B18] text-[#FAF8F3]'
                        }`}
                      >
                        {pendingRequestsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Bottom Card + Settings + Logout */}
      <div className="px-4 pb-5 pt-6 space-y-4">
        <div className="rounded-2xl bg-[#1D1B18] text-[#FAF8F3] p-4">
          <div className="text-[11px] text-[#B8A88A]">
            Operasional hari ini
          </div>
          <div className="text-xl font-semibold mt-1 tabular-nums">
            {activeCartsCount} dari {totalCartsCount}
          </div>
          <div className="text-[11px] text-[#FAF8F3]/65 mt-0.5">
            gerobak sedang berjualan
          </div>
        </div>

        <div className="border-t border-[#E5DFD0] pt-3 space-y-1">
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(true);
              onItemClick?.();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-full text-xs font-medium text-[#5C5549] hover:bg-[#EFECE4] hover:text-[#171614] transition-colors"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Pengaturan</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-full text-xs font-medium text-[#5C5549] hover:bg-red-50 hover:text-[#9B1C1C] transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#FAF8F3] text-[#171614]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[248px] shrink-0 border-r border-[#E6E0D3] bg-[#F7F4EC] sticky top-0 h-screen overflow-y-auto">
        {renderNavContent()}
      </aside>

      {/* Mobile/Tablet Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-[264px] max-w-[85vw] bg-[#F7F4EC] h-full border-r border-[#E6E0D3] overflow-y-auto">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Tutup menu"
              className="absolute right-4 top-5 rounded-full p-1.5 text-[#6E6659] hover:bg-[#EFECE4]"
            >
              <X className="w-4 h-4" />
            </button>
            {renderNavContent(() => setMobileMenuOpen(false))}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#FAF8F3]/95 backdrop-blur-sm border-b border-[#E6E0D3] px-4 sm:px-8 py-3.5">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Buka navigasi owner"
                className="lg:hidden rounded-xl border border-[#DFD9C9] bg-[#FAF8F3] p-2 text-[#171614] hover:bg-[#EFECE4]"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
                <span className="text-[#8E8371]">Workspace</span>
                <span className="text-[#B8AF9E]">/</span>
                <span className="font-semibold text-[#171614]">KKJ Express</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#EFECE4] border border-[#E4DEC9] px-3.5 py-1.5 text-xs text-[#5C5549] tabular-nums">
                <span className="h-2 w-2 rounded-full bg-[#2E6B47]" />
                <span>
                  Tersinkron{lastSyncedLabel ? ` • ${lastSyncedLabel}` : ''}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectTab('alokasi-stok')}
                aria-label="Notifikasi permintaan stok"
                className="relative rounded-full p-2 text-[#5C5549] hover:bg-[#EFECE4] transition-colors"
              >
                <Bell className="w-4 h-4" />
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#1D1B18] text-[#FAF8F3] text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              <div className="h-5 w-px bg-[#DFD8C8] hidden sm:block" />

              {/* Owner Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2.5 rounded-2xl px-2 py-1 hover:bg-[#EFECE4]/70 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EFECE4] border border-[#DFD8C8] flex items-center justify-center text-[#1D1B18] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-semibold text-[#171614] leading-tight">
                      {owner.name}
                    </div>
                    <div className="text-[11px] text-[#7B7263] leading-tight">
                      {owner.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7B7263]" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E2DCCE] bg-[#FAF8F3] shadow-xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-[#E8E2D6] mb-1">
                      <div className="text-xs font-semibold text-[#171614]">
                        {owner.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#7B7263]">
                        {owner.email}
                      </div>
                    </div>

                    <div className="px-3 py-1 font-mono text-[10px] text-[#8E8371] uppercase">
                      Buka Tampilan Rider
                    </div>
                    {RIDER_ACCOUNTS.map((riderAcc) => (
                      <button
                        key={riderAcc.id}
                        type="button"
                        onClick={() => {
                          onSwitchAccount(riderAcc);
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#171614] hover:bg-[#EFECE4] transition-colors"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-[#7B7263] shrink-0" />
                        <div className="min-w-0">
                          <div className="truncate">{riderAcc.name}</div>
                          <div className="text-[10px] text-[#7B7263]">
                            {riderAcc.role}
                          </div>
                        </div>
                      </button>
                    ))}

                    <div className="my-1 border-t border-[#E8E2D6]" />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#9B1C1C] hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* Bottom Workspace Footer */}
        <footer className="border-t border-[#E6E0D3] px-4 sm:px-8 py-4 text-[11px] text-[#8E8371]">
          <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-2">
            <span>
              KKJ Express Owner Dashboard • Terhubung langsung dengan Rider
              Workspace
            </span>
            <span className="tabular-nums">
              {lastSyncedLabel
                ? `Terakhir diperbarui pukul ${lastSyncedLabel}`
                : 'Menunggu aktivitas operasional'}
            </span>
          </div>
        </footer>
      </div>

      {/* Settings / Workspace Utility Modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#FAF8F3] border border-[#DFD9C9] p-6 text-[#171614] shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] tracking-[0.16em] text-[#8E8371] uppercase">
                  PENGATURAN WORKSPACE
                </div>
                <h3 className="text-xl font-semibold mt-1">
                  Pengaturan KKJ Express
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full p-1.5 text-[#6E6659] hover:bg-[#EFECE4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl bg-[#EFECE4] p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#171614]">
                <PackageCheck className="w-4 h-4 text-[#2E6B47]" />
                <span>Sinkronisasi Owner &amp; Rider Aktif</span>
              </div>
              <p className="text-[#6E6659] leading-relaxed">
                Perubahan produk, harga, maupun alokasi stok dari dashboard
                Owner akan langsung tampil di aplikasi POS Rider Gerobak 01 &amp;
                Gerobak 03.
              </p>
            </div>

            <div className="rounded-2xl border border-[#DFD9C9] bg-white p-4 space-y-3">
              <div className="text-xs font-semibold text-[#171614]">
                Reset Seluruh Data Operasional
              </div>
              <p className="text-xs text-[#6E6659] leading-relaxed">
                Mengembalikan seluruh transaksi, pengeluaran, absensi, serta
                stok gerobak ke kondisi awal (0).
              </p>
              <button
                type="button"
                onClick={() => {
                  onResetAllData();
                  setSettingsOpen(false);
                }}
                className="rounded-full border border-[#9B1C1C]/30 bg-red-50 hover:bg-red-100 text-[#9B1C1C] text-xs font-semibold px-4 py-2 inline-flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset data ke kondisi awal</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full bg-[#1D1B18] text-[#FAF8F3] text-xs font-semibold px-5 py-2.5"
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
