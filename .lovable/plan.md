# BroYouFree — The Voice, Personality, and Guy-Centric DNA (Recovery Doc)

You're right: over the last dozen rebuilds the mechanics survived but the *soul* got sanded off. This is a written writeup — not a build plan — that reconstructs what actually made BroYouFree feel like *BroYouFree*, pulled from the earliest specs (msg #1, #7, #90–94, #166), the current codebase (`activities.ts`, `BroModePanel.tsx`, `.lovable/plan.md`), and the strategy conversations that got lost between rebuilds.

Use this as the source of truth the next time you hand a spec to Claude Code (or me). If we start a build and it doesn't reflect what's below, we're off-track.

---

## 1. The Core Strategic Insight (why this app exists)

From the very first prompt (msg #1):

> "75% of men want to spend more time with friends but cite scheduling as their biggest barrier."

This is not a generic calendar app. It's a **friendship-crisis product with a specific target: adult men (25–45) whose social lives are dying from logistical friction, not from lack of desire.** Every design decision should be filtered through: *does this reduce emotional labor for a guy who already feels weird about saying "I miss you"?*

That framing generated three product principles that keep getting forgotten:

1. **Low emotional labor.** A tap is a feeling. You shouldn't have to compose a message to say "wanna hang."
2. **Action over expression.** Men bond side-by-side around an *activity*, not face-to-face around a *conversation*. The invite always leads with the thing you'll do, not the feelings you'll share.
3. **Direct, efficient, no fluff.** Linear meets Calendly, not Bumble BFF. No "let's chat about our friendship goals" energy.

---

## 2. The Voice (what got lost)

The original voice was **confident, dry, and warm without being soft**. Think group-text-with-your-best-friends, not lifestyle-brand-Instagram. Current copy ("Your availability and hangout coordination hub", "You're most active on weekends!") reads like a productivity SaaS. That's the regression.

**Voice pillars:**

| Pillar | Do | Don't |
|---|---|---|
| Direct | "Bro you free Thursday?" | "Would you be interested in scheduling a hangout?" |
| Dry-funny | "Turn 'we should hang' into an actual plan." | "Connect with your besties!" |
| Low-stakes | "No pressure. He can bail." | "Commit to your friendships!" |
| Guy-shorthand | "Grab beers", "Shoot hoops", "Watch the game" | "Beverage social", "Athletic activity", "Sports viewing" |
| Emotionally literate, not emotional | "Something on my mind." (period, no explanation) | "Share your feelings with your bestie 💜" |

**Signature phrases from the original spec that should be sacred:**
- "Bro you free?" (the name is a question — the whole product is a question)
- "Schedule Bro Time"
- "Something on my mind" (the emotional signal that isn't therapy)
- "Vibe Check"
- "Bro Mode"
- "Bro Points"

None of these are jokes. They're the product's identity. Killing them to sound more "professional" is the mistake we keep making.

---

## 3. The Guy-Centric Features (the ones that keep vanishing)

These are the features from the original strategy that made this *not just a scheduling app*. Current code has kept the skeleton (activities, points, achievements) but stripped the personality moves that made them feel guy-coded.

### 3.1 The Emotional Signal (aka "Vibe Check")
The single most important guy-centric feature and the one most often watered down. Four states, no more:

| Signal | Copy | The unspoken thing it lets a guy say |
|---|---|---|
| 🎧 Just Need to Talk | "Something heavy on my mind" | "I'm not okay and I can't type that" |
| ☕ Let's Catch Up | "Life updates" | "I miss you but that word feels weird" |
| 😎 Just Wanna Chill | "No agenda" | "I don't need anything, I just want you around" |
| ⚡ Need to Blow Off Steam | "Stressed, need an outlet" | "I'm about to lose it, help" |

Why it matters: men don't lead with feelings — they attach feelings to plans. A tap here is a full sentence a guy would never text. This is the whole thesis of the app in one UI element. It should never be optional-looking or buried.

### 3.2 The Activity Catalog as a Vibe Map
The categories aren't just organization — they're emotional archetypes for how guys hang:

- **Chill Vibes** — parallel play (walk, coffee, park bench)
- **Food & Drink** — the universal male excuse to sit across from each other
- **Competitive & Active** — the trojan horse for connection (you're not "talking", you're "playing pool")
- **Health & Wellness** — the modern guy addition (sauna, cold plunge, gym) that gives permission to hang without alcohol
- **Big Plans** — the aspirational stuff that never happens without a system
- **Short & Sweet** — the *"15 min walk"* category is critical: it removes the excuse that hanging out has to be a Whole Thing

The `Short & Sweet` category is the most under-celebrated feature. It's the one that fights the "we should hang out" purgatory directly. "Meet at gym for 30 min" is emotionally identical to "I love you, man" for the target user.

### 3.3 Bro Points & Streaks (gamification, not points-casino)
Rules from msg #92 that should be restored (currently the app just gives 50 pts for a completed hangout — flat and boring):

- Send invite: **+5**
- Respond to invite: **+3**
- Complete hangout: **+10**
- **Last-minute accept: +15** ← the emotionally important one. Rewards showing up when it's inconvenient. This is the whole point.
- Suggest a new activity: **+7**

Streaks should be tracked in **plural dimensions**, not just "consecutive hangouts":
- Daily social interaction
- Weekly (≥2 hangouts)
- Response streak (never leave a bro on read)

### 3.4 Achievement Badges with Guy-Coded Names
Original set (currently generic in code — "Getting Started", "Social Butterfly"):
- 🔥 Streak Master (7+ days)
- 🤝 Social Butterfly → **rename: "The Regular"** (10 hangouts/month — like being a regular at the bar)
- ⚡ Quick Responder (<1hr avg)
- 🎯 Planner Pro → **"The Wingman"** (5 events created for others)
- 🌟 Vibe Curator (uses emotional signals regularly — rewards vulnerability without naming it)

Missing from current code but originally proposed:
- **The Anchor** — the friend everyone else invites most
- **Last-Minute Legend** — highest last-minute accept rate
- **The Connector** — introduced two friends who then hung out

### 3.5 Friend Cards with "Response Rate" and "Preferred Times"
The original friend model included `responseRate`, `preferredTimes`, and `favoriteActivities`. Current app dropped these. They're the *social intelligence layer* — the thing that made the app feel like it knew your friends. Without them the friend list is just a contact list.

Restoring these enables the *actual killer feature*: **suggested invites** — "Marcus usually says yes to pickleball on Sunday mornings. Send it?"

---

## 4. Features That Were Discussed But Never Built (worth resurrecting)

Pulled from strategy threads. These are the things that would make BYF feel like a real product with a point of view, not another scheduling tool:

1. **The Wingman prompt** — weekly nudge: "You haven't hung with Marcus in 6 weeks. He's usually free Thursday nights. One tap to invite." Passive social memory the user doesn't have to maintain.
2. **"Bro you free?" broadcast** — one-tap invite to your top 3 friends simultaneously. First to accept wins. Solves the "I want to do something tonight but don't want to text 5 people" problem.
3. **Standing hangs** — recurring plans (e.g. "Wednesday pickleball with Dan") that regenerate themselves. Zero-friction recurring friendship.
4. **The bail button, done with grace** — cancellation includes a required reschedule tap. You can't just kill the plan, you have to propose a new one. Structural friendship insurance.
5. **Read-with-emotional-signal** — when a friend opens your 🎧 "Something on my mind" invite, you get a subtle "he saw it" indicator. No pressure, but the connection is acknowledged.
6. **Post-hangout one-tap check-in** — 24 hours after a hangout: "That was good." One button. That's the whole interaction. Feeds the streak and, over time, becomes a private record of the friendship.
7. **Guy-centric onboarding** — instead of "Add your friends!", the first-run flow asks: "Name 3 guys you'd hang with tomorrow if scheduling were free." Reframes the ask.

---

## 5. Where the Personality Got Lost (diagnosis)

Looking at the current code vs. the original spec, here's the pattern of drift — useful so we can stop repeating it:

| Original | What it became | Why it happened |
|---|---|---|
| "Turn 'we should hang out' into actual plans" | "Your availability and hangout coordination hub" | Rebuilds defaulted to SaaS-copy voice |
| Emotional Signals front-and-center on invite | Optional afterthought, if present | Treated as feature, not thesis |
| Bro Points with 5 different earning rules | Flat "50 pts per completed" | Simplified for MVP, never restored |
| Guy-coded badge names ("The Regular", "Wingman") | "Getting Started", "Social Butterfly" | Generic gamification defaults |
| Rich friend model (response rate, preferred times) | Just name + status | Dropped when DB was cleaned up |
| Category names like "Chill Vibes", "Big Plans" | Kept ✅ (one of the few things that survived) | You defended it |
| Landing page "Built for Male Psychology" section | Deleted in polish passes | Read as "too edgy" — was actually the point |

The recurring failure mode: **each rebuild treats personality as decoration and mechanics as substance**. In this product they're the same thing. The 🎧 signal *is* the mechanic. "Bro Time" *is* the feature. Strip the voice and there's nothing left but a worse Calendly.

---

## 6. The One-Paragraph Spec (paste this into every rebuild prompt)

> BroYouFree is a scheduling app for men who miss their friends but hate the logistics of saying so. The whole product is a low-emotional-labor way to turn "we should hang out" into a confirmed plan in 3 taps: pick a bro, pick an activity, pick a time. The voice is direct, dry, and warm — group-text-with-best-friends, not lifestyle brand. Four "Vibe Check" signals (🎧 Just Need to Talk, ☕ Let's Catch Up, 😎 Just Wanna Chill, ⚡ Need to Blow Off Steam) let a guy attach emotional context to a plan without having to type feelings. Gamification (Bro Points, streaks, "Wingman" and "Regular" badges) rewards the specifically male friendship behaviors: showing up last-minute, being the one who plans, being a reliable Wednesday. Activities are guy-coded and vibe-mapped (Chill Vibes, Competitive & Active, Short & Sweet). Every UI moment should ask: would this feel natural in a group text between three guys who love each other and would rather die than say so?

---

## 7. What I'd Do Next

Since you've been starting from scratch each rebuild and losing the DNA, the highest-leverage move is not another rebuild — it's **locking this document as the canonical brief** and, before the next build, converting sections 2, 3, and 6 into project memory (`mem://`) so it survives session resets and can never get sanded off again by a well-meaning "polish" pass.

If you want, next I can:
- (a) Turn sections 2, 3, and 6 into a set of `mem://` files (voice, guy-centric features, one-paragraph spec) so every future session inherits this
- (b) Rewrite `.lovable/plan.md` to lead with voice + guy-centric features (currently it leads with data model)
- (c) Do a copy audit of the *current* app and replace SaaS-voice strings with the real voice, no other changes

Which of those you want first?
