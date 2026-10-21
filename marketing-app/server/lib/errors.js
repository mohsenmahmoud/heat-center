/**
 * Errors the UI can show as-is. Every message exists in Arabic and English so
 * the client can pick based on the current UI language.
 */
export class AppError extends Error {
  constructor(code, status, ar, en, details) {
    super(en);
    this.code = code;
    this.status = status;
    this.messages = { ar, en };
    this.details = details;
  }
}

export const errors = {
  missingClaudeKey: () =>
    new AppError(
      'MISSING_CLAUDE_KEY',
      503,
      'مفتاح Claude غير موجود. أضف ANTHROPIC_API_KEY في ملف .env ثم أعد تشغيل التطبيق.',
      'Claude API key is missing. Add ANTHROPIC_API_KEY to .env and restart the app.',
    ),
  missingAiKey: () =>
    new AppError(
      'MISSING_AI_KEY',
      503,
      'لا يوجد مفتاح ذكاء اصطناعي. أضف ANTHROPIC_API_KEY (Claude) أو GEMINI_API_KEY (Gemini) في ملف .env ثم أعد تشغيل التطبيق.',
      'No AI key found. Add ANTHROPIC_API_KEY (Claude) or GEMINI_API_KEY (Gemini) to .env and restart the app.',
    ),
  missingGeminiKey: () =>
    new AppError('MISSING_GEMINI_KEY', 503, 'مفتاح Gemini غير موجود. أضف GEMINI_API_KEY في ملف .env ثم أعد التشغيل.', 'Gemini API key is missing. Add GEMINI_API_KEY to .env and restart.'),
  invalidGeminiKey: () =>
    new AppError('INVALID_GEMINI_KEY', 502, 'مفتاح Gemini غير صحيح أو غير مفعّل. راجع GEMINI_API_KEY في .env.', 'Gemini API key was rejected. Check GEMINI_API_KEY in .env.'),
  geminiModelNotFound: (model) =>
    new AppError(
      'GEMINI_MODEL_NOT_FOUND',
      502,
      `موديل Gemini "${model}" غير متاح لحسابك. غيّر GEMINI_MODEL في .env إلى موديل متاح (مثل gemini-flash-latest).`,
      `Gemini model "${model}" is not available to your key. Set GEMINI_MODEL in .env to an available model (e.g. gemini-flash-latest).`,
    ),
  invalidClaudeKey: () =>
    new AppError('INVALID_CLAUDE_KEY', 502, 'مفتاح Claude غير صحيح أو منتهي. راجع ANTHROPIC_API_KEY في .env.', 'Claude API key was rejected. Check ANTHROPIC_API_KEY in .env.'),
  rateLimited: (name = 'Claude') =>
    new AppError('RATE_LIMITED', 429, `تم تجاوز حد الطلبات على ${name}. انتظر دقيقة وحاول مرة أخرى.`, `${name} rate limit reached. Wait a minute and try again.`),
  aiUnavailable: (name = 'Claude') =>
    new AppError('AI_UNAVAILABLE', 502, `تعذّر الوصول إلى ${name} الآن. تأكد من الإنترنت وحاول مرة أخرى.`, `Could not reach ${name}. Check your internet connection and try again.`),
  aiRefused: (name = 'Claude') =>
    new AppError('AI_REFUSED', 422, `رفض ${name} هذا الطلب. جرّب صياغة الموضوع بشكل مختلف.`, `${name} declined this request. Try rephrasing the topic.`),
  aiBadOutput: (name = 'Claude') =>
    new AppError('AI_BAD_OUTPUT', 502, `رد ${name} بصيغة غير متوقعة. اضغط "إعادة المحاولة".`, `${name} returned an unexpected format. Please retry.`),
  validation: (en, ar = 'بيانات غير صحيحة: ' + en) => new AppError('VALIDATION', 400, ar, en),
  notFound: (what = 'Item') => new AppError('NOT_FOUND', 404, 'العنصر غير موجود.', `${what} not found.`),
  unauthorized: () => new AppError('UNAUTHORIZED', 401, 'يجب تسجيل الدخول أولاً.', 'Please sign in first.'),
  badPassword: () => new AppError('BAD_PASSWORD', 401, 'كلمة المرور غير صحيحة.', 'Wrong password.'),
  scrapeFailed: (en) =>
    new AppError('SCRAPE_FAILED', 422, 'تعذّر قراءة الرابط. تأكد أنه صحيح ومتاح للعامة، أو انسخ النص بنفسك (في خانة الموضوع أو وصف البراند).', `Could not read the URL (${en}). Paste its text yourself (topic field or brand brief).`),
  blockedUrl: () =>
    new AppError('BLOCKED_URL', 400, 'هذا الرابط غير مسموح (عنوان داخلي أو محلي).', 'This URL points to a local/private address and is not allowed.'),
  providerFailed: (name, en) =>
    new AppError('PROVIDER_FAILED', 502, `فشل الاتصال بخدمة ${name}. تحقق من المفتاح في .env.`, `${name} request failed: ${en}`),
  renderFailed: (en) =>
    new AppError('RENDER_FAILED', 500, 'فشل إنتاج الفيديو. راجع سجل السيرفر للتفاصيل وحاول مرة أخرى.', `Video render failed: ${en}`),
  busy: () => new AppError('BUSY', 409, 'يوجد فيديو قيد الإنتاج الآن. انتظر حتى ينتهي.', 'A video is already rendering. Wait for it to finish.'),
};

export function toPayload(err) {
  if (err instanceof AppError) {
    return { status: err.status, body: { error: { code: err.code, message: err.messages, details: err.details } } };
  }
  if (err?.type === 'entity.too.large' || err?.code === 'LIMIT_FILE_SIZE') {
    return { status: 413, body: { error: { code: 'TOO_LARGE', message: { ar: 'الملف أكبر من الحد المسموح (10 ميجا للصور والصوت، 200 ميجا للفيديو).', en: 'File is too large (10 MB for images/audio, 200 MB for video).' } } } };
  }
  if (err?.code === 'LIMIT_FILE_COUNT' || err?.code === 'LIMIT_UNEXPECTED_FILE') {
    return { status: 400, body: { error: { code: 'TOO_MANY_FILES', message: { ar: 'عدد الملفات أكبر من المسموح (10).', en: 'Too many files (max 10).' } } } };
  }
  return {
    status: 500,
    // Localhost-only app: the technical reason helps the user report the problem.
    body: { error: { code: 'INTERNAL', message: { ar: 'حدث خطأ غير متوقع. حاول مرة أخرى.', en: 'Unexpected error. Please try again.' }, details: String(err?.message || err || '').split('\n')[0].slice(0, 300) } },
  };
}
