import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  Users,
  Check,
  Loader2,
  Receipt,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { fetchProducts, insertOrder } from '../lib/supabase'

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const CLASS_OPTIONS = [
  { group: 'PPLG', options: ['X PPLG 1', 'X PPLG 2', 'X PPLG 3', 'XI PPLG 1', 'XI PPLG 2', 'XI PPLG 3'] },
  { group: 'AKL',  options: ['X AKL 1',  'X AKL 2',  'X AKL 3',  'XI AKL 1',  'XI AKL 2',  'XI AKL 3']  },
  { group: 'MPLB', options: ['X MPLB 1', 'X MPLB 2', 'X MPLB 3', 'XI MPLB 1', 'XI MPLB 2', 'XI MPLB 3'] },
  { group: 'PM',   options: ['X PM 1',   'X PM 2',   'XI PM 1',  'XI PM 2'] },
  { group: 'Lainnya', options: ['Guru/Staff', 'Lainnya'] },
]

function SuccessModal({ orderData, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-green-500" />
        </div>
        <h3 className="font-bold text-xl text-gray-900">Pesanan Berhasil!</h3>
        <p className="text-gray-500 text-sm mt-2">
          Pesanan dari <b>{orderData.customer_name}</b> ({orderData.class}) telah disimpan.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 mt-4 text-left space-y-1.5">
          {orderData.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.product_name} x{item.quantity}
              </span>
              <span className="font-medium">{formatRupiah(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-primary">{formatRupiah(orderData.total)}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          Pesanan Baru
        </button>
      </div>
    </div>
  )
}

export default function OrderPage() {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productError, setProductError] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [quantities, setQuantities] = useState({}) // { productId: number }

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successData, setSuccessData] = useState(null)

  // Filter / search
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoadingProducts(true)
    setProductError('')
    try {
      const data = await fetchProducts()
      setProducts(data || [])
    } catch (err) {
      setProductError('Gagal memuat produk. Cek koneksi Supabase.')
    } finally {
      setLoadingProducts(false)
    }
  }

  function setQty(productId, value) {
    setQuantities((prev) => {
      const next = { ...prev }
      if (value <= 0) {
        delete next[productId]
      } else {
        next[productId] = value
      }
      return next
    })
  }

  const cartItems = products
    .filter((p) => quantities[p.id] > 0)
    .map((p) => ({
      product_name: p.name,
      price: p.price,
      quantity: quantities[p.id],
    }))

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  function resetForm() {
    setCustomerName('')
    setSelectedClass('')
    setQuantities({})
    setSearch('')
    setSubmitError('')
    setSuccessData(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    if (!customerName.trim()) {
      setSubmitError('Nama pelanggan wajib diisi.')
      return
    }
    if (!selectedClass) {
      setSubmitError('Kelas wajib dipilih.')
      return
    }
    if (cartItems.length === 0) {
      setSubmitError('Pilih minimal satu produk.')
      return
    }

    setSubmitting(true)
    try {
      await insertOrder(
        { customer_name: customerName.trim(), class: selectedClass, total },
        cartItems
      )
      setSuccessData({
        customer_name: customerName.trim(),
        class: selectedClass,
        total,
        items: cartItems,
      })
    } catch (err) {
      setSubmitError(err.message || 'Gagal menyimpan pesanan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Receipt size={22} className="text-primary" />
              Form Pesanan
            </h1>
            <p className="text-gray-500 text-sm">Input pesanan pelanggan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left — Products */}
            <div className="lg:col-span-2 space-y-5">
              {/* Customer Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={17} className="text-primary" />
                  Info Pelanggan
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nama Pelanggan <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="cth. Budi Santoso"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Kelas <span className="text-primary">*</span>
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="input-field"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {CLASS_OPTIONS.map(({ group, options }) => (
                        <optgroup key={group} label={group}>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <ShoppingCart size={17} className="text-primary" />
                    Pilih Produk
                  </h2>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari produk..."
                    className="input-field !w-48 !py-1.5 text-sm"
                  />
                </div>

                {loadingProducts ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                ) : productError ? (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-xl text-sm">
                    <AlertCircle size={16} />
                    {productError}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-gray-400 text-center py-8 text-sm">Tidak ada produk ditemukan</p>
                ) : (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {filteredProducts.map((product) => {
                      const qty = quantities[product.id] || 0
                      return (
                        <div
                          key={product.id}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            qty > 0
                              ? 'border-primary/30 bg-primary/5'
                              : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-bold text-sm">
                                {product.name[0]}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-sm truncate">
                                {product.name}
                              </p>
                              <p className="text-primary font-semibold text-sm">
                                {formatRupiah(product.price)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {qty > 0 && (
                              <span className="text-xs text-gray-400 hidden sm:block">
                                = {formatRupiah(product.price * qty)}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setQty(product.id, qty - 1)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center font-semibold text-gray-800 text-sm">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(product.id, qty + 1)}
                              className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right — Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingCart size={17} className="text-primary" />
                  Rincian Pesanan
                  {cartItems.length > 0 && (
                    <span className="ml-auto bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </h2>

                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Belum ada produk dipilih</p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {cartItems.map((item) => (
                      <div key={item.product_name} className="flex justify-between items-start text-sm">
                        <div className="text-gray-600 pr-2">
                          <span className="font-medium text-gray-800">{item.product_name}</span>
                          <span className="text-gray-400"> x{item.quantity}</span>
                        </div>
                        <span className="font-semibold text-gray-800 flex-shrink-0">
                          {formatRupiah(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Customer summary */}
                {(customerName || selectedClass) && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-1">
                    {customerName && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={13} />
                        <span>{customerName}</span>
                      </div>
                    )}
                    {selectedClass && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={13} />
                        <span>{selectedClass}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-700">Total</span>
                    <span className="font-black text-2xl text-primary">{formatRupiah(total)}</span>
                  </div>

                  {submitError && (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-xs mb-3">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || cartItems.length === 0}
                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    {submitting ? 'Menyimpan...' : 'Simpan Pesanan'}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full mt-2 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
                  >
                    <RefreshCw size={14} />
                    Reset Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {successData && (
        <SuccessModal orderData={successData} onClose={resetForm} />
      )}
    </div>
  )
}
