import { TrendingUp, ShoppingBag, Users, DollarSign } from 'lucide-react'

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const CLASS_GROUPS = [
  { key: 'PPLG', label: 'PPLG', color: 'bg-blue-50 border-blue-100 text-blue-700', dot: 'bg-blue-500' },
  { key: 'AKL', label: 'AKL', color: 'bg-green-50 border-green-100 text-green-700', dot: 'bg-green-500' },
  { key: 'MPLB', label: 'MPLB', color: 'bg-purple-50 border-purple-100 text-purple-700', dot: 'bg-purple-500' },
  { key: 'PM', label: 'PM', color: 'bg-orange-50 border-orange-100 text-orange-700', dot: 'bg-orange-500' },
  { key: 'Other', label: 'Other', color: 'bg-gray-50 border-gray-100 text-gray-600', dot: 'bg-gray-400' },
]

function getGroup(className) {
  if (!className) return 'Other'
  const normalized = String(className).toUpperCase().replace(/\s+/g, ' ').trim()

  if (normalized.includes('PPLG')) return 'PPLG'
  if (normalized.includes('AKL')) return 'AKL'
  if (normalized.includes('MPLB')) return 'MPLB'
  if (/\bPM\b/.test(normalized)) return 'PM'

  return 'Other'
}

export default function DashboardStats({ orders }) {
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

  // Group stats
  const groupStats = CLASS_GROUPS.map(({ key, label, color, dot }) => {
    const groupOrders = orders.filter((o) => getGroup(o.class) === key)
    const revenue = groupOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    return { key, label, color, dot, count: groupOrders.length, revenue }
  }).filter((g) => g.count > 0)

  const summaryCards = [
    {
      icon: ShoppingBag,
      label: 'Total Pesanan',
      value: totalOrders,
      sub: 'semua kelas',
      bg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: DollarSign,
      label: 'Total Pendapatan',
      value: formatRupiah(totalRevenue),
      sub: 'dari semua pesanan',
      bg: 'bg-accent/15',
      iconColor: 'text-amber-600',
    },
    {
      icon: Users,
      label: 'Kelas Aktif',
      value: groupStats.length,
      sub: 'kelompok kelas',
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      icon: TrendingUp,
      label: 'Rata-rata Order',
      value: totalOrders > 0 ? formatRupiah(totalRevenue / totalOrders) : 'Rp 0',
      sub: 'per pesanan',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-11 h-11 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={22} className={card.iconColor} />
              </div>
              <p className="text-gray-500 text-xs font-medium">{card.label}</p>
              <p className="text-gray-900 font-bold text-xl mt-0.5 leading-tight">{card.value}</p>
              <p className="text-gray-400 text-xs mt-1">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Group Stats */}
      {groupStats.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
            Statistik per Kelompok
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {groupStats.map(({ key, label, color, dot, count, revenue }) => (
              <div key={key} className={`rounded-xl border p-4 ${color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="font-semibold text-sm">{label}</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs opacity-75 mt-0.5">pesanan</p>
                <p className="text-xs font-semibold mt-1 opacity-90">{formatRupiah(revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { getGroup, CLASS_GROUPS, formatRupiah }
