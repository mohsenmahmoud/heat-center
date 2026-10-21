import { ApiError, GoogleGenAI } from '@google/genai';
import { config } from '../../config.js';
import { errors } from '../../lib/errors.js';
import { toStrictJsonSchema } from './json-schema.js';

let client;
function getClient() {
  if (!config.geminiKey) throw errors.missingGeminiKey();
  client ??= new GoogleGenAI({ apiKey: config.geminiKey });
  return client;
}

/** Claude-style content (a string, or text/image blocks) → Gemini parts. */
export function toGeminiParts(content) {
  if (typeof content === 'string') return [{ text: content }];
  return content.map((block) =>
    block.type === 'image' ? { inlineData: { mimeType: block.source.media_type, data: block.source.data } } : { text: block.text },
  );
}

function mapApiError(err) {
  if (err instanceof ApiError) {
    console.error(`[gemini] API error ${err.status}:`, err.message);
    // Gemini answers a bad key with 400 "API key not valid" rather than 401.
    if (err.status === 401 || err.status === 403 || (err.status === 400 && /api key/i.test(err.message))) return errors.invalidGeminiKey();
    if (err.status === 404) return errors.geminiModelNotFound(config.geminiModel);
    if (err.status === 429) return errors.rateLimited('Gemini');
    return errors.aiUnavailable('Gemini');
  }
  console.error('[gemini] request failed:', err);
  return errors.aiUnavailable('Gemini');
}

const BLOCKED = new Set(['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'RECITATION']);

/** Same contract as the Claude client: returns an object validated against the zod `schema`. */
export async function generateJson({ system, content, schema, maxTokens = 16000 }) {
  const ai = getClient();
  let response;
  try {
    response = await ai.models.generateContent({
      model: config.geminiModel,
      contents: [{ role: 'user', parts: toGeminiParts(content) }],
      config: {
        systemInstruction: system,
        responseMimeType: 'application/json',
        responseJsonSchema: toStrictJsonSchema(schema),
        maxOutputTokens: maxTokens,
      },
    });
  } catch (err) {
    throw mapApiError(err);
  }

  const finish = response.candidates?.[0]?.finishReason;
  if (response.promptFeedback?.blockReason || BLOCKED.has(finish)) throw errors.aiRefused('Gemini');
  if (finish === 'MAX_TOKENS') throw errors.aiBadOutput('Gemini');
  try {
    return schema.parse(JSON.parse(response.text ?? ''));
  } catch (err) {
    console.error('[gemini] could not parse structured output:', err.message);
    throw errors.aiBadOutput('Gemini');
  }
}
