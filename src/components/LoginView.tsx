import React, { useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { DEMO_ACCOUNTS } from '../data/mockData';
import { RiderAccount } from '../types';
import { EspressoBackdrop } from './EspressoBackdrop';

interface LoginViewProps {
  onLogin: (account: RiderAccount, rememberMe: boolean) => void;
  savedIdentifier?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  savedIdentifier = '',
}) => {
  const [identifier, setIdentifier] = useState(savedIdentifier);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(savedIdentifier));
  const [errorMsg, setErrorMsg] = useState('');
  const [activeModal, setActiveModal] = useState<'admin' | 'forgot' | null>(null);

  const handleAutoFill = (account: RiderAccount, autoSubmit = false) => {
    setIdentifier(account.email);
    setPassword(account.password);
    setErrorMsg('');
    if (autoSubmit) {
      onLogin(account, rememberMe);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = identifier.trim().toLowerCase();
    const matched = DEMO_ACCOUNTS.find(
      (acc) =>
        (acc.email.toLowerCase() === trimmed ||
          acc.username.toLowerCase() === trimmed) &&
        acc.password === password,
    );

    if (!matched) {
      setErrorMsg(
        'Email/username atau kata sandi tidak sesuai. Gunakan tombol isi otomatis akun demo untuk masuk.',
      );
      return;
    }

    setErrorMsg('');
    onLogin(matched, rememberMe);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#151311] text-[#FAF8F3] overflow-x-hidden">
      <EspressoBackdrop variant="login" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-[1320px] mx-auto px-6 sm:px-10 pt-7 pb-5">
        <div className="flex items-center justify-between gap-6 border-b border-[#FAF8F3]/12 pb-6">
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl tracking-tight text-[#FAF8F3] whitespace-nowrap">
              <strong className="font-bold">KKJ</strong>{' '}
              <span className="font-light text-[#FAF8F3]/90">Express</span>
            </span>
            <span className="font-mono text-[10px] tracking-[0.22em] text-[#B8A88A] uppercase mt-1 whitespace-nowrap">
              COFFEE &nbsp;/&nbsp; POINT OF SALE
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-[#FAF8F3]/65 hidden sm:inline">
              Butuh bantuan?
            </span>
            <button
              type="button"
              onClick={() => setActiveModal('admin')}
              className="font-medium text-[#D2B98B] hover:text-[#FAF8F3] transition-colors whitespace-nowrap"
            >
              Hubungi admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-[1320px] mx-auto px-6 sm:px-10 py-8 sm:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Login Form */}
          <div className="lg:col-span-6 xl:col-span-5 max-w-[440px] w-full mx-auto lg:mx-0">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-6 bg-[#B8A88A]/70" aria-hidden="true" />
              <span className="font-mono text-[11px] tracking-[0.18em] text-[#B8A88A] uppercase">
                KKJ EXPRESS / RIDER WORKSPACE
              </span>
            </div>

            <h1 className="text-3xl sm:text-[42px] font-medium tracking-tight leading-[1.12] text-[#FAF8F3] mb-3 text-balance">
              Selamat datang kembali
            </h1>
            <p className="text-sm sm:text-[15px] text-[#FAF8F3]/70 leading-relaxed mb-7">
              Masuk ke akun KKJ Express Anda untuk melanjutkan operasional hari
              ini.
            </p>

            {/* Quick Demo Strip on Mobile/Tablet (also visible everywhere for zero-friction access) */}
            <div className="mb-6 rounded-2xl border border-[#B8A88A]/25 bg-[#211E1A]/85 p-3.5 lg:hidden">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="font-mono text-[10px] tracking-[0.16em] text-[#D2B98B] uppercase">
                  ISI OTOMATIS AKUN DEMO
                </span>
                <span className="text-[11px] text-[#FAF8F3]/60">
                  Data dummy
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleAutoFill(acc, false)}
                    className="text-left rounded-xl border border-[#FAF8F3]/12 bg-[#FAF8F3]/[0.04] hover:bg-[#FAF8F3]/[0.09] px-3 py-2.5 transition-colors"
                  >
                    <div className="text-xs font-semibold text-[#FAF8F3]">
                      {acc.name}
                    </div>
                    <div className="text-[11px] text-[#B8A88A] mt-0.5">
                      {acc.role}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-xs font-medium text-[#FAF8F3]/85 mb-2"
                >
                  Email atau username
                </label>
                <div className="relative">
                  <User
                    className="w-4 h-4 text-[#B8A88A]/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="login-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Masukkan email atau username"
                    autoComplete="username"
                    className="w-full rounded-xl border border-[#B8A88A]/30 bg-[#23201C]/80 pl-10 pr-4 py-3 text-sm text-[#FAF8F3] placeholder:text-[#FAF8F3]/40 focus:outline-none focus:border-[#D2B98B] focus:ring-1 focus:ring-[#D2B98B]/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-[#FAF8F3]/85 mb-2"
                >
                  Kata sandi
                </label>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 text-[#B8A88A]/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-[#B8A88A]/30 bg-[#23201C]/80 pl-10 pr-11 py-3 text-sm text-[#FAF8F3] placeholder:text-[#FAF8F3]/40 focus:outline-none focus:border-[#D2B98B] focus:ring-1 focus:ring-[#D2B98B]/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? 'Sembunyikan kata sandi'
                        : 'Tampilkan kata sandi'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#B8A88A] hover:text-[#FAF8F3] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2.5 text-xs text-[#FAF8F3]/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#B8A88A]/45 bg-[#23201C] text-[#D2B98B] focus:ring-[#D2B98B]/40 accent-[#D2B98B]"
                  />
                  <span>Ingat saya</span>
                </label>

                <button
                  type="button"
                  onClick={() => setActiveModal('forgot')}
                  className="text-xs font-medium text-[#D2B98B] hover:text-[#FAF8F3] transition-colors"
                >
                  Lupa kata sandi?
                </button>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-400/35 bg-amber-950/50 px-3.5 py-2.5 text-xs text-amber-200 leading-relaxed"
                >
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 rounded-full bg-[#F5F2EB] hover:bg-[#FAF8F3] active:scale-[0.99] text-[#171614] font-semibold text-sm py-3.5 px-6 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 text-xs text-[#FAF8F3]/65 mt-4">
              <ShieldCheck
                className="w-4 h-4 text-[#B8A88A]"
                aria-hidden="true"
              />
              <span>Akses otomatis sesuai peran akun Anda.</span>
            </div>

            <div className="mt-6 rounded-2xl border border-[#B8A88A]/22 bg-[#23201C]/75 p-4 flex items-start gap-3">
              <Info
                className="w-4 h-4 text-[#B8A88A] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="text-xs leading-relaxed">
                <div className="font-semibold text-[#D2B98B] mb-0.5">
                  Informasi untuk rider
                </div>
                <p className="text-[#FAF8F3]/70">
                  Setelah masuk, klik tombol{' '}
                  <strong className="text-[#FAF8F3]/90 font-medium">
                    Mulai operasional
                  </strong>{' '}
                  untuk mencatat jam mulai kerja hari ini.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-[#FAF8F3]/65">
              Belum memiliki akun?{' '}
              <button
                type="button"
                onClick={() => setActiveModal('admin')}
                className="font-semibold text-[#D2B98B] hover:text-[#FAF8F3] transition-colors ml-1"
              >
                Hubungi admin
              </button>
            </div>
          </div>

          {/* Right Column: Demo Auto-Fill Panel (Desktop & Tablet-ready) */}
          <div className="lg:col-span-6 xl:col-span-6 xl:col-start-7">
            <div className="rounded-3xl border border-[#B8A88A]/25 bg-[#1D1B18]/85 backdrop-blur-md p-6 sm:p-7 shadow-2xl max-w-[500px] mx-auto lg:ml-auto lg:mr-0">
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#FAF8F3]/10">
                <div>
                  <div className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-[#D2B98B] uppercase mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>AKUN DEMO &amp; ISI OTOMATIS</span>
                  </div>
                  <h2 className="text-lg font-semibold text-[#FAF8F3]">
                    Pilih akun rider untuk pengujian
                  </h2>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF8F3]/10 text-[#D2B98B] whitespace-nowrap">
                  Demo Mode
                </span>
              </div>

              <div className="space-y-3.5 mt-5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isFilled =
                    identifier.trim().toLowerCase() ===
                      acc.email.toLowerCase() ||
                    identifier.trim().toLowerCase() ===
                      acc.username.toLowerCase();

                  return (
                    <div
                      key={acc.id}
                      className={`rounded-2xl border p-4 transition-colors ${
                        isFilled
                          ? 'border-[#D2B98B]/65 bg-[#2A251F]/90'
                          : 'border-[#FAF8F3]/12 bg-[#FAF8F3]/[0.03] hover:bg-[#FAF8F3]/[0.06]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-mono uppercase tracking-wider text-[#B8A88A]">
                            {acc.accountTypeLabel}
                          </div>
                          <div className="text-base font-semibold text-[#FAF8F3] mt-0.5">
                            {acc.name}
                          </div>
                          <div className="text-xs text-[#FAF8F3]/70">
                            {acc.role}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-[#151311]/70 rounded-xl p-2.5 border border-[#FAF8F3]/8">
                        <div className="truncate">
                          <span className="text-[#FAF8F3]/45 block text-[10px]">
                            Email / Username
                          </span>
                          <span className="text-[#FAF8F3]/90">{acc.email}</span>
                          <span className="text-[#FAF8F3]/50 block text-[10px]">
                            @{acc.username}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#FAF8F3]/45 block text-[10px]">
                            Kata sandi
                          </span>
                          <span className="text-[#D2B98B]">{acc.password}</span>
                        </div>
                      </div>

                      <div className="mt-3.5 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAutoFill(acc, false)}
                          className="flex-1 min-w-[130px] rounded-full border border-[#B8A88A]/40 bg-transparent hover:bg-[#FAF8F3]/10 text-[#FAF8F3] text-xs font-medium py-2 px-3.5 transition-colors whitespace-nowrap"
                        >
                          Isi otomatis
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAutoFill(acc, true)}
                          className="flex-1 min-w-[130px] rounded-full bg-[#F5F2EB] hover:bg-[#FAF8F3] text-[#171614] text-xs font-semibold py-2 px-3.5 inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                        >
                          <span>Isi &amp; Masuk</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-[11px] text-[#FAF8F3]/60 leading-relaxed">
                Catatan: Akun di atas adalah data demo terintegrasi. Gunakan{' '}
                <strong className="text-[#FAF8F3]/85 font-medium">
                  Akun owner
                </strong>{' '}
                untuk mengelola produk, alokasi stok, pengeluaran, dan laporan,
                atau akun{' '}
                <strong className="text-[#FAF8F3]/85 font-medium">Rider</strong>{' '}
                untuk operasional POS gerobak.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-[1320px] mx-auto px-6 sm:px-10 pb-7 pt-4">
        <div className="border-t border-[#FAF8F3]/12 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] text-[#B8A88A] uppercase">
            KOPI TERUS MENGALIR. USAHA TETAP TERKENDALI.
          </span>
          <span className="text-[11px] text-[#FAF8F3]/50">
            © 2026 KKJ Express. Seluruh hak dilindungi.
          </span>
        </div>
      </footer>

      {/* Helper Modals */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#B8A88A]/25 bg-[#1D1B18] p-6 text-[#FAF8F3] shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="font-mono text-[10px] tracking-[0.16em] text-[#B8A88A] uppercase">
                  BANTUAN RIDER
                </span>
                <h3 className="text-lg font-semibold mt-1">
                  {activeModal === 'admin'
                    ? 'Hubungi Admin Operasional'
                    : 'Lupa Kata Sandi'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Tutup dialog"
                className="rounded-full p-1.5 text-[#FAF8F3]/60 hover:bg-[#FAF8F3]/10 hover:text-[#FAF8F3] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeModal === 'admin' ? (
              <div className="space-y-3 text-sm text-[#FAF8F3]/80">
                <p>
                  Jika Anda mengalami kendala akses akun gerobak atau belum
                  memiliki akun rider, silakan hubungi koordinator lapangan:
                </p>
                <div className="rounded-2xl bg-[#151311] border border-[#FAF8F3]/10 p-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#FAF8F3]/50">Admin Pusat</span>
                    <span>+62 811-2233-4455</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#FAF8F3]/50">Email Dukungan</span>
                    <span>ops@kkjexpress.id</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#FAF8F3]/50">Jam Siaga</span>
                    <span>06.00 – 19.00 WIB</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-[#FAF8F3]/80">
                <p>
                  Untuk keamanan gerobak, pembaruan kata sandi dilakukan melalui
                  Admin Operasional. Untuk mode demo, Anda dapat langsung
                  menggunakan tombol{' '}
                  <strong className="text-[#D2B98B]">Isi otomatis</strong> di
                  halaman login.
                </p>
                <div className="rounded-2xl bg-[#151311] border border-[#FAF8F3]/10 p-3.5 text-xs font-mono space-y-1.5">
                  <div>
                    Gerobak 03: <span className="text-[#D2B98B]">KopiKKJ#03</span>
                  </div>
                  <div>
                    Gerobak 01: <span className="text-[#D2B98B]">KopiKKJ#01</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full bg-[#F5F2EB] hover:bg-[#FAF8F3] text-[#171614] text-xs font-semibold px-5 py-2.5 transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
