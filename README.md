# MOVE FAST

*Zero importance. Total focus.*

A personal PWA running the "90 Day Plan and System" program. The SOP is fixed; you give it today's variables (3–5 needle movers) and it prices them against the goal, refuses to build the day until they add up to $3,333, builds the day by the minute, asks whether each one produced what it was worth, and brings your lessons back until you check them off. One HTML file on GitHub Pages, state synced through Supabase so phone and iPad see the same thing.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app. The first-fill SOP is the `DEFAULT_PLAN` object at the top of the script; after that you edit it inside the app (Plan → Edit). |
| `manifest.webmanifest` | Makes it installable (icon, name, full-screen). |
| `sw.js` | Service worker: works offline, caches the shell. Bump `VERSION` when you ship a change. |
| `icons/` | App icon in every size iOS and Android ask for. |
| `supabase/setup.sql` | One-time database setup. |
| `supabase/functions/plan-day/index.ts` | The AI planner. Holds your Anthropic key server-side. |

## One-time setup

### 1. Supabase — table + lock (2 min)

Dashboard → **SQL Editor** → New query → paste `supabase/setup.sql` with `OWNER_EMAIL` replaced by your sign-in email → **Run**.

### 2. Supabase — password sign-in, no emails (1 min)

Dashboard → **Authentication** → **Sign In / Providers** → **Email** → turn **off** "Confirm email" → Save.
Why: Supabase's built-in mailer can't be customized without custom SMTP, and a magic link opens in Safari instead of the installed app. Email + password needs no email at all. Pick a strong password; the table is locked to your email either way.

### 3. Supabase — the AI planner (5 min, optional — the app plans without it, just without the priced outcomes)

1. Dashboard → **Edge Functions** → **Secrets** → add `ANTHROPIC_API_KEY` (your key from console.anthropic.com) and `OWNER_EMAIL` (same email as step 1).
2. Dashboard → **Edge Functions** → **Deploy a new function** → name it `plan-day` → paste the contents of `supabase/functions/plan-day/index.ts` → turn **Verify JWT off** (the function verifies you itself) → Deploy.
   Or with the CLI: `supabase functions deploy plan-day --no-verify-jwt`.

### 4. GitHub Pages

Repo → **Settings** → **Pages** → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → Save.
The app is at `https://danielgonzalez28.github.io/90-day-plan-and-system/`.

### 5. Install on iPhone / iPad

Open the URL in Safari → Share → **Add to Home Screen**. Open it from the icon, go to **More** → **Create account** with your email + password the first time, **Sign in** on the other device.

## The value cascade

$100k a month → $3,333 a day, every day, Sunday included → the day's 3–5 needle movers, each carrying a dollar share of the day. Hours and minutes are containers; the task carries the value, the day proves it, the week and the month add up or they don't.

## The daily process

1. **Morning.** Type 3–5 needle movers. Arrow them into priority. Per line: who does it (you, or a *who* you pay), what it needs, when it's best done, minutes. Tap **Price and build my day**.
2. **The AI values each mover** — how much of the $3,333 does finishing this carry toward the goal? Would someone pay that for the result? You can override any number. If they don't add up, **the day is not built**: add a mover, defend a value, or give one to a who.
3. **The day comes out as a timeline** — routine fixed, your movers in the focus blocks by priority, each with its $ and a failable "done means". Delegated movers sit in their own *Who, not how* section.
4. **Run it.** Tap a mover done → *"Worth $1,000 — did it produce that?"* Yes earns it. No earns nothing and offers **Carry to tomorrow**, which opens three required questions: what it adds to the goal and why, what moves with it done and why, what could move it with 2× the leverage. Unanswered, it dies at midnight. On the hour inside a block the app still asks: was that worth $150?
5. **Close.** Cash in, one line of what you learned.
6. **Every 2 days** the lessons come back pinned at the top, annotated, until you check each one off.
7. **Sunday.** Value earned vs cash vs the week's $23,333; the three months as $100k checkpoints; the week's movers ranked by what they earned — you mark the **20% inside the 20%** (what only you can do), everything else gets a who. Then next week's plan. Monday won't open without it. If value keeps saying yes while cash says no for two weeks, the app flags it: the values are wrong.

Everything else — grid, scores, scorecard, wallpaper — is derived. You never maintain the app.

## Changing the plan

Plan → **Edit**. Mission line, goals, descriptions, checklist items, routine, policy, Sunday review — all editable in place and synced. **More** holds your card (how you work), your $/hr and $/day, the focus blocks the planner fills, and your **whos** — the people you pay or learn from, one per line.
