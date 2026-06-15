import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Users, TrendingUp, DollarSign, Phone, UserPlus, Award, ArrowLeft } from 'lucide-react'
import useStore from '../store/useStore'

const STAGES = ['ليد جديد', 'لا يرد', 'تم التواصل', 'متابعة', 'مهتم', 'تفاوض', 'تريال محجوز', 'حضر التريال', 'تم التسجيل', 'غير مهتم']
const STAGE_COLORS = {
  'ليد جديد':    '#3b82f6',
  'لا يرد':      '#64748b',
  'تم التواصل':  '#f59e0b',
  'متابعة':      '#06b6d4',
  'مهتم':        '#f97316',
  'تفاوض':       '#8b5cf6',
  'تريال محجوز': '#6366f1',
  'حضر التريال': '#ec4899',
  'تم التسجيل':  '#10b981',
  'غير مهتم':    '#ef4444',
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

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-amber-200' : ''}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {onClick && <ArrowLeft size={16} className="text-gray-300" />}
    </div>
  )
}

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2 text-sm font-medium text-gray-700" style={{ fontFamily: 'Tajawal' }}>
        <p>{payload[0].payload.stage}</p>
        <p className="text-amber-500 font-bold">{payload[0].value} عميل</p>
        <p className="text-xs text-gray-400 mt-1">اضغط للتفاصيل</p>
      </div>
    )
  }
  return null
}

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2 text-sm font-medium text-gray-700" style={{ fontFamily: 'Tajawal' }}>
        <p>{payload[0].name}</p>
        <p className="text-amber-500 font-bold">{payload[0].value} عميل</p>
        <p className="text-xs text-gray-400 mt-1">اضغط للتفاصيل</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const leads = useStore((s) => s.leads)
  const activities = useStore((s) => s.activities)
  const kpis = useStore((s) => s.kpis)
  const navigate = useNavigate()

  const enrolled = useMemo(() => leads.filter((l) => l.stage === 'تم التسجيل'), [leads])
  const trialsBooked = useMemo(() => leads.filter((l) => l.stage === 'تريال محجوز' || l.stage === 'حضر التريال'), [leads])
  const convRate = leads.length ? Math.round((enrolled.length / leads.length) * 100) : 0
  const totalRevenue = enrolled.reduce((s, l) => s + (Number(l.value) || 0), 0)
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

  const handleBarClick = (data) => {
    if (data && data.activePayload) {
      const stage = data.activePayload[0].payload.stage
      navigate('/leads', { state: { filterStage: stage } })
    }
  }

  const handlePieClick = (data) => {
    if (data && data.name) {
      navigate('/leads', { state: { filterSource: data.name } })
    }
  }

  const handleActivityClick = (leadId) => {
    navigate('/leads', { state: { openLeadId: leadId } })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users} label="إجمالي العملاء" value={leads.length} sub="كليك لعرض الكل" color="bg-blue-500"
          onClick={() => navigate('/leads')}
        />
        <StatCard
          icon={Award} label="تريال محجوز" value={trialsBooked.length} sub="كليك لعرض التريالز" color="bg-indigo-500"
          onClick={() => navigate('/leads', { state: { filterStage: 'تريال محجوز' } })}
        />
        <StatCard
          icon={TrendingUp} label="معدل التحويل" value={`${convRate}%`} sub="كليك لمؤشرات الأداء" color="bg-amber-500"
          onClick={() => navigate('/kpis')}
        />
        <StatCard
          icon={DollarSign} label="الإيرادات" value={`${(totalRevenue / 1000).toFixed(1)}k`} sub="جنيه مصري" color="bg-purple-500"
          onClick={() => navigate('/kpis')}
        />
        <StatCard
          icon={Phone} label="متابعات اليوم" value={followUpsToday} sub="كليك لعرض المتابعات" color="bg-cyan-500"
          onClick={() => navigate('/leads', { state: { filterFollowUp: today } })}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-800 text-lg">مسار المبيعات</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">اضغط على أي مرحلة</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">كليك على العمود → عرض عملاء المرحلة</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={pipelineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fontFamily: 'Tajawal' }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomBarTooltip />} />
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
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-800 text-lg">مصادر العملاء</h3>
          </div>
          <p className="text-xs text-gray-400 mb-2">كليك على المصدر → عرض عملاؤه</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                paddingAngle={4} dataKey="value"
                onClick={handlePieClick}
                style={{ cursor: 'pointer' }}
              >
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontFamily: 'Tajawal', fontSize: 12 }}>{v}</span>} />
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-1 text-lg">آخر النشاطات</h3>
          <p className="text-xs text-gray-400 mb-4">كليك على النشاط → تفاصيل العميل</p>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {activities.slice(0, 10).map((act) => (
              <div
                key={act.id}
                onClick={() => handleActivityClick(act.leadId)}
                className="flex items-start gap-3 py-2.5 px-2 border-b border-gray-50 last:border-0 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors group"
              >
                <span className="text-xl mt-0.5">{activityIcons[act.type] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate group-hover:text-amber-700">{act.leadName}</p>
                  <p className="text-xs text-gray-500 truncate">{act.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{act.rep}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(act.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                  <ArrowLeft size={12} className="text-gray-300 group-hover:text-amber-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-800 text-lg">أفضل المبيعين</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">هذا الشهر</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">كليك على المندوب → تفاصيل أدائه</p>
          <div className="space-y-3">
            {topReps.map((rep, i) => (
              <div
                key={rep.id}
                onClick={() => navigate('/kpis')}
                className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors group"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>
                  {i + 1}
                </span>
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {rep.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 group-hover:text-amber-700">{rep.name}</p>
                    <p className="text-sm font-bold text-green-600">{rep.monthly.revenue.toLocaleString()} ج</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${rep.rate}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{rep.rate}%</span>
                  </div>
                </div>
                <ArrowLeft size={14} className="text-gray-300 group-hover:text-amber-400" />
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
