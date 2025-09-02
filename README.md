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
