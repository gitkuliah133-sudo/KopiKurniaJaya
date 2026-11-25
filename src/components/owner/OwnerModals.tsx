import React, { useEffect, useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import {
  formatInputDots,
  formatRupiah,
  getTodayWibIsoDate,
} from '../../data/mockData';
import {
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseRecord,
  Product,
  ProductCategory,
  Transaction,
} from '../../types';

/* 1. Tambah Pengeluaran Modal */
interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseRecord, 'id' | 'recordedBy'>) => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [dateIso, setDateIso] = useState(() => getTodayWibIsoDate());
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<ExpensePaymentMethod | ''>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setDateIso(getTodayWibIsoDate());
      setCategory('');
      setName('');
      setAmount(0);
      setMethod('');
      setNote('');
    }
  }, [open]);

  if (!open) return null;

  const handleFillSample = () => {
    setDateIso(getTodayWibIsoDate());
    setCategory('Bahan baku');
    setName('Pembelian susu segar UHT 20 liter');
    setAmount(380000);
    setMethod('Transfer Bank');
    setNote('Stok tambahan persediaan pusat');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateIso || !category || !name.trim() || amount <= 0 || !method) return;
    onSave({
      dateIso,
      category,
      name: name.trim(),
      amount,
      method,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const isValid =
    Boolean(dateIso) &&
    Boolean(category) &&
    name.trim().length > 0 &&
    amount > 0 &&
    Boolean(method);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-3xl bg-[#FAF8F3] border border-[#E2DCCE] p-6 sm:p-7 text-[#171614] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Tambah pengeluaran
            </h3>
            <p className="text-xs text-[#6E6659] mt-1">
              Catat biaya operasional usaha Anda.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillSample}
              className="rounded-full bg-[#EFECE4] hover:bg-[#E4DEC9] px-3.5 py-1.5 text-xs font-medium text-[#5C5549] transition-colors"
            >
              Isi data contoh
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="rounded-full bg-[#EFECE4] p-2 text-[#6E6659] hover:text-[#171614]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
                Tanggal Pengeluaran *
              </label>
              <input
                type="date"
                required
                value={dateIso}
                onChange={(e) => setDateIso(e.target.value)}
                className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] focus:outline-none focus:border-[#9E8C6C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
                Kategori Pengeluaran *
              </label>
              <select
                required
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as ExpenseCategory)
                }
                className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] focus:outline-none focus:border-[#9E8C6C]"
              >
                <option value="">Pilih kategori</option>
                <option value="Bahan baku">Bahan baku</option>
                <option value="Operasional">Operasional</option>
                <option value="Transportasi">Transportasi</option>
                <option value="Perawatan">Perawatan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
              Nama Pengeluaran *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pembelian susu segar"
              className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] placeholder:text-[#9E9484] focus:outline-none focus:border-[#9E8C6C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
                Nominal Pengeluaran *
              </label>
              <div className="flex items-center rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 focus-within:border-[#9E8C6C]">
                <span className="text-xs font-semibold text-[#8E8371] mr-2">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formatInputDots(amount)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setAmount(digits ? parseInt(digits, 10) : 0);
                  }}
                  placeholder="0"
                  className="w-full bg-transparent text-sm font-medium text-[#171614] focus:outline-none tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
                Metode Pembayaran *
              </label>
              <select
                required
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value as ExpensePaymentMethod)
                }
                className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] focus:outline-none focus:border-[#9E8C6C]"
              >
                <option value="">Pilih metode</option>
                <option value="Tunai">Tunai</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
              Keterangan (opsional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahkan keterangan jika diperlukan"
              className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] placeholder:text-[#9E9484] focus:outline-none focus:border-[#9E8C6C]"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E6E0D3] flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#8E8371]">* Wajib diisi</span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#DFD9C9] bg-white hover:bg-[#EFECE4] px-5 py-2.5 text-xs font-semibold text-[#171614]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="rounded-full bg-[#1D1B18] hover:bg-[#2E2A25] disabled:opacity-40 text-[#FAF8F3] px-5 py-2.5 text-xs font-semibold transition-colors"
            >
              Simpan Pengeluaran
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

/* 2. Detail Transaksi Owner Modal */
interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const subtotalSum = transaction.items.reduce(
    (s, item) => s + item.subtotal,
    0,
  );
  const discount = Math.max(0, subtotalSum - transaction.total);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#FAF8F3] border border-[#E2DCCE] p-6 sm:p-7 text-[#171614] shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Detail transaksi
            </h3>
            <p className="font-mono text-xs text-[#8A7553] mt-1 tabular-nums">
              {transaction.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full bg-[#EFECE4] p-2 text-[#6E6659] hover:text-[#171614]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-5 rounded-2xl bg-[#EFECE4] p-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-[#7B7263]">Nama rider</div>
            <div className="text-sm font-semibold text-[#171614] mt-0.5">
              {transaction.riderName}
            </div>
          </div>
          <div>
            <div className="text-[#7B7263]">Gerobak</div>
            <div className="text-sm font-semibold text-[#171614] mt-0.5">
              {transaction.cartCode}
            </div>
          </div>
          <div>
            <div className="text-[#7B7263]">Waktu transaksi</div>
            <div className="text-sm font-semibold text-[#171614] mt-0.5 tabular-nums">
              {transaction.dateLabel}, {transaction.time}
            </div>
          </div>
          <div>
            <div className="text-[#7B7263]">Metode pembayaran</div>
            <div className="text-sm font-semibold text-[#171614] mt-0.5">
              {transaction.method}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mt-5">
          <div className="text-sm font-semibold text-[#171614] mb-2.5">
            Produk yang dibeli
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5DFD0] text-[10px] font-mono text-[#8E8371] uppercase">
                  <th className="py-2 pr-2">PRODUK</th>
                  <th className="py-2 px-2 text-right">QTY</th>
                  <th className="py-2 px-2 text-right">HARGA SATUAN</th>
                  <th className="py-2 pl-2 text-right">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DA]">
                {transaction.items.map((item, idx) => (
                  <tr key={`${item.productId}-${idx}`}>
                    <td className="py-3 pr-2 font-medium text-[#171614]">
                      {item.name}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {item.qty}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {formatRupiah(item.unitPrice)}
                    </td>
                    <td className="py-3 pl-2 text-right font-semibold tabular-nums">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#E5DFD0] pt-3 mt-1 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#6E6659]">
              <span>Subtotal</span>
              <span className="font-medium text-[#171614] tabular-nums">
                {formatRupiah(subtotalSum)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#6E6659]">
                <span>Potongan harga</span>
                <span className="tabular-nums">-{formatRupiah(discount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-2">
              <span className="text-sm font-semibold text-[#171614]">
                Total pembayaran
              </span>
              <span className="text-xl font-bold text-[#171614] tabular-nums">
                {formatRupiah(transaction.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Status banner */}
        <div
          className={`mt-4 rounded-2xl px-4 py-3 flex items-start gap-2.5 text-xs ${
            transaction.status === 'Berhasil'
              ? 'bg-[#E6EFE8] text-[#2E6B47]'
              : 'bg-red-50 text-[#9B1C1C]'
          }`}
        >
          {transaction.status === 'Berhasil' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold">{transaction.status}</div>
            <div className="mt-0.5 opacity-90">
              {transaction.status === 'Berhasil'
                ? 'Pembayaran berhasil. Transaksi tercatat dalam total penjualan.'
                : 'Pembayaran gagal atau dibatalkan.'}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#8E8371]">
            Harga mengikuti data saat transaksi.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#1D1B18] text-[#FAF8F3] text-xs font-semibold px-6 py-2.5 hover:bg-[#2F2B25]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

/* 3. Tambah / Edit Produk Modal */
interface ProductModalProps {
  open: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    name: string;
    category: ProductCategory;
    price: number;
    description: string;
    active: boolean;
  }) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  open,
  editingProduct,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setPrice(editingProduct.price);
      setDescription(editingProduct.description);
      setActive(editingProduct.active);
    } else {
      setName('');
      setCategory('');
      setPrice(0);
      setDescription('');
      setActive(true);
    }
  }, [open, editingProduct]);

  if (!open) return null;

  const handleFillSample = () => {
    setName('Es Kopi Susu Vanilla');
    setCategory('KOPI');
    setPrice(21000);
    setDescription('Espresso house blend, susu segar, dan sirup vanilla.');
    setActive(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category || price <= 0) return;
    onSave({
      id: editingProduct?.id,
      name: name.trim(),
      category,
      price,
      description: description.trim(),
      active,
    });
    onClose();
  };

  const isValid = name.trim().length > 0 && Boolean(category) && price > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-3xl bg-[#FAF8F3] border border-[#E2DCCE] p-6 sm:p-7 text-[#171614] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </h3>
            <p className="text-xs text-[#6E6659] mt-1">
              Lengkapi informasi produk untuk katalog penjualan Rider POS.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editingProduct && (
              <button
                type="button"
                onClick={handleFillSample}
                className="rounded-full bg-[#EFECE4] hover:bg-[#E4DEC9] px-3.5 py-1.5 text-xs font-medium text-[#5C5549] transition-colors"
              >
                Isi data contoh
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="rounded-full bg-[#EFECE4] p-2 text-[#6E6659] hover:text-[#171614]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
              Nama Produk *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Es Kopi Susu Vanilla"
              className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] placeholder:text-[#9E9484] focus:outline-none focus:border-[#9E8C6C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
                Kategori Produk *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] focus:outline-none focus:border-[#9E8C6C]"
              >
                <option value="">Pilih kategori</option>
                <option value="KOPI">Kopi</option>
                <option value="NON-KOPI">Non-kopi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
                Harga Jual *
              </label>
              <div className="flex items-center rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 focus-within:border-[#9E8C6C]">
                <span className="text-xs font-semibold text-[#8E8371] mr-2">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formatInputDots(price)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setPrice(digits ? parseInt(digits, 10) : 0);
                  }}
                  placeholder="0"
                  className="w-full bg-transparent text-sm font-medium text-[#171614] focus:outline-none tabular-nums"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
              Deskripsi Produk (opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan informasi produk jika diperlukan"
              className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] placeholder:text-[#9E9484] focus:outline-none focus:border-[#9E8C6C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
            <div>
              <label className="block text-xs font-medium text-[#5C5549] mb-1.5">
                Status Produk *
              </label>
              <select
                value={active ? 'Aktif' : 'Nonaktif'}
                onChange={(e) => setActive(e.target.value === 'Aktif')}
                className="w-full rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm text-[#171614] focus:outline-none focus:border-[#9E8C6C]"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
            <p className="text-[11px] text-[#7B7263] leading-relaxed sm:pt-5">
              Produk aktif langsung tampil di kasir Website Riders. Perubahan
              harga berlaku untuk transaksi berikutnya.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E6E0D3] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#DFD9C9] bg-white hover:bg-[#EFECE4] px-5 py-2.5 text-xs font-semibold text-[#171614]"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="rounded-full bg-[#1D1B18] hover:bg-[#2E2A25] disabled:opacity-40 text-[#FAF8F3] px-5 py-2.5 text-xs font-semibold transition-colors"
          >
            Simpan Produk
          </button>
        </div>
      </form>
    </div>
  );
};
