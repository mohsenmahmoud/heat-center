import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config.js';
import { errors } from '../../lib/errors.js';
import { toStrictJsonSchema } from './json-schema.js';

let client;
function getClient() {
  if (!config.anthropicKey) throw errors.missingClaudeKey();
  client ??= new Anthropic({ apiKey: config.anthropicKey, maxRetries: 2, timeout: 5 * 60 * 1000 });
  return client;
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
