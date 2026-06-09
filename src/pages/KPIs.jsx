import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, Users, DollarSign, Phone, Award } from 'lucide-react'
import useStore from '../store/useStore'

const PERIODS = [
  { key: 'weekly', label: 'هذا الأسبوع' },
  { key: 'monthly', label: 'هذا الشهر' },
  { key: 'quarterly', label: 'هذا الربع' },
]

const REP_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6']
const SOURCE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444']

function RepCard({ rep, period, rank }) {
  const data = rep[period]
  const rate = data.leads ? Math.round((data.conversions / data.leads) * 100) : 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
            {rep.avatar}
          </div>
          <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${rank === 0 ? 'bg-amber-500' : rank === 1 ? 'bg-gray-400' : rank === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>
            {rank + 1}
          </span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{rep.name}</h3>
          <p className="text-xs text-gray-400">مندوب مبيعات</p>
        </div>
        <div className="mr-auto text-left">
          <p className="text-xs text-gray-400">معدل التحويل</p>
          <p className="font-bold text-lg text-amber-500">{rate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-blue-600">{data.leads}</p>
          <p className="text-xs text-blue-500 mt-0.5">عميل محتمل</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-600">{data.conversions}</p>
          <p className="text-xs text-green-500 mt-0.5">تسجيل</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-purple-600">{data.revenue.toLocaleString()}</p>
          <p className="text-xs text-purple-500 mt-0.5">إيراد (ج)</p>
        </div>
        <div className="bg-cyan-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-cyan-600">{data.calls}</p>
          <p className="text-xs text-cyan-500 mt-0.5">مكالمة</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>معدل التحويل</span>
          <span>{rate}%</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2">
          <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${rate}%` }} />
        </div>
      </div>
    </div>
  )
}

export default function KPIs() {
  const kpis = useStore((s) => s.kpis)
  const leads = useStore((s) => s.leads)
  const [period, setPeriod] = useState('monthly')
  const [sortBy, setSortBy] = useState('revenue')

  const sortedReps = [...kpis.reps].sort((a, b) => b[period][sortBy] - a[period][sortBy])

  const totals = kpis.reps.reduce((acc, rep) => ({
    leads: acc.leads + rep[period].leads,
    conversions: acc.conversions + rep[period].conversions,
    revenue: acc.revenue + rep[period].revenue,
    calls: acc.calls + rep[period].calls,
  }), { leads: 0, conversions: 0, revenue: 0, calls: 0 })

  const teamRate = totals.leads ? Math.round((totals.conversions / totals.leads) * 100) : 0

  // Source breakdown from actual leads
  const sourceCounts = {}
  leads.forEach((l) => { sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1 })
  const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }))

  // Bar chart data for comparison
  const barData = kpis.reps.map((r) => ({
    name: r.name.split(' ')[0],
    rate: r[period].leads ? Math.round((r[period].conversions / r[period].leads) * 100) : 0,
    revenue: r[period].revenue,
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">أداء فريق المبيعات</h2>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p.key ? 'bg-white shadow text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Users, label: 'إجمالي العملاء', value: totals.leads, color: 'bg-blue-500' },
          { icon: Award, label: 'التسجيلات', value: totals.conversions, color: 'bg-green-500' },
          { icon: TrendingUp, label: 'معدل التحويل', value: `${teamRate}%`, color: 'bg-amber-500' },
          { icon: DollarSign, label: 'الإيرادات', value: `${(totals.revenue / 1000).toFixed(1)}k ج`, color: 'bg-purple-500' },
          { icon: Phone, label: 'المكالمات', value: totals.calls, color: 'bg-cyan-500' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center`}>
              <item.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-xl font-bold text-gray-800">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rep Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedReps.map((rep, i) => (
          <RepCard key={rep.id} rep={rep} period={period} rank={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4">التسجيلات الشهرية</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={kpis.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Tajawal' }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: '8px' }} />
              <Legend formatter={(v) => <span style={{ fontFamily: 'Tajawal', fontSize: 12 }}>{v}</span>} />
              {kpis.reps.map((rep, i) => (
                <Line key={rep.id} type="monotone" dataKey={rep.name.split(' ')[0]} stroke={REP_COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Source Pie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4">مصادر العملاء</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {sourceData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontFamily: 'Tajawal', fontSize: 11 }}>{v}</span>} />
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">لوحة المتصدرين</h3>
          <div className="flex gap-2">
            {[
              { key: 'revenue', label: 'الإيراد' },
              { key: 'conversions', label: 'التسجيلات' },
              { key: 'leads', label: 'العملاء' },
            ].map((s) => (
              <button key={s.key} onClick={() => setSortBy(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === s.key ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-4 py-3 font-bold text-gray-600 rounded-r-lg">#</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">المندوب</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">العملاء</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">التسجيلات</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">معدل التحويل</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">الإيراد</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600 rounded-l-lg">المكالمات</th>
              </tr>
            </thead>
            <tbody>
              {sortedReps.map((rep, i) => {
                const d = rep[period]
                const rate = d.leads ? Math.round((d.conversions / d.leads) * 100) : 0
                return (
                  <tr key={rep.id} className={`border-b border-gray-50 hover:bg-amber-50/30 transition-colors ${i === 0 ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white inline-flex ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">{rep.avatar}</div>
                        <span className="font-medium text-gray-800">{rep.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600">{d.leads}</td>
                    <td className="px-4 py-3 font-medium text-green-600">{d.conversions}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-16">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs font-medium text-amber-600">{rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">{d.revenue.toLocaleString()} ج</td>
                    <td className="px-4 py-3 text-gray-600">{d.calls}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-4">مقارنة معدلات التحويل</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Tajawal' }} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(val) => [`${val}%`, 'معدل التحويل']} contentStyle={{ fontFamily: 'Tajawal', borderRadius: '8px' }} />
            <Bar dataKey="rate" radius={[6, 6, 0, 0]} fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
