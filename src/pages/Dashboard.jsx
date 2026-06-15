import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Users, TrendingUp, DollarSign, Phone, UserPlus, Award, ArrowLeft, PhoneOff, CalendarClock } from 'lucide-react'
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
  no_answer: '📵',
}

function StatCard({ icon: Icon, label, value, sub, color, onClick, badge }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-amber-200' : ''}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-sm">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {badge && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {onClick && <ArrowLeft size={16} className="text-gray-300 flex-shrink-0" />}
    </div>
  )
}

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2 text-sm font-medium text-gray-700" style={{ fontFamily: 'Tajawal' }}>
        <p>{payload[0].payload.stage}</p>
        <p className="text-amber-500 font-bold">{payload[0].value} ليد</p>
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
        <p className="text-amber-500 font-bold">{payload[0].value} ليد</p>
        <p className="text-xs text-gray-400 mt-1">اضغط للتفاصيل</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const leads = useStore((s) => s.leads)
  const activities = useStore((s) => s.activities)
  const navigate = useNavigate()

  const today = new Date().toISOString().split('T')[0]

  // ── Core metrics from real leads data ────────────────────────────────────
  const enrolled = useMemo(() => leads.filter((l) => l.stage === 'تم التسجيل'), [leads])
  const trials = useMemo(() => leads.filter((l) => l.stage === 'تريال محجوز' || l.stage === 'حضر التريال'), [leads])
  const noAnswer = useMemo(() => leads.filter((l) => l.stage === 'لا يرد'), [leads])
  const followUpsToday = useMemo(() => leads.filter((l) => l.followUpDate === today), [leads, today])

  // Revenue = sum of value for enrolled leads only
  const totalRevenue = useMemo(() =>
    enrolled.reduce((sum, l) => sum + (Number(l.value) || 0), 0)
  , [enrolled])

  // Conversion rate = enrolled / (total - غير مهتم - لا يرد)
  const activeLeads = leads.filter((l) => l.stage !== 'غير مهتم')
  const convRate = activeLeads.length ? Math.round((enrolled.length / activeLeads.length) * 100) : 0

  // Trial conversion = enrolled / حضر التريال
  const attendedTrial = leads.filter((l) => l.stage === 'حضر التريال')
  const trialConvRate = (attendedTrial.length + enrolled.length) > 0
    ? Math.round((enrolled.length / (attendedTrial.length + enrolled.length)) * 100)
    : 0

  // ── Top performers from REAL leads data ──────────────────────────────────
  const repStats = useMemo(() => {
    const stats = {}
    leads.forEach((l) => {
      const rep = l.assignedTo
      if (!rep) return
      if (!stats[rep]) stats[rep] = { name: rep, leads: 0, enrolled: 0, trials: 0, revenue: 0, noAnswer: 0 }
      stats[rep].leads++
      if (l.stage === 'تم التسجيل') {
        stats[rep].enrolled++
        stats[rep].revenue += Number(l.value) || 0
      }
      if (l.stage === 'تريال محجوز' || l.stage === 'حضر التريال') stats[rep].trials++
      if (l.stage === 'لا يرد') stats[rep].noAnswer++
    })
    return Object.values(stats).sort((a, b) => b.enrolled - a.enrolled || b.revenue - a.revenue)
  }, [leads])

  // ── Pipeline chart data ──────────────────────────────────────────────────
  const pipelineData = STAGES.map((stage) => ({
    stage,
    count: leads.filter((l) => l.stage === stage).length,
    fill: STAGE_COLORS[stage],
  }))

  // ── Source pie data ──────────────────────────────────────────────────────
  const sourceData = useMemo(() => {
    const counts = {}
    leads.forEach((l) => { counts[l.source] = (counts[l.source] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [leads])

  const handleBarClick = (data) => {
    if (data?.activePayload) {
      navigate('/leads', { state: { filterStage: data.activePayload[0].payload.stage } })
    }
  }

  const handlePieClick = (data) => {
    if (data?.name) navigate('/leads', { state: { filterSource: data.name } })
  }

  const handleActivityClick = (leadId) => {
    navigate('/leads', { state: { openLeadId: leadId } })
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── Stats Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users} label="إجمالي الليدز" value={leads.length}
          sub={`${noAnswer.length} لا يرد`}
          badge={noAnswer.length > 0 ? `${noAnswer.length} لا يرد` : null}
          color="bg-blue-500"
          onClick={() => navigate('/leads')}
        />
        <StatCard
          icon={Award} label="تم التسجيل" value={enrolled.length}
          sub={`من ${activeLeads.length} ليد نشط`}
          color="bg-green-500"
          onClick={() => navigate('/leads', { state: { filterStage: 'تم التسجيل' } })}
        />
        <StatCard
          icon={TrendingUp} label="معدل التحويل" value={`${convRate}%`}
          sub={`تريال → تسجيل: ${trialConvRate}%`}
          color="bg-amber-500"
          onClick={() => navigate('/kpis')}
        />
        <StatCard
          icon={DollarSign}
          label="الإيرادات"
          value={totalRevenue > 0 ? `${(totalRevenue / 1000).toFixed(1)}k` : '—'}
          sub={totalRevenue > 0 ? `${totalRevenue.toLocaleString()} ج من ${enrolled.length} مسجل` : 'لم يتم تسجيل إيرادات بعد'}
          color="bg-purple-500"
          onClick={() => navigate('/kpis')}
        />
        <StatCard
          icon={CalendarClock} label="متابعات اليوم" value={followUpsToday.length}
          sub="موعد متابعة اليوم"
          color="bg-cyan-500"
          onClick={() => navigate('/leads', { state: { filterFollowUpToday: true } })}
        />
      </div>

      {/* ── Funnel Summary Row ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-4">ملخص القمع البيعي</h3>
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { label: 'ليد جديد', stage: 'ليد جديد', color: 'bg-blue-500' },
            { label: 'تم التواصل', stage: 'تم التواصل', color: 'bg-amber-500' },
            { label: 'مهتم', stage: 'مهتم', color: 'bg-orange-500' },
            { label: 'تفاوض', stage: 'تفاوض', color: 'bg-purple-500' },
            { label: 'تريال محجوز', stage: 'تريال محجوز', color: 'bg-indigo-500' },
            { label: 'حضر التريال', stage: 'حضر التريال', color: 'bg-pink-500' },
            { label: 'تم التسجيل', stage: 'تم التسجيل', color: 'bg-green-500' },
          ].map((item, i, arr) => {
            const count = leads.filter((l) => l.stage === item.stage).length
            const pct = leads.length ? Math.round((count / leads.length) * 100) : 0
            return (
              <div key={item.stage} className="flex items-center gap-1 flex-shrink-0">
                <div
                  onClick={() => navigate('/leads', { state: { filterStage: item.stage } })}
                  className="text-center cursor-pointer group"
                >
                  <div className={`${item.color} text-white rounded-xl px-4 py-3 min-w-20 group-hover:opacity-90 transition-opacity`}>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs mt-0.5 text-white/80">{pct}%</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 font-medium">{item.label}</p>
                </div>
                {i < arr.length - 1 && <span className="text-gray-300 text-lg mb-5">›</span>}
              </div>
            )
          })}
          {/* Separator */}
          <div className="flex items-center gap-1 flex-shrink-0 opacity-50">
            <span className="text-gray-300 text-lg mb-5 mr-2">|</span>
          </div>
          {/* Lost & No Answer */}
          {[
            { label: 'لا يرد', stage: 'لا يرد', color: 'bg-slate-400' },
            { label: 'غير مهتم', stage: 'غير مهتم', color: 'bg-red-400' },
          ].map((item) => {
            const count = leads.filter((l) => l.stage === item.stage).length
            const pct = leads.length ? Math.round((count / leads.length) * 100) : 0
            return (
              <div key={item.stage}
                onClick={() => navigate('/leads', { state: { filterStage: item.stage } })}
                className="text-center cursor-pointer group flex-shrink-0"
              >
                <div className={`${item.color} text-white rounded-xl px-4 py-3 min-w-16 group-hover:opacity-90 transition-opacity`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs mt-0.5 text-white/80">{pct}%</p>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 font-medium">{item.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Charts Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-800 text-lg">توزيع الليدز على المراحل</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">كليك على العمود</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={pipelineData} margin={{ top: 5, right: 5, left: -20, bottom: 40 }} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fontFamily: 'Tajawal' }} angle={-25} textAnchor="end" interval={0} />
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
          <h3 className="font-bold text-gray-800 text-lg mb-1">مصادر الليدز</h3>
          <p className="text-xs text-gray-400 mb-2">كليك على المصدر → عرض ليدزه</p>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={88}
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

      {/* ── Bottom Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-1 text-lg">آخر النشاطات</h3>
          <p className="text-xs text-gray-400 mb-3">كليك على النشاط → تفاصيل الليد</p>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {activities.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">لا توجد نشاطات بعد</p>
            )}
            {activities.slice(0, 12).map((act) => (
              <div
                key={act.id}
                onClick={() => handleActivityClick(act.leadId)}
                className="flex items-start gap-3 py-2.5 px-2 border-b border-gray-50 last:border-0 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors group"
              >
                <span className="text-lg mt-0.5 flex-shrink-0">{activityIcons[act.type] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate group-hover:text-amber-700">{act.leadName}</p>
                  <p className="text-xs text-gray-500 truncate">{act.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{act.rep}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(act.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <ArrowLeft size={12} className="text-gray-300 group-hover:text-amber-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers — from REAL leads data */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-800 text-lg">أداء المندوبين</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">من الليدز الفعلية</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">كليك على المندوب → تفاصيل أدائه</p>

          {repStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">لا توجد بيانات بعد</p>
          ) : (
            <div className="space-y-3">
              {repStats.map((rep, i) => {
                const rate = rep.leads ? Math.round((rep.enrolled / rep.leads) * 100) : 0
                return (
                  <div
                    key={rep.name}
                    onClick={() => navigate('/leads', { state: { filterRep: rep.name } })}
                    className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors group"
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>
                      {i + 1}
                    </span>
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                      {rep.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-amber-700 truncate">{rep.name}</p>
                        <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500">
                          <span>{rep.leads} ليد</span>
                          <span className="text-green-600 font-bold">{rep.enrolled} ✓</span>
                          {rep.revenue > 0 && <span className="text-purple-600 font-bold">{(rep.revenue/1000).toFixed(1)}k</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">{rate}%</span>
                        {rep.noAnswer > 0 && (
                          <span className="text-xs text-red-500 flex-shrink-0">{rep.noAnswer} 📵</span>
                        )}
                      </div>
                    </div>
                    <ArrowLeft size={14} className="text-gray-300 group-hover:text-amber-400 flex-shrink-0" />
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={() => navigate('/leads', { state: { openAdd: true } })}
            className="mt-5 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            إضافة ليد جديد
          </button>
        </div>
      </div>
    </div>
  )
}
