import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Plus, X, Phone, MessageCircle, ChevronRight, Trash2, Edit3, Filter, Download, Upload, CheckCircle, AlertCircle, PhoneOff, UserPlus } from 'lucide-react'
import * as XLSX from 'xlsx'
import useStore from '../store/useStore'
import { openWhatsApp } from '../utils/phone'

const STAGES = ['ليد جديد', 'لا يرد', 'تم التواصل', 'متابعة', 'مهتم', 'تفاوض', 'تريال محجوز', 'حضر التريال', 'تم التسجيل', 'غير مهتم']
const SOURCES = ['Facebook', 'Instagram', 'WhatsApp', 'B2B', 'Organic']
const REPS = ['ميادة', 'هاجر', 'أسماء', 'غادة']
const TRACKS = ['Scratch', 'Web Development', 'Mobile Development', 'AI']
const PARENT_TYPES = ['أم', 'أب', 'أخرى']
const LEAD_TYPES = ['B2C', 'B2B']
const ONLINE_OPTIONS = ['أونلاين', 'أوف لاين']
const PAYMENT_TYPES = ['', 'كاش', 'تقسيط']
const DISCOUNT_OPTIONS = ['', 'خصم كاش 15%', 'خصم أخوات 10%', 'خصم مبكر 10%']

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
  'غير مهتم':    'bg-red-100 text-red-700',
}

const STAGE_BADGE_BORDER = {
  'ليد جديد':    'border-blue-200 bg-blue-50',
  'لا يرد':      'border-slate-200 bg-slate-50',
  'تم التواصل':  'border-amber-200 bg-amber-50',
  'متابعة':      'border-cyan-200 bg-cyan-50',
  'مهتم':        'border-orange-200 bg-orange-50',
  'تفاوض':       'border-purple-200 bg-purple-50',
  'تريال محجوز': 'border-indigo-200 bg-indigo-50',
  'حضر التريال': 'border-pink-200 bg-pink-50',
  'تم التسجيل':  'border-green-200 bg-green-50',
  'غير مهتم':    'border-red-200 bg-red-50',
}

const SOURCE_COLORS = {
  Facebook: 'bg-blue-500',
  Instagram: 'bg-pink-500',
  WhatsApp: 'bg-green-500',
  B2B: 'bg-purple-500',
  Organic: 'bg-gray-500',
}

const emptyStudent = { name: '', age: '', track: 'Scratch', onlineOffline: 'أونلاين', gradeLevel: '' }

const emptyForm = {
  name: '', phone: '', whatsappPhone: '', email: '', parentType: 'أم',
  leadType: 'B2C', b2bSource: '', source: 'Facebook', stage: 'ليد جديد',
  assignedTo: 'ميادة', value: '', followUpDate: '', paymentType: '', discount: '',
  notes: '', callRecordLink: '',
  students: [{ ...emptyStudent }],
}

// ─── Lead Form Modal ─────────────────────────────────────────────────────────
function LeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead ? {
    name: lead.name || '', phone: lead.phone || '', whatsappPhone: lead.whatsappPhone || lead.phone || '',
    email: lead.email || '', parentType: lead.parentType || 'أم',
    leadType: lead.leadType || 'B2C', b2bSource: lead.b2bSource || '',
    source: lead.source || 'Facebook', stage: lead.stage || 'ليد جديد',
    assignedTo: lead.assignedTo || 'ميادة', value: lead.value || '',
    followUpDate: lead.followUpDate || '', paymentType: lead.paymentType || '',
    discount: lead.discount || '', notes: lead.notes || '', callRecordLink: lead.callRecordLink || '',
    students: lead.students?.length ? lead.students.map(s => ({ ...emptyStudent, ...s })) : [{ ...emptyStudent }],
  } : emptyForm)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setStudent = (i, k, v) => setForm(f => {
    const students = [...f.students]
    students[i] = { ...students[i], [k]: v }
    return { ...f, students }
  })
  const addStudent = () => { if (form.students.length < 4) setForm(f => ({ ...f, students: [...f.students, { ...emptyStudent }] })) }
  const removeStudent = (i) => { if (form.students.length > 1) setForm(f => ({ ...f, students: f.students.filter((_, idx) => idx !== i) })) }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, value: form.value ? Number(form.value) : '' })
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-800 text-lg">{lead ? 'تعديل الليد' : 'إضافة ليد جديد'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          {/* ── Parent Info ── */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
              بيانات ولي الأمر
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>الاسم *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} required className={inputCls} placeholder="اسم ولي الأمر" />
              </div>
              <div>
                <label className={labelCls}>نوع الوالد</label>
                <select value={form.parentType} onChange={e => set('parentType', e.target.value)} className={inputCls}>
                  {PARENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>رقم التليفون *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} required className={inputCls} placeholder="01x-xxxx-xxxx" />
              </div>
              <div>
                <label className={labelCls}>رقم WhatsApp</label>
                <input value={form.whatsappPhone} onChange={e => set('whatsappPhone', e.target.value)} className={inputCls} placeholder="نفس التليفون لو مفيش فرق" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} placeholder="example@gmail.com" />
              </div>
            </div>
          </div>

          {/* ── Lead Info ── */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
              بيانات الليد
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>نوع الليد</label>
                <select value={form.leadType} onChange={e => set('leadType', e.target.value)} className={inputCls}>
                  {LEAD_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {form.leadType === 'B2B' && (
                <div>
                  <label className={labelCls}>اسم المدرسة / المصدر</label>
                  <input value={form.b2bSource} onChange={e => set('b2bSource', e.target.value)} className={inputCls} placeholder="اسم المدرسة" />
                </div>
              )}
              <div>
                <label className={labelCls}>مصدر الليد</label>
                <select value={form.source} onChange={e => set('source', e.target.value)} className={inputCls}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>المرحلة</label>
                <select value={form.stage} onChange={e => set('stage', e.target.value)} className={inputCls}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>المسؤول</label>
                <select value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} className={inputCls}>
                  {REPS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>تاريخ المتابعة</label>
                <input type="date" value={form.followUpDate} onChange={e => set('followUpDate', e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {/* ── Students ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                بيانات الطلاب
              </h4>
              {form.students.length < 4 && (
                <button type="button" onClick={addStudent} className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1">
                  <Plus size={13} /> إضافة طالب
                </button>
              )}
            </div>
            <div className="space-y-3">
              {form.students.map((student, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">الطالب {i + 1}</span>
                    {form.students.length > 1 && (
                      <button type="button" onClick={() => removeStudent(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>اسم الطالب *</label>
                      <input value={student.name} onChange={e => setStudent(i, 'name', e.target.value)} required className={inputCls} placeholder="اسم الطالب" />
                    </div>
                    <div>
                      <label className={labelCls}>العمر *</label>
                      <input type="number" min="5" max="18" value={student.age} onChange={e => setStudent(i, 'age', e.target.value)} required className={inputCls} placeholder="6-17" />
                    </div>
                    <div>
                      <label className={labelCls}>التراك</label>
                      <select value={student.track} onChange={e => setStudent(i, 'track', e.target.value)} className={inputCls}>
                        {TRACKS.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>أونلاين / أوف لاين</label>
                      <select value={student.onlineOffline} onChange={e => setStudent(i, 'onlineOffline', e.target.value)} className={inputCls}>
                        {ONLINE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>الصف الدراسي</label>
                      <input value={student.gradeLevel} onChange={e => setStudent(i, 'gradeLevel', e.target.value)} className={inputCls} placeholder="مثال: الصف الخامس" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sales ── */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
              بيانات البيع
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>القيمة (جنيه)</label>
                <input type="number" value={form.value} onChange={e => set('value', e.target.value)} className={inputCls} placeholder="3000" />
              </div>
              <div>
                <label className={labelCls}>طريقة الدفع</label>
                <select value={form.paymentType} onChange={e => set('paymentType', e.target.value)} className={inputCls}>
                  {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t || '— لم يُحدد —'}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>الخصم</label>
                <select value={form.discount} onChange={e => set('discount', e.target.value)} className={inputCls}>
                  {DISCOUNT_OPTIONS.map(d => <option key={d} value={d}>{d || '— بدون خصم —'}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>رابط تسجيل المكالمة</label>
                <input value={form.callRecordLink} onChange={e => set('callRecordLink', e.target.value)} className={inputCls} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>ملاحظات</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={inputCls} placeholder="أي ملاحظات..." />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition-colors">
              {lead ? 'حفظ التعديلات' : 'إضافة الليد'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Stage Notes View ────────────────────────────────────────────────────────
function StageNotesView({ activities, currentStage, activityIcons, activityColors }) {
  const [collapsed, setCollapsed] = useState({})

  const byStage = useMemo(() => {
    const map = {}
    const sorted = [...activities].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    let trackedStage = currentStage
    const firstChange = sorted.find((a) => a.type === 'stage_change' && a.fromStage)
    if (firstChange) trackedStage = firstChange.fromStage

    sorted.forEach((act) => {
      const stage = act.stage || (act.type === 'stage_change' && act.fromStage ? act.fromStage : trackedStage)
      if (act.type === 'stage_change' && act.stage) trackedStage = act.stage
      if (!map[stage]) map[stage] = []
      map[stage].push(act)
    })
    return map
  }, [activities, currentStage])

  const stagesWithData = STAGES.filter((s) => byStage[s]?.length)
  if (stagesWithData.length === 0) return <p className="text-sm text-gray-400 text-center py-4">لا توجد نشاطات بعد</p>

  return (
    <div className="space-y-2">
      {stagesWithData.map((stage) => {
        const acts = byStage[stage]
        const isOpen = !collapsed[stage]
        const noteCount = acts.filter((a) => a.type === 'note').length
        const isCurrent = stage === currentStage
        const colors = STAGE_BADGE_BORDER[stage] || 'border-gray-200 bg-gray-50'
        const textColors = STAGE_COLORS[stage] || 'bg-gray-100 text-gray-700'
        return (
          <div key={stage} className={`border rounded-xl overflow-hidden`}>
            <button
              onClick={() => setCollapsed((p) => ({ ...p, [stage]: !p[stage] }))}
              className={`w-full flex items-center justify-between px-3 py-2 text-right ${colors}`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${textColors}`}>{stage}</span>
                {isCurrent && <span className="text-xs text-gray-500 font-medium">• الحالية</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{noteCount} ملاحظة · {acts.length} نشاط</span>
                <span className="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>
            {isOpen && (
              <div className="bg-white p-2 space-y-1.5">
                {acts.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 bg-gray-50 rounded-lg p-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${activityColors[act.type] || 'bg-gray-100'}`}>
                      {activityIcons[act.type] || '📌'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">{act.description}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-gray-400">{act.rep}</p>
                        <span className="text-gray-300">·</span>
                        <p className="text-xs text-gray-400">{new Date(act.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Lead Detail Panel ───────────────────────────────────────────────────────
function LeadDetail({ lead, onClose, onEdit }) {
  const moveLead = useStore((s) => s.moveLead)
  const deleteLead = useStore((s) => s.deleteLead)
  const addActivity = useStore((s) => s.addActivity)
  const incrementNoAnswer = useStore((s) => s.incrementNoAnswer)
  const activities = useStore((s) => s.activities)
  const leadActivities = activities.filter((a) => a.leadId === lead.id)

  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [logTab, setLogTab] = useState('stages')
  const noteRef = useRef()

  const days = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000)
  const firstStudent = lead.students?.[0] || {}

  const handleCall = () => {
    addActivity({ type: 'call', leadId: lead.id, leadName: lead.name, description: 'تم الاتصال', rep: lead.assignedTo, stage: lead.stage })
    window.open(`tel:${lead.phone}`)
  }

  const handleWhatsApp = () => {
    addActivity({ type: 'whatsapp', leadId: lead.id, leadName: lead.name, description: 'تم فتح واتساب', rep: lead.assignedTo, stage: lead.stage })
    openWhatsApp(lead.whatsappPhone || lead.phone)
  }

  const handleNoAnswer = () => {
    incrementNoAnswer(lead.id)
  }

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذا الليد؟')) {
      deleteLead(lead.id)
      onClose()
    }
  }

  const handleSaveNote = () => {
    const text = newNote.trim()
    if (!text) return
    setSaving(true)
    addActivity({ type: 'note', leadId: lead.id, leadName: lead.name, description: text, rep: lead.assignedTo, stage: lead.stage })
    setNewNote('')
    setTimeout(() => { setSaving(false); noteRef.current?.focus() }, 300)
  }

  const activityIcons = { call: '📞', whatsapp: '💬', stage_change: '🔄', note: '📝', enrollment: '🎉', new_lead: '👤', no_answer: '📵' }
  const activityColors = {
    call: 'bg-blue-100 text-blue-600',
    whatsapp: 'bg-green-100 text-green-600',
    stage_change: 'bg-purple-100 text-purple-600',
    note: 'bg-amber-100 text-amber-600',
    enrollment: 'bg-emerald-100 text-emerald-600',
    new_lead: 'bg-gray-100 text-gray-600',
    no_answer: 'bg-red-100 text-red-600',
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full">

        {/* Header */}
        <div className="bg-gradient-to-l from-amber-500 to-amber-600 p-5 text-white flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl">{lead.name}</h3>
                {lead.leadType === 'B2B' && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">B2B</span>}
                {lead.noAnswerCount > 0 && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{lead.noAnswerCount}× لا يرد</span>
                )}
              </div>
              <p className="text-amber-100 text-sm mt-1">{lead.phone}{lead.whatsappPhone && lead.whatsappPhone !== lead.phone ? ` · WA: ${lead.whatsappPhone}` : ''}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${STAGE_COLORS[lead.stage] || 'bg-white/20 text-white'}`}>{lead.stage}</span>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1"><X size={22} /></button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Students */}
          <div className="bg-blue-50 rounded-xl p-3">
            <h4 className="text-xs font-bold text-blue-600 uppercase mb-2">الطلاب</h4>
            <div className="space-y-2">
              {(lead.students || []).map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <span className="font-medium">{s.name}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">{s.age} سنة</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-indigo-600 text-xs bg-indigo-50 px-2 py-0.5 rounded-full">{s.track}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.onlineOffline === 'أونلاين' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{s.onlineOffline}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 text-xs">المصدر</p>
              <p className="font-medium mt-0.5">{lead.source}{lead.b2bSource ? ` — ${lead.b2bSource}` : ''}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 text-xs">المسؤول</p>
              <p className="font-medium mt-0.5">{lead.assignedTo}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 text-xs">نوع الوالد</p>
              <p className="font-medium mt-0.5">{lead.parentType}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 text-xs">منذ الإضافة</p>
              <p className="font-medium mt-0.5">{days} يوم</p>
            </div>
            {lead.email && (
              <div className="col-span-2 bg-gray-50 rounded-lg p-2.5">
                <p className="text-gray-400 text-xs">البريد الإلكتروني</p>
                <p className="font-medium mt-0.5">{lead.email}</p>
              </div>
            )}
            {lead.value && (
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-gray-400 text-xs">القيمة</p>
                <p className="font-medium mt-0.5 text-green-600">{Number(lead.value).toLocaleString()} ج</p>
              </div>
            )}
            {lead.paymentType && (
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-gray-400 text-xs">طريقة الدفع</p>
                <p className="font-medium mt-0.5">{lead.paymentType}{lead.discount ? ` · ${lead.discount}` : ''}</p>
              </div>
            )}
            {lead.followUpDate && (
              <div className="col-span-2 bg-amber-50 rounded-lg p-2.5">
                <p className="text-gray-400 text-xs">موعد المتابعة</p>
                <p className="font-medium mt-0.5 text-amber-700">{lead.followUpDate}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={handleCall} className="flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl transition-colors text-sm font-medium">
              <Phone size={14} /> اتصال
            </button>
            <button onClick={handleNoAnswer} className="flex items-center justify-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-xl transition-colors text-sm font-medium">
              <PhoneOff size={14} /> لا يرد
            </button>
            <button onClick={handleWhatsApp} className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl transition-colors text-sm font-medium">
              <MessageCircle size={14} /> واتساب
            </button>
          </div>

          {/* Move Stage */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">تغيير المرحلة</p>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.filter((s) => s !== lead.stage).map((stage) => (
                <button key={stage} onClick={() => moveLead(lead.id, stage)}
                  className="px-2.5 py-1 text-xs font-medium border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors">
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Add Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-sm font-bold text-amber-700 mb-2">📝 ملاحظة في "{lead.stage}"</p>
            <textarea
              ref={noteRef}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSaveNote() }}
              rows={2}
              placeholder="اكتب ملاحظة... (Ctrl+Enter للحفظ)"
              className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
            />
            <button
              onClick={handleSaveNote}
              disabled={!newNote.trim() || saving}
              className="mt-2 w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold py-1.5 rounded-lg text-sm transition-colors"
            >
              {saving ? 'تم الحفظ ✓' : 'حفظ الملاحظة'}
            </button>
          </div>

          {/* Activity Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-700">سجل المتابعات</p>
              <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs">
                <button onClick={() => setLogTab('stages')} className={`px-2.5 py-1 rounded-md transition-colors font-medium ${logTab === 'stages' ? 'bg-white shadow text-amber-700' : 'text-gray-500'}`}>
                  حسب المرحلة
                </button>
                <button onClick={() => setLogTab('timeline')} className={`px-2.5 py-1 rounded-md transition-colors font-medium ${logTab === 'timeline' ? 'bg-white shadow text-amber-700' : 'text-gray-500'}`}>
                  الكل
                </button>
              </div>
            </div>
            {leadActivities.length === 0
              ? <p className="text-sm text-gray-400 text-center py-4">لا توجد نشاطات بعد</p>
              : logTab === 'timeline'
                ? (
                  <div className="space-y-2">
                    {leadActivities.map((act) => (
                      <div key={act.id} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${activityColors[act.type] || 'bg-gray-100'}`}>
                          {activityIcons[act.type] || '📌'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 leading-snug">{act.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(act.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                : <StageNotesView activities={leadActivities} currentStage={lead.stage} activityIcons={activityIcons} activityColors={activityColors} />
            }
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-3 flex gap-2 flex-shrink-0">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-sm font-bold transition-colors">
            <Edit3 size={15} /> تعديل
          </button>
          <button onClick={handleDelete} className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Import Modal ─────────────────────────────────────────────────────────────
const TEMPLATE_HEADERS = [
  'اسم ولي الأمر *', 'رقم التليفون *', 'رقم WhatsApp', 'البريد الإلكتروني',
  'نوع الوالد (أم/أب/أخرى)', 'نوع الليد (B2C/B2B)', 'اسم المدرسة (B2B فقط)',
  'المصدر (Facebook/Instagram/WhatsApp/B2B/Organic)',
  'المرحلة', 'المسؤول (ميادة/هاجر/أسماء/غادة)',
  'اسم الطالب 1 *', 'عمر الطالب 1 *', 'تراك الطالب 1 (Scratch/Web Development/Mobile Development/AI)',
  'أونلاين/أوف لاين 1', 'الصف الدراسي 1',
  'اسم الطالب 2', 'عمر الطالب 2', 'تراك الطالب 2',
  'القيمة (جنيه)', 'طريقة الدفع (كاش/تقسيط)', 'الخصم',
  'تاريخ المتابعة (YYYY-MM-DD)', 'ملاحظات',
]

function downloadTemplate() {
  const wb = XLSX.utils.book_new()
  const example = [
    'أحمد محمد', '01012345678', '01012345678', 'ahmed@gmail.com',
    'أب', 'B2C', '',
    'Facebook', 'ليد جديد', 'ميادة',
    'يوسف', '10', 'Scratch', 'أونلاين', 'الصف الخامس',
    '', '', '',
    '3000', 'كاش', 'خصم كاش 15%',
    '2026-06-20', '',
  ]
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, example])
  ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }))
  XLSX.utils.book_append_sheet(wb, ws, 'بنيان CRM - قالب')
  XLSX.writeFile(wb, 'bonyan_crm_template.xlsx')
}

function parseImportedFile(file, onSuccess, onError) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (rows.length < 2) { onError('الملف فاضي'); return }
      const dataRows = rows.slice(1).filter((r) => r[0] || r[1])
      const leads = dataRows.map((r) => {
        const students = [{ name: String(r[10] || '').trim(), age: String(r[11] || '').trim(), track: TRACKS.includes(r[12]) ? r[12] : 'Scratch', onlineOffline: r[13] === 'أوف لاين' ? 'أوف لاين' : 'أونلاين', gradeLevel: String(r[14] || '').trim() }]
        if (r[15]) students.push({ name: String(r[15]).trim(), age: String(r[16] || '').trim(), track: TRACKS.includes(r[17]) ? r[17] : 'Scratch', onlineOffline: 'أونلاين', gradeLevel: '' })
        return {
          name: String(r[0] || '').trim(),
          phone: String(r[1] || '').trim(),
          whatsappPhone: String(r[2] || r[1] || '').trim(),
          email: String(r[3] || '').trim(),
          parentType: PARENT_TYPES.includes(r[4]) ? r[4] : 'أب',
          leadType: r[5] === 'B2B' ? 'B2B' : 'B2C',
          b2bSource: String(r[6] || '').trim(),
          source: SOURCES.includes(r[7]) ? r[7] : 'Facebook',
          stage: STAGES.includes(r[8]) ? r[8] : 'ليد جديد',
          assignedTo: REPS.includes(r[9]) ? r[9] : REPS[0],
          students,
          value: r[18] ? Number(r[18]) : '',
          paymentType: PAYMENT_TYPES.includes(r[19]) ? r[19] : '',
          discount: String(r[20] || '').trim(),
          followUpDate: String(r[21] || '').trim() || '',
          notes: String(r[22] || '').trim(),
          noAnswerCount: 0,
          callRecordLink: '',
        }
      }).filter((l) => l.name && l.phone)
      if (leads.length === 0) { onError('لم يتم العثور على بيانات صالحة'); return }
      onSuccess(leads)
    } catch { onError('خطأ في قراءة الملف') }
  }
  reader.readAsArrayBuffer(file)
}

function ImportModal({ onClose, onImport }) {
  const fileRef = useRef()
  const [status, setStatus] = useState(null)
  const [preview, setPreview] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [importing, setImporting] = useState(false)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    parseImportedFile(file, (leads) => { setPreview(leads); setStatus('preview') }, (msg) => { setStatus('error'); setErrorMsg(msg) })
  }

  const handleConfirm = () => {
    setImporting(true)
    preview.forEach((lead) => onImport(lead))
    setTimeout(() => { setImporting(false); onClose() }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-800 text-lg">استيراد ليدز من Excel</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-bold text-amber-800 mb-1">الخطوة 1: نزّل القالب</p>
            <button onClick={downloadTemplate} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              <Download size={16} /> تحميل قالب Excel
            </button>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-amber-300 transition-colors">
            <p className="font-bold text-gray-700 mb-1">الخطوة 2: ارفع الملف</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 mx-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
              <Upload size={16} /> اختر الملف
            </button>
          </div>
          {status === 'error' && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              <AlertCircle size={20} /><p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}
          {status === 'preview' && preview.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <CheckCircle size={18} />
                <p className="font-bold">تم قراءة {preview.length} ليد</p>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-right px-3 py-2 font-bold text-gray-600">الاسم</th>
                      <th className="text-right px-3 py-2 font-bold text-gray-600">الهاتف</th>
                      <th className="text-right px-3 py-2 font-bold text-gray-600">الطالب الأول</th>
                      <th className="text-right px-3 py-2 font-bold text-gray-600">المرحلة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((l, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{l.name}</td>
                        <td className="px-3 py-2 font-mono text-gray-500">{l.phone}</td>
                        <td className="px-3 py-2 text-gray-600">{l.students[0]?.name} ({l.students[0]?.age})</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STAGE_COLORS[l.stage] || 'bg-gray-100'}`}>{l.stage}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleConfirm} disabled={importing} className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <CheckCircle size={16} />{importing ? 'جاري...' : `استيراد ${preview.length} ليد`}
                </button>
                <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors">إلغاء</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Leads Page ──────────────────────────────────────────────────────────
export default function Leads() {
  const allLeads = useStore((s) => s.leads)
  const currentUser = useStore((s) => s.currentUser)
  const isAdmin = currentUser?.role === 'admin'
  const leads = isAdmin ? allLeads : allLeads.filter((l) => l.assignedTo === currentUser?.repName)
  const addLead = useStore((s) => s.addLead)
  const updateLead = useStore((s) => s.updateLead)
  const deleteLead = useStore((s) => s.deleteLead)
  const location = useLocation()

  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterRep, setFilterRep] = useState('')
  const [filterFollowUpToday, setFilterFollowUpToday] = useState(false)
  const [filterNewToday, setFilterNewToday] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editLead, setEditLead] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [checkedIds, setCheckedIds] = useState(new Set())

  useEffect(() => {
    const state = location.state
    if (!state) return
    // reset all nav-driven filters first so switching between them works
    setFilterStage(''); setFilterSource(''); setFilterRep('')
    setFilterFollowUpToday(false); setFilterNewToday(false)
    if (state.filterStage) { setFilterStage(state.filterStage); setShowFilters(true) }
    if (state.filterSource) { setFilterSource(state.filterSource); setShowFilters(true) }
    if (state.filterRep) { setFilterRep(state.filterRep); setShowFilters(true) }
    if (state.filterFollowUpToday) { setFilterFollowUpToday(true); setShowFilters(true) }
    if (state.filterNewToday) { setFilterNewToday(true); setShowFilters(true) }
    if (state.openAdd) setShowAddModal(true)
    if (state.openLeadId) {
      const lead = leads.find((l) => l.id === state.openLeadId)
      if (lead) setSelectedLead(lead)
    }
  }, [location.key])

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const q = search.toLowerCase()
      const studentNames = (l.students || []).map(s => s.name).join(' ').toLowerCase()
      const matchSearch = !q || l.name.toLowerCase().includes(q) || studentNames.includes(q) || l.phone.includes(q)
      const matchStage = !filterStage || l.stage === filterStage
      const matchSource = !filterSource || l.source === filterSource
      const matchRep = !filterRep || l.assignedTo === filterRep
      const today = new Date().toISOString().split('T')[0]
      const matchFollowUp = !filterFollowUpToday || l.followUpDate === today
      const matchNewToday = !filterNewToday || l.createdAt?.startsWith(today)
      return matchSearch && matchStage && matchSource && matchRep && matchFollowUp && matchNewToday
    })
  }, [leads, search, filterStage, filterSource, filterRep, filterFollowUpToday, filterNewToday])

  const allChecked = filtered.length > 0 && filtered.every((l) => checkedIds.has(l.id))
  const someChecked = checkedIds.size > 0

  const toggleCheck = (id, e) => {
    e.stopPropagation()
    setCheckedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }
  const toggleAll = () => { allChecked ? setCheckedIds(new Set()) : setCheckedIds(new Set(filtered.map((l) => l.id))) }
  const handleBulkDelete = () => {
    if (!window.confirm(`حذف ${checkedIds.size} ليد؟`)) return
    checkedIds.forEach((id) => deleteLead(id))
    setCheckedIds(new Set())
  }

  const handleSaveLead = (data) => {
    if (editLead) {
      updateLead(editLead.id, data)
      setEditLead(null)
      if (selectedLead?.id === editLead.id) setSelectedLead({ ...selectedLead, ...data })
    } else {
      addLead(data)
    }
    setShowAddModal(false)
  }

  const handleEdit = () => { setEditLead(selectedLead); setShowAddModal(true); setSelectedLead(null) }

  return (
    <div className="p-6 space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الطالب أو الهاتف..."
            className="w-full border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            <Filter size={16} /> فلترة
          </button>
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
            <Upload size={16} /> Excel
          </button>
          <button onClick={() => { setEditLead(null); setShowAddModal(true) }} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
            <Plus size={16} /> ليد جديد
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">كل المراحل</option>
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">كل المصادر</option>
            {SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={filterRep} onChange={(e) => setFilterRep(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">كل المندوبين</option>
            {REPS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button onClick={() => { setFilterStage(''); setFilterSource(''); setFilterRep('') }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-white">
            إعادة تعيين
          </button>
        </div>
      )}

      {/* Stats + Bulk */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          عرض <span className="font-bold text-gray-800">{filtered.length}</span> من {leads.length} ليد
          {someChecked && <span className="mr-2 text-amber-600 font-bold">· تم تحديد {checkedIds.size}</span>}
        </div>
        {someChecked && (
          <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            <Trash2 size={15} /> حذف {checkedIds.size}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 rounded accent-amber-500 cursor-pointer" />
                </th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">ولي الأمر</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">الطالب</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">الهاتف</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">المصدر</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">المرحلة</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">المسؤول</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">المتابعة</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const today = new Date().toISOString().split('T')[0]
                const overdue = lead.followUpDate && lead.followUpDate < today
                const firstStudent = lead.students?.[0] || {}
                return (
                  <tr key={lead.id}
                    className={`border-b border-gray-50 transition-colors cursor-pointer ${checkedIds.has(lead.id) ? 'bg-amber-50' : 'hover:bg-amber-50/30'}`}
                    onClick={() => setSelectedLead(lead)}>
                    <td className="px-4 py-3 w-10" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={checkedIds.has(lead.id)} onChange={(e) => toggleCheck(lead.id, e)} className="w-4 h-4 rounded accent-amber-500 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                          {lead.name[0]}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">{lead.name}</span>
                          {lead.noAnswerCount > 0 && (
                            <span className="mr-1.5 bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{lead.noAnswerCount}×</span>
                          )}
                          {lead.leadType === 'B2B' && <span className="mr-1 text-xs bg-purple-100 text-purple-600 px-1.5 rounded-full font-bold">B2B</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {firstStudent.name && <span>{firstStudent.name} ({firstStudent.age})</span>}
                      {lead.students?.length > 1 && <span className="text-xs text-gray-400 mr-1">+{lead.students.length - 1}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{lead.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block w-2 h-2 rounded-full ${SOURCE_COLORS[lead.source] || 'bg-gray-400'} ml-2`} />
                      <span className="text-gray-600">{lead.source}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STAGE_COLORS[lead.stage] || 'bg-gray-100 text-gray-600'}`}>{lead.stage}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.assignedTo}</td>
                    <td className="px-4 py-3">
                      {lead.followUpDate
                        ? <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-500'}`}>{lead.followUpDate}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3"><ChevronRight size={16} className="text-gray-300" /></td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">لا توجد نتائج</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <LeadModal lead={editLead} onClose={() => { setShowAddModal(false); setEditLead(null) }} onSave={handleSaveLead} />}
      {selectedLead && <LeadDetail lead={leads.find((l) => l.id === selectedLead.id) || selectedLead} onClose={() => setSelectedLead(null)} onEdit={handleEdit} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={addLead} />}
    </div>
  )
}
