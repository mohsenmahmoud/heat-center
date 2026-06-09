import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialLeads = [
  {
    id: '1',
    name: 'أحمد محمد السيد',
    phone: '0101-2345-678',
    childName: 'يوسف أحمد',
    childAge: 10,
    source: 'Facebook',
    stage: 'جديد',
    notes: 'الطفل مهتم جداً بالألعاب، يريد تعلم برمجة الألعاب',
    assignedTo: 'سارة عبد الله',
    createdAt: '2026-06-01T09:00:00Z',
    value: 2500,
    followUpDate: '2026-06-10',
    courseInterest: 'Game Design',
  },
  {
    id: '2',
    name: 'منى حسن إبراهيم',
    phone: '0112-3456-789',
    childName: 'ريم حسن',
    childAge: 8,
    source: 'Instagram',
    stage: 'تم التواصل',
    notes: 'الأم حضرت ندوة أونلاين، مهتمة جداً بكورس Scratch',
    assignedTo: 'محمد خالد',
    createdAt: '2026-05-28T10:30:00Z',
    value: 1800,
    followUpDate: '2026-06-11',
    courseInterest: 'Scratch',
  },
  {
    id: '3',
    name: 'طارق عبد الرحمن',
    phone: '0155-4567-890',
    childName: 'عمر طارق',
    childAge: 14,
    source: 'Referral',
    stage: 'موعد محجوز',
    notes: 'تم حجز موعد تجريبي الجمعة القادمة الساعة 5 عصراً',
    assignedTo: 'نورا أحمد',
    createdAt: '2026-05-25T14:00:00Z',
    value: 3000,
    followUpDate: '2026-06-13',
    courseInterest: 'Python',
  },
  {
    id: '4',
    name: 'هدى سمير علي',
    phone: '0100-5678-901',
    childName: 'لينا سمير',
    childAge: 12,
    source: 'Website',
    stage: 'عرض تقديمي',
    notes: 'أعجبها العرض جداً، تحتاج وقت للتفكير مع الزوج',
    assignedTo: 'سارة عبد الله',
    createdAt: '2026-05-20T11:00:00Z',
    value: 2800,
    followUpDate: '2026-06-09',
    courseInterest: 'Web Development',
  },
  {
    id: '5',
    name: 'كريم محمود عثمان',
    phone: '0122-6789-012',
    childName: 'آدم كريم',
    childAge: 9,
    source: 'WhatsApp',
    stage: 'متابعة',
    notes: 'قال سيفكر، تم إرسال عرض خاص بخصم 10%',
    assignedTo: 'محمد خالد',
    createdAt: '2026-05-18T15:30:00Z',
    value: 2000,
    followUpDate: '2026-06-09',
    courseInterest: 'Scratch',
  },
  {
    id: '6',
    name: 'رانيا فاروق النجار',
    phone: '0106-7890-123',
    childName: 'مريم فاروق',
    childAge: 11,
    source: 'Facebook',
    stage: 'تم التسجيل',
    notes: 'سددت المبلغ كاملاً، كورس Python - تبدأ الأسبوع القادم',
    assignedTo: 'نورا أحمد',
    createdAt: '2026-05-15T09:00:00Z',
    value: 2500,
    followUpDate: null,
    courseInterest: 'Python',
  },
  {
    id: '7',
    name: 'سامي عادل حسين',
    phone: '0111-8901-234',
    childName: 'زياد سامي',
    childAge: 15,
    source: 'Instagram',
    stage: 'تم التسجيل',
    notes: 'مسجل في كورس Web Development المتقدم',
    assignedTo: 'أمير يوسف',
    createdAt: '2026-05-12T13:00:00Z',
    value: 3000,
    followUpDate: null,
    courseInterest: 'Web Development',
  },
  {
    id: '8',
    name: 'ليلى حمدي صالح',
    phone: '0109-9012-345',
    childName: 'كريم حمدي',
    childAge: 7,
    source: 'Referral',
    stage: 'لم يتم',
    notes: 'السعر كان غالي عليهم في الوقت الحالي، يمكن المتابعة بعد 3 أشهر',
    assignedTo: 'سارة عبد الله',
    createdAt: '2026-05-10T10:00:00Z',
    value: 1500,
    followUpDate: '2026-09-01',
    courseInterest: 'Scratch',
  },
  {
    id: '9',
    name: 'عمرو جمال الدين',
    phone: '0128-0123-456',
    childName: 'سلمى عمرو',
    childAge: 13,
    source: 'Website',
    stage: 'جديد',
    notes: 'ملأت استمارة الموقع، مهتمة بكورس Robotics',
    assignedTo: 'أمير يوسف',
    createdAt: '2026-06-07T16:00:00Z',
    value: 3000,
    followUpDate: '2026-06-10',
    courseInterest: 'Robotics',
  },
  {
    id: '10',
    name: 'داليا وائل منصور',
    phone: '0103-1234-567',
    childName: 'تامر وائل',
    childAge: 16,
    source: 'Facebook',
    stage: 'تم التواصل',
    notes: 'كلمناه وكان متحمس جداً، ولده يحب الحاسبات كتير',
    assignedTo: 'محمد خالد',
    createdAt: '2026-06-05T11:00:00Z',
    value: 2800,
    followUpDate: '2026-06-12',
    courseInterest: 'Python',
  },
]

const initialTemplates = [
  {
    id: 't1',
    name: 'رسالة الترحيب الأولى',
    category: 'ترحيب',
    content: `السلام عليكم ورحمة الله وبركاته 🌟

أهلاً {اسم_الوالد}،

شكراً جزيلاً على اهتمامك ببرامج بنيان التعليمية لتعلم البرمجة للأطفال.

يسعدنا أن نخبرك أن طفلك {اسم_الطفل} ({عمر_الطفل} سنوات) في العمر المثالي لبدء رحلته مع عالم التكنولوجيا والبرمجة! 🚀

في بنيان، نؤمن أن كل طفل يمكنه التعلم بالطريقة الصحيحة والممتعة.

هل تودّ أن نرسل لك تفاصيل البرامج المتاحة؟`,
  },
  {
    id: 't2',
    name: 'تأكيد الموعد',
    category: 'موعد',
    content: `مرحباً {اسم_الوالد} 😊

نذكّركم بالجلسة التجريبية المجانية المحجوزة لطفلكم {اسم_الطفل}:

📅 التاريخ: {التاريخ}
⏰ الوقت: {الوقت}
💻 الكورس: {اسم_الكورس}

الجلسة التجريبية مجانية تماماً وستعطيكم فكرة شاملة عن أسلوب التدريس.

يرجى التأكيد بكلمة "تأكيد" للاحتفاظ بالموعد.

نتطلع لرؤيتكم! 🌟`,
  },
  {
    id: 't3',
    name: 'رسالة بعد الـ Demo',
    category: 'متابعة',
    content: `السلام عليكم {اسم_الوالد} 🌺

نتمنى أن الجلسة التجريبية لطفلكم {اسم_الطفل} قد أعجبته وأعجبتكم!

كان من الرائع أن نرى حماسه وتفاعله مع المحتوى. هذا يوضح أن لديه الاستعداد والموهبة للتميز في عالم البرمجة 💡

للتسجيل في كورس {اسم_الكورس}، الخطوة التالية بسيطة جداً. هل لديك أي استفسارات؟

نحن هنا دائماً لمساعدتك 😊`,
  },
  {
    id: 't4',
    name: 'متابعة بعد يومين',
    category: 'متابعة',
    content: `أهلاً {اسم_الوالد} 👋

أردت فقط أن أطمئن عليكم وأعرف إذا كان عندكم أي تساؤلات بعد جلسة {اسم_الطفل} التجريبية.

كثيراً من الأهل يسألوننا عن:
✅ هل البرمجة مناسبة لعمر طفلهم؟
✅ كم تستغرق الكورسات؟
✅ ما الفرق بين الكورسات؟

أنا هنا للإجابة على أي سؤال 🙂

ما رأيك في {اسم_الطفل}، هل كان متحمساً؟`,
  },
  {
    id: 't5',
    name: 'عرض خاص',
    category: 'عروض',
    content: `🎉 عرض خاص لـ {اسم_الوالد}!

بمناسبة اهتمامكم ببرامج بنيان، يسعدنا تقديم عرض حصري لطفلكم {اسم_الطفل}:

🔥 خصم 15% على كورس {اسم_الكورس}
🎁 جلسة متابعة مجانية إضافية
⏳ العرض ساري حتى: {التاريخ}

لا تفوّت هذه الفرصة لمنح طفلك أفضل بداية في عالم التكنولوجيا!

للتسجيل الآن، رد بـ "نعم" وسنكمل الإجراءات فوراً 🚀`,
  },
  {
    id: 't6',
    name: 'رسالة الوالدين المهتمين',
    category: 'ترحيب',
    content: `السلام عليكم {اسم_الوالد} 🌟

شكراً على اهتمامك ببرامج بنيان لتعليم البرمجة!

🎯 لماذا بنيان مختلفة؟
• مناهج مصممة خصيصاً للأطفال العرب
• مدربون متخصصون وذوو خبرة
• بيئة تعلم ممتعة وتفاعلية
• شهادات معتمدة دولياً
• فصول صغيرة (لا تزيد عن 8 طلاب)

طفلكم {اسم_الطفل} في عمر {عمر_الطفل} سنوات - الوقت المثالي!

هل تريد جدولة جلسة تجريبية مجانية؟`,
  },
  {
    id: 't7',
    name: 'تذكير بالجلسة التجريبية',
    category: 'موعد',
    content: `تذكير 🔔

{اسم_الوالد}، جلستكم التجريبية غداً!

📅 {التاريخ} الساعة {الوقت}
👦 للطفل: {اسم_الطفل}
💻 الكورس: {اسم_الكورس}

تأكد من:
✅ اتصال إنترنت جيد (إذا أونلاين)
✅ حاسوب أو تابلت جاهز
✅ الطفل مرتاح ومستعد

نتطلع لرؤيتكم! أي استفسار لا تتردد 😊`,
  },
  {
    id: 't8',
    name: 'رسالة التسجيل النهائي',
    category: 'تسجيل',
    content: `🎉 مبروك {اسم_الوالد}!

تم تسجيل {اسم_الطفل} بنجاح في كورس {اسم_الكورس} مع بنيان! 🚀

التفاصيل:
📅 بداية الكورس: {التاريخ}
⏰ الوقت: {الوقت}
💻 رابط الجلسة سيُرسل قبل 30 دقيقة

سيصلكم قريباً:
✅ تأكيد التسجيل عبر الإيميل
✅ المواد التعليمية الأولية
✅ رابط مجموعة أولياء الأمور

نحن متحمسون لرحلة {اسم_الطفل} مع البرمجة! 💡`,
  },
]

const initialKpis = {
  reps: [
    {
      id: 'r1',
      name: 'سارة عبد الله',
      avatar: 'سع',
      monthly: { leads: 18, conversions: 7, revenue: 16500, calls: 45 },
      weekly: { leads: 5, conversions: 2, revenue: 4500, calls: 12 },
      quarterly: { leads: 52, conversions: 21, revenue: 51000, calls: 130 },
    },
    {
      id: 'r2',
      name: 'محمد خالد',
      avatar: 'مخ',
      monthly: { leads: 15, conversions: 5, revenue: 13000, calls: 38 },
      weekly: { leads: 4, conversions: 1, revenue: 2800, calls: 10 },
      quarterly: { leads: 44, conversions: 16, revenue: 40000, calls: 112 },
    },
    {
      id: 'r3',
      name: 'نورا أحمد',
      avatar: 'نأ',
      monthly: { leads: 20, conversions: 9, revenue: 22000, calls: 52 },
      weekly: { leads: 6, conversions: 3, revenue: 7200, calls: 14 },
      quarterly: { leads: 58, conversions: 26, revenue: 64000, calls: 148 },
    },
    {
      id: 'r4',
      name: 'أمير يوسف',
      avatar: 'أي',
      monthly: { leads: 12, conversions: 4, revenue: 10500, calls: 30 },
      weekly: { leads: 3, conversions: 1, revenue: 2500, calls: 8 },
      quarterly: { leads: 36, conversions: 12, revenue: 31500, calls: 90 },
    },
  ],
  chartData: [
    { month: 'يناير', سارة: 5, محمد: 3, نورا: 6, أمير: 2 },
    { month: 'فبراير', سارة: 6, محمد: 4, نورا: 7, أمير: 3 },
    { month: 'مارس', سارة: 5, محمد: 5, نورا: 8, أمير: 4 },
    { month: 'أبريل', سارة: 7, محمد: 4, نورا: 9, أمير: 3 },
    { month: 'مايو', سارة: 8, محمد: 6, نورا: 10, أمير: 4 },
    { month: 'يونيو', سارة: 7, محمد: 5, نورا: 9, أمير: 4 },
  ],
}

const initialActivities = [
  { id: 'a1', type: 'call', leadId: '1', leadName: 'أحمد محمد السيد', description: 'اتصال أول - الأب مهتم جداً', rep: 'سارة عبد الله', createdAt: '2026-06-09T09:30:00Z' },
  { id: 'a2', type: 'whatsapp', leadId: '2', leadName: 'منى حسن إبراهيم', description: 'إرسال تفاصيل كورس Scratch', rep: 'محمد خالد', createdAt: '2026-06-09T10:00:00Z' },
  { id: 'a3', type: 'stage_change', leadId: '3', leadName: 'طارق عبد الرحمن', description: 'تم حجز موعد تجريبي يوم الجمعة', rep: 'نورا أحمد', createdAt: '2026-06-09T11:00:00Z' },
  { id: 'a4', type: 'note', leadId: '4', leadName: 'هدى سمير علي', description: 'الأم تريد التفكير مع الزوج', rep: 'سارة عبد الله', createdAt: '2026-06-08T14:00:00Z' },
  { id: 'a5', type: 'enrollment', leadId: '6', leadName: 'رانيا فاروق النجار', description: 'تم التسجيل ودفع المبلغ كاملاً 🎉', rep: 'نورا أحمد', createdAt: '2026-06-07T16:00:00Z' },
  { id: 'a6', type: 'call', leadId: '5', leadName: 'كريم محمود عثمان', description: 'متابعة - ما زال يفكر', rep: 'محمد خالد', createdAt: '2026-06-07T12:00:00Z' },
]

const useStore = create(
  persist(
    (set, get) => ({
      leads: initialLeads,
      templates: initialTemplates,
      kpis: initialKpis,
      activities: initialActivities,

      addLead: (lead) => {
        const newLead = { ...lead, id: Date.now().toString(), createdAt: new Date().toISOString() }
        set((state) => ({ leads: [newLead, ...state.leads] }))
        get().addActivity({ type: 'new_lead', leadId: newLead.id, leadName: newLead.name, description: 'تم إضافة عميل جديد', rep: newLead.assignedTo })
      },

      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }))
      },

      deleteLead: (id) => {
        set((state) => ({ leads: state.leads.filter((l) => l.id !== id) }))
      },

      moveLead: (id, newStage) => {
        const lead = get().leads.find((l) => l.id === id)
        if (lead) {
          set((state) => ({
            leads: state.leads.map((l) => (l.id === id ? { ...l, stage: newStage } : l)),
          }))
          get().addActivity({ type: 'stage_change', leadId: id, leadName: lead.name, description: `تم نقل إلى مرحلة: ${newStage}`, rep: lead.assignedTo })
        }
      },

      addTemplate: (template) => {
        const newTemplate = { ...template, id: 't' + Date.now() }
        set((state) => ({ templates: [newTemplate, ...state.templates] }))
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }))
      },

      addActivity: (activity) => {
        const newActivity = { ...activity, id: 'a' + Date.now(), createdAt: new Date().toISOString() }
        set((state) => ({ activities: [newActivity, ...state.activities.slice(0, 49)] }))
      },
    }),
    { name: 'bonyan-crm-storage' }
  )
)

export default useStore
