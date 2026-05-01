# SpeakUp Inner Pages Redesign — Implementation Plan

## Overview

Redesign all inner (authenticated) pages to match the new Claude Design mockups from the light and dark mode PDFs. Logic, hooks, and APIs stay untouched — only the UI layer changes.

---

## Shared Design Pattern (applies to every page)

Every inner page gets:
- Small indigo uppercase label at top (e.g. "Lesson Library")
- Large bold black/white heading
- Grey subtitle text
- White cards with light borders and rounded corners
- Dark mode: dark page bg (`#0f1117`), dark cards (`#1a1f2e`), white text

---

## Phase 1 — Foundation

### `client/src/index.css`
- Add `html[data-dark]` variable overrides for dark mode
- Dark page background: `#0f1117`
- Dark card background: `#1a1f2e`
- Dark border color: `#2a2f3e`
- White headings, light grey body text

### `client/src/components/layout/AppLayout.tsx`
- On mount, read `localStorage.getItem('dark')` and apply `document.documentElement.dataset.dark = '1'` if set
- Expose a `toggleDark()` function accessible to SettingsPage

---

## Phase 2 — Page Redesigns

---

### 1. LessonsPage (`client/src/pages/LessonsPage.tsx`)

**Add state:**
- `search: string` — search input value
- `filter: 'all' | 'interviews' | 'business' | 'daily-life' | 'grammar'` — active tab

**Remove:**
- Category group headers (grammar_focus, vocabulary_building, fluency_drill grouping)
- "Request AI Curriculum" empty state CTA

**Add:**
- Search bar at top (magnifier icon + placeholder "Search lessons...")
- Filter tabs row: All / Interviews / Business / Daily Life / Grammar
  - Active tab: indigo filled pill
  - Inactive tabs: outline pill
- "N lessons" count label below tabs
- Derive filtered list from `search` + `filter` state

**Redesign lesson card:**
- Top row: category badge (grey outline) + difficulty badge (green=Beginner, blue=Intermediate, orange=Advanced)
- Bold lesson title
- Description text
- Thin horizontal divider
- Metadata row: clock icon + duration · people icon + enrollee count · star icon + rating · arrow icon (far right)
- Hover: subtle lift shadow

---

### 2. CustomScenarioSetup (`client/src/components/conversation/CustomScenarioSetup.tsx`)

**Remove:**
- Name input field
- Level selector (beginner/intermediate/advanced buttons)
- Custom scenario textarea
- Examples dropdown

**Add:**
- Page header: "Custom Practice" indigo label + "Start a freeform session" heading + subtitle
- **Conversation type section** — "Conversation type" label + 3×2 selectable card grid:
  - 💬 Casual Conversation — Talk freely about anything — hobbies, plans, opinions.
  - 💼 Interview Practice — Rehearse answers for real interview scenarios.
  - ⚡ Structured Debate — Build and defend an argument on a given topic.
  - 🎤 Presentation Prep — Practice delivering a talk or pitch clearly.
  - 📋 Meeting Simulation — Simulate leading or contributing to a work meeting.
  - ✏️ Custom Topic — Describe any scenario you want to practice.
  - Selected card: indigo border + light indigo background tint
- **Focus area section** — "Focus area" label + pill chips (single-select):
  - Improve fluency / Fix grammar / Build vocabulary / Sound professional / Reduce hesitation
  - Active chip: solid indigo background, white text
  - Inactive chip: outline, dark text
- "Begin Session →" primary indigo button

**State changes:**
- Replace `name`, `level`, `customScenario` with `selectedType: string` and `selectedFocus: string`
- Map to existing `onStart` callback: pass type as scenario description, focus as goal

---

### 3. ConversationView (`client/src/components/conversation/ConversationView.tsx`)

**Add at top:**
- Header strip: "Live Conversation" indigo label + "AI Coaching Session" heading + subtitle
- 3 stat cards row:
  - ⏱ Elapsed — derived from a `useEffect` timer started on mount
  - ✏️ Corrections — count of messages with `type === 'correction'` from `messages` array
  - 💼 Topic — from scenario context passed as prop

**Redesign chat bubbles:**
- AI messages (left): white card, dark text, no change to logic
- User messages (right): solid indigo background (`#6366f1`), white text
- Correction/suggestion messages: left-aligned, amber "Suggestion" label above, white bg with amber left border accent

**Keep unchanged:** voice button, TTS, STT, `useConversation` hook, send logic

---

### 4. HistoryPage (`client/src/pages/HistoryPage.tsx`)

**Add state:**
- `filter: 'all' | 'lesson' | 'custom'` — active tab filter

**Remove:**
- 4 stat cards at top (sessions, messages, avg score, practice time)
- Card grid layout

**Add:**
- Filter tabs: All / Lesson / Custom + "N sessions" count right-aligned
- Derive filtered sessions from `filter` state

**Redesign as list rows** (each session = one row in a white bordered container):
- **Score circle** (left, rounded square ~48px):
  - Score ≥ 85: green background
  - Score 70–84: amber background
  - Score < 70: red background
  - No score: grey background
- **Session info** (middle):
  - Bold session/topic name
  - Date · Duration · Type badge (indigo pill = Lesson, grey pill = Custom)
- **Right side:** corrections count (bold large number) + "corrections" small label
- **Chevron** icon to navigate to session detail
- Clicking row → navigate to `/history/:id`

---

### 5. ProgressPage (`client/src/pages/ProgressPage.tsx`)

**Remove:**
- `LevelRecommendation` card
- Grammar stats card
- Topic breakdown section
- 3-column grid layout

**Redesign stat cards** (keep same data, new style):
- 4 cards: Sessions completed / Total practice time / Average score / Current streak
- Each card: emoji icon in soft rounded square bg + large bold number + label + green delta text (e.g. "+5 this week")
- Sessions, Practice Time, Avg Score: 3 in a row
- Streak: separate wider card below with "Personal best!" text if applicable

**Redesign bar chart ("Weekly scores"):**
- Label: "Weekly scores"
- 7 bars (Mon–Sun), all light grey except current day = indigo
- Score label above each bar
- Day label below each bar
- Keep existing height calculation logic, restyle only

**Add "Skill breakdown" section:**
- 4 progress bar rows using existing `data.focusAreas` or similar:
  - Fluency — green bar
  - Grammar — amber bar
  - Pronunciation — indigo bar
  - Vocabulary — purple bar
- Each row: label (left) + progress bar (fill width = score/100) + score number + green delta (right)

---

### 6. VocabularyReviewPage (`client/src/pages/VocabularyReviewPage.tsx`)

**This is a full interaction model redesign.**

**Add state:**
- `view: 'list' | 'cards'` — toggle between list and flashcard view
- `filter: 'all' | 'professional' | 'business' | 'general'` — category filter
- `known: Set<string>` — locally tracked known words (in addition to hook state)

**Header:**
- "Vocabulary" indigo label
- "Words from your sessions" heading
- Subtitle text
- "List / Cards" segmented toggle button (top-right)

**Below header:**
- Filter tabs: All / Professional / Business / General + "X/Y mastered" count right-aligned
- Green mastery progress bar (width = mastered/total × 100%)

**List view (default):**
- Each vocabulary row in a white bordered container:
  - Word (bold, large) + category badge (indigo=Professional, orange=Business, grey=General)
  - Definition text
  - Italic example sentence in grey
  - "Mark known" button (outline, right) or "✓ Known" button (green filled, right) — toggle on click
- Map from `results` array in `useVocabReview` hook

**Cards view:**
- Keep existing flashcard logic from `useVocabReview` hook
- Restyle card to be a centered white card with word large, definition below, input at bottom

---

### 7. SettingsPage (`client/src/pages/SettingsPage.tsx`)

**Remove:**
- 3-column grid layout
- Theme selector (calm-garden, ocean-breeze, midnight)
- Font size buttons (A/A/A)
- Corner radius buttons
- Home style selector
- Chat density selector
- Animation toggle
- Voice preview section complexity
- ElevenLabs usage bar
- Reset defaults button

**New layout — single column, stacked cards:**

**Profile card:**
- Title: "Profile" + subtitle "Your display name and email address."
- Full name text input (pre-filled from user)
- Email address text input (pre-filled, read-only)

**Voice & Audio card:**
- Title: "Voice & Audio" + subtitle "Microphone selection and AI speech speed."
- Microphone dropdown (keep existing `serverVoices` / browser voices logic)
- "AI voice speed — 1×" label + slider (0.5× to 2×, keep existing `voiceSpeed` state)

**Appearance card:**
- Title: "Appearance" + subtitle "Customize how SpeakUp looks."
- "Dark mode" toggle row — wires to Phase 1 `toggleDark()` + `localStorage`

**Daily Reminders card:**
- Title: "Daily Reminders" + subtitle "Get a notification to practice each day."
- "Enable daily reminders" toggle row
- "Reminder time" time input (shown only when toggle is on)

**Account card:**
- Title: "Account" + subtitle "Security and account management."
- "Change password" outline button
- "Delete account" button with red text (keep existing danger confirmation)

**Save changes:**
- Primary indigo button below all cards
- Calls existing `updateSettings()` from `useSettings` hook

---

## Phase 3 — Dark Mode Polish

After all pages are implemented:
- Toggle dark mode in Settings and verify each page
- Check: card backgrounds, text colors, borders, input fields, badges, progress bars
- Fix any hardcoded `#fff` or `white` that doesn't respond to `html[data-dark]`

---

## Files Changed

| File | Change Type |
|---|---|
| `client/src/index.css` | Add dark mode CSS variables |
| `client/src/components/layout/AppLayout.tsx` | Dark mode init on mount |
| `client/src/pages/LessonsPage.tsx` | Full redesign |
| `client/src/components/conversation/CustomScenarioSetup.tsx` | Full redesign |
| `client/src/components/conversation/ConversationView.tsx` | Header + stat cards + bubble restyle |
| `client/src/pages/HistoryPage.tsx` | Full redesign |
| `client/src/pages/ProgressPage.tsx` | Full redesign |
| `client/src/pages/VocabularyReviewPage.tsx` | Full redesign |
| `client/src/pages/SettingsPage.tsx` | Full redesign |

## Files NOT Changed

| File | Reason |
|---|---|
| `client/src/pages/PracticePage.tsx` | Thin wrapper only, no UI |
| `client/src/pages/CustomPracticePage.tsx` | Thin wrapper only, no UI |
| `client/src/hooks/useConversation.ts` | Logic only |
| `client/src/hooks/useVocabReview.ts` | Logic only |
| `client/src/hooks/useSettings.ts` | Logic only |
| `client/src/pages/HomePage.tsx` | Already redesigned |
| `client/src/pages/LoginPage.tsx` | Already redesigned |
| `client/src/pages/SignupPage.tsx` | Already redesigned |

---

## Implementation Order

1. `index.css` — dark mode variables (5 min)
2. `AppLayout.tsx` — dark mode init (10 min)
3. `ProgressPage.tsx` — no interaction complexity, good warm-up (30 min)
4. `HistoryPage.tsx` — list rows, filter tabs (30 min)
5. `LessonsPage.tsx` — search + filter + card redesign (30 min)
6. `VocabularyReviewPage.tsx` — list + cards view toggle (45 min)
7. `SettingsPage.tsx` — simplify + dark mode toggle (45 min)
8. `CustomScenarioSetup.tsx` — new type/focus selection UI (30 min)
9. `ConversationView.tsx` — stat cards + bubble restyle (45 min)
10. Dark mode polish pass (20 min)
