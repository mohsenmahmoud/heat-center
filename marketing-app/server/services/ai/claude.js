import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { config } from '../../config.js';
import { errors } from '../../lib/errors.js';

let client;
function getClient() {
  if (!config.anthropicKey) throw errors.missingClaudeKey();
  client ??= new Anthropic({ apiKey: config.anthropicKey, maxRetries: 2, timeout: 5 * 60 * 1000 });
  return client;
}

const UNSUPPORTED = ['$schema', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'minLength', 'maxLength', 'pattern', 'format', 'default'];

/** Structured outputs need every object closed and only the supported keywords. */
export function toStrictJsonSchema(zodSchema) {
  const walk = (node) => {
    if (Array.isArray(node)) return node.map(walk);
    if (!node || typeof node !== 'object') return node;
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (UNSUPPORTED.includes(k)) continue;
      out[k] = walk(v);
    }
    if (out.type === 'object') {
      out.additionalProperties = false;
      out.required = Object.keys(out.properties || {});
    }
    if (out.type === 'array' && out.minItems > 1) delete out.minItems;
    if (out.maxItems !== undefined) delete out.maxItems;
    return out;
  };
  return walk(z.toJSONSchema(zodSchema));
}

function mapApiError(err) {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) return errors.invalidClaudeKey();
  if (err instanceof Anthropic.RateLimitError) return errors.rateLimited();
  if (err instanceof Anthropic.APIConnectionError) return errors.aiUnavailable();
  if (err instanceof Anthropic.APIError) {
    console.error(`[claude] API error ${err.status}:`, err.message);
    return errors.aiUnavailable();
  }
  return err;
}

/**
 * Asks Claude for JSON matching `schema` and returns the validated object.
 * `content` is a string or an array of Messages API content blocks (text + images).
 */
export async function generateJson({ system, content, schema, effort = 'medium', maxTokens = 16000 }) {
  const anthropic = getClient();
  const request = {
    model: config.claudeModel,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content }],
    output_config: { effort, format: { type: 'json_schema', schema: toStrictJsonSchema(schema) } },
  };
  // Server-side fallback re-runs a declined request on Anthropic's recommended model instead of failing.
  if (config.claudeFallbacks) {
    request.betas = ['server-side-fallback-2026-07-01'];
    request.fallbacks = 'default';
  }

  let response;
  try {
    response = await anthropic.beta.messages.create(request);
  } catch (err) {
    throw mapApiError(err);
  }

  if (response.stop_reason === 'refusal') throw errors.aiRefused();
  if (response.stop_reason === 'max_tokens') throw errors.aiBadOutput();

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
  try {
    return schema.parse(JSON.parse(text));
  } catch (err) {
    console.error('[claude] could not parse structured output:', err.message);
    throw errors.aiBadOutput();
  }
}
