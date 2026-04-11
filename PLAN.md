# AI English Speaking Partner — Full Product Plan

---

## 1. Problem & Opportunity

Many people in India understand English but cannot speak confidently due to lack of practice
and fear of judgment. Existing apps (Duolingo, ELSA Speak) focus on vocabulary and grammar,
not conversational confidence. No dominant player owns the "fearless practice" angle.

**Validation signals:**
- ELSA Speak raised $23M targeting this problem
- Speak.com raised $27M for AI conversation practice
- India has ~250M English learners stuck at the "understand but can't speak" gap
- Reddit/Quora threads on "scared to speak English" get thousands of upvotes

---

## 2. Target Users

1. College students (presentations, vivas, campus interviews)
2. Job seekers (placement season, HR rounds)
3. Non-English medium school graduates

---

## 3. Value Proposition

A safe, AI-powered environment where users practice speaking English daily without fear of
judgment. Confidence-first, not grammar-first.

---

## 4. Core Features

### MVP (Phase 1)
- Voice-based conversation (primary feature)
- Text chat fallback
- Friendly AI persona ("Aria")
- Gentle grammar feedback — max 1 correction per message
- 3 conversation topics: Job Interview, Daily Life, College
- Basic progress tracking

### Phase 2
- Streak system with reminders
- Progress dashboard (grammar trends, topic scores)
- Pronunciation feedback
- IELTS speaking practice
- Conversation history + PDF download

### Phase 3
- Group conversation rooms (2–3 users + AI moderator)
- 30-day curriculum with certificates
- React Native mobile app
- OpenAI Realtime API migration (sub-600ms latency)

---

## 5. Tech Stack (100% Free to Start)

```
Frontend + API Routes:  Next.js 14 (App Router) on Vercel Hobby (free)
Database:               Neon free tier (serverless Postgres, 512MB)
Auth:                   Clerk free tier (up to 10k MAU)
LLM:                    Groq API free tier — llama-3.3-70b-versatile
STT:                    Web Speech API (browser built-in, free)
                        Groq Whisper fallback — whisper-large-v3-turbo
TTS:                    Web Speech Synthesis API (browser built-in, free)
Payments:               Skip — product is free initially
ORM:                    Drizzle ORM + drizzle-kit
─────────────────────────────────────────────────────────
Monthly cost:           ₹0
```

### Free Tier Limits (Groq)
| Model | Free Limit |
|-------|-----------|
| whisper-large-v3-turbo | 7,200 req/day |
| llama-3.3-70b-versatile | 14,400 req/day |

### When to Upgrade
| Trigger | Upgrade |
|---------|---------|
| Vercel function timeouts (>10s) | Switch to Cloudflare Workers (still free) |
| TTS quality complaints | ElevenLabs free (10k chars/month) |
| Groq free limits hit | OpenAI API (pay as you go) |
| >500 DAU | Railway or Render for dedicated Postgres |

---

## 6. Architecture

### Voice Pipeline (Core Loop)

```
User taps mic
  → Web Speech API (browser STT — free, no API call)
    → Groq API (Llama 3.3 70b — structured JSON response)
      → Parse: { reply, grammarFeedback, followUpQuestion }
        → Web Speech Synthesis (browser TTS — free)
          → Show grammar tip in UI
```

Target latency on Indian 4G: **1.5–2.5 seconds** end-to-end.

### Latency Optimizations
1. **Sentence-boundary streaming** — fire TTS on first complete sentence from LLM stream,
   don't wait for full response. Cuts perceived latency by 40–60%.
2. Use `webm/opus` audio format in MediaRecorder (30–40% smaller than MP3).
3. Deploy to Vercel Edge (Mumbai PoP) for lower RTT from India.
4. Keep-alive connections (SSE or WebSocket) to avoid TCP handshake on every turn.

### System Architecture Diagram

```
Browser
  │
  ├── Web Speech API (STT)       ← free, no server
  ├── Web Speech Synthesis (TTS) ← free, no server
  │
  └── Next.js on Vercel
        │
        ├── /api/conversation    ← Groq LLM call
        ├── /api/voice/transcribe ← Groq Whisper (fallback STT)
        ├── /api/progress
        └── /api/webhooks/razorpay
              │
              └── Neon Postgres (via Drizzle ORM)
```

---

## 7. Project File Structure

```
ai-english/
├── PLAN.md                          ← this file
├── apps/
│   └── web/
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── sign-in/page.tsx
│       │   │   └── sign-up/page.tsx
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx              # Topic selector / home
│       │   │   ├── practice/
│       │   │   │   └── [scenarioId]/
│       │   │   │       └── page.tsx      # Main conversation UI
│       │   │   ├── progress/
│       │   │   │   └── page.tsx
│       │   │   └── settings/
│       │   │       └── page.tsx
│       │   └── api/
│       │       ├── conversation/
│       │       │   ├── route.ts          # POST: run LLM pipeline
│       │       │   └── [id]/end/route.ts # POST: end session, save summary
│       │       ├── voice/
│       │       │   └── transcribe/route.ts # POST: audio → Groq Whisper (fallback)
│       │       ├── progress/route.ts
│       │       └── webhooks/razorpay/route.ts
│       ├── components/
│       │   ├── voice/
│       │   │   ├── VoiceButton.tsx       # Mic button with pulse animation
│       │   │   ├── AudioVisualizer.tsx   # Waveform while AI speaks
│       │   │   └── TranscriptDisplay.tsx
│       │   ├── conversation/
│       │   │   ├── ConversationView.tsx  # Main container
│       │   │   ├── MessageBubble.tsx
│       │   │   └── FeedbackCard.tsx      # Grammar tip UI
│       │   └── ui/                       # shadcn/ui components
│       ├── hooks/
│       │   ├── useVoiceRecorder.ts       # MediaRecorder abstraction
│       │   ├── useWebSpeech.ts           # Web Speech API (STT + TTS)
│       │   └── useConversation.ts        # Full conversation state
│       └── lib/
│           ├── groq.ts                   # Groq client + helper functions
│           ├── voice-pipeline.ts         # STT → LLM → TTS orchestration
│           ├── scenarios.ts              # All scenario definitions
│           ├── system-prompts.ts         # AI persona prompt templates
│           └── db.ts                     # Drizzle instance
└── packages/
    └── db/
        ├── schema.ts                     # Database schema
        └── migrations/
```

---

## 8. Database Schema (Drizzle + Postgres)

```typescript
// packages/db/schema.ts

users {
  id                    uuid PK
  clerkId               varchar UNIQUE
  email                 varchar
  name                  varchar
  plan                  varchar    // 'free' | 'pro' | 'premium'
  planExpiresAt         timestamp
  currentStreak         integer    default 0
  longestStreak         integer    default 0
  lastPracticeDate      date
  totalMinutesPracticed integer    default 0
  xpPoints              integer    default 0
  createdAt             timestamp
}

conversations {
  id                    uuid PK
  userId                uuid FK → users
  topic                 varchar    // 'job_interview' | 'daily_life' | 'college'
  scenario              varchar    // 'tell_me_about_yourself'
  startedAt             timestamp
  endedAt               timestamp
  durationSeconds       integer
  messageCount          integer
  fluencyScore          integer    // 0–100
  grammarScore          integer    // 0–100
  vocabularyScore       integer    // 0–100
  summaryFeedback       text
}

messages {
  id                    uuid PK
  conversationId        uuid FK → conversations
  role                  varchar    // 'user' | 'assistant'
  content               text
  grammarErrors         jsonb      // [{ original, improved, tip }]
  suggestedPhrase       text
  createdAt             timestamp
}

userProgress {
  id                    uuid PK
  userId                uuid FK UNIQUE
  topicScores           jsonb      // { "job_interview": 72, "daily_life": 85 }
  weakAreas             jsonb      // ["articles", "prepositions", "past tense"]
  masteredPhrases       jsonb
  updatedAt             timestamp
}
```

---

## 9. AI Persona & System Prompt

### Persona: Aria

Aria is a warm, encouraging English speaking coach — like a supportive friend who is great at
English, not a strict teacher.

```
You are Aria, a warm English speaking coach. You are like a supportive friend —
encouraging, patient, and never judgmental.

YOUR PERSONALITY:
- Always positive. Never say "wrong" or "incorrect".
- Use phrases like "Great start!", "You're getting better!", "Nice try, let's refine that"
- Sound natural and conversational, not robotic
- Acknowledge when something is hard ("prepositions trip everyone up!")
- Keep your own replies SHORT — 1–3 sentences. This is a speaking practice app.

RESPONSE FORMAT — always return valid JSON:
{
  "response": "Your conversational reply (1-3 sentences)",
  "feedback": {
    "show": true,
    "original": "what they said",
    "improved": "better version",
    "tip": "one specific tip — max 15 words"
  },
  "followUpQuestion": "Next question to keep conversation going",
  "emotionalTone": "encouraging | neutral | celebratory"
}

FEEDBACK RULES (critical):
- Correct MAX 1 error per message. Never overwhelm.
- If they made 3 mistakes, pick only the most important one.
- If their English was good: set feedback.show = false and celebrate them.
- Focus on: verb tenses, articles (a/an/the), prepositions, sentence structure.
- After every 5 messages, give a mini celebration: "You're on a roll!"

CURRENT SCENARIO: {{scenario_name}}
USER LEVEL: {{user_level}}  // beginner | intermediate | advanced
```

### Scenario Library

```typescript
// lib/scenarios.ts
export const scenarios = {
  job_interview: [
    { id: 'intro',       name: 'Tell Me About Yourself',    difficulty: 'intermediate' },
    { id: 'strengths',   name: 'Strengths & Weaknesses',    difficulty: 'intermediate' },
    { id: 'why_company', name: 'Why This Company?',         difficulty: 'advanced'     },
  ],
  daily_life: [
    { id: 'restaurant',  name: 'Ordering at a Restaurant',  difficulty: 'beginner'     },
    { id: 'doctor',      name: 'Talking to a Doctor',       difficulty: 'beginner'     },
    { id: 'shopping',    name: 'Bargaining at a Market',    difficulty: 'beginner'     },
  ],
  college: [
    { id: 'presentation', name: 'Giving a Class Presentation', difficulty: 'intermediate' },
    { id: 'professor',    name: 'Talking to Your Professor',   difficulty: 'beginner'     },
    { id: 'group',        name: 'Group Project Discussion',    difficulty: 'intermediate' },
  ],
}
```

---

## 10. Key Technical Challenges & Solutions

### Challenge 1: Web Speech API Browser Compatibility
- Works in Chrome, Edge, Safari (iOS 14.5+)
- Doesn't work in Firefox
- **Solution:** Show a browser compatibility banner. Suggest Chrome. Keep Groq Whisper
  as fallback — upload recorded audio if Web Speech API is unavailable.

### Challenge 2: Indian Accent Recognition
- Web Speech API: set `recognition.lang = 'en-IN'` for better accuracy
- Groq Whisper: pass `language: 'en'` explicitly — improves accuracy ~15%
- Always show transcript to user before processing — tap to correct
- Keep a visible text input as permanent fallback

### Challenge 3: Freemium Limits (Never Cut Off Mid-Conversation)
```typescript
// Check BEFORE session starts, never interrupt mid-conversation
async function checkLimit(userId: string) {
  const todayCount = await getTodayConversationCount(userId)
  return {
    allowed: todayCount < 3 || user.plan !== 'free',
    remaining: Math.max(0, 3 - todayCount),
    showUpgrade: todayCount >= 2
  }
}
```

### Challenge 4: Vercel 10-Second Function Timeout
- Groq is fast enough (~1–2s for 70b model) — usually not an issue
- Use streaming responses (`stream: true`) to start sending data before timeout
- If needed, switch API routes to Cloudflare Workers (free, better for streaming)

### Challenge 5: TTS Voice Quality (Web Speech Synthesis)
- Quality varies by OS — Windows voices are weakest, macOS/iOS are good
- Let users pick from available system voices in settings
- On poor-quality voices, ElevenLabs free tier (10k chars/month) can be offered as
  a "premium voice" option

---

## 11. Conversation UI Design

```
┌─────────────────────────────────────┐
│  Job Interview: Tell Me About You   │
│  Session 1  •  Streak: 🔥 3 days    │
├─────────────────────────────────────┤
│                                     │
│   [Aria avatar / audio waveform]    │
│                                     │
│   Aria: "Good morning! Please       │
│   have a seat. Tell me a little     │
│   about yourself."                  │
│                                     │
│   ───────────────────────────────   │
│   You: "I am having 3 year          │
│   experience in software field"     │
│                                     │
│   💡 Try: "I have 3 years of        │
│      experience in software"        │
│                                     │
├─────────────────────────────────────┤
│          [  🎤 HOLD TO SPEAK  ]     │
│     ──────────────────────────      │
│     [  Type instead  ]              │
└─────────────────────────────────────┘
```

**UX Principles:**
- Non-judgmental: never show red/error colors. Use soft blue/green for feedback.
- Encouraging: every session ends with a summary of what went WELL.
- Simple: one screen, one action. No menus during practice.
- Progress visible: streak and session count always in header.

---

## 12. Monetization (Add Later)

Initially the app is 100% free. Add payments once you have real returning users.

| Plan | Price | Limits |
|------|-------|--------|
| Free | ₹0 | 3 conversations/day, 10 min each |
| Pro | ₹199/month | Unlimited conversations, detailed reports |
| Premium | ₹499/month | Pro + IELTS prep, interview simulations |

**Payment stack when ready:** Razorpay (India-native, supports UPI, free setup)

---

## 13. Build Phases & Timeline

### Phase 1 — MVP (Weeks 1–6)

| Week | Goal |
|------|------|
| 1 | Project setup, Neon DB, Drizzle schema, Clerk auth |
| 2 | Voice pipeline: Web Speech STT → Groq LLM → Web Speech TTS |
| 3 | Conversation UI, scenario selector, message display |
| 4 | Grammar feedback display, session summary |
| 5 | Progress tracking, streak system |
| 6 | Deploy to Vercel, bug fixes, share with 10 test users |

### Phase 2 — Growth (Weeks 7–14)

- Progress dashboard with charts
- More scenarios (IELTS, business, travel)
- Push notifications for streaks
- Pronunciation feedback (approximate, via Groq Whisper word timestamps)
- Conversation history + PDF export
- Add Razorpay payments

### Phase 3 — Scale (Month 4+)

- Migrate TTS to ElevenLabs or OpenAI TTS for better voice quality
- Group conversation rooms (Livekit/Daily.co for WebRTC)
- 30-day curriculum with LinkedIn certificates
- React Native app (better Android audio)
- Explore OpenAI Realtime API (single WebSocket: STT + LLM + TTS, ~400ms latency)

---

## 14. Environment Variables

```bash
# .env.local
GROQ_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=                    # Neon pooled connection string
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Add later when monetizing
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

---

## 15. Cost Estimate

### Phase 1 (Free tier, 0–100 users)
```
Vercel Hobby:     $0
Neon:             $0  (free tier: 512MB)
Clerk:            $0  (free: up to 10k MAU)
Groq API:         $0  (free tier: 14,400 LLM req/day)
Web Speech API:   $0  (browser built-in)
──────────────────────
Total:            $0 / month
```

### Phase 2 (Paid tier, 100–500 users)
```
Vercel Pro:       $20/month
Neon Pro:         $19/month
Clerk:            $0  (still free under 10k MAU)
Groq API:         $0–$20/month (or switch to OpenAI at ~$50–100)
ElevenLabs:       $5/month (starter, 30k chars)
──────────────────────
Total:            ~$44–64/month
Break-even:       30–40 paying users at ₹199
```

---

## 16. Fastest Path to First Real Users

**Week 1–2:** Build ONLY the voice loop. No auth, no DB, no payments.
One page. Mic button → Groq → speak back. Deploy and share.

**Week 3:** Add Clerk auth + single scenario: "Job Interview — Tell Me About Yourself"

**Week 4:** Add Neon DB + session saving + deploy publicly.
Launch on: LinkedIn, Reddit r/developersIndia, WhatsApp college groups.
Offer first 50 users permanent free access.

### Metrics to Track from Day 1

| Metric | Target | Action if below target |
|--------|--------|----------------------|
| D7 retention | > 20% | Voice loop feels bad — fix latency |
| Avg session length | > 5 min | Scenarios are boring — add variety |
| D1 → D7 drop-off reason | Survey users | Ask directly in app |
| Conversion (free→paid) | > 2% | Pricing or paywall placement issue |

---

## 17. Differentiation

**Most English apps:** correct you → grammar rules → tests → feels like school

**This app:** encourage you → practice conversation → build confidence → feels like a friend

The psychological safety of the practice environment is the product. The AI persona,
the gentle feedback, the non-judgmental UI — these are the moat, not the tech.

---

## 18. Resume Story

Once shipped with real users:

> "Built and launched an AI English speaking coach with real-time voice conversation
> (Web Speech API + Groq Llama 3.3 + TTS), serving X users with Y% weekly retention.
> Full-stack: Next.js, Postgres, Drizzle ORM, Clerk auth. Zero infrastructure cost at MVP."

That covers: full-stack, AI integration, product thinking, real users, cost efficiency.
