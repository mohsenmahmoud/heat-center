import { useState, useMemo } from 'react'
import { Search, Plus, X, Phone, MessageCircle, ChevronRight, Trash2, Edit3, Filter } from 'lucide-react'
import useStore from '../store/useStore'

const STAGES = ['جديد', 'تم التواصل', 'موعد محجوز', 'عرض تقديمي', 'متابعة', 'تم التسجيل', 'لم يتم']
const SOURCES = ['Facebook', 'Instagram', 'WhatsApp', 'Referral', 'Website']
const REPS = ['سارة عبد الله', 'محمد خالد', 'نورا أحمد', 'أمير يوسف']
const COURSES = ['Scratch', 'Python', 'Web Development', 'Game Design', 'Robotics']

const STAGE_COLORS = {
  'جديد': 'bg-blue-100 text-blue-700',
  'تم التواصل': 'bg-amber-100 text-amber-700',
  'موعد محجوز': 'bg-orange-100 text-orange-700',
  'عرض تقديمي': 'bg-purple-100 text-purple-700',
  'متابعة': 'bg-cyan-100 text-cyan-700',
  'تم التسجيل': 'bg-green-100 text-green-700',
  'لم يتم': 'bg-red-100 text-red-700',
}

const SOURCE_COLORS = {
  Facebook: 'bg-blue-500',
  Instagram: 'bg-pink-500',
  WhatsApp: 'bg-green-500',
  Referral: 'bg-purple-500',
  Website: 'bg-gray-500',
}

const emptyForm = {
  name: '', phone: '', childName: '', childAge: '', source: 'Facebook',
  stage: 'جديد', notes: '', assignedTo: 'سارة عبد الله', value: '', followUpDate: '', courseInterest: 'Scratch'
}

function LeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead ? {
    name: lead.name, phone: lead.phone, childName: lead.childName, childAge: lead.childAge,
    source: lead.source, stage: lead.stage, notes: lead.notes || '', assignedTo: lead.assignedTo,
    value: lead.value, followUpDate: lead.followUpDate || '', courseInterest: lead.courseInterest || 'Scratch'
  } : emptyForm)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, childAge: Number(form.childAge), value: Number(form.value) })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-800 text-lg">{lead ? 'تعديل العميل' : 'إضافة عميل جديد'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم ولي الأمر *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="الاسم الكامل" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="01x-xxxx-xxxx" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الطفل *</label>
              <input name="childName" value={form.childName} onChange={handleChange} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="اسم الطفل" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عمر الطفل *</label>
              <input name="childAge" type="number" min="6" max="17" value={form.childAge} onChange={handleChange} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="6-17 سنة" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المصدر</label>
              <select name="source" value={form.source} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المرحلة</label>
              <select name="stage" value={form.stage} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مسؤول المتابعة</label>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {REPS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الكورس المهتم به</label>
              <select name="courseInterest" value={form.courseInterest} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {COURSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الكورس (ج)</label>
              <input name="value" type="number" value={form.value} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="1500-3000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ المتابعة</label>
              <input name="followUpDate" type="date" value={form.followUpDate} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="أي ملاحظات مهمة..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition-colors">
              {lead ? 'حفظ التعديلات' : 'إضافة العميل'}
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

function LeadDetail({ lead, onClose, onEdit }) {
  const moveLead = useStore((s) => s.moveLead)
  const deleteLead = useStore((s) => s.deleteLead)
  const addActivity = useStore((s) => s.addActivity)
  const activities = useStore((s) => s.activities)
  const leadActivities = activities.filter((a) => a.leadId === lead.id).slice(0, 8)

  const days = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000)

  const handleCall = () => {
    addActivity({ type: 'call', leadId: lead.id, leadName: lead.name, description: 'تم الاتصال بولي الأمر', rep: lead.assignedTo })
    window.open(`tel:${lead.phone}`)
  }

  const handleWhatsApp = () => {
    addActivity({ type: 'whatsapp', leadId: lead.id, leadName: lead.name, description: 'تم فتح محادثة واتساب', rep: lead.assignedTo })
    const phone = lead.phone.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/2${phone}`)
  }

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteLead(lead.id)
      onClose()
    }
  }

  const activityIcons = { call: '📞', whatsapp: '💬', stage_change: '🔄', note: '📝', enrollment: '🎉', new_lead: '👤' }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-l from-amber-500 to-amber-600 p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-xl">{lead.name}</h3>
              <p className="text-amber-100 text-sm mt-1">{lead.phone}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white`}>{lead.stage}</span>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1"><X size={22} /></button>
          </div>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Child Info */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-blue-600 uppercase mb-2">بيانات الطفل</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">الاسم: </span><span className="font-medium">{lead.childName}</span></div>
              <div><span className="text-gray-500">العمر: </span><span className="font-medium">{lead.childAge} سنة</span></div>
              <div><span className="text-gray-500">الكورس: </span><span className="font-medium">{lead.courseInterest}</span></div>
              <div><span className="text-gray-500">القيمة: </span><span className="font-medium text-green-600">{lead.value?.toLocaleString()} ج</span></div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">المصدر</p>
              <p className="font-medium mt-0.5">{lead.source}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">مسؤول المتابعة</p>
              <p className="font-medium mt-0.5">{lead.assignedTo}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">منذ الإضافة</p>
              <p className="font-medium mt-0.5">{days} يوم</p>
            </div>
            {lead.followUpDate && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">المتابعة القادمة</p>
                <p className="font-medium mt-0.5">{lead.followUpDate}</p>
              </div>
            )}
          </div>

          {lead.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-600 mb-1">ملاحظات</p>
              <p className="text-sm text-gray-700">{lead.notes}</p>
            </div>
          )}

          {/* Move Stage */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">تغيير المرحلة</p>
            <div className="flex flex-wrap gap-2">
              {STAGES.filter((s) => s !== lead.stage).map((stage) => (
                <button key={stage} onClick={() => moveLead(lead.id, stage)}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors">
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleCall} className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl transition-colors text-sm font-medium">
              <Phone size={16} /> اتصال
            </button>
            <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl transition-colors text-sm font-medium">
              <MessageCircle size={16} /> واتساب
            </button>
          </div>

          {/* Activity Log */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">سجل النشاط</p>
            <div className="space-y-2">
              {leadActivities.length === 0 && <p className="text-sm text-gray-400">لا توجد نشاطات بعد</p>}
              {leadActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-2 text-sm py-2 border-b border-gray-50 last:border-0">
                  <span>{activityIcons[act.type] || '📌'}</span>
                  <div>
                    <p className="text-gray-700">{act.description}</p>
                    <p className="text-xs text-gray-400">{new Date(act.createdAt).toLocaleString('ar-EG')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 flex gap-3">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
            <Edit3 size={16} /> تعديل
          </button>
          <button onClick={handleDelete} className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Leads() {
  const leads = useStore((s) => s.leads)
  const addLead = useStore((s) => s.addLead)
  const updateLead = useStore((s) => s.updateLead)

  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterRep, setFilterRep] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editLead, setEditLead] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const q = search.toLowerCase()
      const matchSearch = !q || l.name.includes(q) || l.childName.includes(q) || l.phone.includes(q)
      const matchStage = !filterStage || l.stage === filterStage
      const matchSource = !filterSource || l.source === filterSource
      const matchRep = !filterRep || l.assignedTo === filterRep
      return matchSearch && matchStage && matchSource && matchRep
    })
  }, [leads, search, filterStage, filterSource, filterRep])

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

  const handleEdit = () => {
    setEditLead(selectedLead)
    setShowAddModal(true)
    setSelectedLead(null)
  }

  return (
    <div className="p-6 space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف..."
            className="w-full border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            <Filter size={16} /> فلترة
          </button>
          <button onClick={() => { setEditLead(null); setShowAddModal(true) }} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
            <Plus size={16} /> عميل جديد
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

      {/* Stats */}
      <div className="text-sm text-gray-500">
        عرض <span className="font-bold text-gray-800">{filtered.length}</span> من {leads.length} عميل
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 font-bold text-gray-600">ولي الأمر</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">الطفل</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">الهاتف</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">المصدر</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">المرحلة</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">المسؤول</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600">المتابعة</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const today = new Date().toISOString().split('T')[0]
                const overdue = lead.followUpDate && lead.followUpDate < today
                return (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-amber-50/30 cursor-pointer transition-colors" onClick={() => setSelectedLead(lead)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {lead.name[0]}
                        </div>
                        <span className="font-medium text-gray-800">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.childName} ({lead.childAge})</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{lead.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block w-2 h-2 rounded-full ${SOURCE_COLORS[lead.source]} ml-2`} />
                      <span className="text-gray-600">{lead.source}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STAGE_COLORS[lead.stage]}`}>{lead.stage}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.assignedTo}</td>
                    <td className="px-4 py-3">
                      {lead.followUpDate ? (
                        <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-500'}`}>{lead.followUpDate}</span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight size={16} className="text-gray-300" />
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">لا توجد نتائج</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <LeadModal
          lead={editLead}
          onClose={() => { setShowAddModal(false); setEditLead(null) }}
          onSave={handleSaveLead}
        />
      )}
      {selectedLead && (
        <LeadDetail
          lead={leads.find((l) => l.id === selectedLead.id) || selectedLead}
          onClose={() => setSelectedLead(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}
