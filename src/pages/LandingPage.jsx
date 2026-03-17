import { useState, useEffect } from 'react'
import {
  MapPin,
  Star,
  Users,
  ShoppingBag,
  Plus,
  Trash2,
  X,
  Check,
  Loader2,
  Upload,
  ImagePlus,
} from 'lucide-react'
import { SiInstagram, SiTiktok, SiWhatsapp } from 'react-icons/si'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import { fetchProducts, addProduct, updateProduct, deleteProduct, uploadProductImage } from '../lib/supabase'

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// ── Product Modal with file upload ──────────────────────────────────────────
function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({ name: product?.name || '', price: product?.price || '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(product?.image_url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.price) { setError('Nama dan harga wajib diisi.'); return }
    setLoading(true); setError('')
    try {
      let image_url = product?.image_url || ''
      if (imageFile) {
        image_url = await uploadProductImage(imageFile)
      }
      await onSave({ name: form.name.trim(), price: Number(form.price), image_url })
      onClose()
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-gray-900">{product ? 'Edit Produk' : 'Tambah Produk'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload — 1:1 square */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Foto Produk <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <label className="block cursor-pointer">
              <div className="aspect-square w-full max-w-[200px] mx-auto rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors overflow-hidden bg-gray-50 flex items-center justify-center relative group">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImagePlus size={24} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400 p-4">
                    <Upload size={28} />
                    <span className="text-xs text-center">Klik untuk upload gambar</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk <span className="text-primary">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="cth. Mie Goreng Spesial" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga (Rp) <span className="text-primary">*</span></label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="cth. 5000" min="0" className="input-field" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {product ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmModal({ product, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="font-bold text-lg text-gray-900">Hapus Produk</h3>
        <p className="text-gray-500 text-sm mt-1">Yakin ingin menghapus <b>{product.name}</b>? Tindakan ini tidak bisa dibatalkan.</p>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">Batal</button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false) }}
            disabled={loading}
            className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [modal, setModal] = useState(null)
  const [adminMode, setAdminMode] = useState(false)
  const [adminClickCount, setAdminClickCount] = useState(0)

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    setLoadingProducts(true)
    try { setProducts((await fetchProducts()) || []) }
    catch { setProducts([]) }
    finally { setLoadingProducts(false) }
  }

  function handleLogoClick() {
    const count = adminClickCount + 1
    setAdminClickCount(count)
    if (count >= 5) { setAdminMode((prev) => !prev); setAdminClickCount(0) }
  }

  async function handleSaveProduct(formData) {
    if (modal?.product) { await updateProduct(modal.product.id, formData) }
    else { await addProduct(formData) }
    await loadProducts()
  }

  async function handleDeleteProduct() {
    await deleteProduct(modal.product.id)
    setModal(null)
    await loadProducts()
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── HERO ─── */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark pt-16 min-h-[92vh] flex items-center">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left — Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
                <Star size={13} className="text-accent" fill="#FFB800" />
                SMKN 2 Magelang — Student Business
              </div>

              <h1
                style={{ fontFamily: "'Aldrich', sans-serif" }}
                className="text-5xl md:text-6xl lg:text-7xl text-white leading-none tracking-tight"
              >
                ESEFTWO
                <br />
                <span className="text-accent">MARKET</span>
              </h1>

              <p className="text-white/75 text-base md:text-lg mt-5 max-w-md leading-relaxed">
                Kantin kelas kami — dikelola oleh siswa, untuk siswa. Makanan enak, harga terjangkau, dan semangat wirausaha.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <a
                  href="#produk"
                  className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-lg"
                >
                  <ShoppingBag size={17} />
                  Lihat Produk
                </a>
              </div>

              <div className="flex flex-wrap gap-6 mt-10">
                {[
                  { icon: Users, value: '34', label: 'Siswa Aktif' },
                  { icon: ShoppingBag, value: `${products.length}+`, label: 'Produk' },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                      <Icon size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-none">{value}</p>
                      <p className="text-white/55 text-xs mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — EI Illustration */}
            <div className="hidden md:flex items-center justify-center">
              <img
                src="/EI.svg"
                alt="ESEFTWO Illustration"
                className="w-full max-w-md drop-shadow-2xl float-soft fade-rise"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 56L1440 56L1440 0C1200 56 240 56 0 0L0 56Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary font-semibold text-xs uppercase tracking-widest">Tentang Kami</span>
              <h2 className="section-title mt-2">
                Belajar Wirausaha,
                <br />
                <span className="text-primary">Bersama-sama</span>
              </h2>
              <p className="text-gray-500 mt-4 leading-relaxed">
                ESEFTWO MARKET adalah program kewirausahaan kelas kami di <span className="font-semibold text-gray-700">SMKN 2 Magelang</span>. Dengan total <span className="font-semibold text-gray-700">34 siswa</span> yang aktif terlibat, kami belajar tentang manajemen bisnis, keuangan, dan pelayanan pelanggan secara langsung.
              </p>
              <p className="text-gray-500 mt-3 leading-relaxed">
                Setiap produk yang kami jual adalah hasil kreativitas dan kerja keras tim kami. Mulai dari perencanaan, produksi, hingga pemasaran — semua dikerjakan oleh siswa.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-8">
                {[
                  { value: '34', label: 'Anggota Aktif', color: 'text-primary' },
                  { value: `${products.length}`, label: 'Jenis Produk', color: 'text-primary' },
                  { value: '100%', label: 'Produk Siswa', color: 'text-accent-dark' },
                  { value: 'SMKN 2', label: 'Magelang', color: 'text-accent-dark' },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
                    <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-3xl p-8 text-center w-full max-w-sm">
                {/* 5-click secret trigger */}
                <div
                  className="w-24 h-24 mx-auto mb-5 cursor-pointer select-none"
                  onClick={handleLogoClick}
                  title="ESEFTWO MARKET"
                >
                  <img src="/EL.svg" alt="ESEFTWO MARKET logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">ESEFTWO MARKET</h3>
                <p className="text-gray-500 text-sm mt-1">Student-powered food market</p>
                <div className="mt-5 space-y-3 text-left">
                  {[
                    'Produk berkualitas & terjangkau',
                    'Dikelola siswa secara mandiri',
                    'Mendukung pembelajaran wirausaha',
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-primary" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
                {adminMode && (
                  <div className="mt-4 bg-accent/20 text-amber-700 text-xs px-3 py-1.5 rounded-full font-semibold inline-block">
                    Mode Admin Aktif
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUK ─── */}
      <section id="produk" className="py-20 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-primary font-semibold text-xs uppercase tracking-widest">Menu Kami</span>
              <h2 className="section-title mt-1">Produk Unggulan</h2>
              <p className="section-subtitle">Pilihan makanan & minuman dari tim kami</p>
            </div>
            {adminMode && (
              <button
                onClick={() => setModal({ type: 'add' })}
                className="btn-primary flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus size={16} />
                Tambah Produk
              </button>
            )}
          </div>

          {loadingProducts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Belum ada produk</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showActions={adminMode}
                  onEdit={(p) => setModal({ type: 'edit', product: p })}
                  onDelete={(p) => setModal({ type: 'delete', product: p })}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-primary font-semibold text-xs uppercase tracking-widest">Hubungi Kami</span>
            <h2 className="section-title mt-1">Kontak & Sosial Media</h2>
            <p className="section-subtitle">Tanya produk, harga, atau pesan langsung via pesan</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-500 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-green-600 active:scale-95 transition-all shadow-sm hover-lift"
            >
              <SiWhatsapp size={19} />
              Chat di WhatsApp
            </a>
            <a
              href="https://instagram.com/eseftwomarket"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-amber-400 text-white px-6 py-3.5 rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm hover-lift"
            >
              <SiInstagram size={19} />
              Follow Instagram
            </a>
            <a
              href="https://www.tiktok.com/@eseftwomarket"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-900 active:scale-95 transition-all shadow-sm hover-lift"
            >
              <SiTiktok size={19} />
              Follow TikTok
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8 text-gray-400 text-sm">
            <MapPin size={13} />
            <span>SMKN 2 Magelang, Jawa Tengah, Indonesia</span>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/EL.svg" alt="ESEFTWO MARKET" className="h-8 w-auto" />
          </div>
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} ESEFTWO MARKET &mdash; SMKN 2 Magelang
          </p>
          <p className="text-xs text-gray-600">Student Business Project</p>
        </div>
      </footer>

      {/* Modals */}
      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <ProductModal
          product={modal?.product || null}
          onClose={() => setModal(null)}
          onSave={handleSaveProduct}
        />
      )}
      {modal?.type === 'delete' && (
        <ConfirmModal
          product={modal.product}
          onClose={() => setModal(null)}
          onConfirm={handleDeleteProduct}
        />
      )}
    </div>
  )
}
