import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  type: 'income' | 'expense'
  amount: number
  paymentMethod: string
  notes?: string
  taxDeductible?: boolean
}

const CATEGORIES = {
  income: ['Fundraiser Revenue', 'Membership Dues', 'Donations', 'Grants', 'Event Revenue', 'Other Income'],
  expense: ['Event Expenses', 'Educational Programs', 'Administrative', 'Marketing', 'Supplies', 'Vendor Payments', 'Teacher Appreciation', 'Awards & Recognition', 'Other Expense'],
}

const SEED: Transaction[] = [
  { id: '1', date: '2025-07-10', description: 'Walk-A-Thon Pledge Collections', category: 'Fundraiser Revenue', type: 'income', amount: 12400, paymentMethod: 'Check/Online', taxDeductible: true },
  { id: '2', date: '2025-07-05', description: 'Membership Dues — Summer', category: 'Membership Dues', type: 'income', amount: 1240, paymentMethod: 'Online', taxDeductible: false },
  { id: '3', date: '2025-07-01', description: 'Book Fair Revenue Share', category: 'Fundraiser Revenue', type: 'income', amount: 847, paymentMethod: 'Check', taxDeductible: true },
  { id: '4', date: '2025-06-28', description: 'Restaurant Night — Chipotle', category: 'Fundraiser Revenue', type: 'income', amount: 620, paymentMethod: 'Check', taxDeductible: false },
  { id: '5', date: '2025-06-15', description: 'Anonymous Donation', category: 'Donations', type: 'income', amount: 500, paymentMethod: 'Check', taxDeductible: true },
  { id: '6', date: '2025-07-12', description: 'Fall Carnival Supplies Deposit', category: 'Event Expenses', type: 'expense', amount: -1200, paymentMethod: 'Credit Card', taxDeductible: false },
  { id: '7', date: '2025-07-08', description: 'Spirit Wear Vendor Invoice', category: 'Vendor Payments', type: 'expense', amount: -890, paymentMethod: 'Check', taxDeductible: false },
  { id: '8', date: '2025-06-30', description: 'PO Box Annual Renewal', category: 'Administrative', type: 'expense', amount: -180, paymentMethod: 'Check', taxDeductible: false },
  { id: '9', date: '2025-06-20', description: 'Teacher Appreciation Lunch', category: 'Teacher Appreciation', type: 'expense', amount: -640, paymentMethod: 'Credit Card', taxDeductible: false },
  { id: '10', date: '2025-06-10', description: 'Walk-A-Thon T-Shirts', category: 'Supplies', type: 'expense', amount: -450, paymentMethod: 'Check', taxDeductible: false },
  { id: '11', date: '2025-05-20', description: 'Grant — Local Community Foundation', category: 'Grants', type: 'income', amount: 2000, paymentMethod: 'ACH', taxDeductible: true },
  { id: '12', date: '2025-05-15', description: 'Spring Concert Decorations', category: 'Event Expenses', type: 'expense', amount: -320, paymentMethod: 'Credit Card', taxDeductible: false },
]

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

export default function TreasurerModule() {
  const [transactions, setTransactions] = useState(SEED)
  const [tab, setTab] = useState<'transactions' | 'pl' | 'taxes'>('transactions')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ date: '', description: '', category: CATEGORIES.income[0], type: 'income' as 'income' | 'expense', amount: '', paymentMethod: 'Check', notes: '', taxDeductible: false })

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
  const netBalance = totalIncome - totalExpenses

  const filtered = transactions.filter(t => typeFilter === 'all' || t.type === typeFilter)

  const monthlyData = [
    { month: 'Feb', income: 1200, expenses: 400 },
    { month: 'Mar', income: 3500, expenses: 1200 },
    { month: 'Apr', income: 2800, expenses: 900 },
    { month: 'May', income: 4200, expenses: 1800 },
    { month: 'Jun', income: 3100, expenses: 1400 },
    { month: 'Jul', income: 15607, expenses: 2720 },
  ]

  const expenseByCategory = Object.entries(
    transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const addTransaction = () => {
    if (!form.description || !form.amount) return
    const t: Transaction = {
      id: Date.now().toString(),
      date: form.date || new Date().toISOString().split('T')[0],
      description: form.description,
      category: form.category,
      type: form.type,
      amount: form.type === 'expense' ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount)),
      paymentMethod: form.paymentMethod,
      notes: form.notes,
      taxDeductible: form.taxDeductible,
    }
    setTransactions(prev => [t, ...prev])
    setForm({ date: '', description: '', category: CATEGORIES.income[0], type: 'income', amount: '', paymentMethod: 'Check', notes: '', taxDeductible: false })
    setShowAdd(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Private banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-sm text-amber-800"><strong>Private — Treasurer Only.</strong> This financial data is restricted to the PTA Treasurer and authorized officers.</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Treasurer Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Profit & Loss · Tax Records · Financial Reporting</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export Report
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Transaction
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-sm text-slate-500 mb-1">Total Income (YTD)</p>
          <p className="text-3xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500 mb-1">Total Expenses (YTD)</p>
          <p className="text-3xl font-bold text-red-500">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className={`card p-5 ${netBalance >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <p className="text-sm text-slate-500 mb-1">Net Balance</p>
          <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {netBalance >= 0 ? '+' : ''} ${netBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {[{ id: 'transactions', label: 'Ledger' }, { id: 'pl', label: 'P&L Report' }, { id: 'taxes', label: '📋 Tax Center' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'transactions' && (
        <>
          <div className="flex gap-2 mb-4">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${typeFilter === t ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Date', 'Description', 'Category', 'Method', 'Amount', 'Tax'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500">{t.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{t.description}</td>
                    <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-500 text-xs">{t.category}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{t.paymentMethod}</td>
                    <td className={`px-4 py-3 font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {t.taxDeductible ? <span className="text-green-600">✓</span> : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'pl' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Monthly Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                <Bar dataKey="income" name="Income" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={expenseByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6 lg:col-span-2">
            <h3 className="font-semibold text-slate-800 mb-4">Profit & Loss Summary — FY 2024-2025</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3">Income</h4>
                {CATEGORIES.income.map(cat => {
                  const total = transactions.filter(t => t.type === 'income' && t.category === cat).reduce((s, t) => s + t.amount, 0)
                  if (!total) return null
                  return <div key={cat} className="flex justify-between py-1.5 border-b border-slate-50 text-sm"><span className="text-slate-600">{cat}</span><span className="font-medium text-slate-800">${total.toLocaleString()}</span></div>
                })}
                <div className="flex justify-between py-2 mt-2 font-bold text-green-700 text-sm"><span>Total Income</span><span>${totalIncome.toLocaleString()}</span></div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">Expenses</h4>
                {CATEGORIES.expense.map(cat => {
                  const total = transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + Math.abs(t.amount), 0)
                  if (!total) return null
                  return <div key={cat} className="flex justify-between py-1.5 border-b border-slate-50 text-sm"><span className="text-slate-600">{cat}</span><span className="font-medium text-slate-800">${total.toLocaleString()}</span></div>
                })}
                <div className="flex justify-between py-2 mt-2 font-bold text-red-600 text-sm"><span>Total Expenses</span><span>${totalExpenses.toLocaleString()}</span></div>
              </div>
            </div>
            <div className={`mt-4 p-4 rounded-xl flex justify-between items-center ${netBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className="font-bold text-slate-800">Net Surplus / Deficit</span>
              <span className={`text-xl font-bold ${netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>${netBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'taxes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 mb-4">🏛️ Tax-Exempt Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-slate-700">501(c)(3) Status</span>
                <span className="badge bg-green-100 text-green-700">Active ✓</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl hover:bg-slate-50 text-sm">
                <span className="text-slate-600">EIN Number</span>
                <span className="font-mono text-slate-800">47-XXXXXXX</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl hover:bg-slate-50 text-sm">
                <span className="text-slate-600">Organization Type</span>
                <span className="text-slate-800">Public Charity</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 mb-4">📋 IRS 990 Filing</h3>
            <div className="space-y-3">
              {[
                { year: '2023-2024', form: '990-N', status: 'Filed', date: 'Apr 30, 2024', color: 'text-green-600' },
                { year: '2022-2023', form: '990-N', status: 'Filed', date: 'Apr 28, 2023', color: 'text-green-600' },
                { year: '2021-2022', form: '990-N', status: 'Filed', date: 'May 10, 2022', color: 'text-green-600' },
                { year: '2024-2025', form: '990-N', status: 'Due May 15, 2025', date: '—', color: 'text-amber-600' },
              ].map(f => (
                <div key={f.year} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-sm">
                  <div>
                    <span className="font-medium text-slate-800">{f.form} · {f.year}</span>
                    <p className="text-xs text-slate-400">{f.date}</p>
                  </div>
                  <span className={`text-xs font-semibold ${f.color}`}>{f.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 mb-1">📄 Tax-Deductible Donations</h3>
            <p className="text-xs text-slate-400 mb-4">Donations eligible for donor deduction receipts</p>
            <div className="space-y-2">
              {transactions.filter(t => t.taxDeductible && t.type === 'income').map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{t.description}</p>
                    <p className="text-xs text-slate-400">{t.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${t.amount.toLocaleString()}</p>
                    <button className="text-xs text-brand-600">Send Receipt</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-brand-50 rounded-xl">
              <p className="text-sm font-semibold text-brand-800">Total Deductible: ${transactions.filter(t => t.taxDeductible && t.type === 'income').reduce((s, t) => s + t.amount, 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 mb-4">⚠️ Important Tax Reminders</h3>
            <div className="space-y-3">
              {[
                { icon: '📅', text: 'IRS 990-N due May 15 annually (if income < $50,000)', urgent: false },
                { icon: '🧾', text: 'Send donation acknowledgment letters for gifts ≥ $250', urgent: false },
                { icon: '📝', text: 'Keep all receipts for expenses > $75 for 7 years', urgent: false },
                { icon: '🏦', text: 'Reimbursements require written request + receipts', urgent: false },
                { icon: '💳', text: 'No personal use of PTA funds or debit cards', urgent: true },
                { icon: '🔍', text: 'Annual financial review recommended; audit if >$250K', urgent: false },
              ].map((tip, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${tip.urgent ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                  <span>{tip.icon}</span>
                  <p className={`text-xs leading-relaxed ${tip.urgent ? 'text-red-700 font-medium' : 'text-slate-600'}`}>{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Add Transaction</h3>
            <div className="space-y-3">
              <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-2">
                <button onClick={() => setForm(p => ({ ...p, type: 'income', category: CATEGORIES.income[0] }))} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.type === 'income' ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Income</button>
                <button onClick={() => setForm(p => ({ ...p, type: 'expense', category: CATEGORIES.expense[0] }))} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.type === 'expense' ? 'bg-red-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Expense</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Amount ($) *</label>
                  <input className="input" type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="label">Description *</label>
                <input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description of transaction" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES[form.type].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select className="input" value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                    {['Check', 'Credit Card', 'Debit Card', 'Cash', 'Online', 'ACH', 'PayPal', 'Venmo'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              {form.type === 'income' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" checked={form.taxDeductible} onChange={e => setForm(p => ({ ...p, taxDeductible: e.target.checked }))} />
                  <span className="text-sm text-slate-700">Tax-deductible donation (send donor receipt)</span>
                </label>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={addTransaction} className="btn-primary flex-1 justify-center">Save Transaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
