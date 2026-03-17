import { useState } from 'react'
import { ShoppingCart, Edit2, Trash2, Tag } from 'lucide-react'

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function ProductCard({ product, onEdit, onDelete, showActions = false }) {
  const [imageError, setImageError] = useState(false)

  const initials = product.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      {/* Image Area — 1:1 square ratio */}
      <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/10 relative flex items-center justify-center overflow-hidden">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
            <span className="text-primary font-bold text-2xl">{initials}</span>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-accent text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Tag size={10} />
            {formatRupiah(product.price)}
          </span>
        </div>

        {/* Action Buttons on hover */}
        {showActions && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(product)}
              className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors shadow-md"
              title="Edit produk"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => onDelete(product)}
              className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-md"
              title="Hapus produk"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
          {product.name}
        </h3>
        <p className="text-primary font-bold text-lg mt-1">{formatRupiah(product.price)}</p>

        {!showActions && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
            <ShoppingCart size={12} />
            <span>Tersedia</span>
          </div>
        )}
      </div>
    </div>
  )
}
