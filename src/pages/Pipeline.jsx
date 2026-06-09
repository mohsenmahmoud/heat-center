import { useState } from 'react'
import { Phone, MessageCircle, ChevronDown, User } from 'lucide-react'
import useStore from '../store/useStore'

const STAGES = ['جديد', 'تم التواصل', 'موعد محجوز', 'عرض تقديمي', 'متابعة', 'تم التسجيل', 'لم يتم']

const STAGE_CONFIG = {
  'جديد': { color: 'bg-blue-500', light: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', header: 'bg-blue-500' },
  'تم التواصل': { color: 'bg-amber-500', light: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', header: 'bg-amber-500' },
  'موعد محجوز': { color: 'bg-orange-500', light: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700', header: 'bg-orange-500' },
  'عرض تقديمي': { color: 'bg-purple-500', light: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-700', header: 'bg-purple-500' },
  'متابعة': { color: 'bg-cyan-500', light: 'bg-cyan-50 border-cyan-200', badge: 'bg-cyan-100 text-cyan-700', header: 'bg-cyan-500' },
  'تم التسجيل': { color: 'bg-green-500', light: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', header: 'bg-green-500' },
  'لم يتم': { color: 'bg-red-500', light: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', header: 'bg-red-500' },
}

const SOURCE_COLORS = {
  Facebook: 'bg-blue-500',
  Instagram: 'bg-pink-500',
  WhatsApp: 'bg-green-500',
  Referral: 'bg-purple-500',
  Website: 'bg-gray-500',
}

function MoveMenu({ lead, onMove, onClose }) {
  return (
    <div className="absolute top-full left-0 z-20 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-36">
      {STAGES.filter((s) => s !== lead.stage).map((stage) => (
        <button key={stage} onClick={() => { onMove(lead.id, stage); onClose() }}
          className="w-full text-right px-4 py-2 text-sm hover:bg-amber-50 text-gray-700 hover:text-amber-700 transition-colors">
          {stage}
        </button>
      ))}
    </div>
  )
}

function LeadCard({ lead }) {
  const moveLead = useStore((s) => s.moveLead)
  const [showMenu, setShowMenu] = useState(false)
  const days = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000)

  const handleCall = (e) => {
    e.stopPropagation()
    window.open(`tel:${lead.phone}`)
  }

  const handleWa = (e) => {
    e.stopPropagation()
    const phone = lead.phone.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/2${phone}`)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
            {lead.name[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">{lead.name}</p>
            <p className="text-xs text-gray-500">{lead.childName} · {lead.childAge} سنة</p>
          </div>
        </div>
        <span className={`inline-block w-2.5 h-2.5 rounded-full mt-1 ${SOURCE_COLORS[lead.source]}`} title={lead.source} />
      </div>

      {/* Course & Value */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{lead.courseInterest}</span>
        <span className="text-xs font-bold text-green-600">{lead.value?.toLocaleString()} ج</span>
      </div>

      {/* Phone */}
      <p className="text-xs text-gray-400 font-mono mb-3">{lead.phone}</p>

      {/* Rep & Days */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <User size={11} />
          <span className="truncate max-w-20">{lead.assignedTo.split(' ')[0]}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${days > 7 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
          {days} يوم
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 relative">
        <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs transition-colors">
          <Phone size={12} /> اتصال
        </button>
        <button onClick={handleWa} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs transition-colors">
          <MessageCircle size={12} /> واتس
        </button>
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-xs transition-colors">
            <ChevronDown size={12} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <MoveMenu lead={lead} onMove={moveLead} onClose={() => setShowMenu(false)} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Pipeline() {
  const leads = useStore((s) => s.leads)

  const stageLeads = (stage) => leads.filter((l) => l.stage === stage)
  const stageValue = (stage) => stageLeads(stage).reduce((s, l) => s + (l.value || 0), 0)

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">مسار المبيعات (Kanban)</h2>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>إجمالي العملاء: <strong className="text-gray-800">{leads.length}</strong></span>
          <span>الإيرادات المتوقعة: <strong className="text-green-600">{leads.reduce((s, l) => s + (l.value || 0), 0).toLocaleString()} ج</strong></span>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {STAGES.map((stage) => {
          const config = STAGE_CONFIG[stage]
          const stageList = stageLeads(stage)
          return (
            <div key={stage} className="flex-shrink-0 w-56">
              {/* Column Header */}
              <div className={`${config.header} text-white rounded-t-xl px-3 py-2.5 mb-0`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{stage}</span>
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {stageList.length}
                  </span>
                </div>
                <p className="text-white/80 text-xs mt-0.5">{stageValue(stage).toLocaleString()} ج</p>
              </div>

              {/* Cards */}
              <div className={`${config.light} border border-t-0 rounded-b-xl p-2 space-y-2 min-h-64`}>
                {stageList.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
                {stageList.length === 0 && (
                  <div className="text-center py-8 text-gray-300 text-xs">
                    <p>لا يوجد عملاء</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
