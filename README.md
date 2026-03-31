# SHSAT Math Practice (Next.js)

A sleek, zero-DB SHSAT math practice app. Create timed quizzes, run a realistic **57-question exam (90 min)**, filter by category (Algebra / Geometry / Statistics-Probability), and get instant scoring — all powered by simple JSON files.

---

## ✨ Features

- **One-click Exam Mode**: Generates a 57-question set with **exactly 5 Grid-In** and a target mix: **40–45% Algebra/Proportional**, **30–35% Geometry**, **15–20% Statistics/Probability**.
- **Custom quizzes**: Choose question count, randomize order, set a timer.
- **Category filtering**: Start Algebra-only, Geometry-only, or Stats/Prob-only sets.
- **Instant scoring**: Per-question correctness, total score, and a **Reveal Results** mode.
- **Cancel test**: Leave mid-test and return to configuration safely.
- **Zero database**: Drop JSON files into `lib/database/*.json` and the app auto-discovers them.

---

## 🧱 Tech Stack

- **Next.js (App Router)** + **TypeScript**
- **React** + **Tailwind CSS**
- No database required (filesystem JSON loader)
- Optional preset selector for DOE-like exam mix

---

## 🚀 Quick Start

```bash
# 1) Install dependencies
npm install

# 2) Add your questions
#   Put *.json files into lib/database/
#   (See schema below.)

# 3) Run the app
npm run dev
# Visit http://localhost:3000




Use the following design system and visual style for all UI components.

Project: SHSAT Guide (student learning dashboard)

Stack:
Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Lucide Icons + Framer Motion.

Overall Style:
Clean modern SaaS dashboard similar to Linear / Vercel / Notion style interfaces. 
Soft gradients, rounded cards, subtle shadows, minimal borders, calm academic feel.

Color System:
Primary gradient:
from-indigo-600 → to-violet-600

Primary accent colors:
indigo-600
violet-600
fuchsia-500

Background system:
Main page background:
bg-gradient-to-br from-slate-50 via-white to-indigo-50/40

Cards:
bg-white
border-slate-200/70
rounded-2xl or rounded-3xl
shadow-sm or soft shadow

Sidebar:
bg-white/90 backdrop-blur-xl
border-r border-slate-200/70

Hover surfaces:
hover:bg-slate-100

Inactive text:
text-slate-600

Muted text:
text-slate-500

Main headings:
text-slate-900

Active navigation state:
bg-gradient-to-r from-indigo-600 to-violet-600
text-white
shadow-md shadow-indigo-500/20

Icon containers:
h-10 w-10
rounded-xl
bg-slate-100
text-slate-600

Layout Rules:
Sidebar width collapsed: w-20
Sidebar width expanded: w-72
Icons stay fixed and labels fade in when sidebar expands.

Spacing system:
Use h-14 rows for sidebar items.
Use px-4 / px-6 container spacing.
Cards use p-4 or p-6.

Animation rules:
Transitions should be subtle and smooth.

Use:
transition-all duration-200
or
transition-[width] duration-300

Hover animations should not shift layout elements.

Design philosophy:
Minimal
Readable
Student-friendly
Professional SaaS dashboard
Not overly colorful.

Avoid:
Harsh colors
Heavy gradients everywhere
Overcrowded UI
Large shadows.

All pages should visually belong to the same system as the dashboard and sidebar.