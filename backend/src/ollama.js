/**
 * Ollama API client: intent extraction for natural language.
 * - Timeout 5s, retry once.
 * - Only allow localhost (enforced in config).
 */
import axios from 'axios';
import { config, assertOllamaLocalhost } from './config.js';

const OLLAMA_GENERATE_PATH = '/api/generate';

const SYSTEM_PROMPT = `You are an attendance assistant. You must extract structured intent from the user message.
Return ONLY valid JSON, no other text.

Valid intents: clock_in, clock_out, correction, summary, question

JSON format:
{
  "intent": "clock_in | clock_out | correction | summary | question",
  "time": "HH:MM" or null if not mentioned,
  "date": "YYYY-MM-DD" or null if not mentioned (use today when implied),
  "confidence": 0.0 to 1.0
}

Examples:
- "I came in at 9:12 today" -> {"intent":"clock_in","time":"09:12","date":null,"confidence":0.95}
- "Am I late?" -> {"intent":"question","time":null,"date":null,"confidence":0.9}
- "Fix my clock-in to 08:55" -> {"intent":"correction","time":"08:55","date":null,"confidence":0.9}
- "Weekly summary" -> {"intent":"summary","time":null,"date":null,"confidence":0.95}`;

/**
 * Build prompt for Ollama (non-streaming).
 */
function buildPrompt(userMessage) {
  return `${SYSTEM_PROMPT}\n\nUser message: ${userMessage}\n\nJSON:`;
}

/**
 * Parse AI response to extract JSON. Handles markdown code blocks.
 */
function parseIntentResponse(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  let jsonStr = trimmed;
  const codeMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();
  const firstBrace = jsonStr.indexOf('{');
  if (firstBrace !== -1) {
    const lastBrace = jsonStr.lastIndexOf('}');
    if (lastBrace !== -1) jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Call Ollama /api/generate. Timeout and retry once.
 * @param {string} userMessage - Raw user text
 * @returns {Promise<{ intent: string, time: string|null, date: string|null, confidence: number } | null>}
 */
export async function extractIntent(userMessage) {
  assertOllamaLocalhost();

  const url = `${config.ollama.baseUrl.replace(/\/$/, '')}${OLLAMA_GENERATE_PATH}`;
  const payload = {
    model: config.ollama.model,
    prompt: buildPrompt(userMessage),
    stream: false,
  };

  const timeout = config.ollama.timeoutMs;
  const maxAttempts = 1 + config.ollama.retryCount;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await axios.post(url, payload, {
        timeout,
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
      });

      if (res.status !== 200) {
        if (attempt < maxAttempts) continue;
        return null;
      }

      const responseText = res.data?.response ?? res.data?.message?.content ?? '';
      const parsed = parseIntentResponse(responseText);
      if (parsed && typeof parsed.intent === 'string') {
        return {
          intent: parsed.intent,
          time: parsed.time ?? null,
          date: parsed.date ?? null,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        };
      }
    } catch (err) {
      if (attempt >= maxAttempts) return null;
    }
  }
  return null;
}

/**
 * Fallback message when AI is unreachable.
 */
export const OLLAMA_FALLBACK_MESSAGE =
  "I couldn't reach the AI right now. Please use the buttons: Clock In, Clock Out, Request Correction, or type `/attendance` for the menu.";
