# BroYouFree — Product Specification

A product-level spec for handoff to Claude Code. Tech stack and visual design system are intentionally left open — Claude Code should choose the most modern, appropriate tools and define a cohesive design system that fits the vibe described below.

---

## 1. Product Overview

**Name:** BroYouFree
**Tagline:** Turn "we should hang out" into actual plans.

**Problem:** Friends say "we should hang out" but never follow through. Coordinating over text is tedious — too many messages, no commitment, plans die.

**Solution:** One-tap hangout invites that bundle an activity, a time, and an optional emotional signal ("just need to talk", "wanna chill"). Light gamification (streaks, points) reinforces the habit of actually showing up for friends.

**Audience:** Adults 20–45 with busy lives who want to maintain friendships but struggle with logistics. Tone is casual and warm, male-leaning ("bro") but inclusive.

**Form factor:** Responsive web app, mobile-first. Should feel like a polished consumer product, not a SaaS dashboard.

---

## 2. Vibe & Design Direction

Claude Code chooses the specific design system, but the result should feel:

- **Modern and confident** — think Partiful, Linear, Cal.com. Not corporate, not childish.
- **Warm and human** — friendship app, not productivity tool. Personality without being cheesy.
- **Mobile-first** — most usage is on a phone in between other things. Big tap targets, fast flows.
- **Quiet, not loud** — restrained animation, deliberate color, generous whitespace. One hero moment per screen, not many.
- **Distinct** — avoid generic AI defaults (Inter + purple gradient + rounded cards). Pick a real point of view.

Things to avoid: bouncing emojis, muddy multi-stop gradients applied to every page, "floating" layouts that don't fill the viewport, cheap glassmorphism stacked on dark gradients.

Light and dark mode both supported.

---

## 3. Core User Flows

### 3.1 Send a hangout invite (the hero flow)
The whole product hinges on this being effortless.
1. From home, user taps "Invite a bro"
2. Picks a friend (or starts from an activity)
3. Picks an activity from a curated catalog (or chooses "something else")
4. Picks a date/time (or offers 2–3 options)
5. Optionally attaches an emotional signal and a short message
6. Sends — friend gets an email/SMS with a link to accept/decline without logging in

### 3.2 Add a friend
- Search existing users by name/username, OR
- Invite by email/phone — recipient gets a link to sign up and auto-connect

### 3.3 Respond to an invite
- In-app: bell icon shows pending invites, accept/decline inline
- Via link: public token-based page that doesn't require an account to respond

### 3.4 Track and reflect
- See upcoming and past hangouts on a calendar
- See streaks, points, achievements in a "Bro Mode" view
- Mark hangouts as completed

### 3.5 Auth
- Email + password sign up / log in
- Password reset via email link
- Auth provider must handle the case where reset is triggered from a preview/localhost origin — the email link must work from the published URL

---

## 4. Pages

**Public**
- Landing — value prop, 4 feature highlights, sign up CTA. Redirect to home if logged in.
- Login, Signup, Forgot Password, Reset Password
- Hangout Response — public token page to accept/decline without an account

**Authenticated**
- Home — dashboard with upcoming hangouts, quick actions, streak/points, activity feed
- Friends — list + pending invitations, add-friend modal, per-friend profile sheet
- Invite — friend grid + activity catalog, invite composer dialog
- Calendar — month view with hangout markers, day-detail panel, ICS export
- Bro Mode — challenges, achievements, availability settings
- Profile — name, username, phone, timezone, avatar

**Navigation**
- Desktop: top header (logo, streak/points, notifications, user menu)
- Mobile: bottom tab bar (Home, Calendar, Bro Mode, Friends) — hidden on public pages

---

## 5. Data Model (conceptual)

Claude Code picks the database, but the entities are:

- **Profile** — id, username, full name, avatar, phone, timezone, preferred times
- **Friendship** — bidirectional, status (pending/accepted/blocked), notes, favorite flag
- **Friend invitation** — inviter, invitee (email/phone or user id), token, status, expires_at
- **Hangout** — organizer, friend, activity (name + emoji), date, time, location, status (draft/pending/confirmed/completed/cancelled/rescheduled), duration, emotional signal, cancellation metadata
- **Hangout invitation** — hangout, inviter, invitee, status, token, message, sent_via, expires_at
- **Hangout time proposal** — multiple proposed times per hangout
- **User availability** — recurring weekly windows + one-off dates
- **Time slots** — concrete date/time availability
- **User role** — must be a separate table from profile, never store roles on the user/profile record

Security: row-level authorization so users can only read/write their own data and data they're a participant in. Tokens for public response links must be unguessable and expirable.

---

## 6. Activity Catalog

~30 activities across 6 categories. Each has a name, emoji, and rough duration.

- **Chill Vibes** — Coffee, Walk, BBQ, Hang at Home, Park Bench
- **Food & Drink** — Lunch/Dinner Out, Cook Together, Brewery, Dessert Run
- **Competitive & Active** — Basketball, Darts, Pool, Video Games, Pickleball, Mini-Golf
- **Health & Wellness** — Gym, Sauna, Cold Plunge, Walk & Talk, Recovery
- **Big Plans** — Road Trip, Live Show, Fishing, Sports Game, Car Meet
- **Short & Sweet** — 15-min Walk, Smoothie Run, Meet at Gym, Kids' Event Check-in

**Emotional Signals (optional tag on an invite):**
- 🎧 Just Need to Talk — something heavy on my mind
- ☕ Let's Catch Up — life updates
- 😎 Just Wanna Chill — no agenda
- ⚡ Need to Blow Off Steam — active outlet

---

## 7. Gamification

- **Bro Points** — small rewards for confirming and completing hangouts
- **Streaks** — count of confirmed hangouts (v2: date-consecutive)
- **Achievements** — Getting Started (1st hangout), Social Butterfly (5), Marathon Bro (10), The Connector (3 in a week)
- **Challenges** — short rolling goals (e.g., 5 hangouts this month, 7-day streak)

Keep this layer playful but not overbearing — it's encouragement, not a points casino.

---

## 8. Notifications

- **In-app** — bell icon with badge; popover lists pending friend + hangout invitations with inline accept/decline
- **Email** — invites, confirmations, cancellations, reschedules
- **SMS (optional)** — for users with a phone on file

---

## 9. Acceptance Criteria

- [ ] User can sign up, log in, and reset their password — reset link works whether triggered from preview or production
- [ ] User can add a friend by search or by email/phone invite
- [ ] User can send a hangout invite in 3 taps or fewer from the home screen
- [ ] Invitee receives a notification with a working accept/decline link that does not require login
- [ ] Accepting an invite confirms the hangout and shows it on both users' calendars
- [ ] Points and streak update correctly as hangouts are confirmed and completed
- [ ] Mobile bottom nav only appears on authenticated routes
- [ ] Layout fills the viewport; no "floating centered" page wrapper
- [ ] Light and dark mode both work end-to-end
- [ ] A user cannot read or modify another user's data (verified)

---

## 10. Out of Scope for v1

- Group hangouts (>2 people)
- Calendar OAuth sync (Google/Outlook) — scaffold the data model but don't ship the integration
- Native iOS/Android apps
- Payments
- Public profiles / social feed

---

## 11. Suggested Build Order

1. Auth + profiles + protected routing
2. Friends (add, accept, list, profile)
3. Hangout invite flow end-to-end (compose → send → respond → confirm)
4. Calendar view + ICS export
5. Home dashboard (stats, upcoming, activity feed)
6. Bro Mode (points, streaks, achievements)
7. Notifications (in-app bell + transactional email)
8. Polish pass: dark mode, empty states, mobile QA, accessibility

---

## 12. Notes for Claude Code

- Choose the stack you'd pick for a modern, fast, mobile-first consumer web app in 2026. Optimize for developer velocity and user-perceived performance.
- Define a real design system up front — typography pair, color tokens, spacing scale, radii, shadows — and use it consistently. No raw color literals in components.
- Animate sparingly and intentionally. Prefer easing and timing over movement distance.
- Treat the invite flow as the make-or-break surface. Spend extra time there.
- Build with row-level security in mind from day one — don't bolt it on later.
