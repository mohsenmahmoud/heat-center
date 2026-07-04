// Prefixes public-folder asset paths with Vite's base URL (e.g. '/heat-center/'
// on GitHub Pages) so they resolve correctly regardless of deploy path.
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export const siteConfig = {
  name: 'هيت سنتر',
  nameEn: 'Heat Center',
  tagline: 'أفضل حلول التدفئة المركزية في مصر',
  phone: '+20 100 000 0000',
  phoneDisplay: '01000000000',
  whatsapp: '201020014249',
  email: 'info@heat-center.com',
  address: 'القاهرة الجديدة، جمهورية مصر العربية',
  workHours: 'يوميًا من 9 صباحًا حتى 8 مساءً',
  social: {
    facebook: 'https://www.facebook.com/Heatcenter1/',
    instagram: '#',
    whatsapp: 'https://wa.me/201020014249',
    linkedin: '#',
  },
}

export const navLinks = [
  { label: 'الرئيسية', href: '/' },
  { label: 'من نحن', href: '/about' },
  { label: 'خدماتنا', href: '/services' },
  { label: 'أعمالنا', href: '/projects' },
  { label: 'معرض الصور', href: '/gallery' },
  { label: 'الأسئلة الشائعة', href: '/faq' },
  { label: 'تواصل معنا', href: '/contact' },
]

export const stats = [
  { value: 8, suffix: '+', label: 'سنوات خبرة' },
  { value: 250, suffix: '+', label: 'مشروع منجز' },
  { value: 700, suffix: '+', label: 'عميل راضٍ' },
  { value: 40, suffix: '+', label: 'كمباوند وفيلا' },
]

export type ServiceId =
  | 'central-heating'
  | 'underfloor-heating'
  | 'central-boilers'
  | 'solar-heaters'
  | 'instant-heaters'
  | 'pool-heating'
  | 'plumbing'
  | 'solar-energy'

export interface Service {
  id: ServiceId
  icon: 'flame' | 'waves' | 'droplet' | 'sun' | 'instant' | 'pool' | 'pipe' | 'panel'
  title: string
  short: string
  description: string
  features: string[]
  accent: 'ember' | 'aqua'
  image: string
}

const centralHeatingServices: Service[] = [
  {
    id: 'central-heating',
    icon: 'flame',
    title: 'تدفئة حائطية',
    short: 'دفء متجانس في كل ركن من المنزل، بلا ضوضاء وبلا روائح احتراق داخلية.',
    description:
      'نصمم وننفذ شبكة تدفئة مركزية متكاملة تعتمد على الماء الساخن كوسيط لنقل الحرارة، وهي الطريقة الأعلى كفاءة عالميًا للحصول على دفء ثابت في جميع الغرف من مصدر واحد. نحدد لك أفضل توزيع للرادياتير الحائطي حسب مساحة ومعمارية كل غرفة، باستخدام رادياتير من الألومنيوم النقي أو الستانلس ستيل المعالج ضد الصدأ بتصميمات عصرية تتناسب مع ديكور منزلك.',
    features: [
      'رادياتير حائطي بتصميمات أنيقة من ألومنيوم نقي أو ستانلس ستيل',
      'توزيع حراري مدروس هندسيًا لكل غرفة على حدة',
      'تشغيل هادئ تمامًا بلا أصوات أو روائح احتراق',
      'مقاومة كاملة للصدأ وعمر تشغيلي طويل',
    ],
    accent: 'ember',
    image: asset('images/services/central-heating.svg'),
  },
  {
    id: 'underfloor-heating',
    icon: 'waves',
    title: 'تدفئة أرضية',
    short: 'حرارة تنبعث من الأرض بالتساوي دون الحاجة لأي وحدات ظاهرة على الحوائط.',
    description:
      'نظام تدفئة مخفي بالكامل داخل الأرضية باستخدام مواسير عالية الجودة موزّعة بدقة هندسية، ما يمنحك توزيعًا متجانسًا للحرارة من أسفل لأعلى بكفاءة عالية وتوفير ملحوظ في استهلاك الطاقة، مع الحفاظ على مساحات الجدران فارغة تمامًا لحرية أكبر في التصميم الداخلي.',
    features: [
      'مواسير أوروبية عالية الجودة معتمدة لأنظمة التدفئة الأرضية',
      'توزيع حراري متجانس فى كامل مساحة الغرفة',
      'كفاءة أعلى فى استهلاك الطاقة مقارنة بالأنظمة التقليدية',
      'لا تشغل أي مساحة ظاهرة، مثالية للتصميمات المفتوحة',
    ],
    accent: 'ember',
    image: asset('images/services/underfloor-heating.svg'),
  },
]

const centralHeatingSourceServices: Service[] = [
  {
    id: 'central-boilers',
    icon: 'droplet',
    title: 'غلايات مركزية بالغاز الطبيعي',
    short: 'مياه ساخنة فورية ومستمرة على مدار اليوم لكل نقاط الاستخدام في المبنى.',
    description:
      'نوفر ونركب غلايات مركزية تعمل بالغاز الطبيعي بأحجام وقدرات تناسب الشقق والفلل والمنشآت الكبيرة والفنادق، لتأمين مياه ساخنة فورية ومستمرة دون انتظار ودون تفاوت في درجة الحرارة بين نقاط الاستخدام المختلفة، مع كفاءة احتراق عالية توفر في استهلاك الغاز.',
    features: [
      'تعمل بالغاز الطبيعي بكفاءة احتراق عالية',
      'مياه ساخنة فورية ومستمرة لجميع نقاط الاستخدام',
      'قدرات متعددة تناسب الشقق والفلل والمنشآت الكبيرة',
      'أنظمة تحكم ذكية لضبط درجة الحرارة',
    ],
    accent: 'ember',
    image: asset('images/services/central-boilers.svg'),
  },
  {
    id: 'solar-heaters',
    icon: 'sun',
    title: 'سخانات شمسية',
    short: 'وفّر حتى 89% من فاتورة الكهرباء بسخان شمسي عمره الافتراضي يتجاوز 20 عامًا.',
    description:
      'نقدم سخانات شمسية أوروبية الصنع بسعات تبدأ من 150 لترًا وحتى الأحجام الكبيرة للمنشآت، مصممة لتحويل أشعة الشمس الوفيرة في مصر إلى مياه ساخنة مجانًا طوال العام. توفر حتى 89% من استهلاك الكهرباء المخصص لتسخين المياه، بعمر افتراضي يتجاوز 20 عامًا وصيانة شبه معدومة.',
    features: [
      'سعات متعددة تبدأ من 150 لتر وحتى المشاريع الكبيرة',
      'توفير يصل إلى 89% من استهلاك الكهرباء',
      'عمر افتراضي يتجاوز 20 عامًا',
      'حل مثالي لمناخ مصر المشمس على مدار العام',
    ],
    accent: 'ember',
    image: asset('images/services/solar-heaters.svg'),
  },
  {
    id: 'instant-heaters',
    icon: 'instant',
    title: 'سخانات مركزية فورية للأماكن المتوسطة أو الصغيرة',
    short: 'مياه ساخنة فورية بوحدة مدمجة الحجم، حل عملي واقتصادي للشقق والمساحات الصغيرة.',
    description:
      'نوفر سخانات مركزية فورية مدمجة الحجم تناسب الشقق والمساحات المتوسطة والصغيرة التي لا تحتاج إلى غلاية مركزية كاملة، فتؤمن مياه ساخنة فورية لنقاط الاستخدام المختلفة بتكلفة تركيب أقل ووقت تنفيذ أسرع، مع نفس معايير الجودة والسلامة فى التشغيل.',
    features: [
      'وحدة مدمجة الحجم مناسبة للشقق والمساحات الصغيرة',
      'تكلفة تركيب أقل ووقت تنفيذ أسرع من الغلايات الكبيرة',
      'مياه ساخنة فورية دون الحاجة للانتظار',
      'حل اقتصادي بنفس معايير الجودة والسلامة',
    ],
    accent: 'ember',
    image: asset('images/services/instant-heaters.svg'),
  },
]

const poolHeatingServices: Service[] = [
  {
    id: 'pool-heating',
    icon: 'pool',
    title: 'تسخين حمامات السباحة',
    short: 'استمتع بحمام السباحة طوال العام بأنظمة تسخين تعمل بالغاز أو الكهرباء أو الطاقة الشمسية.',
    description:
      'نصمم أنظمة تسخين متكاملة لحمامات السباحة الخاصة والعامة تعمل بالغاز أو الكهرباء أو الديزل الشمسي حسب احتياج المشروع وميزانيته، لإطالة موسم الاستخدام والاستمتاع بالمسبح في الشتاء بدرجة حرارة مثالية وآمنة.',
    features: [
      'خيارات متعددة: غاز، كهرباء، أو ديزل شمسي',
      'مناسبة للمسابح الخاصة والفندقية والنوادي',
      'تحكم دقيق فى درجة حرارة المياه',
      'إطالة موسم استخدام المسبح على مدار العام',
    ],
    accent: 'aqua',
    image: asset('images/services/pool-heating.svg'),
  },
]

const plumbingServices: Service[] = [
  {
    id: 'plumbing',
    icon: 'pipe',
    title: 'أعمال السباكة والتأسيس',
    short: 'تأسيس صحي وسباكة بمعايير أوروبية باستخدام مواسير البولي إيثيلين عالية الجودة.',
    description:
      'ننفذ أعمال التأسيس الصحي والسباكة الكاملة للمشروعات السكنية والتجارية باستخدام مواسير البولي إيثيلين المعتمدة أوروبيًا، بما يضمن عمرًا افتراضيًا طويلًا ومقاومة كاملة للتسريب والتآكل، مع إشراف هندسي كامل من التصميم وحتى التسليم.',
    features: [
      'تأسيس بمواسير البولي إيثيلين المعتمدة أوروبيًا',
      'مقاومة كاملة للتسريب والتآكل',
      'إشراف هندسي من التصميم وحتى التسليم النهائي',
      'يناسب المشروعات السكنية والتجارية على حد سواء',
    ],
    accent: 'aqua',
    image: asset('images/services/plumbing.svg'),
  },
]

const solarEnergyServices: Service[] = [
  {
    id: 'solar-energy',
    icon: 'panel',
    title: 'حلول الطاقة الشمسية',
    short: 'استثمر في الطاقة النظيفة وقلّل فاتورتك الكهربائية بحلول شمسية متكاملة.',
    description:
      'إلى جانب السخانات الشمسية، نقدم استشارات وحلول للطاقة الشمسية التكميلية التي تخفض الاعتماد على الشبكة الكهربائية، وتتكامل بسلاسة مع أنظمة التدفئة والتسخين التي ننفذها لتحقيق أعلى كفاءة وأقل تكلفة تشغيل على المدى الطويل.',
    features: [
      'استشارات فنية لدمج الطاقة الشمسية مع أنظمة التدفئة',
      'خفض الاعتماد على الشبكة الكهربائية',
      'عائد استثماري ملموس على المدى المتوسط والطويل',
      'حلول مصممة خصيصًا حسب طبيعة كل مشروع',
    ],
    accent: 'ember',
    image: asset('images/services/solar-energy.svg'),
  },
]

export interface ServiceCategory {
  id: string
  title: string
  icon: Service['icon']
  accent: 'ember' | 'aqua'
  subServices: Service[]
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'central-heating-category',
    title: 'التدفئة المركزية',
    icon: 'flame',
    accent: 'ember',
    subServices: centralHeatingServices,
  },
  {
    id: 'central-water-heating-category',
    title: 'التسخين المركزي',
    icon: 'droplet',
    accent: 'ember',
    subServices: centralHeatingSourceServices,
  },
  {
    id: 'pool-heating-category',
    title: 'تسخين حمامات السباحة',
    icon: 'pool',
    accent: 'aqua',
    subServices: poolHeatingServices,
  },
  {
    id: 'plumbing-category',
    title: 'أعمال السباكة والتأسيس',
    icon: 'pipe',
    accent: 'aqua',
    subServices: plumbingServices,
  },
  {
    id: 'solar-energy-category',
    title: 'حلول الطاقة الشمسية',
    icon: 'panel',
    accent: 'ember',
    subServices: solarEnergyServices,
  },
]

export const services: Service[] = serviceCategories.flatMap((c) => c.subServices)

// Real project photos go here per category — just append more paths to each
// array (e.g. '/images/gallery/central-heating/1.jpg') as they become available.
export const galleryImages: Record<ServiceId, string[]> = {
  'central-heating': [asset('images/services/central-heating.svg')],
  'underfloor-heating': [asset('images/services/underfloor-heating.svg')],
  'central-boilers': [asset('images/services/central-boilers.svg')],
  'solar-heaters': [asset('images/services/solar-heaters.svg')],
  'instant-heaters': [asset('images/services/instant-heaters.svg')],
  'pool-heating': [asset('images/services/pool-heating.svg')],
  plumbing: [asset('images/services/plumbing.svg')],
  'solar-energy': [asset('images/services/solar-energy.svg')],
}

export const whyUs = [
  {
    title: '8 سنوات خبرة و250+ مشروع',
    description: 'رصيد حقيقي من المشروعات المنفذة فى أكثر من 40 كمباوند وفيلا ومنشأة.',
  },
  {
    title: 'معدات أوروبية أصلية',
    description: 'نتعامل حصريًا مع معدات وماركات عالمية موثوقة تضمن أداءً طويل الأمد.',
  },
  {
    title: 'فريق هندسي متخصص',
    description: 'مهندسون وفنيون مدربون على أحدث معايير التصميم والتركيب العالمية.',
  },
  {
    title: 'تصميم مخصص لكل مساحة',
    description: 'لا حلول جاهزة؛ كل مشروع يبدأ بمعاينة دقيقة وتصميم هندسي مخصص.',
  },
  {
    title: 'توفير حقيقي فى الطاقة',
    description: 'حتى 89% توفير فى استهلاك الكهرباء مع أنظمتنا الشمسية.',
  },
  {
    title: 'خدمة ما بعد البيع',
    description: 'متابعة دورية وصيانة مستمرة لضمان أداء الأنظمة لأطول فترة ممكنة.',
  },
]

export const process = [
  {
    step: '01',
    title: 'معاينة ميدانية مجانية',
    description: 'يزورك فريقنا الهندسي لدراسة المساحة وفهم احتياجاتك الفعلية دون أي التزام.',
  },
  {
    step: '02',
    title: 'تصميم هندسي مخصص',
    description: 'نضع تصميمًا تفصيليًا لتوزيع الأنظمة يراعي معمارية المكان وكفاءة الطاقة.',
  },
  {
    step: '03',
    title: 'توريد وتركيب احترافي',
    description: 'توريد المعدات الأصلية وتنفيذ التركيب بأيدي فنيين متخصصين وفق الجدول الزمني المتفق عليه.',
  },
  {
    step: '04',
    title: 'تشغيل تجريبي وتسليم',
    description: 'اختبار شامل للنظام والتأكد من كفاءته قبل التسليم النهائي وتدريبك على الاستخدام.',
  },
  {
    step: '05',
    title: 'متابعة وصيانة دورية',
    description: 'خطط صيانة دورية اختيارية للحفاظ على أداء النظام لأطول فترة ممكنة.',
  },
]

export const projectTypes = [
  {
    title: 'فلل خاصة',
    description: 'أنظمة تدفئة وتسخين مخصصة تراعي خصوصية وتصميم كل فيلا.',
    image: asset('images/project-types/villa.svg'),
  },
  {
    title: 'كمباوندات سكنية',
    description: 'حلول تدفئة متكاملة لأكثر من 40 كمباوند بمعايير تنفيذ موحدة وجودة عالية.',
    image: asset('images/project-types/compound.svg'),
  },
  {
    title: 'فنادق ومنشآت سياحية',
    description: 'أنظمة تسخين مياه وتدفئة بقدرات كبيرة تلبي احتياج الضيافة على مدار الساعة.',
    image: asset('images/project-types/hotel.svg'),
  },
  {
    title: 'مبانٍ إدارية وتجارية',
    description: 'تصميم وتنفيذ أنظمة تدفئة مركزية للمكاتب والمنشآت التجارية.',
    image: asset('images/project-types/office.svg'),
  },
]

export interface CaseStudy {
  title: string
  projectType: string
  location: string
  scope: string
  serviceId: ServiceId
  image: string
}

// Placeholder project cards — swap `image` with a real project photo and
// update title/location/scope once client details are ready to publish.
export const caseStudies: CaseStudy[] = [
  {
    title: 'مشروع فيلا خاصة',
    projectType: 'فلل خاصة',
    location: 'القاهرة الكبرى',
    scope: 'تصميم وتركيب شبكة تدفئة مركزية بالمياه الساخنة ورادياتير حائطي لكامل الفيلا.',
    serviceId: 'central-heating',
    image: asset('images/services/central-heating.svg'),
  },
  {
    title: 'مشروع كمباوند سكني',
    projectType: 'كمباوندات سكنية',
    location: 'القاهرة الكبرى',
    scope: 'تنفيذ نظام تدفئة أرضية موحّد لعدد من الوحدات السكنية بنفس معايير الجودة.',
    serviceId: 'underfloor-heating',
    image: asset('images/services/underfloor-heating.svg'),
  },
  {
    title: 'مشروع منشأة فندقية',
    projectType: 'فنادق ومنشآت سياحية',
    location: 'القاهرة الكبرى',
    scope: 'توريد وتركيب غلاية مركزية بقدرة كبيرة لتأمين مياه ساخنة مستمرة على مدار الساعة.',
    serviceId: 'central-boilers',
    image: asset('images/services/central-boilers.svg'),
  },
  {
    title: 'مشروع مبنى إداري',
    projectType: 'مبانٍ إدارية وتجارية',
    location: 'القاهرة الكبرى',
    scope: 'تركيب منظومة سخانات شمسية لتغطية احتياج المبنى من المياه الساخنة وتقليل استهلاك الكهرباء.',
    serviceId: 'solar-heaters',
    image: asset('images/services/solar-heaters.svg'),
  },
  {
    title: 'مشروع فيلا خاصة',
    projectType: 'فلل خاصة',
    location: 'القاهرة الكبرى',
    scope: 'تركيب نظام تسخين لحمام سباحة خاص لإطالة موسم الاستخدام على مدار العام.',
    serviceId: 'pool-heating',
    image: asset('images/services/pool-heating.svg'),
  },
  {
    title: 'مشروع كمباوند سكني',
    projectType: 'كمباوندات سكنية',
    location: 'القاهرة الكبرى',
    scope: 'أعمال تأسيس صحي وسباكة كاملة بمواسير بولي إيثيلين معتمدة أوروبيًا.',
    serviceId: 'plumbing',
    image: asset('images/services/plumbing.svg'),
  },
  {
    title: 'مشروع منشأة فندقية',
    projectType: 'فنادق ومنشآت سياحية',
    location: 'القاهرة الكبرى',
    scope: 'حلول طاقة شمسية تكميلية لخفض الاعتماد على الشبكة الكهربائية للمنشأة.',
    serviceId: 'solar-energy',
    image: asset('images/services/solar-energy.svg'),
  },
  {
    title: 'مشروع مبنى إداري',
    projectType: 'مبانٍ إدارية وتجارية',
    location: 'القاهرة الكبرى',
    scope: 'تصميم وتنفيذ شبكة تدفئة مركزية موزّعة على جميع طوابق المبنى الإداري.',
    serviceId: 'central-heating',
    image: asset('images/services/central-heating.svg'),
  },
]

export const faqs = [
  {
    question: 'ما هي التدفئة المركزية وكيف تعمل؟',
    answer:
      'التدفئة المركزية نظام يعتمد على تسخين المياه من مصدر واحد (غلاية مركزية) ثم توزيعها عبر شبكة من المواسير إلى الرادياتير الحائطي أو دوائر التدفئة الأرضية فى جميع الغرف، لتحقيق دفء متجانس فى كل أنحاء المكان من نقطة تحكم واحدة.',
  },
  {
    question: 'كم تستغرق مدة تركيب نظام التدفئة المركزية؟',
    answer:
      'تختلف المدة حسب مساحة المشروع وتعقيد التصميم، لكن بشكل عام تتراوح مدة التركيب لمشروع متوسط الحجم من عدة أيام إلى أسبوعين، ونوضح لك الجدول الزمني الدقيق بعد المعاينة الهندسية.',
  },
  {
    question: 'ما الفرق بين التدفئة الحائطية والتدفئة تحت الأرضية؟',
    answer:
      'التدفئة الحائطية تعتمد على رادياتير مثبت على الحوائط وتناسب معظم المساحات بتكلفة أقل، بينما التدفئة الأرضية مخفية بالكامل تحت الأرضية وتمنح توزيعًا حراريًا أكثر تجانسًا وتحافظ على الجدران فارغة، مع تكلفة تركيب أعلى قليلًا. نساعدك فى اختيار الأنسب حسب تصميم مساحتك وميزانيتك.',
  },
  {
    question: 'هل السخانات الشمسية تناسب مناخ مصر؟ وكم نسبة التوفير؟',
    answer:
      'نعم، مناخ مصر المشمس على مدار العام مثالي للسخانات الشمسية. يمكن أن توفر لك حتى 89% من استهلاك الكهرباء المخصص لتسخين المياه، بعمر افتراضي يتجاوز 20 عامًا.',
  },
  {
    question: 'هل يمكن دمج السخان الشمسي مع الغلاية المركزية؟',
    answer:
      'بالتأكيد. يمكن دمج السخان الشمسي كمصدر تسخين أساسي مع الغلاية المركزية كمصدر احتياطي فى الأيام الأقل شمسًا، لضمان مياه ساخنة مستمرة على مدار العام بأقل استهلاك للطاقة.',
  },
  {
    question: 'ما تكلفة تركيب نظام تدفئة مركزية لشقة أو فيلا؟',
    answer:
      'تختلف التكلفة حسب المساحة، نوع النظام (حائطي أو أرضي)، وعدد الغرف. نقدم معاينة ميدانية مجانية لتحديد التصميم الأنسب وتقديم عرض سعر دقيق ومفصل بدون أي التزام.',
  },
  {
    question: 'هل تقدمون خدمة الصيانة الدورية بعد التركيب؟',
    answer:
      'نعم، نوفر خطط متابعة وصيانة دورية اختيارية بعد التسليم لضمان استمرار كفاءة النظام لأطول فترة ممكنة، بالإضافة إلى دعم فني عند الحاجة.',
  },
  {
    question: 'هل تعملون فى مناطق خارج القاهرة الكبرى؟',
    answer:
      'ننفذ مشروعاتنا فى القاهرة الكبرى والمحافظات المجاورة، وندرس أي طلب من مناطق أخرى حسب طبيعة المشروع. تواصل معنا لمعرفة إمكانية التنفيذ فى منطقتك.',
  },
]
