# BetweenUs — Claude Code guide

Private web app for **exactly two people**. Tagline: *Những gì chỉ có giữa chúng mình.*

UI copy is Vietnamese. Brand name `BetweenUs` only on splash, landing, and settings. Inside the app say **chúng mình**, **ngày này**, **thư**.

This file is the source of truth for product + engineering. Do not invent social features, public profiles, or a third member.

## What this is

A couple memory space, not Instagram. Everything hangs off a **calendar day**. Homepage after login is the timeline (`/days`). Polaroid / vintage frames and stickers are presentation, not a separate product.

Web only, mobile-first responsive. No native app in MVP.

## Stack

- Next.js App Router (this repo is Next 16) + TypeScript + Tailwind v4
- Prisma 7 + SQLite (`prisma/dev.db`) for local MVP. Connection URL lives in `prisma.config.ts` (not the schema); the client uses `@prisma/adapter-libsql` (see `src/lib/prisma.ts`). Keep `prisma` and `@prisma/client` on the same exact version
- Next 16 uses `src/proxy.ts` (not `middleware.ts`). Upload body limits are raised in `next.config.ts` (`serverActions.bodySizeLimit`, `proxyClientMaxBodySize`)
- Auth: email + password, JWT cookie `betweenus_session` (`jose` + `bcryptjs`)
- Media stored in `data/uploads/` and served only via authenticated `GET /api/files/:id`
- No Redis, no S3, no OAuth unless explicitly asked

Commands:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Env (see `.env.example`):

- `DATABASE_URL="file:./prisma/dev.db"` (relative to the project root)
- `SESSION_SECRET` — required, long random string in production
- `NEXT_PUBLIC_APP_URL` — optional, used to render invite links

Never commit `prisma/dev.db`, `data/uploads/*`, or `.env`.

## Hard product rules

1. **Two accounts per space.** Invite code/link is single-use. When the second person joins, clear the code. Slot `2/2` cannot mint a new invite.
2. **No public content.** `robots.ts` disallows all. Metadata `noindex`. Media URLs must not be guessable static files under `/public`.
3. **No share button** in MVP. No `/u/:username`. No OG images of user photos.
4. Dates are **`YYYY-MM-DD` strings**, not UTC datetimes, to avoid timezone bugs.
5. Each person can edit/delete **only what they created**. Journal: only your column. Notes: sender cannot edit after the recipient has read (keep this). Wishlist: owner edits items; partner can only mark **Đã tặng**.
6. Do not add likes, comments, followers, explore, or AI chat unless asked.
7. Do not use NestJS / a second backend for this project unless the user asks to split later.

## Information architecture

Desktop: left nav. Mobile: bottom tabs **Days · Moments · Notes · Us**. Floating `+` → `/new`.

| Route | Purpose |
|---|---|
| `/` | Landing if logged out; redirect `/days` if logged in |
| `/login` | Login. `?mode=create` registers and **creates a space** |
| `/join/:code` | Second person registers into an existing space |
| `/onboarding` | Display name, optional Since date, show invite if `1/2` |
| `/days` | Timeline |
| `/calendar` | Month grid; dots = content; gold = moment |
| `/day/:date` | One day: mood, both-sides journal, media, notes |
| `/moments` | Special-day albums |
| `/moments/:id` | Album grid |
| `/notes` | Inbox. `?box=sent` = sent |
| `/notes/:id` | Read note; mark read if recipient |
| `/us` | Hub |
| `/us/since` | Day count + milestones 100 / 365 / 1000 |
| `/us/this-week` | Date ideas + 1 vote per person per week (Mon–Sun local) |
| `/us/for-you` | Two wishlists |
| `/us/just-us` | Members, invite, privacy copy |
| `/new` | Composer. `?type=media\|journal\|note\|mood\|moment&day=` |
| `/api/files/:id` | Auth + same-space file bytes |

Out of MVP (do not build unless asked): map, open-when letters, on-this-day, voice, PIN/lock screen, leave/delete space, email notifications, expiring share links `/s/:token`.

## Domain language (keep these labels)

| Feature | In-app name |
|---|---|
| Timeline | Days |
| Special albums | Moments |
| Letters / stickers notes | Notes (sticky vs thư) |
| Two-column diary | Both sides |
| Milestone counter | Since |
| Daily 1-tap | Today / mood |
| Date vote | This week |
| Gifts | For you |
| Pairing | Just us |

## Data model (Prisma)

- `Space`: `startedOn`, `inviteCode`, `inviteExpiresAt` (7 days)
- `User`: email unique, `displayName`, optional `spaceId`
- `Media`: `day`, `frame` (`polaroid` \| `vintage` \| `none`), `stickers` JSON string, `type` image/video, `fileName`, optional `momentId`
- `JournalEntry`: unique `(spaceId, authorId, day)`
- `Note`: `kind` sticky/letter, optional `day`, `readAt`
- `Mood`: unique `(spaceId, authorId, day)`
- `Moment`: `startDay`–`endDay`
- `DateIdea` + `DateVote` unique `(userId, weekStart)`
- `WishlistItem`: `giftedAt` / `giftedById`

SQLite is fine until Postgres is requested. If you migrate, keep day keys as strings.

## Auth & pairing flow

1. Person A: `/login?mode=create` → space + invite code → `/onboarding` → `/days`.
2. Person B: `/join/CODE` → account attached to that space → code destroyed → `/days`.
3. Invalid / expired / full space: show the matching Vietnamese message; do not create a second space.
4. Session cookie is httpOnly, 30 days. Logout from `/us`.

Server helpers: `getSessionUser()`, `requireUser()`, `requireSpace()`, `partnerOf(user)`.

## Composer & day page

`/day/:date` is the canonical object. Timeline cards summarize it.

Order on a day: date + moment chips → moods → both-sides journal → polaroid gallery → notes that day.

Backdating is allowed (`<input type="date">`). Prefill composer with `day` query.

Media max 50MB. After upload, redirect to that day.

Journal empty state: **Chưa viết hôm nay** — never hide the partner column.

Mood: 1 tap, changeable, no caption required. Emojis live in `src/lib/constants.ts`.

## UI / design

- Paper background `#f4efe6`, ink `#2b241c`, blush `#c46b5a`, gold `#c4a574`
- Titles: Fraunces (`.hand`). Body: Nunito Sans, Vietnamese subset
- Soft, album-like. No dark SaaS dashboard, no infinite cold feed
- Polaroid CSS: `.polaroid`. Vintage: `.frame-vintage`
- Empty states should feel warm, not “No data found”

## Code layout

```
src/app/(app)/     authenticated screens + AppShell
src/app/actions/   server actions (auth, space, memories, notes, together)
src/app/api/files  authenticated media
src/components/    AppShell, Polaroid, forms, small UI
src/lib/           prisma, auth, dates, queries, constants
prisma/schema.prisma
```

Prefer **server components + server actions**. Client components only for nav, auth form pending state, and similar.

Forms whose action returns `{ error }` use `<ActionForm>` (`src/components/ActionForm.tsx`), not a bare `<form action>`: it shows the Vietnamese error, disables the form while pending, and only resets fields on success. Pass `resetOnSuccess={false}` for forms that edit an existing value.

`revalidatePath` after writes. Do not cache private pages as public static.

## Implementation habits

- Keep changes in existing routes/modules; do not add a new micro-app per feature
- Validate `YYYY-MM-DD` with `isValidDayKey`
- Always scope queries by `spaceId` of the session user
- File access: session + `media.spaceId === user.spaceId` or 404
- When adding a field, update Prisma, this file, and the matching screen together
- Tests are not set up yet; if you add them, start with pairing (invite 1-time, reject 3rd user) and note unread → read

## Do not

- `git commit` unless the user asks
- `push --force`, change git config, or skip hooks
- Put user media in `/public`
- Add Google login / magic link until asked
- Soften the 2-person rule “just for testing”
- Translate the whole UI to English unless asked (code identifiers stay English)

## Local demo

1. Create account A (create space), copy invite from onboarding or Just us.
2. Incognito: open `/join/CODE`, create account B.
3. Post a polaroid, write both journal sides, send a note, tap a mood, add a date idea and vote.
