import { useState } from 'react'
import { Plus, Copy, Edit3, Trash2, X, Check, MessageCircle, Eye } from 'lucide-react'
import useStore from '../store/useStore'

const CATEGORIES = ['ترحيب', 'متابعة', 'موعد', 'تسجيل', 'عروض']

const CATEGORY_COLORS = {
  ترحيب: 'bg-blue-100 text-blue-700',
  متابعة: 'bg-amber-100 text-amber-700',
  موعد: 'bg-orange-100 text-orange-700',
  تسجيل: 'bg-green-100 text-green-700',
  عروض: 'bg-purple-100 text-purple-700',
}

const PLACEHOLDERS = [
  { key: '{اسم_الوالد}', desc: 'اسم ولي الأمر' },
  { key: '{اسم_الطفل}', desc: 'اسم الطفل' },
  { key: '{عمر_الطفل}', desc: 'عمر الطفل' },
  { key: '{التاريخ}', desc: 'تاريخ الموعد' },
  { key: '{الوقت}', desc: 'وقت الموعد' },
  { key: '{اسم_الكورس}', desc: 'اسم الكورس' },
]

const emptyForm = { name: '', category: 'ترحيب', content: '' }

function TemplateModal({ template, onClose, onSave }) {
  const [form, setForm] = useState(template ? { name: template.name, category: template.category, content: template.content } : emptyForm)
  const [preview, setPreview] = useState(false)

  const insertPlaceholder = (key) => {
    setForm((f) => ({ ...f, content: f.content + key }))
  }

  const previewContent = form.content
    .replace(/{اسم_الوالد}/g, 'أحمد محمد')
    .replace(/{اسم_الطفل}/g, 'يوسف')
    .replace(/{عمر_الطفل}/g, '10')
    .replace(/{التاريخ}/g, '2026/06/15')
    .replace(/{الوقت}/g, '5:00 مساءً')
    .replace(/{اسم_الكورس}/g, 'Python')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-800 text-lg">{template ? 'تعديل القالب' : 'قالب جديد'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم القالب *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="اسم القالب" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Placeholder Guide */}
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-600 mb-2">المتغيرات المتاحة (اضغط للإدراج)</p>
            <div className="flex flex-wrap gap-2">
              {PLACEHOLDERS.map((p) => (
                <button key={p.key} onClick={() => insertPlaceholder(p.key)}
                  className="px-2 py-1 bg-white border border-blue-200 rounded-lg text-xs text-blue-700 hover:bg-blue-100 transition-colors font-mono"
                  title={p.desc}>
                  {p.key}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">محتوى الرسالة *</label>
              <button onClick={() => setPreview(!preview)}
                className={`flex items-center gap-1 text-xs px-3 py-1 rounded-lg transition-colors ${preview ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Eye size={12} /> {preview ? 'تعديل' : 'معاينة'}
              </button>
            </div>
            {preview ? (
              <div className="w-full border border-gray-200 rounded-xl p-4 min-h-40 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">بنيان للبرمجة</p>
                    <p className="text-xs text-gray-400">واتساب</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl rounded-tr-sm shadow-sm p-3">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{previewContent}</p>
                </div>
              </div>
            ) : (
              <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={8} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                placeholder="اكتب نص الرسالة هنا..." />
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => { if (form.name && form.content) onSave(form) }} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition-colors">
              {template ? 'حفظ التعديلات' : 'إضافة القالب'}
            </button>
            <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplateCard({ template, onEdit }) {
  const deleteTemplate = useStore((s) => s.deleteTemplate)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(template.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const preview = template.content.slice(0, 120) + (template.content.length > 120 ? '...' : '')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-sm truncate">{template.name}</h3>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[template.category] || 'bg-gray-100 text-gray-600'}`}>
            {template.category}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-4 whitespace-pre-wrap">{preview}</p>

      <div className="flex gap-2 mt-auto">
        <button onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-amber-50 hover:bg-amber-100 text-amber-700'}`}>
          {copied ? <><Check size={14} /> تم النسخ</> : <><Copy size={14} /> نسخ</>}
        </button>
        <button onClick={() => onEdit(template)} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition-colors">
          <Edit3 size={14} />
        </button>
        <button onClick={() => { if (confirm('هل تريد حذف هذا القالب؟')) deleteTemplate(template.id) }}
          className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Templates() {
  const templates = useStore((s) => s.templates)
  const addTemplate = useStore((s) => s.addTemplate)
  const updateTemplate = useStore((s) => s.updateTemplate)

  const [showModal, setShowModal] = useState(false)
  const [editTemplate, setEditTemplate] = useState(null)
  const [filterCat, setFilterCat] = useState('')

  const filtered = filterCat ? templates.filter((t) => t.category === filterCat) : templates

  const handleSave = (data) => {
    if (editTemplate) updateTemplate(editTemplate.id, data)
    else addTemplate(data)
    setShowModal(false)
    setEditTemplate(null)
  }

  const handleEdit = (template) => {
    setEditTemplate(template)
    setShowModal(true)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterCat('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterCat ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            الكل ({templates.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = templates.filter((t) => t.category === cat).length
            return (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterCat === cat ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat} ({count})
              </button>
            )
          })}
        </div>
        <button onClick={() => { setEditTemplate(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
          <Plus size={16} /> قالب جديد
        </button>
      </div>

      {/* Placeholder Guide */}
      <div className="bg-gradient-to-l from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle size={16} className="text-indigo-600" />
          <h3 className="font-bold text-indigo-800 text-sm">دليل المتغيرات</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {PLACEHOLDERS.map((p) => (
            <div key={p.key} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 text-xs">
              <code className="text-indigo-600 font-mono">{p.key}</code>
              <span className="text-gray-500">{p.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((template) => (
          <TemplateCard key={template.id} template={template} onEdit={handleEdit} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
            <p>لا توجد قوالب في هذه الفئة</p>
          </div>
        )}
      </div>

      {showModal && (
        <TemplateModal
          template={editTemplate}
          onClose={() => { setShowModal(false); setEditTemplate(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
