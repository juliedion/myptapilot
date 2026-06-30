import { useState } from 'react'

interface OrderItem {
  name: string
  size: string
  color: string
  qty: number
  price: number
}
interface Order {
  id: string
  name: string
  email: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'paid' | 'fulfilled' | 'shipped'
  date: string
}

const PRODUCTS = [
  { name: 'Spirit T-Shirt', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], colors: ['Navy Blue', 'Gray', 'White'], price: 18 },
  { name: 'Hoodie Sweatshirt', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Navy Blue', 'Gray'], price: 35 },
  { name: 'Youth T-Shirt', sizes: ['YXS', 'YS', 'YM', 'YL', 'YXL'], colors: ['Navy Blue', 'Gray', 'White'], price: 15 },
  { name: 'Baseball Cap', sizes: ['One Size'], colors: ['Navy Blue', 'Gray'], price: 22 },
  { name: 'Drawstring Bag', sizes: ['One Size'], colors: ['Navy Blue', 'Gray'], price: 12 },
  { name: 'Water Bottle', sizes: ['20oz'], colors: ['Navy Blue', 'White'], price: 16 },
  { name: 'Sticker Pack (5ct)', sizes: ['Standard'], colors: ['Full Color'], price: 5 },
]

const SEED_ORDERS: Order[] = [
  { id: '1', name: 'Maria Gonzalez', email: 'mgonzalez@email.com', items: [{ name: 'Spirit T-Shirt', size: 'M', color: 'Navy Blue', qty: 2, price: 18 }, { name: 'Youth T-Shirt', size: 'YS', color: 'Navy Blue', qty: 1, price: 15 }], total: 51, status: 'paid', date: '2025-07-10' },
  { id: '2', name: 'Robert Thompson', email: 'rthompson@email.com', items: [{ name: 'Hoodie Sweatshirt', size: 'L', color: 'Gray', qty: 1, price: 35 }], total: 35, status: 'fulfilled', date: '2025-07-08' },
  { id: '3', name: 'Linda Wu', email: 'lwu@email.com', items: [{ name: 'Spirit T-Shirt', size: 'S', color: 'White', qty: 1, price: 18 }, { name: 'Baseball Cap', size: 'One Size', color: 'Navy Blue', qty: 1, price: 22 }], total: 40, status: 'pending', date: '2025-07-12' },
  { id: '4', name: 'James Carter', email: 'jcarter@email.com', items: [{ name: 'Youth T-Shirt', size: 'YM', color: 'Navy Blue', qty: 3, price: 15 }], total: 45, status: 'pending', date: '2025-07-13' },
  { id: '5', name: 'Amanda Johnson', email: 'ajohnson@email.com', items: [{ name: 'Hoodie Sweatshirt', size: 'M', color: 'Navy Blue', qty: 1, price: 35 }, { name: 'Water Bottle', size: '20oz', color: 'Navy Blue', qty: 2, price: 16 }], total: 67, status: 'shipped', date: '2025-07-05' },
]

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
  paid: { color: 'bg-blue-100 text-blue-700', label: 'Paid' },
  fulfilled: { color: 'bg-purple-100 text-purple-700', label: 'Fulfilled' },
  shipped: { color: 'bg-green-100 text-green-700', label: 'Shipped' },
}

export default function SpiritWearModule() {
  const [tab, setTab] = useState<'orders' | 'catalog' | 'intake'>('orders')
  const [orders, setOrders] = useState(SEED_ORDERS)
  const [statusFilter, setStatusFilter] = useState('all')
  const [intake, setIntake] = useState({ name: '', email: '', product: PRODUCTS[0].name, size: 'M', color: 'Navy Blue', qty: '1' })

  const filtered = orders.filter(o => statusFilter === 'all' || o.status === statusFilter)
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const pendingCount = orders.filter(o => o.status === 'pending').length

  const submitIntake = () => {
    if (!intake.name || !intake.email) return
    const product = PRODUCTS.find(p => p.name === intake.product)!
    const order: Order = {
      id: Date.now().toString(),
      name: intake.name,
      email: intake.email,
      items: [{ name: intake.product, size: intake.size, color: intake.color, qty: parseInt(intake.qty) || 1, price: product.price }],
      total: product.price * (parseInt(intake.qty) || 1),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    }
    setOrders(prev => [...prev, order])
    setIntake({ name: '', email: '', product: PRODUCTS[0].name, size: 'M', color: 'Navy Blue', qty: '1' })
    setTab('orders')
  }

  const updateStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Spirit Wear</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your school merchandise catalog, orders, and intake</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-2xl font-bold text-brand-600 mt-1">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{orders.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Items Sold</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.qty, 0), 0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {[{ id: 'orders', label: `Orders (${orders.length})` }, { id: 'catalog', label: '🛍️ Catalog' }, { id: 'intake', label: '+ New Order' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div>
          <div className="flex gap-2 mb-4">
            {['all', 'pending', 'paid', 'fulfilled', 'shipped'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-800">{order.name}</p>
                      <p className="text-xs text-slate-400">{order.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-xs text-slate-600">{item.qty}x {item.name} ({item.size}, {item.color})</p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800 text-sm">${order.total}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value as Order['status'])}
                        className={`badge ${statusConfig[order.status].color} border-0 cursor-pointer text-xs font-medium`}
                      >
                        {Object.entries(statusConfig).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">{order.date}</td>
                    <td className="px-4 py-3.5">
                      <button className="text-xs text-brand-600 hover:text-brand-800 font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'catalog' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PRODUCTS.map((p, i) => (
            <div key={i} className="card p-5 hover:shadow-md transition-all">
              <div className="w-full h-28 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl mb-4 flex items-center justify-center text-4xl">
                {['👕', '🧥', '👕', '🧢', '🎒', '🍶', '⭐'][i]}
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">{p.name}</h3>
              <p className="text-brand-600 font-bold mt-1">${p.price}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.colors.map(c => <span key={c} className="badge bg-slate-100 text-slate-500 text-xs">{c}</span>)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Sizes: {p.sizes.join(', ')}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'intake' && (
        <div className="max-w-lg card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Record New Order</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Customer Name *</label>
                <input className="input" value={intake.name} onChange={e => setIntake(p => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" value={intake.email} onChange={e => setIntake(p => ({ ...p, email: e.target.value }))} placeholder="jane@email.com" />
              </div>
            </div>
            <div>
              <label className="label">Product</label>
              <select className="input" value={intake.product} onChange={e => setIntake(p => ({ ...p, product: e.target.value, size: PRODUCTS.find(pr => pr.name === e.target.value)?.sizes[0] || 'M', color: PRODUCTS.find(pr => pr.name === e.target.value)?.colors[0] || 'Navy Blue' }))}>
                {PRODUCTS.map(p => <option key={p.name} value={p.name}>{p.name} — ${p.price}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Size</label>
                <select className="input" value={intake.size} onChange={e => setIntake(p => ({ ...p, size: e.target.value }))}>
                  {(PRODUCTS.find(p => p.name === intake.product)?.sizes || []).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Color</label>
                <select className="input" value={intake.color} onChange={e => setIntake(p => ({ ...p, color: e.target.value }))}>
                  {(PRODUCTS.find(p => p.name === intake.product)?.colors || []).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Quantity</label>
                <input className="input" type="number" min="1" value={intake.qty} onChange={e => setIntake(p => ({ ...p, qty: e.target.value }))} />
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-sm text-slate-600">Order Total</span>
              <span className="text-lg font-bold text-brand-600">
                ${((PRODUCTS.find(p => p.name === intake.product)?.price || 0) * (parseInt(intake.qty) || 1)).toFixed(2)}
              </span>
            </div>
            <button onClick={submitIntake} className="btn-primary w-full justify-center py-3">Submit Order</button>
          </div>
        </div>
      )}
    </div>
  )
}
