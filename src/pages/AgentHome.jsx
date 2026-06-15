import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, PhoneOff, Clock, UserPlus, TrendingUp, CheckCircle } from 'lucide-react'
import useStore from '../store/useStore'
import { openWhatsApp } from '../utils/phone'

const STAGE_COLORS = {
  'ليد جديد':    'bg-blue-100 text-blue-700',
  'لا يرد':      'bg-slate-100 text-slate-600',
  'تم التواصل':  'bg-amber-100 text-amber-700',
  'متابعة':      'bg-cyan-100 text-cyan-700',
  'مهتم':        'bg-orange-100 text-orange-700',
  'تفاوض':       'bg-purple-100 text-purple-700',
  'تريال محجوز': 'bg-indigo-100 text-indigo-700',
  'حضر التريال': 'bg-pink-100 text-pink-700',
  'تم التسجيل':  'bg-green-100 text-green-700',
  'غير مهتم':    'bg-red-100 text-red-600',
}

function LeadRow({ lead, onCall, onWa, onNoAnswer }) {
  const firstStudent = lead.students?.[0] || {}
  const days = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
            {lead.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-800 text-sm">{lead.name}</p>
              {lead.noAnswerCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{lead.noAnswerCount}×</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{lead.phone}</p>
            {firstStudent.name && (
              <p className="text-xs text-gray-400">{firstStudent.name} · {firstStudent.age} سنة · {firstStudent.track}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[lead.stage] || 'bg-gray-100 text-gray-600'}`}>
            {lead.stage}
          </span>
          <span className="text-xs text-gray-400">{days} يوم</span>
        </div>
      </div>

      {lead.followUpDate && (
        <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mb-3">
          <Clock size={11} />
          <span>متابعة: {lead.followUpDate}</span>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => onCall(lead)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors">
          <Phone size={12} /> اتصال
        </button>
        <button onClick={() => onNoAnswer(lead)} className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs transition-colors" title="لا يرد">
          <PhoneOff size={12} />
        </button>
        <button onClick={() => onWa(lead)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-medium transition-colors">
          <MessageCircle size={12} /> واتس
        </button>
      </div>
    </div>
  )
}

export default function AgentHome() {
  const leads = useStore((s) => s.leads)
  const currentUser = useStore((s) => s.currentUser)
  const incrementNoAnswer = useStore((s) => s.incrementNoAnswer)
  const navigate = useNavigate()

  const today = new Date().toISOString().split('T')[0]
  const repName = currentUser?.repName

  const myLeads = useMemo(() => leads.filter((l) => l.assignedTo === repName), [leads, repName])

  const newToday = useMemo(() => myLeads.filter((l) => l.createdAt?.startsWith(today)), [myLeads, today])
  const followUpsToday = useMemo(() => myLeads.filter((l) => l.followUpDate === today && !l.createdAt?.startsWith(today)), [myLeads, today])
  const enrolled = useMemo(() => myLeads.filter((l) => l.stage === 'تم التسجيل'), [myLeads])
  const myRevenue = useMemo(() => enrolled.reduce((s, l) => s + (Number(l.value) || 0), 0), [enrolled])

  const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const handleCall = (lead) => window.open(`tel:${lead.phone}`)
  const handleWa = (lead) => openWhatsApp(lead.whatsappPhone || lead.phone)
  const handleNoAnswer = (lead) => incrementNoAnswer(lead.id)

  const workList = [...newToday, ...followUpsToday]

  return (
    <div className="p-6 max-w-2xl mx-auto" dir="rtl">
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">مرحباً {currentUser?.name} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">{dateStr}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <UserPlus size={20} className="text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-blue-700">{newToday.length}</p>
          <p className="text-xs text-blue-500 mt-0.5">ليد جديد اليوم</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
          <Clock size={20} className="text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-700">{followUpsToday.length}</p>
          <p className="text-xs text-amber-500 mt-0.5">متابعة اليوم</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-700">{enrolled.length}</p>
          <p className="text-xs text-green-500 mt-0.5">تم التسجيل</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
          <TrendingUp size={20} className="text-indigo-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-indigo-700">{myLeads.length}</p>
          <p className="text-xs text-indigo-500 mt-0.5">إجمالي ليدزي</p>
        </div>
      </div>

      {myRevenue > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 mb-6 text-white flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">إجمالي إيراداتي</p>
            <p className="text-2xl font-bold">{myRevenue.toLocaleString()} ج</p>
          </div>
          <TrendingUp size={32} className="text-green-200" />
        </div>
      )}

      {/* Today's work */}
      {workList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-gray-600 font-medium">لا يوجد عمل معلق اليوم</p>
          <p className="text-gray-400 text-sm mt-1">كل شيء تمام!</p>
          <button onClick={() => navigate('/leads')} className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors">
            عرض كل الليدز
          </button>
        </div>
      ) : (
        <div>
          {newToday.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                ليدز جديدة اليوم ({newToday.length})
              </h3>
              <div className="space-y-3">
                {newToday.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} onCall={handleCall} onWa={handleWa} onNoAnswer={handleNoAnswer} />
                ))}
              </div>
            </div>
          )}

          {followUpsToday.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                متابعات مطلوبة اليوم ({followUpsToday.length})
              </h3>
              <div className="space-y-3">
                {followUpsToday.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} onCall={handleCall} onWa={handleWa} onNoAnswer={handleNoAnswer} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <button onClick={() => navigate('/leads')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-4">
          عرض كل ليدزي ({myLeads.length})
        </button>
      </div>
    </div>
  )
}
