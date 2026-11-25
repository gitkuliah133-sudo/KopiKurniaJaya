import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, ChevronDown, LogOut, RotateCcw } from 'lucide-react';
import { DEMO_ACCOUNTS } from '../data/mockData';
import { RiderAccount, TabId } from '../types';

interface NavbarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  rider: RiderAccount;
  onSwitchAccount: (account: RiderAccount) => void;
  onResetDemo: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: TabId; label: string }[] = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'riwayat', label: 'Riwayat transaksi' },
  { id: 'stok', label: 'Stok gerobak' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  rider,
  onSwitchAccount,
  onResetDemo,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const otherAccounts = DEMO_ACCOUNTS.filter((a) => a.id !== rider.id);

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F3]/95 backdrop-blur-sm border-b border-[#E5DFD2]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-4 py-3.5">
          {/* Brand */}
          <button
            type="button"
            onClick={() => onSelectTab('beranda')}
            className="text-left group focus:outline-none shrink-0"
          >
            <div className="text-xl tracking-tight text-[#171614] whitespace-nowrap leading-none">
              <strong className="font-bold">KKJ</strong>{' '}
              <span className="font-normal">Express</span>
            </div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#8A7E6B] uppercase mt-1 whitespace-nowrap">
              COFFEE &nbsp;/&nbsp; POINT OF SALE
            </div>
          </button>

          {/* Desktop Center Navigation */}
          <nav
            aria-label="Navigasi utama rider"
            className="hidden lg:flex items-center gap-2"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#EFECE4] text-[#171614] font-semibold'
                      : 'text-[#6A6357] hover:text-[#171614] hover:bg-[#EFECE4]/50 font-medium'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Rider Profile Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              aria-expanded={dropdownOpen}
              className="flex items-center gap-3 rounded-2xl px-2.5 py-1.5 hover:bg-[#EFECE4]/70 transition-colors text-left"
            >
              <div>
                <div className="text-sm font-semibold text-[#171614] leading-tight whitespace-nowrap">
                  {rider.name}
                </div>
                <div className="text-xs text-[#7B7263] leading-tight whitespace-nowrap">
                  {rider.role}
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#7B7263] transition-transform duration-150 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E2DCCE] bg-[#FAF8F3] shadow-xl p-2 z-50">
                <div className="px-3 py-2 border-b border-[#E8E2D6] mb-1">
                  <div className="text-xs font-semibold text-[#171614]">
                    {rider.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#7B7263] truncate">
                    {rider.email}
                  </div>
                </div>

                {otherAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      onSwitchAccount(acc);
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#171614] hover:bg-[#EFECE4] transition-colors"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#7B7263] shrink-0" />
                    <div className="min-w-0">
                      <div className="truncate">
                        {acc.roleType === 'owner'
                          ? 'Buka Dashboard Owner'
                          : `Ganti ke ${acc.firstName}`}
                      </div>
                      <div className="text-[10px] text-[#7B7263]">
                        {acc.role}
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    onResetDemo();
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#171614] hover:bg-[#EFECE4] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#7B7263] shrink-0" />
                  <span>Reset data demo</span>
                </button>

                <div className="my-1 border-t border-[#E8E2D6]" />

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
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

        {/* Tablet & Mobile Second-Row Navigation */}
        <nav
          aria-label="Navigasi rider tablet dan mobile"
          className="flex lg:hidden items-center gap-1.5 pb-3 pt-1 overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#EFECE4] text-[#171614] font-semibold'
                    : 'text-[#6A6357] hover:text-[#171614] font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
