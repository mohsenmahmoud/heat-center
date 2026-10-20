/**
 * Demo mode (MOCK_AI=true): deterministic, on-brand content without calling any API.
 * Lets you try the whole UI and the render pipeline before adding a Claude key; also used by tests.
 */
const T = {
  ar: {
    title: (t) => `قدرة: ${t}`,
    scenes: (t) => [
      { type: 'hook', headline: 'آخر الشهر… وأنت تجمع الحضور من 6 جروبات واتساب؟', subtext: t, bullets: [], stockQuery: 'stressed office manager paperwork', transition: 'fade' },
      { type: 'pain', headline: 'إكسل، ورق، ورسائل متفرقة', subtext: 'ولا أحد يعرف بدقة من دفع القسط ومن تأخر.', bullets: ['حضور يدوي', 'أقساط بلا متابعة', 'شهادات تأخذ يوماً كاملاً'], stockQuery: 'messy desk spreadsheets', transition: 'slide' },
      { type: 'solution', headline: 'قُدرة: كل عمليات التدريب في منصة واحدة', subtext: 'الحضور والأقساط والشهادات في مكان واحد.', bullets: [], stockQuery: 'modern training center classroom', transition: 'wipe' },
      { type: 'feature', headline: 'تذكير تلقائي بكل قسط', subtext: 'جدول تحصيل واضح: من دفع، ومن تأخر، وكم المتبقي.', bullets: ['جدول التحصيل', 'إشعارات للطلاب', 'تقارير مالية'], stockQuery: 'finance dashboard laptop', transition: 'slide' },
      { type: 'feature', headline: 'شهادات بضغطة واحدة', subtext: 'قوالب جاهزة تصدر لكل الدفعة دفعة واحدة.', bullets: [], stockQuery: 'certificate graduation', transition: 'flip' },
      { type: 'proof', headline: 'قبل قدرة: يومان لتقرير الشهر', subtext: 'مع قدرة: التقرير جاهز وقت ما تحتاجه.', bullets: [], stockQuery: 'business owner smiling laptop', transition: 'fade' },
      { type: 'cta', headline: 'أكاديميتك تشتغل بنظام', subtext: 'احجز ديمو مجاني وشاهد قدرة على بيانات مثل بياناتك.', bullets: [], stockQuery: '', transition: 'fade' },
    ],
    cta: { headline: 'احجز ديمو مجاني', button: 'احجز الآن' },
    caption: 'أكاديميتك تستحق نظاماً، لا جروبات واتساب. شاهد كيف تجمع قدرة الحضور والأقساط والشهادات في منصة واحدة.',
    hashtags: ['#قدرة', '#إدارة_التدريب', '#مراكز_التدريب'],
    post: (pillar, platform, i) => ({
      hook: [
        'لو الموظفة اللي ماسكة الإكسل غابت بكرة… هتعرف مين دفع؟',
        'شهادة واحدة = 4 دقائق. 200 طالب = يوم عمل كامل.',
        'كم قسطاً متأخراً لدى أكاديميتك الآن؟',
        'أكاديميتك تكبر؟ الفوضى تكبر معها، إلا لو في نظام.',
        'الإكسل ليس عدوك. لكنه ليس نظام إدارة.',
        'متى رأيت آخر مرة ربح كل برنامج تدريبي على حدة؟',
        'يوم في مركز تدريب يعمل بنظام.',
      ][i % 7],
      caption: `${pillar.ar}: مشهد يعرفه كل صاحب أكاديمية.\nالحضور في جروب، والأقساط في شيت، والشهادات على مكتب الريسبشن.\n\nقدرة تجمع كل ذلك في لوحة تحكم واحدة، وتعرض لك الصورة كاملة اليوم، لا آخر الشهر.`,
      visualIdea: 'فيديو موشن على تدرج قدرة الأخضر، يعرض لوحة التحكم داخل موكاب متصفح.',
      hashtags: ['#قدرة', '#إدارة_التدريب', '#مراكز_التدريب'],
      cta: 'احجز ديمو مجاني',
      format: platform === 'linkedin' ? 'LinkedIn video 9:16' : platform === 'tiktok' ? 'Short 9:16' : 'Reel 9:16',
      bestTime: platform === 'linkedin' ? '09:00' : '20:00',
    }),
  },
  en: {
    title: (t) => `Qudra: ${t}`,
    scenes: (t) => [
      { type: 'hook', headline: 'Month end. Attendance scattered across 6 WhatsApp groups?', subtext: t, bullets: [], stockQuery: 'stressed office manager paperwork', transition: 'fade' },
      { type: 'pain', headline: 'Excel, paper and scattered messages', subtext: 'Nobody knows exactly who paid and who is late.', bullets: ['Manual attendance', 'Untracked installments', 'Certificates take a full day'], stockQuery: 'messy desk spreadsheets', transition: 'slide' },
      { type: 'solution', headline: 'Qudra: all your training operations in one platform', subtext: 'Attendance, installments and certificates in one place.', bullets: [], stockQuery: 'modern training center classroom', transition: 'wipe' },
      { type: 'feature', headline: 'Automatic installment reminders', subtext: 'A clear collection schedule: who paid, who is late, what is left.', bullets: ['Collection schedule', 'Student notifications', 'Financial reports'], stockQuery: 'finance dashboard laptop', transition: 'slide' },
      { type: 'feature', headline: 'Certificates for the whole cohort at once', subtext: 'Ready templates, issued in one go.', bullets: [], stockQuery: 'certificate graduation', transition: 'flip' },
      { type: 'proof', headline: 'Before Qudra: two days for the monthly report', subtext: 'With Qudra: the report is ready when you need it.', bullets: [], stockQuery: 'business owner smiling laptop', transition: 'fade' },
      { type: 'cta', headline: 'Run your academy on a system', subtext: 'Book a free demo and see Qudra on data like yours.', bullets: [], stockQuery: '', transition: 'fade' },
    ],
    cta: { headline: 'Book a free demo', button: 'Book now' },
    caption: 'Your academy deserves a system, not WhatsApp groups. See how Qudra brings attendance, installments and certificates into one platform.',
    hashtags: ['#Qudra', '#TrainingManagement', '#TrainingCenters'],
    post: (pillar, platform, i) => ({
      hook: [
        'If the person who owns the Excel sheet is off tomorrow, who knows who paid?',
        'One certificate = 4 minutes. 200 students = a full working day.',
        'How many installments are overdue at your academy right now?',
        'Your academy is growing. So is the chaos, unless there is a system.',
        'Excel is not your enemy. It is just not a management system.',
        'When did you last see the profit of each program on its own?',
        'A day at a training center that runs on a system.',
      ][i % 7],
      caption: `${pillar.en}: a scene every academy owner knows.\nAttendance in a group chat, installments in a sheet, certificates on the reception desk.\n\nQudra puts it all in one dashboard and shows you the full picture today, not at month end.`,
      visualIdea: 'Motion video on the Qudra green gradient showing the dashboard in a browser mockup.',
      hashtags: ['#Qudra', '#TrainingManagement', '#TrainingCenters'],
      cta: 'Book a free demo',
      format: platform === 'linkedin' ? 'LinkedIn video 9:16' : platform === 'tiktok' ? 'Short 9:16' : 'Reel 9:16',
      bestTime: platform === 'linkedin' ? '09:00' : '20:00',
    }),
  },
};

export function mockScript({ topic, language, reference = null }) {
  const t = T[language];
  if (reference) {
    // Demo of "rebuild this reference": same scenes, types, timing and transitions.
    return {
      title: t.title((topic || '').slice(0, 60)),
      scenes: reference.scenes.map((s) => ({ type: s.type, headline: (s.onScreenText || s.purpose).slice(0, 90), subtext: '', bullets: [], durationSec: s.durationSec, transition: s.transition, stockQuery: '', visualIdea: s.visual, voiceover: s.voiceover })),
      cta: t.cta,
      caption: t.caption,
      hashtags: t.hashtags,
    };
  }
  const shortTopic = (topic || (language === 'ar' ? 'إدارة أكاديميتك' : 'running your academy')).slice(0, 80);
  return {
    title: t.title(shortTopic),
    scenes: t.scenes(shortTopic).map((s) => ({ ...s, durationSec: 7, visualIdea: s.stockQuery, voiceover: [s.headline, s.subtext].filter(Boolean).map((x) => (/[.!?؟…]$/.test(x) ? x : `${x}.`)).join(' ') })),
    cta: t.cta,
    caption: t.caption,
    hashtags: t.hashtags,
  };
}

export function mockPosts({ slots, language }) {
  return slots.map((slot, i) => T[language].post(slot.pillar, slot.platform, i + (slot.seed || 0)));
}
