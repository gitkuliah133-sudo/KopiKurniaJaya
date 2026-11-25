import React, { useMemo, useState } from 'react';
import { Coffee, CheckCircle2, EyeOff, Plus, Search, X } from 'lucide-react';
import { formatRupiah } from '../../data/mockData';
import { Product } from '../../types';

interface OwnerProductsPageProps {
  products: Product[];
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onToggleProductStatus: (productId: string) => void;
}

export const OwnerProductsPage: React.FC<OwnerProductsPageProps> = ({
  products,
  onOpenAddModal,
  onOpenEditModal,
  onToggleProductStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<
    'Semua' | 'KOPI' | 'NON-KOPI'
  >('Semua');
  const [statusFilter, setStatusFilter] = useState<
    'Semua' | 'Aktif' | 'Nonaktif'
  >('Semua');
  const [selectedId, setSelectedId] = useState<string>(products[0]?.id ?? '');

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat =
        categoryFilter === 'Semua' || p.category === categoryFilter;
      const matchStatus =
        statusFilter === 'Semua' ||
        (statusFilter === 'Aktif' ? p.active : !p.active);
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q);
      return matchCat && matchStatus && matchQuery;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const selectedProduct = useMemo(() => {
    return (
      products.find((p) => p.id === selectedId) ??
      filteredProducts[0] ??
      products[0] ??
      null
    );
  }, [products, filteredProducts, selectedId]);

  const activeCount = products.filter((p) => p.active).length;
  const inactiveCount = products.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[36px] font-semibold tracking-tight text-[#171614]">
            Manajemen data produk
          </h1>
          <p className="text-sm text-[#6E6659] mt-1">
            Kelola informasi dan harga jual menu untuk katalog kasir Website
            Riders.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="self-start sm:self-center rounded-full bg-[#1D1B18] hover:bg-[#2F2B25] text-[#FAF8F3] px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah produk</span>
        </button>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#1D1B18] text-[#FAF8F3] p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#B8A88A]">
            <span>Total produk</span>
            <Coffee className="w-4 h-4 text-[#D2B98B]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight mt-2 tabular-nums">
            {products.length}
          </div>
          <div className="text-[11px] text-[#FAF8F3]/65 mt-2">
            Katalog menu KKJ Express
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Produk aktif</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E6B47]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {activeCount}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Tampil di kasir Website Riders
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFECE4] border border-[#E4DEC9] p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#6E6659]">
            <span>Produk nonaktif</span>
            <EyeOff className="w-4 h-4 text-[#8E8371]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#171614] mt-2 tabular-nums">
            {inactiveCount}
          </div>
          <div className="text-[11px] text-[#7B7263] mt-2">
            Tidak ditampilkan di kasir
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-3xl border border-[#E4DEC9] bg-white/75 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8A806E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau kode produk..."
            className="w-full rounded-full border border-[#DFD9C9] bg-[#FAF8F3] pl-10 pr-8 py-2 text-xs text-[#171614] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A806E]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as 'Semua' | 'KOPI' | 'NON-KOPI')
          }
          className="rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614] focus:outline-none"
        >
          <option value="Semua">Semua kategori</option>
          <option value="KOPI">Kopi</option>
          <option value="NON-KOPI">Non-kopi</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'Semua' | 'Aktif' | 'Nonaktif')
          }
          className="rounded-full border border-[#DFD9C9] bg-[#FAF8F3] px-4 py-2 text-xs font-medium text-[#171614] focus:outline-none"
        >
          <option value="Semua">Semua status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setCategoryFilter('Semua');
            setStatusFilter('Semua');
          }}
          className="px-3 py-2 text-xs font-medium text-[#8A7553] hover:text-[#171614]"
        >
          Reset
        </button>
      </div>

      {/* 2-Column Split: Product List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <section className="lg:col-span-7 rounded-3xl border border-[#E4DEC9] bg-white/75 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-lg font-semibold text-[#171614]">
              Daftar produk
            </h2>
            <p className="text-xs text-[#7B7263] mt-0.5">
              Pilih produk untuk melihat detail atau mengubah harga jual.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y border-[#E5DFD0] bg-[#FAF8F3] text-[10px] font-mono text-[#8E8371] uppercase">
                  <th className="py-2.5 px-5">PRODUK</th>
                  <th className="py-2.5 px-3">KATEGORI</th>
                  <th className="py-2.5 px-3">HARGA JUAL</th>
                  <th className="py-2.5 px-5 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DA] text-xs sm:text-sm">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProduct?.id === product.id;
                  return (
                    <tr
                      key={product.id}
                      onClick={() => setSelectedId(product.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#EFECE4]' : 'hover:bg-[#FAF8F3]'
                      }`}
                    >
                      <td className="py-3 px-5">
                        <div className="font-semibold text-[#171614]">
                          {product.name}
                        </div>
                        <div className="text-[11px] font-mono text-[#7B7263]">
                          {product.code}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-[#5C5549]">
                        {product.category === 'KOPI' ? 'Kopi' : 'Non-kopi'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#171614] tabular-nums">
                        {formatRupiah(product.price)}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span
                          className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-medium ${
                            product.active
                              ? 'bg-[#E6EFE8] text-[#2E6B47]'
                              : 'bg-[#EFECE4] text-[#6E6659]'
                          }`}
                        >
                          {product.active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-[#ECE7DA] flex justify-between text-[11px] text-[#7B7263]">
            <span>
              Menampilkan {filteredProducts.length} dari {products.length} produk
            </span>
            <span>Harga dalam Rupiah</span>
          </div>
        </section>

        {/* Detail Panel */}
        <aside className="lg:col-span-5 rounded-3xl border border-[#E4DEC9] bg-[#F7F4EC] p-5 sm:p-6">
          {selectedProduct ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#171614]">
                    Detail produk
                  </h2>
                  <p className="text-xs text-[#7B7263] mt-0.5">
                    Ringkasan produk terpilih. Edit melalui modal.
                  </p>
                </div>
                <span className="font-mono text-[11px] text-[#8E8371]">
                  {selectedProduct.code}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="text-[11px] text-[#7B7263]">Nama produk</div>
                  <div className="mt-1 rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm font-medium text-[#171614]">
                    {selectedProduct.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] text-[#7B7263]">Kode</div>
                    <div className="mt-1 rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2 text-xs font-mono text-[#171614]">
                      {selectedProduct.code}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#7B7263]">Kategori</div>
                    <div className="mt-1 rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2 text-xs text-[#171614]">
                      {selectedProduct.category === 'KOPI' ? 'Kopi' : 'Non-kopi'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-[#7B7263]">Harga jual</div>
                  <div className="mt-1 rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#171614] tabular-nums">
                    {formatRupiah(selectedProduct.price)}
                  </div>
                  <div className="text-[11px] text-[#8A7553] mt-1 tabular-nums">
                    Harga di kasir: {formatRupiah(selectedProduct.price)} / cup
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-[#7B7263]">Deskripsi</div>
                  <div className="mt-1 rounded-xl border border-[#DFD9C9] bg-white px-3.5 py-2.5 text-xs text-[#5C5549] min-h-[56px]">
                    {selectedProduct.description || 'Belum ada deskripsi.'}
                  </div>
                </div>

                <p className="text-[11px] text-[#7B7263] leading-relaxed">
                  Perubahan berlaku untuk transaksi berikutnya di Website
                  Riders. Riwayat transaksi sebelumnya tetap menggunakan harga
                  sebelumnya.
                </p>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => onToggleProductStatus(selectedProduct.id)}
                    className="flex-1 rounded-full border border-[#DFD9C9] bg-white hover:bg-[#EFECE4] py-2.5 text-xs font-semibold text-[#171614] transition-colors"
                  >
                    {selectedProduct.active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenEditModal(selectedProduct)}
                    className="flex-1 rounded-full bg-[#1D1B18] hover:bg-[#2F2B25] text-[#FAF8F3] py-2.5 text-xs font-semibold transition-colors"
                  >
                    Edit produk
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-[#7B7263]">
              Pilih salah satu produk untuk melihat detail.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
