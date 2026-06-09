import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Lightbulb, Target, Phone, MessageCircle, Shield, HelpCircle } from 'lucide-react'

function AccordionItem({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-right hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Icon size={20} className="text-amber-600" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">{title}</h3>
        </div>
        {open ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-50">{children}</div>}
    </div>
  )
}

function Stage({ name, color, what, how, duration, criteria, next }) {
  return (
    <div className={`rounded-xl p-4 border ${color} mb-3 last:mb-0`}>
      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-current" />
        مرحلة: {name}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="font-medium text-gray-600 mb-1">ماذا تفعل؟</p>
          <p className="text-gray-700">{what}</p>
        </div>
        <div>
          <p className="font-medium text-gray-600 mb-1">كيف؟</p>
          <p className="text-gray-700">{how}</p>
        </div>
        <div>
          <p className="font-medium text-gray-600 mb-1">مدة البقاء في المرحلة</p>
          <p className="text-gray-700 font-medium text-amber-600">{duration}</p>
        </div>
        <div>
          <p className="font-medium text-gray-600 mb-1">معيار الانتقال</p>
          <p className="text-gray-700 text-green-600">{criteria}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="font-medium text-gray-600 mb-1">الخطوة التالية</p>
          <p className="text-gray-700 bg-white rounded-lg px-3 py-1.5">{next}</p>
        </div>
      </div>
    </div>
  )
}

function Objection({ q, a }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-3 last:mb-0">
      <div className="bg-red-50 px-4 py-3 flex items-start gap-2">
        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm font-medium text-red-700">"{q}"</p>
      </div>
      <div className="bg-green-50 px-4 py-3 flex items-start gap-2">
        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-green-800">{a}</p>
      </div>
    </div>
  )
}

export default function Playbook() {
  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
          <span className="text-white font-bold text-xl">ب</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">دليل المبيعات - بنيان</h1>
          <p className="text-gray-500 text-sm">المرجع الكامل لفريق المبيعات</p>
        </div>
      </div>

      <AccordionItem title="نظرة عامة على بنيان" icon={Lightbulb} defaultOpen>
        <div className="mt-4 space-y-4">
          <div className="bg-amber-50 rounded-xl p-4">
            <h4 className="font-bold text-amber-800 mb-2">من نحن؟</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              بنيان هي منصة تعليمية رائدة متخصصة في تعليم البرمجة للأطفال من سن 6 إلى 17 سنة. نقدم كورسات أونلاين وأوفلاين بمناهج عربية مصممة خصيصاً لتناسب عقلية الطفل العربي وتجعل تعلم البرمجة ممتعاً وفعالاً.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-bold text-blue-700 mb-2">الفئة المستهدفة</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• أطفال من 6 إلى 17 سنة</li>
                <li>• أولياء الأمور المهتمون بمستقبل أبنائهم</li>
                <li>• أسر الطبقة المتوسطة والعليا</li>
                <li>• المهتمون بالتكنولوجيا والتعليم الحديث</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-bold text-green-700 mb-2">الكورسات المتاحة</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Scratch (6-9 سنوات) - 1500 ج</li>
                <li>• Python (10-14 سنة) - 2500 ج</li>
                <li>• Web Development (12-17) - 2800 ج</li>
                <li>• Game Design (10-16) - 2500 ج</li>
                <li>• Robotics (8-14) - 3000 ج</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="font-bold text-purple-700 mb-2">🌟 نقاط التميز</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> مناهج عربية حديثة</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> فصول لا تزيد عن 8 طلاب</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> مدربون معتمدون دولياً</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> شهادات معتمدة دولياً</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> جلسة تجريبية مجانية</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> أون لاين وأوف لاين</div>
            </div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem title="خطوات الـ Pipeline بالتفصيل" icon={Target}>
        <div className="mt-4 space-y-3">
          <Stage
            name="جديد"
            color="bg-blue-50 border-blue-200"
            what="أول تواصل مع العميل المحتمل"
            how="اتصل خلال 30 دقيقة من وصول الليد"
            duration="لا تتجاوز 24 ساعة"
            criteria="تم التواصل الأول وإظهار الاهتمام"
            next="انقل إلى 'تم التواصل' وسجل ملاحظات المكالمة"
          />
          <Stage
            name="تم التواصل"
            color="bg-amber-50 border-amber-200"
            what="فهم احتياجات الأسرة وتأهيل العميل"
            how="مكالمة تفصيلية 10-15 دقيقة - اسأل أسئلة التأهيل"
            duration="2-3 أيام"
            criteria="العميل مهتم ويريد معرفة المزيد"
            next="حجز موعد للجلسة التجريبية المجانية"
          />
          <Stage
            name="موعد محجوز"
            color="bg-orange-50 border-orange-200"
            what="التأكيد والتذكير بالموعد"
            how="أرسل رسالة تأكيد فور الحجز + تذكير قبل 24 ساعة"
            duration="حتى يوم الموعد"
            criteria="الحضور الفعلي للجلسة التجريبية"
            next="إجراء الجلسة التجريبية وتقديم العرض"
          />
          <Stage
            name="عرض تقديمي"
            color="bg-purple-50 border-purple-200"
            what="تقديم العرض الكامل وإجابة الأسئلة"
            how="اجعل الطفل يجرب بنفسه، أشرك الوالدين"
            duration="خلال 48 ساعة بعد الجلسة"
            criteria="ولي الأمر يريد التفكير أو يسأل عن التسجيل"
            next="تابع خلال 24 ساعة مع عرض خاص إذا لزم"
          />
          <Stage
            name="متابعة"
            color="bg-cyan-50 border-cyan-200"
            what="الرد على الاعتراضات والتحفيز للتسجيل"
            how="متابعة منتظمة كل يومين، قدم قيمة في كل رسالة"
            duration="لا تتجاوز أسبوع"
            criteria="الموافقة المبدئية على التسجيل"
            next="إتمام إجراءات التسجيل ودفع الرسوم"
          />
          <Stage
            name="تم التسجيل"
            color="bg-green-50 border-green-200"
            what="إتمام التسجيل الرسمي واستقبال الطالب"
            how="أرسل تفاصيل الكورس وأضف لمجموعة الواتساب"
            duration="مستمر"
            criteria="بداية الكورس بنجاح"
            next="متابعة رضا الطالب والوالدين - اطلب التوصية"
          />
        </div>
      </AccordionItem>

      <AccordionItem title="سكريبت المكالمة الأولى" icon={Phone}>
        <div className="mt-4 space-y-4">
          <div className="bg-indigo-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed space-y-3">
            <div className="border-r-4 border-indigo-400 pr-3">
              <p className="font-bold text-indigo-700 mb-1">الافتتاح (30 ثانية)</p>
              <p>"السلام عليكم ورحمة الله، أنا [اسمك] من بنيان للبرمجة. كيف حضرتك/حضرتك بخير؟ شايف إن حضرتك اهتميت بمعرفة المزيد عن برامجنا لتعليم البرمجة للأطفال، صح؟"</p>
            </div>
            <div className="border-r-4 border-amber-400 pr-3">
              <p className="font-bold text-amber-700 mb-1">الاستكشاف (2-3 دقايق)</p>
              <p>"تمام! عشان أقدر أساعدك صح - ممكن أعرف طفلك كامه تقريباً؟ وهل عنده اهتمام بأي حاجة معينة زي الألعاب أو الكمبيوتر؟ وإيه اللي خلاك تهتم بتعليم البرمجة له دلوقتي؟"</p>
            </div>
            <div className="border-r-4 border-green-400 pr-3">
              <p className="font-bold text-green-700 mb-1">تقديم القيمة (2 دقيقة)</p>
              <p>"ممتاز! بناءً على اللي قلته، طفلك في العمر المثالي. في بنيان، بنعلمه [الكورس المناسب] بطريقة ممتعة وتفاعلية. عندنا فصول صغيرة مش أكتر من 8 طلاب، ومدربين متخصصين، وشهادات معتمدة دولياً."</p>
            </div>
            <div className="border-r-4 border-purple-400 pr-3">
              <p className="font-bold text-purple-700 mb-1">الدعوة للعمل (30 ثانية)</p>
              <p>"وعشان تشوف بنفسك - عندنا جلسة تجريبية مجانية تماماً. طفلك هيجرب ويشوف إيه اللي هنعمله. إيه رأيك نعمل موعد للجلسة دي؟ عندي أماكن محدودة الأسبوع الجاي."</p>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="font-bold text-green-700 mb-2">نقاط مهمة في المكالمة:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> ابتسم وأنت بتتكلم - بتنعكس في صوتك</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> استمع أكثر مما تتكلم</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> اذكر اسم الطفل دائماً</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> لا تبدأ بالسعر قبل تقديم القيمة</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> اهدف لحجز موعد، مش البيع المباشر</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> سجل كل ما ذكره ولي الأمر</div>
            </div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem title="التعامل مع الاعتراضات" icon={Shield}>
        <div className="mt-4 space-y-3">
          <Objection
            q="السعر غالي"
            a="أفهم حضرتك تماماً! بس خلينا نفكر فيه كاستثمار. مهارة البرمجة دلوقتي من أهم المهارات اللي ممكن تديها لطفلك. والكورس عنده شهادة دولية، ممكن تفيده في المستقبل في الجامعة والشغل. وعندنا نظام سداد مريح كمان. يعني التكلفة اليومية أقل من كوباية قهوة."
          />
          <Objection
            q="هفكر وأرد عليك"
            a="أكيد! بس خليني أسألك سؤال - إيه اللي محتاج تفكر فيه بالظبط؟ عشان ممكن أساعدك في اتخاذ القرار دلوقتي. لو الموضوع السعر، عندنا عروض خاصة. لو الوقت، عندنا مواعيد مرنة. الأماكن المتاحة محدودة وعارف قد إيه الطلب عالي."
          />
          <Objection
            q="الطفل مش مهتم بالبرمجة"
            a="ده طبيعي جداً! معظم الأطفال عندنا ما كانوش عارفين إن البرمجة دي حاجة ممتعة. إحنا بنعلم بطريقة الألعاب والمشاريع اللي بيحبها الأطفال. معظم أطفالنا بيبهروا أهلهم في أول أسبوع! ليه مش بنجرب الجلسة التجريبية المجانية ونشوف؟"
          />
          <Objection
            q="عندنا مناهج تانية"
            a="ده شيء رائع إن حضرتك مهتم بتعليم ولدك! بس خليني أوضحلك الفرق. معظم المناهج التانية مش متخصصة في البرمجة أو مش مناسبة لعمر طفلك. إحنا متخصصين 100% وعندنا 3 سنين خبرة وآلاف الطلاب. والجلسة التجريبية هتخليك تقارن بنفسك."
          />
          <Objection
            q="مش وقته دلوقتي"
            a="بفهم حضرتك! بس ممكن أقولك إن كل شهر بيأخر فيه طفلك بيتأخر على منافسيه. سوق التكنولوجيا محتاج مهارات البرمجة من سن صغير. والكورسات عندنا مرنة وهتتناسب مع جدول طفلك ومدرسته. نبدأ بالجلسة التجريبية المجانية وتشوف؟"
          />
        </div>
      </AccordionItem>

      <AccordionItem title="أسئلة التأهيل" icon={HelpCircle}>
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-4">اسأل هذه الأسئلة في أول مكالمة لتفهم العميل وتخصيص عرضك:</p>
          <div className="space-y-3">
            {[
              { q: 'كم عمر الطفل؟', why: 'لتحديد الكورس المناسب' },
              { q: 'هل عنده اهتمامات معينة (ألعاب، رسم، رياضة)؟', why: 'لاختيار المسار الصح' },
              { q: 'هل سبق له تجربة أي نشاط تعليمي إضافي؟', why: 'لمعرفة مدى الانضباط' },
              { q: 'إيه هدفك من تعليمه البرمجة؟', why: 'لمعرفة دوافع الشراء' },
              { q: 'كام ساعة في الأسبوع ممكن يخصص للكورس؟', why: 'لاختيار الباقة المناسبة' },
              { q: 'هل تفضل أونلاين ولا أوفلاين؟', why: 'لتحديد نوع الكورس' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                <span className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.q}</p>
                  <p className="text-xs text-gray-500 mt-0.5">الهدف: {item.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AccordionItem>

      <AccordionItem title="نظام المتابعة (Follow-up)" icon={MessageCircle}>
        <div className="mt-4 space-y-4">
          <div className="bg-amber-50 rounded-xl p-4">
            <h4 className="font-bold text-amber-700 mb-3">جدول المتابعة المثالي:</h4>
            <div className="space-y-3">
              {[
                { day: 'فور وصول الليد', action: 'اتصال أول خلال 30 دقيقة', icon: '📞' },
                { day: 'نفس اليوم (مساءً)', action: 'واتساب: رسالة ترحيب + معلومات الكورس', icon: '💬' },
                { day: 'اليوم التالي', action: 'متابعة لو ما ردش - جرب في وقت مختلف', icon: '🔄' },
                { day: 'بعد الجلسة التجريبية', action: 'رسالة فورية + اتصال خلال ساعتين', icon: '⭐' },
                { day: '48 ساعة بعد العرض', action: 'عرض خاص لو لم يسجل بعد', icon: '🎁' },
                { day: 'أسبوع من المتابعة', action: 'قرار نهائي - لو لأ، حدد سبب وسجل', icon: '📋' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3 text-sm">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-amber-700">{item.day}</p>
                    <p className="text-gray-600">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-bold text-blue-700 mb-2">قاعدة الـ 3 - 7 - 30:</h4>
            <p className="text-sm text-gray-700">
              لو العميل مش مستجيب، جرب 3 مكالمات في 7 أيام. لو ما ردش، ابعت رسالة واتساب وانتظر. بعد 30 يوم، جرب مرة تانية مع محتوى جديد.
            </p>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem title="Do's & Don'ts - قواعد الفريق" icon={CheckCircle}>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2"><CheckCircle size={16} /> افعل دائماً</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'سجل كل تفاعل في الـ CRM فوراً',
                'اتصل خلال 30 دقيقة من وصول الليد',
                'اذكر اسم الطفل في كل رسالة',
                'قدم قيمة في كل تواصل',
                'احترم وقت العميل',
                'اسأل عن سبب الرفض دائماً',
                'شكر العميل على وقته حتى لو رفض',
                'اطلب التوصية من المسجلين',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2"><XCircle size={16} /> لا تفعل أبداً</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'لا تذكر السعر قبل تقديم القيمة',
                'لا تضغط على العميل بشكل مفرط',
                'لا تترك ليد بدون متابعة أكثر من 24 ساعة',
                'لا تعد بما لا تستطيع تقديمه',
                'لا تتحدث بشكل سلبي عن المنافسين',
                'لا تتجاهل الاعتراضات - عالجها',
                'لا تنسى تحديث المرحلة في الـ CRM',
                'لا تستسلم بعد أول رفض',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AccordionItem>
    </div>
  )
}
