import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronRight,
  Package,
  ShoppingBag,
  Trash2,
  AlertCircle,
  Plus,
  Search,
  LayoutDashboard,
  Users,
  Edit2,
  X,
  Check,
  Upload,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import DashboardStats, { getGroup, CLASS_GROUPS, formatRupiah } from '../components/DashboardStats'
import ProductCard from '../components/ProductCard'
import {
  fetchOrders,
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  deleteOrder,
  uploadProductImage,
} from '../lib/supabase'

// ─── Product Modal ──────────────────────────────────────────────────────────
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
      if (imageFile) image_url = await uploadProductImage(imageFile)
      await onSave({ name: form.name.trim(), price: Number(form.price), image_url })
      onClose()
    } catch (err) { setError(err.message || 'Terjadi kesalahan.') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg">{product ? 'Edit Produk' : 'Tambah Produk'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Square image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto Produk <span className="text-gray-400 font-normal">(opsional)</span></label>
            <label className="block cursor-pointer">
              <div className="aspect-square w-full max-w-[180px] mx-auto rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary/40 transition-colors overflow-hidden bg-gray-50 flex items-center justify-center relative group">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={22} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400 p-4">
                    <Upload size={26} />
                    <span className="text-xs text-center">Upload gambar</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk <span className="text-primary">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="cth. Mie Goreng" className="input-field" />
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

// ─── Order Row ───────────────────────────────────────────────────────────────
function OrderRow({ order, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const items = order.order_items || []
  const date = new Date(order.created_at)
  const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users size={14} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{order.customer_name}</p>
            <p className="text-gray-400 text-xs">{order.class} &middot; {dateStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden sm:block text-gray-500 text-xs">{items.length} item</span>
          <span className="font-bold text-primary text-sm">{formatRupiah(order.total)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(order) }}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </div>
      </div>
      {expanded && items.length > 0 && (
        <div className="px-4 pb-3 bg-gray-50 border-t border-gray-100">
          <div className="pt-2 space-y-1">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">{item.product_name} <span className="text-gray-400">x{item.quantity}</span></span>
                <span className="text-gray-700 font-medium">{formatRupiah(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DeleteConfirm Modal ─────────────────────────────────────────────────────
function DeleteOrderModal({ order, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="font-bold text-lg">Hapus Pesanan?</h3>
        <p className="text-gray-500 text-sm mt-1">Pesanan dari <b>{order.customer_name}</b> akan dihapus permanen.</p>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">Batal</button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false) }}
            disabled={loading}
            className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-600 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'products'
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState('All')
  const [modal, setModal] = useState(null)
  const [deleteOrderModal, setDeleteOrderModal] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [ordersData, productsData] = await Promise.all([fetchOrders(), fetchProducts()])
      setOrders(ordersData || [])
      setProducts(productsData || [])
    } catch (err) {
      setError('Gagal memuat data. Pastikan Supabase sudah dikonfigurasi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Groups with All
  const allGroups = [{ key: 'All', label: 'Semua' }, ...CLASS_GROUPS]
  const filteredOrders = orders.filter((o) => {
    const matchGroup = activeGroup === 'All' || getGroup(o.class) === activeGroup
    const matchSearch =
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.class?.toLowerCase().includes(search.toLowerCase())
    return matchGroup && matchSearch
  })

  async function handleSaveProduct(formData) {
    if (modal?.product) {
      await updateProduct(modal.product.id, formData)
    } else {
      await addProduct(formData)
    }
    await loadData()
  }

  async function handleDeleteProduct() {
    await deleteProduct(modal.product.id)
    setModal(null)
    await loadData()
  }

  async function handleDeleteOrder() {
    await deleteOrder(deleteOrderModal.id)
    setDeleteOrderModal(null)
    await loadData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutDashboard size={22} className="text-primary" />
                Dashboard
              </h1>
              <p className="text-gray-500 text-sm">Laporan & manajemen ESEFTWO MARKET</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl mb-6 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <DashboardStats orders={orders} />

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mt-8 mb-6">
              {[
                { key: 'orders', label: 'Pesanan', icon: ShoppingBag },
                { key: 'products', label: 'Produk', icon: Package },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${activeTab === key ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                    {key === 'orders' ? orders.length : products.length}
                  </span>
                </button>
              ))}
            </div>

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <div className="space-y-5">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama / kelas..."
                      className="input-field !pl-9"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {allGroups.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setActiveGroup(key)}
                        className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                          activeGroup === key
                            ? 'bg-primary text-white shadow-sm shadow-primary/25'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-primary/30'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders grouped */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <ShoppingBag size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 font-medium">Tidak ada pesanan</p>
                    <p className="text-gray-300 text-sm mt-1">
                      {search ? 'Coba kata kunci lain' : 'Belum ada data pesanan'}
                    </p>
                  </div>
                ) : activeGroup === 'All' ? (
                  // Group by class group
                  CLASS_GROUPS.map(({ key, label }) => {
                    const groupOrders = filteredOrders.filter((o) => getGroup(o.class) === key)
                    if (groupOrders.length === 0) return null
                    return (
                      <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Users size={15} className="text-primary" />
                            {label}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{groupOrders.length} pesanan</span>
                            <span className="font-semibold text-gray-700">
                              {formatRupiah(groupOrders.reduce((s, o) => s + (o.total || 0), 0))}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          {groupOrders.map((order) => (
                            <OrderRow key={order.id} order={order} onDelete={setDeleteOrderModal} />
                          ))}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
                    {filteredOrders.map((order) => (
                      <OrderRow key={order.id} order={order} onDelete={setDeleteOrderModal} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PRODUCTS TAB ── */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-gray-500 text-sm">{products.length} produk terdaftar</p>
                  <button
                    onClick={() => setModal({ type: 'add' })}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <Plus size={15} />
                    Tambah Produk
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Package size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 font-medium">Belum ada produk</p>
                    <button onClick={() => setModal({ type: 'add' })} className="btn-primary mt-4 text-sm flex items-center gap-2 mx-auto">
                      <Plus size={14} />
                      Tambah Produk Pertama
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        showActions
                        onEdit={(p) => setModal({ type: 'edit', product: p })}
                        onDelete={(p) => setModal({ type: 'delete', product: p })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <ProductModal
          product={modal?.product || null}
          onClose={() => setModal(null)}
          onSave={handleSaveProduct}
        />
      )}
      {modal?.type === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-lg">Hapus Produk?</h3>
            <p className="text-gray-500 text-sm mt-1">Yakin hapus <b>{modal.product.name}</b>?</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">Batal</button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-600 flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteOrderModal && (
        <DeleteOrderModal
          order={deleteOrderModal}
          onClose={() => setDeleteOrderModal(null)}
          onConfirm={handleDeleteOrder}
        />
      )}
    </div>
  )
}
