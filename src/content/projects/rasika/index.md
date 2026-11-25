---
title: "Rasika"
summary: "A Carnatic music learning app for mobile — structured lessons, swara notation, and a built-in shruti box, for learners who don't have a guru sitting next to them."
date: "Jan 01, 2026"
category: "Side project"
tags: ["music", "iOS", "Vue", "Capacitor"]
demoUrl: ""
repoUrl: ""
draft: true
---

## TL;DR

Rasika is a Carnatic music learning app I built for iOS (and soon Android). The one thing to remember: it isn't trying to replace a guru — it's the digital companion you use between lessons, the reference you open at midnight, and the shruti box you carry in your pocket.

## Fact box

| | |
|---|---|
| **Status** | Live on App Store, Android on waitlist |
| **Role** | Everything: product, design, engineering. Built with Claude Code as my pair programmer |
| **Stack** | Vue 3 / Pinia / Vite, Supabase PostgreSQL, Capacitor (iOS / Android), marked |
| **Timeline** | Started January 2026, shipping continuously |

## The itch

I learned Carnatic music as a child. After about ten years I stopped — life happened. Now I have a son, and I want him to pick it up. When I started looking for how to introduce him to it, I found the same situation I remembered from my own childhood: everything lives inside a guru–shishya relationship, handed down in person, and very little of it has been made accessible in a modern format.

That's not a criticism of the tradition. The guru–shishya model exists for good reasons. But the moment you're between teachers, or you just want to reinforce what you learned that week, or you need to remind yourself of the swara notation for Alankara 17 at 11 pm — there's nothing. A PDF or a YouTube video, at best.

I wanted something that felt like a proper learning product: structured, beautiful, and respectful of the music. I also wanted a shruti box I didn't have to carry separately.

## What it does

The app is organised around a structured learning path — the same path every Carnatic student takes: Sarali Varisai, Jantai Varisai, Dhāttu Varisai, Alankaras, and then compositions (Geetham, Varnam, Kritis). Each lesson has a theory section explaining what you're practising and why, a notation grid where every swara lights up in Roman or Tamil script (or both), and practice notes on what to watch for.

The notation grid is the core of the experience. Rather than staff notation, it uses the familiar Indian solfège — Sa Ri Ga Ma Pa Da Ni — displayed in a grid that maps the rhythm pattern of the tāḷa. Each row is one āvartam. You can flip between Roman script, Tamil script, or both at once.

Alongside the practice path is a Library — every chapter browsable at any time, with progress tracked. The Library also holds the repertoire: Geethams, Varnams, and Kritis, with lyrics, raga scales, and composer notes.

The shruti box is built in. Set your Sa, pick a key, and a tambura drone plays underneath everything you do in the app. It follows you to every screen. It uses real recorded tanpura audio, not synthesis.

**What it deliberately doesn't do:** no social features, no gamification beyond a streak counter, no audio lessons or recorded teacher voices. It's a reference and a practice companion, not a replacement for learning from a human.

## How it works

```
Vue 3 SPA (Capacitor shell)
  ├── Pinia store (lessons, progress)       ← hydrates from localStorage
  │     └── fetchFromDB()                  ← Supabase, runs after mount
  ├── LessonDetailScreen                   ← swara notation grid + theory
  ├── LibraryScreen                        ← chapter browser + repertoire
  └── DroneScreen / shruti box             ← looped MP3 recordings per key

Supabase PostgreSQL
  ├── chapters (id, title_en, title_ta, level, num, show_in_library)
  └── lessons  (id, chapter_id, notation JSONB, theory_en, theory_ta, type)
```

- **Notation as JSONB**: each lesson's notation is stored as a 2D array of swara tokens. The app flat-maps them into equal-width cells, tagging beat boundaries from `|` separators, so the grid renders correctly without any display logic in the database.
- **Static fallback**: the store ships a full set of beginner lessons in JS. If Supabase is unreachable, the app still works. The DB data replaces the static set once it loads.
- **Foundational lessons**: theory chapters (like the Tāḷās overview) are stored as markdown and rendered with `marked`. They get a different layout and ocean-blue styling to distinguish them from practice lessons.
- **Capacitor**: the Vue SPA is wrapped in a native shell. The whole layout uses `position: fixed` on `#app`, custom scroll containers, and `env(safe-area-inset-*)` for safe areas — which is the only sane approach on iOS WKWebView.

### Decisions & trade-offs

- **Chose Supabase over a local SQLite bundle**, so I can update lesson content without shipping an app update. The trade-off is that first load needs a network call; the static fallback covers that.
- **Chose Capacitor over React Native**, because Vue is what I already knew and I didn't want to learn a new framework at the same time as learning mobile. The trade-off is a slightly thinner native integration story.
- **Chose looped MP3 recordings over audio synthesis for the shruti box**, because synthesis never sounds right for a tanpura, and the files are small enough to bundle. The trade-off is thirteen separate audio files, one per key.
- **Chose markdown for foundational (theory) lessons**, so I can write and edit them without touching code. The trade-off is an extra rendering step and scoped CSS hacks for `v-html` content.
- **Skipped user accounts for now.** Progress is stored in `localStorage`. It's enough for a single-device learner and avoids the auth surface entirely for a v1.

## What was hard

**Encoding 35 Alankaras from a 1930s textbook.** The Ganamruta Bodhini is the canonical reference, and the notation is unambiguous once you understand it — but transcribing all 35 Alankaras (seven tāḷa groups × five jāthis) accurately into the JSON schema took care. Each Alankara has between four and twelve rows, each row maps to one āvartam, and the angam separators (`|`) have to land in exactly the right places or the grid mis-counts the beats. I went through the PDF section by section and cross-checked the akshara counts for each tāḷa structure.

**The blank screen on first open for intermediate and advanced users.** The static fallback data only covers beginner chapters. A new user who picked Intermediate or Advanced in onboarding landed on the home screen, `store.currentLesson` returned `undefined`, and the template crashed before painting anything. The fix was a `v-if="current"` guard with a "loading lessons" placeholder card — the real card appears once the Supabase fetch resolves. The harder lesson: a new user's chosen level needs to be respected from the first frame, not just after the network call.

## What I learned

- **Technical:** store content separately from code and fetch it after mount — it's the only way to update a lesson without re-submitting to the App Store. JSONB for structured notation is a good fit: you can query it and it serialises cleanly to Vue.
- **Product:** an app for a tradition you care about is different from an app for a problem you've diagnosed. I know what a good lesson feels like, which made design decisions fast. The risk is building for one person (me, or my son) and not leaving enough room for how other people learn.
- **Process:** the shruti box and the lesson path are independent enough that I could build and ship them in parallel. Getting the drone right early meant every screenshot and demo had something to show that wasn't just text on a screen.
- **Differently next time:** build the content pipeline (how I add new lessons) before the content itself. I added the first lessons by hand and only later wrote the SQL migration pattern. The right order is migrations first, then content.

## What's next

- Android release (the Capacitor build is ready; waiting on Play Store review).
- Compositions: Geethams, Varnams, and a first Kriti, with full lyrics and raga-scale cards.
- Rasikas mode — a separate reading and reference experience for people who love Carnatic music but aren't actively learning it. Raga encyclopaedia, composition library, concert context.
- Open question: should the app eventually support teacher accounts, so a guru can assign lessons and track a student's progress?

## Try it

- **App Store:** <!-- TODO(prash): add the App Store link -->
- **Android waitlist:** <!-- TODO(prash): add the waitlist link -->
- **Source:** private for now
