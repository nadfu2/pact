// Cloudflare Pages Function: Roamie's secure proxy to Gemini (port of netlify/functions/gemini.js).
// Route: /api/gemini.  The API key lives only in Cloudflare's environment variables (add GEMINI_API_KEY as a Secret).
//   GEMINI_API_KEY   (required for live web answers)
//   GEMINI_MODEL     (optional) preferred model, tried first
//   ALLOWED_ORIGIN   (optional) comma-separated origins allowed to call this, e.g. https://my-pact.netlify.app
// GET  -> health check: { ok, hasKey }.  GET ?test=1 -> runs one live Google-Search-grounded question and reports exactly what happened
// POST -> Gemini generateContent (body is validated and trimmed, so this cannot be used as an open proxy)
const DEFAULT_MODELS = ['gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-2.0-flash'];
const RATE_MAX = 25, RATE_WINDOW = 60000;
const hits = new Map();

const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const clip = (v, n) => String(v == null ? '' : v).slice(0, n);

function clean(body) {
  const out = {};
  const contents = Array.isArray(body.contents) ? body.contents.slice(-8) : [];
  out.contents = contents.map(c => ({
    role: c && c.role === 'model' ? 'model' : 'user',
    parts: ((c && c.parts) || []).slice(0, 4).map(p => ({ text: clip(p && p.text, 12000) })).filter(p => p.text)
  })).filter(c => c.parts.length);
  if (!out.contents.length) return null;
  const sys = body.systemInstruction && body.systemInstruction.parts && body.systemInstruction.parts[0];
  if (sys && sys.text) out.systemInstruction = { parts: [{ text: clip(sys.text, 10000) }] };
  if (Array.isArray(body.tools) && body.tools.some(t => t && t.google_search)) out.tools = [{ google_search: {} }];
  const gc = body.generationConfig;
  if (gc && gc.responseMimeType === 'application/json' && gc.responseSchema && typeof gc.responseSchema === 'object') {
    out.generationConfig = { responseMimeType: 'application/json', responseSchema: gc.responseSchema };
  }
  return out;
}


// Try each model in turn. If a model rejects the search tool (400), retry that model once without it so the user still gets an answer.
async function runModels(key, payload, started, MODELS, BUDGET_MS) {
  let lastErr = 'Unknown error';
  for (const model of [...new Set(MODELS)]) {
    const plan = payload.tools ? [{ tools: true, think: true }, { tools: true, think: false }, { tools: false, think: false }] : [{ tools: false, think: true }, { tools: false, think: false }];
    for (const step of plan) {
      const withTools = step.tools;
      const left = BUDGET_MS - (Date.now() - started);
      if (left < 1500) return { ok: false, status: 504, error: 'The request took too long (allowed about ' + Math.round(BUDGET_MS / 1000) + 's per call). ' + lastErr };
      const body = { ...payload }; if (!withTools) delete body.tools;
      // 2.5 Flash "thinks" by default, which makes grounded answers slow enough to hit Netlify's time limit. Skip it.
      if (step.think && /2\.5-flash/.test(model)) body.generationConfig = { ...(payload.generationConfig || {}), thinkingConfig: { thinkingBudget: 0 } };
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), left);
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: 'POST', signal: ctrl.signal,
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify(body)
        });
        const text = await res.text();
        clearTimeout(timer);
        if (res.ok) return { ok: true, text, model, droppedTool: !withTools && !!payload.tools };
        let msg = text;
        try { msg = JSON.parse(text).error.message || text; } catch (e) { /* keep raw */ }
        lastErr = `${model}: ${String(msg).slice(0, 240)}`;
        if (res.status === 401 || res.status === 403 || /API key/i.test(String(msg))) return { ok: false, status: 502, error: 'API_KEY problem: ' + lastErr };
        if (res.status === 429) return { ok: false, status: 429, error: 'Gemini rate limit reached: ' + lastErr };
        if (res.status === 400 && (step.think || withTools)) continue;   // setting rejected: retry with fewer features
        break;                                                              // other failure: next model
      } catch (e) {
        clearTimeout(timer);
        if (e && e.name === 'AbortError') return { ok: false, status: 504, error: 'The request took too long (allowed about ' + Math.round(BUDGET_MS / 1000) + 's per call). ' + lastErr };
        lastErr = `${model}: network error`;
        break;
      }
    }
  }
  return { ok: false, status: 502, error: 'All models failed. ' + lastErr };
}

export async function onRequest({ request, env }) {
  const key = env.GEMINI_API_KEY;
  const MODELS = [env.GEMINI_MODEL, ...DEFAULT_MODELS].filter(Boolean);
  const BUDGET_MS = Number(env.FUNCTION_BUDGET_MS) || 24000;
  const method = request.method;
  const reqUrl = new URL(request.url);

  if (method === 'GET') {
    if (!reqUrl.searchParams.get('test') || !key) return json(200, { ok: true, hasKey: !!key, models: MODELS.length, budgetMs: BUDGET_MS });
    const t0 = Date.now();
    const r = await runModels(key, { contents: [{ role: 'user', parts: [{ text: 'Use Google Search: what is the current weather headline for Manchester, UK today? One short sentence.' }] }], tools: [{ google_search: {} }] }, t0, MODELS, BUDGET_MS);
    if (r.ok) {
      let j = {}; try { j = JSON.parse(r.text); } catch (e) { /* ignore */ }
      const cand = (j.candidates || [])[0] || {};
      const chunks = (cand.groundingMetadata && cand.groundingMetadata.groundingChunks) || [];
      return json(200, { ok: true, hasKey: true, grounded: chunks.length > 0, sources: chunks.length, model: r.model, droppedSearchTool: !!r.droppedTool, ms: Date.now() - t0, answer: ((cand.content && cand.content.parts) || []).map(p => p.text || '').join('').slice(0, 200) });
    }
    return json(200, { ok: false, hasKey: true, ms: Date.now() - t0, error: r.error, status: r.status });
  }
  if (method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!key) return json(500, { error: 'GEMINI_API_KEY is not set in the environment variables' });

  const origin = request.headers.get('origin') || '';
  if (origin) {
    const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(x => x.trim()).filter(Boolean);
    let ok = false;
    try { ok = allowed.length ? allowed.includes(origin) : new URL(origin).host === reqUrl.host; } catch (e) { ok = false; }
    if (!ok) return json(403, { error: 'Origin not allowed' });
  }

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  if (recent.length >= RATE_MAX) return json(429, { error: 'Too many requests, please wait a minute' });
  recent.push(now); hits.set(ip, recent);
  if (hits.size > 500) hits.clear();

  const raw = await request.text();
  if (!raw || raw.length > 80000) return json(400, { error: 'Bad request' });
  let payload;
  try { payload = clean(JSON.parse(raw)); } catch (e) { payload = null; }
  if (!payload) return json(400, { error: 'Bad request' });

  const r = await runModels(key, payload, Date.now(), MODELS, BUDGET_MS);
  if (r.ok) return new Response(r.text, { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  return json(r.status || 502, { error: r.error });
}
