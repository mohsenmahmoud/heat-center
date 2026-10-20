# Qudra Marketing Studio · استوديو قدرة للتسويق

A local AI marketing app for Qudra (قُدرة), in a dark/white UI with Arabic and English:

| Tab | What it does |
|---|---|
| **1. Motion Video Generator** | Topic, URL or screenshots → editable 40–60s script → live preview → branded 1080×1920 MP4 (transitions, CTA, logo, captions, music/voice) → download → history |
| **2. Weekly Video Planner** | 7-day **video** plan (Saturday start) across LinkedIn / Facebook / Instagram / TikTok. Every day gets a hook, a **full video script** (scenes, on-screen text, voiceover, CTA), the caption to publish with it and the best time. Open any day in the video generator with one click, render it, and the day is marked produced. Edit (autosave), regenerate a day, copy the voiceover, export Markdown or Word |

Everything runs on your computer (`127.0.0.1` only). API keys live in `.env` on the server side and never reach the browser.

---

## دليل التشغيل السريع (بالعربي)

### 1) المتطلبات (مرة واحدة)
- **Node.js 22.13 أو أحدث**: نزّله من [nodejs.org](https://nodejs.org) (نسخة LTS).
- إنترنت أول مرة: لتثبيت الحزم، ولتحميل متصفح الرندر (Chrome Headless Shell، حوالي 100 ميجا) تلقائياً عند أول فيديو.

### 2) التثبيت والتشغيل
```bash
cd marketing-app
cp .env.example .env        # على Windows: copy .env.example .env
npm install
npm start                   # يبني الواجهة ويشغّل التطبيق
```
افتح **http://localhost:5174**

أو ببساطة: دبل كليك على `start.bat` (Windows) أو شغّل `./start.sh` (Mac/Linux). الملف ينسخ `.env` ويثبّت الحزم أول مرة ثم يشغّل التطبيق.

### 3) أضف مفتاح الذكاء الاصطناعي: Claude أو Gemini
افتح ملف `.env` وحط **واحد** من المفتاحين:
```
# Claude: من console.anthropic.com (رصيد API منفصل عن اشتراك Claude)
ANTHROPIC_API_KEY=sk-ant-...

# أو Gemini: من aistudio.google.com/apikey
GEMINI_API_KEY=AIza...
```
ثم أعد التشغيل. التطبيق بيستخدم المفتاح الموجود تلقائياً. لو حطيت الاتنين، بيستخدم Claude، إلا لو كتبت `AI_PROVIDER=gemini`.
لتجربة التطبيق **بدون أي مفتاح** ضع `MOCK_AI=true` (محتوى مثال ثابت، والفيديو يُنتج فعلاً).

### 4) استخدام التبويب الأول: مولّد الفيديو
1. اكتب **الموضوع**، أو ضع **رابط** صفحة (مثلاً صفحة ميزة على qudratms.com)، و/أو ارفع **صور** (لقطات من لوحة التحكم أو التطبيق).
2. اختر اللغة (عربي فصحى مبسطة / إنجليزي)، والسوق، والمدة (40–60 ثانية)، والشكل البصري، والصوت، والموسيقى.
3. اضغط **اكتب السكريبت**. Claude يكتب 6–8 مشاهد: Hook ← الألم ← الحل ← ميزات ← قبل/بعد ← CTA.
4. عدّل أي مشهد: النص، المدة، الانتقال، الترتيب، الصورة المعروضة داخل موكاب الموبايل أو المتصفح. المعاينة الحية تتحدث فوراً.
5. اضغط **أنتج الفيديو MP4** وتابع التقدّم لحظة بلحظة، ثم **تحميل MP4**.
6. كل فيديو يُحفظ في **السجل**: تشغيل، تحميل، "استخدم السكريبت" لتعديله وإعادة إنتاجه، أو حذف.

**نصائح:**
- صور اللقطات العرضية (لوحة التحكم) تظهر داخل نافذة متصفح عليها qudratms.com، والطولية تظهر داخل موبايل.
- لإضافة موسيقى: ضع ملفات MP3 في `assets/music/` فتظهر في القائمة.
- اللوجو في `assets/brand/logo.png`. استبدله بنسخة أخرى بنفس الاسم لو حبيت.
- مع "موشن + صور + Stock + AI": لو أضفت مفتاح Pexels أو Pixabay (مجاني)، خلفيات المشاهد تصبح لقطات حقيقية بلمسة أخضر قدرة.

### 5) استخدام التبويب الثاني: خطة الفيديوهات الأسبوعية
كل يوم في الخطة **فيديو كامل**، مش فكرة بس.
1. اختر **بداية الأسبوع** (افتراضياً السبت القادم)، والمنصات، واللغة، والسوق، و**مدة كل فيديو**، وتركيز الحملة لو موجود.
2. اضغط **أنشئ خطة فيديوهات 7 أيام**. Claude يحدد زاوية كل يوم حسب محاور قدرة (ألم التشغيل ×2، قدرة في الشغل ×2، أرقام ونمو، خبرة المجال، ثقة)، وبعدها **يكتب سكريبت الفيديو لكل يوم تلقائياً**. العدّاد فوق بيوضح التقدّم، مثلاً "5/7 سكريبت".
3. في كل يوم هتلاقي **سكريبت الفيديو**: المشاهد، والنص على الشاشة، والتعليق الصوتي لكل مشهد.
4. اضغط **نسخ الفويس أوفر** لو هتسجّل بصوتك، فالنص كله بيتنسخ جاهز للقراءة.
5. اضغط **افتح في مولّد الفيديو**. السكريبت هيتحمّل في التبويب الأول، فارفع صورك وصوتك، ثم **أنتج الفيديو MP4**.
6. بعد الإنتاج هتلاقي اليوم في الخطة عليه علامة **تم الإنتاج** ورابط **تحميل الفيديو**، والعدّاد بيوضح "2 فيديو".
7. تقدر تعدّل الهوك والكابشن (الحفظ تلقائي)، أو تعمل **إعادة توليد** ليوم بزاوية جديدة (السكريبت بيتكتب من جديد)، أو **إعادة كتابة السكريبت** بس.
8. التصدير لـ **Markdown** أو **Word** بيحتوي على السكريبتات كاملة، ونص التعليق الصوتي لكل يوم.

### 6) الأمان
- التطبيق يسمع على `127.0.0.1` فقط ويرفض أي طلب من غير localhost.
- المفاتيح في `.env` على السيرفر فقط، والملف مستثنى من Git.
- لطلب كلمة مرور: ضع `APP_PASSWORD=...` في `.env`.
- الروابط التي تشير لعناوين داخلية (مثل 127.0.0.1 أو 192.168.x.x) مرفوضة.

### 7) مشاكل شائعة
| الرسالة | الحل |
|---|---|
| لا يوجد مفتاح ذكاء اصطناعي | أضف `ANTHROPIC_API_KEY` أو `GEMINI_API_KEY` في `.env` وأعد التشغيل |
| مفتاح Gemini غير صحيح | انسخ المفتاح من جديد من aistudio.google.com/apikey |
| موديل Gemini غير متاح | غيّر `GEMINI_MODEL` في `.env` لموديل متاح في حسابك |
| مفتاح Claude غير صحيح | انسخ المفتاح من جديد من console.anthropic.com |
| تعذّر قراءة الرابط | بعض المواقع تمنع القراءة الآلية. انسخ النص في خانة الموضوع |
| فشل إنتاج الفيديو | أول مرة يحتاج إنترنت لتحميل متصفح الرندر. راجع رسالة السيرفر في الطرفية |
| صوت AI مقفول | أضف `TTS_PROVIDER=elevenlabs` مع `ELEVENLABS_API_KEY` و`ELEVENLABS_VOICE_ID` |
| `node:sqlite` error | حدّث Node.js إلى 22.13 أو أحدث |

---

## Technical reference (English)

### Commands
| Command | Purpose |
|---|---|
| `npm start` | Build the UI and serve the app at http://localhost:5174 |
| `npm run dev` | Development: API with auto-reload + Vite UI at http://localhost:5173 |
| `npm test` | Unit + API tests (Vitest, demo writer, throwaway data dir) |
| `npm run test:e2e` | Real-browser test of both tabs, including a full MP4 render (`npx playwright-core install chromium` first, or set `E2E_BROWSER`) |
| `npm run studio` | Open the video composition in Remotion Studio |

### Architecture
```
marketing-app/
├── server/                     Express API, 127.0.0.1 only
│   ├── index.js / app.js       startup, security headers, Host guard, routing, error → {ar, en} messages
│   ├── config.js               .env loading + capability detection
│   ├── db.js                   SQLite (node:sqlite): uploads, videos, plans
│   ├── brand/qudra.js          brand voice, palette, pillars, banned phrases (edit to retune all output)
│   ├── lib/                    auth (HMAC cookie), errors, safe fetch (blocks private IPs), image size
│   ├── routes/                 system · uploads · video · planner
│   └── services/
│       ├── ai/writer.js        picks Claude or Gemini (AI_PROVIDER / available key)
│       ├── ai/claude.js        Anthropic SDK, structured JSON output, refusal fallback, typed errors
│       ├── ai/gemini.js        Google GenAI SDK, JSON-schema output, friendly errors
│       ├── ai/index.js         prompts for script / week plan / single-post rewrite
│       ├── ai/mock.js          demo mode (MOCK_AI=true)
│       ├── media.js            stock (Pexels, Pixabay), AI images (OpenAI, Replicate), TTS (ElevenLabs, OpenAI)
│       ├── scraper.js          URL → title, text, images
│       ├── render.js + jobs.js Remotion pipeline with live progress over Server-Sent Events
│       ├── planner.js          day/platform/pillar slots
│       └── export.js           Markdown + Word (.docx, RTL-aware)
├── video/                      Remotion composition shared by the live preview and the MP4 renderer
│   ├── QudraVideo.jsx          scenes, transitions, watermark, captions, audio
│   ├── scenes.jsx / parts.jsx  hook, standard, before/after, CTA; kinetic text, mockups, swoosh
│   └── timing.js               40–60s fitting shared by server and browser
├── web/                        React + Vite + Tailwind UI (RTL/LTR, dark/light)
├── assets/brand/logo.png       watermark + CTA logo
├── assets/music/               your royalty-free tracks
└── tests/                      Vitest suites + Playwright E2E
```

### How a video is made
1. `POST /api/video/script`: Claude gets the topic, the scraped page text and up to 4 uploaded images, and returns a structured scene list. Durations are fitted to the requested length.
2. The UI edits the script; the Remotion **Player** previews the exact composition the server renders.
3. `POST /api/video/render` starts a job:
   - voiceover (AI or uploaded), with scenes stretched to the audio length;
   - per-scene visuals: pinned screenshot → device mockup, else stock footage, else AI image, else the brand gradient;
   - `renderMedia` → H.264 MP4, plus a thumbnail.
4. `GET /api/video/jobs/:id/events` streams progress. Results are stored in `data/` and SQLite.

### AI writer (Claude or Gemini)
- `AI_PROVIDER=claude|gemini`, or leave it empty to use whichever key is set (Claude first). Both go through `server/services/ai/writer.js` with the same prompts, JSON schema and Zod validation.
- Gemini: `GEMINI_API_KEY`, `GEMINI_MODEL` (default `gemini-flash-latest`), via the official `@google/genai` SDK with `responseJsonSchema`.

### Claude usage
- Model: `CLAUDE_MODEL` (default `claude-opus-5-5`). For lower cost, set `claude-sonnet-5-5`.
- Structured outputs (`output_config.format` JSON schema) guarantee parseable scripts and plans; responses are validated again with Zod.
- Server-side refusal fallback (`fallbacks: "default"`) is on; set `CLAUDE_FALLBACKS=off` to disable it.

### Data
Everything is in `data/` (git-ignored): `studio.db`, `uploads/`, `media/` (stock/AI/voice cache) and `videos/`. Delete the folder to reset.

### Licensing note
Rendering uses [Remotion](https://remotion.dev), which is free for individuals and companies with up to 3 employees. Larger teams need a [company license](https://remotion.pro).
