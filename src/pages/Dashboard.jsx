import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Users, TrendingUp, DollarSign, Phone, UserPlus, Award } from 'lucide-react'
import useStore from '../store/useStore'

const STAGES = ['جديد', 'تم التواصل', 'موعد محجوز', 'عرض تقديمي', 'متابعة', 'تم التسجيل', 'لم يتم']
const STAGE_COLORS = {
  'جديد': '#3b82f6',
  'تم التواصل': '#f59e0b',
  'موعد محجوز': '#f97316',
  'عرض تقديمي': '#8b5cf6',
  'متابعة': '#06b6d4',
  'تم التسجيل': '#10b981',
  'لم يتم': '#ef4444',
}

const SOURCE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444']

const activityIcons = {
  call: '📞',
  whatsapp: '💬',
  stage_change: '🔄',
  note: '📝',
  enrollment: '🎉',
  new_lead: '👤',
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const leads = useStore((s) => s.leads)
  const activities = useStore((s) => s.activities)
  const kpis = useStore((s) => s.kpis)
  const navigate = useNavigate()

  const enrolled = useMemo(() => leads.filter((l) => l.stage === 'تم التسجيل'), [leads])
  const convRate = leads.length ? Math.round((enrolled.length / leads.length) * 100) : 0
  const totalRevenue = enrolled.reduce((s, l) => s + (l.value || 0), 0)

  const today = new Date().toISOString().split('T')[0]
  const followUpsToday = leads.filter((l) => l.followUpDate === today).length

  const pipelineData = STAGES.map((stage) => ({
    stage,
    count: leads.filter((l) => l.stage === stage).length,
    fill: STAGE_COLORS[stage],
  }))

  const sourceData = useMemo(() => {
    const counts = {}
    leads.forEach((l) => { counts[l.source] = (counts[l.source] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [leads])

  const topReps = kpis.reps
    .map((r) => ({ ...r, rate: r.monthly.leads ? Math.round((r.monthly.conversions / r.monthly.leads) * 100) : 0 }))
    .sort((a, b) => b.monthly.revenue - a.monthly.revenue)

  return (
    <div className="p-6 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="إجمالي العملاء" value={leads.length} sub="جميع المراحل" color="bg-blue-500" />
        <StatCard icon={Award} label="تم التسجيل" value={enrolled.length} sub="هذا الشهر" color="bg-green-500" />
        <StatCard icon={TrendingUp} label="معدل التحويل" value={`${convRate}%`} sub="من الكل" color="bg-amber-500" />
        <StatCard icon={DollarSign} label="الإيرادات" value={`${(totalRevenue / 1000).toFixed(1)}k`} sub="جنيه مصري" color="bg-purple-500" />
        <StatCard icon={Phone} label="متابعات اليوم" value={followUpsToday} sub="تحتاج تواصل" color="bg-cyan-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">مسار المبيعات</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pipelineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fontFamily: 'Tajawal' }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                formatter={(val) => [val, 'عدد العملاء']}
                contentStyle={{ fontFamily: 'Tajawal', borderRadius: '8px' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {pipelineData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Source Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">مصادر العملاء</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontFamily: 'Tajawal', fontSize: 12 }}>{v}</span>} />
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">آخر النشاطات</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {activities.slice(0, 10).map((act) => (
              <div key={act.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-xl mt-0.5">{activityIcons[act.type] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{act.leadName}</p>
                  <p className="text-xs text-gray-500 truncate">{act.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{act.rep}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(act.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">أفضل المبيعين</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">هذا الشهر</span>
          </div>
          <div className="space-y-4">
            {topReps.map((rep, i) => (
              <div key={rep.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}>
                  {i + 1}
                </span>
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {rep.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">{rep.name}</p>
                    <p className="text-sm font-bold text-green-600">{rep.monthly.revenue.toLocaleString()} ج</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${rep.rate}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{rep.rate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/leads', { state: { openAdd: true } })}
            className="mt-5 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            إضافة عميل جديد
          </button>
        </div>
      </div>
    </div>
  )
}
