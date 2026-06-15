import { useState, useRef } from 'react'
import { Phone, MessageCircle, ChevronDown, User, StickyNote, X, Check, PhoneOff } from 'lucide-react'
import useStore from '../store/useStore'
import { openWhatsApp } from '../utils/phone'

const STAGES = ['ليد جديد', 'لا يرد', 'تم التواصل', 'متابعة', 'مهتم', 'تفاوض', 'تريال محجوز', 'حضر التريال', 'تم التسجيل', 'غير مهتم']

const STAGE_CONFIG = {
  'ليد جديد':    { header: 'bg-blue-500',   light: 'bg-blue-50 border-blue-200' },
  'لا يرد':      { header: 'bg-slate-500',  light: 'bg-slate-50 border-slate-200' },
  'تم التواصل':  { header: 'bg-amber-500',  light: 'bg-amber-50 border-amber-200' },
  'متابعة':      { header: 'bg-cyan-500',   light: 'bg-cyan-50 border-cyan-200' },
  'مهتم':        { header: 'bg-orange-500', light: 'bg-orange-50 border-orange-200' },
  'تفاوض':       { header: 'bg-purple-500', light: 'bg-purple-50 border-purple-200' },
  'تريال محجوز': { header: 'bg-indigo-500', light: 'bg-indigo-50 border-indigo-200' },
  'حضر التريال': { header: 'bg-pink-500',   light: 'bg-pink-50 border-pink-200' },
  'تم التسجيل':  { header: 'bg-green-500',  light: 'bg-green-50 border-green-200' },
  'غير مهتم':    { header: 'bg-red-500',    light: 'bg-red-50 border-red-200' },
}

const SOURCE_COLORS = {
  Facebook: 'bg-blue-500',
  Instagram: 'bg-pink-500',
  WhatsApp: 'bg-green-500',
  B2B: 'bg-purple-500',
  Organic: 'bg-gray-500',
}

function MoveMenu({ lead, onMove, onClose }) {
  return (
    <div className="absolute top-full left-0 z-20 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-40">
      {STAGES.filter((s) => s !== lead.stage).map((stage) => (
        <button key={stage} onClick={() => { onMove(lead.id, stage); onClose() }}
          className="w-full text-right px-4 py-2 text-sm hover:bg-amber-50 text-gray-700 hover:text-amber-700 transition-colors">
          {stage}
        </button>
      ))}
    </div>
  )
}

function QuickNote({ lead, onClose }) {
  const addActivity = useStore((s) => s.addActivity)
  const [text, setText] = useState('')

  const save = () => {
    const t = text.trim()
    if (!t) return
    addActivity({ type: 'note', leadId: lead.id, leadName: lead.name, description: t, rep: lead.assignedTo, stage: lead.stage })
    onClose()
  }

  return (
    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 space-y-2">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save() }}
        rows={2}
        placeholder={`ملاحظة في "${lead.stage}"...`}
        className="w-full border border-amber-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
      />
      <div className="flex gap-1.5">
        <button onClick={save} disabled={!text.trim()} className="flex-1 flex items-center justify-center gap-1 py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors">
          <Check size={11} /> حفظ
        </button>
        <button onClick={onClose} className="flex items-center justify-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs transition-colors">
          <X size={11} />
        </button>
      </div>
    </div>
  )
}

function LeadCard({ lead }) {
  const moveLead = useStore((s) => s.moveLead)
  const incrementNoAnswer = useStore((s) => s.incrementNoAnswer)
  const [showMenu, setShowMenu] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const days = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000)
  const firstStudent = lead.students?.[0] || {}

  const handleCall = (e) => {
    e.stopPropagation()
    window.open(`tel:${lead.phone}`)
  }

  const handleWa = (e) => {
    e.stopPropagation()
    openWhatsApp(lead.whatsappPhone || lead.phone)
  }

  const handleNoAnswer = (e) => {
    e.stopPropagation()
    incrementNoAnswer(lead.id)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
            {lead.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-gray-800 leading-tight">{lead.name}</p>
              {lead.noAnswerCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{lead.noAnswerCount}×</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{firstStudent.name} · {firstStudent.age} سنة</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${SOURCE_COLORS[lead.source] || 'bg-gray-400'}`} title={lead.source} />
          {lead.leadType === 'B2B' && <span className="text-xs bg-purple-100 text-purple-600 px-1.5 rounded-full font-bold">B2B</span>}
        </div>
      </div>

      {/* Track & value */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{firstStudent.track || '—'}</span>
        {lead.value ? <span className="text-xs font-bold text-green-600">{Number(lead.value).toLocaleString()} ج</span> : null}
      </div>

      {/* Rep & Days */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <User size={11} />
          <span>{lead.assignedTo}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${days > 7 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
          {days} يوم
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-1 relative">
        <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs transition-colors">
          <Phone size={11} /> اتصال
        </button>
        <button onClick={handleNoAnswer} className="flex items-center justify-center px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs transition-colors" title="لا يرد">
          <PhoneOff size={11} />
        </button>
        <button onClick={handleWa} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs transition-colors">
          <MessageCircle size={11} /> واتس
        </button>
        <button onClick={(e) => { e.stopPropagation(); setShowNote(!showNote) }}
          className={`flex items-center justify-center px-2 py-1.5 rounded-lg text-xs transition-colors ${showNote ? 'bg-amber-200 text-amber-700' : 'bg-amber-50 hover:bg-amber-100 text-amber-600'}`}>
          <StickyNote size={11} />
        </button>
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="flex items-center justify-center px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs transition-colors">
            <ChevronDown size={11} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <MoveMenu lead={lead} onMove={moveLead} onClose={() => setShowMenu(false)} />
            </>
          )}
        </div>
      </div>
      {showNote && <QuickNote lead={lead} onClose={() => setShowNote(false)} />}
    </div>
  )
}

export default function Pipeline() {
  const allLeads = useStore((s) => s.leads)
  const currentUser = useStore((s) => s.currentUser)
  const isAdmin = currentUser?.role === 'admin'
  const leads = isAdmin ? allLeads : allLeads.filter((l) => l.assignedTo === currentUser?.repName)

  const stageLeads = (stage) => leads.filter((l) => l.stage === stage)
  const stageValue = (stage) => stageLeads(stage).reduce((s, l) => s + (Number(l.value) || 0), 0)
  const totalRevenue = leads.filter(l => l.stage === 'تم التسجيل').reduce((s, l) => s + (Number(l.value) || 0), 0)

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">مسار المبيعات (Kanban)</h2>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>إجمالي الليدز: <strong className="text-gray-800">{leads.length}</strong></span>
          <span>الإيرادات المحصلة: <strong className="text-green-600">{totalRevenue.toLocaleString()} ج</strong></span>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {STAGES.map((stage) => {
          const config = STAGE_CONFIG[stage]
          const stageList = stageLeads(stage)
          const val = stageValue(stage)
          return (
            <div key={stage} className="flex-shrink-0 w-52">
              <div className={`${config.header} text-white rounded-t-xl px-3 py-2.5`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{stage}</span>
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">{stageList.length}</span>
                </div>
                {val > 0 && <p className="text-white/80 text-xs mt-0.5">{val.toLocaleString()} ج</p>}
              </div>
              <div className={`${config.light} border border-t-0 rounded-b-xl p-2 space-y-2 min-h-64`}>
                {stageList.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
                {stageList.length === 0 && (
                  <div className="text-center py-8 text-gray-300 text-xs">لا يوجد ليدز</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
