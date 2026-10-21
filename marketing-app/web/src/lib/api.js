export class ApiError extends Error {
  constructor(code, message, status, details) {
    super(typeof message === 'string' ? message : message?.en);
    this.code = code;
    this.details = typeof details === 'string' ? details : null;
    this.messages = typeof message === 'string' ? { ar: message, en: message } : message;
    this.status = status;
  }
}

const NETWORK = {
  ar: 'تعذّر الاتصال بالسيرفر. تأكد أن التطبيق يعمل (npm run dev).',
  en: 'Cannot reach the server. Make sure the app is running (npm run dev).',
};

async function request(method, url, body) {
  let res;
  try {
    const isForm = body instanceof FormData;
    res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError('NETWORK', NETWORK, 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event('qms:unauthorized'));
    throw new ApiError(data?.error?.code || 'HTTP_' + res.status, data?.error?.message || NETWORK, res.status, data?.error?.details);
  }
  return data;
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  del: (url) => request('DELETE', url),
};

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers that block the async clipboard API.
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
