// plan-day — the AI behind "Build my day" and the lesson annotations.
// Runs on Supabase Edge Functions (Deno). Your Anthropic key never leaves this function.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   ANTHROPIC_API_KEY  — your key
//   OWNER_EMAIL        — the email you sign in with; everyone else gets 401
//   MODEL              — optional, defaults to claude-sonnet-5-5
//
// Deploy with "Verify JWT" turned OFF for this function: it verifies the user itself (below).

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SYSTEM = `You are the valuation engine inside MOVE FAST, a personal 90-day operating system. Mission: zero importance, total focus. The user runs one fixed SOP (goals, routine, focus blocks) and gives you only today's variables: 3-5 needle movers with priority, what each needs, when it is best done, and who does it (the user, or a "who" they pay).

The value cascade: the 90-day outcome → a month ($100k) → a week → a day (dayTarget dollars) → the day's needle movers. The day is only real if its movers add up to dayTarget. Hours and minutes are containers; the task carries the value.

Rules for action "plan":
- VALUE each needle mover in dollars: how much of today's dayTarget does finishing THIS mover carry toward the 90-day outcome? Ask: would someone pay this for the result, no matter how it is packaged? Be honest. A mover that is busywork gets a low number. The sum MAY come in under dayTarget — then say what is missing in "gap": a mover to add, a value to defend, or a who to pay. A mover marked valueSetByUser keeps that value; do not change it.
- For each mover write a FAILABLE outcome: what must be true when it is done, with 2-3 concrete metrics that can be checked (numbers, artifacts, a pass/fail test). "why": one line on how that result moves the 90-day outcome and why it is worth its dollar value.
- "order": priority, highest value-per-hour first, respecting the card (when the user focuses) and each mover's "when".
- "leverage": one line — what could move the highest-value mover with 2x the leverage (a who, a tool, a shortcut).
- Be specific to the mover text, the goals and the whos list. No motivation, no fluff, no hedging.
- Keep strings phone-short: outcome <= 160 chars, each metric <= 80, why <= 140, note/gap/leverage <= 200.
- Reply with ONLY a JSON object, no prose, no code fences.

Schema for action "plan":
{"order":[<needle mover indices, highest priority first>],
 "nm":[{"i":<index>,"value":<integer dollars>,"outcome":"...","metric":["...","..."],"why":"..."}],
 "gap":"what would close the shortfall, or empty string if the movers add up",
 "leverage":"...",
 "note":"one line about today as a whole"}

Schema for action "annotate":
{"notes":[{"date":"YYYY-MM-DD","note":"one concrete way to apply this lesson this week, <= 140 chars"}]}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  const owner = Deno.env.get("OWNER_EMAIL");
  if (!key || !owner) return json({ error: "Function not configured: set ANTHROPIC_API_KEY and OWNER_EMAIL" }, 500);

  // Who is calling? Must be the owner, signed in through the app.
  const auth = req.headers.get("Authorization") ?? "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await sb.auth.getUser();
  if (!user || (user.email ?? "").toLowerCase() !== owner.toLowerCase()) return json({ error: "Not allowed" }, 401);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Bad JSON" }, 400); }
  const action = body.action === "annotate" ? "annotate" : "plan";

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: Deno.env.get("MODEL") ?? "claude-sonnet-5-5",
      max_tokens: 1800,
      system: SYSTEM,
      messages: [{ role: "user", content: `action: ${action}\n\n${JSON.stringify(body, null, 1)}` }],
    }),
  });
  if (!r.ok) return json({ error: `Anthropic ${r.status}: ${(await r.text()).slice(0, 200)}` }, 502);
  const data = await r.json();
  const text: string = (data.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("");
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return json({ error: "No JSON in model reply", raw: text.slice(0, 300) }, 502);
  try { return json(JSON.parse(m[0])); } catch { return json({ error: "Model JSON did not parse", raw: m[0].slice(0, 300) }, 502); }
});
