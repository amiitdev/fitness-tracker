<div align="center">
  <br/>
  <img src="./assets/icon.png" width="80" height="80" alt="FitTrack Logo"/>
  <h1>FitTrack — Calisthenics Tracker</h1>
  <p><strong>Bodyweight training companion powered by AI</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Expo-56.0-000?style=flat&logo=expo&logoColor=white" alt="Expo SDK 56"/>
    <img src="https://img.shields.io/badge/React%20Native-0.85-61DAFB?style=flat&logo=react&logoColor=white" alt="React Native 0.85"/>
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white" alt="MongoDB"/>
    <img src="https://img.shields.io/badge/Express.js-000?style=flat&logo=express&logoColor=white" alt="Express.js"/>
    <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/OpenRouter%20AI-GPT--4o--mini-412991?style=flat&logo=openai&logoColor=white" alt="OpenRouter AI"/>
  </p>

  <br/>
</div>

## 📱 About

FitTrack is a full-stack **calisthenics (bodyweight) fitness tracker** built with React Native (Expo) and the MERN stack. Track your bodyweight workouts, get real-time AI coaching from GPT-4o-mini via OpenRouter, and monitor your progress — all with zero gym equipment required.

### ✨ Features

| Feature | Description |
|---------|-------------|
| **Calisthenics-Focused** | 25+ bodyweight exercises — push-ups, pull-ups, dips, squats, planks, and more |
| **AI Coach** | Real-time form guidance powered by OpenAI GPT-4o-mini via OpenRouter |
| **AI Chat** | Conversational fitness assistant — ask about form, routines, nutrition |
| **Preset Routines** | Push Day, Pull Day, Leg Day, Core Crusher, Full Body Blast |
| **Custom Workouts** | Build your own with search, adjustable sets & reps |
| **Live Timer** | Neon-styled stopwatch with haptic tick, pause/resume/reset |
| **Workout History** | Detailed per-exercise, per-set breakdown with long-press delete |
| **5 Dark Themes** | Midnight Black, Charcoal Gray, Deep Ocean, Forest Night, Royal Dark |
| **JWT Auth** | Self-rolled authentication — no third-party services |
| **SQLite Persistence** | Cross-session state via `tracker.db` |

## 🖼️ Screenshots

<div align="center">
  <img src="./assets/splash-icon.png" width="200" alt="Home Screen"/>
  <img src="./assets/icon.png" width="200" alt="Workout Screen"/>
  <img src="./assets/splash-icon.png" width="200" alt="AI Chat"/>
</div>

## 🏗️ Tech Stack

```
┌─────────────────────────────────────────────────┐
│                  Frontend                        │
│  React Native 0.85 · Expo SDK 56 · TypeScript 6 │
│  Expo Router (file-based routing)                │
│  @expo/vector-icons · AsyncStorage               │
├─────────────────────────────────────────────────┤
│                   Backend                        │
│  Node.js · Express.js · MongoDB + Mongoose       │
│  JWT (jsonwebtoken) · bcryptjs                   │
│  OpenRouter AI (GPT-4o-mini) API                 │
├─────────────────────────────────────────────────┤
│                   Auth                           │
│  Custom JWT · AsyncStorage token cache           │
│  Secure HTTP-only flow                           │
└─────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Expo Go** on your phone (iOS/Android)
- **OpenRouter API key** (optional, for AI features)

### 1. Clone & Install

```bash
git clone git@github.com:amiitdev/fitness-tracker.git
cd fitness-tracker

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/fittrack
JWT_SECRET=your_jwt_secret_here
OPENROUTER_API_KEY=sk-or-v1-your_key_here
```

### 3. Seed the Database

```bash
cd backend
node seed.js
```

### 4. Start the Backend

```bash
cd backend
node index.js
```

The API runs on `http://0.0.0.0:5000`.

### 5. Start the Frontend

```bash
cd frontend
npx expo start --clear
```

Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator / `i` for iOS simulator.

> **Note:** Your phone must be on the same network as the backend server. The app auto-detects the machine IP from the Expo debugger host.

## 🧭 Project Structure

```
fitness-tracker/
├── backend/
│   ├── index.js              # Express server entry
│   ├── seed.js               # Exercise data seeder
│   ├── .env                  # Environment variables
│   ├── models/
│   │   ├── Exercise.js       # Exercise schema
│   │   ├── User.js           # User schema
│   │   └── Workout.js        # Workout schema (calisthenics: no weight)
│   ├── routes/
│   │   ├── ai.js             # OpenRouter coach & chat endpoints
│   │   ├── auth.js           # JWT signup/signin/me
│   │   ├── exercises.js      # Exercise CRUD + search
│   │   └── workouts.js       # Workout CRUD + complete
│   └── middleware/
│       └── auth.js           # JWT verification middleware
├── frontend/
│   ├── app/                  # Expo Router file-based routes
│   │   ├── (auth)/           # Sign-in / Sign-up screens
│   │   ├── (tabs)/           # Main tab screens
│   │   │   ├── index.tsx     # Home (stats + recent workouts)
│   │   │   ├── exercises.tsx # Exercise browser with search
│   │   │   ├── workout.tsx   # Preset routines + custom builder
│   │   │   ├── active-workout.tsx  # Live workout with neon timer
│   │   │   ├── history.tsx   # Workout history
│   │   │   ├── workout-detail.tsx  # Per-exercise breakdown
│   │   │   ├── ai-chat.tsx   # AI fitness assistant chat
│   │   │   └── _layout.tsx   # Tab navigator + theme
│   │   └── _layout.tsx       # Root layout
│   ├── components/
│   │   ├── AICoachModal.tsx  # AI form guidance modal
│   │   ├── ExerciseCard.tsx  # Exercise card with muscle icons
│   │   ├── ThemedButton.tsx  # Themed button component
│   │   ├── ThemedInput.tsx   # Themed input component
│   │   └── WorkoutCard.tsx   # Workout summary card
│   ├── context/
│   │   ├── AuthContext.tsx   # Auth state + JWT management
│   │   └── ThemeContext.tsx  # 5 dark themes
│   └── services/
│       └── api.ts            # API client with token caching
└── assets/
    ├── icon.png
    ├── splash-icon.png
    └── logo.svg
```

## 🎨 Themes

5 dark-themed colour schemes available in `frontend/context/ThemeContext.tsx`:

| Theme | Primary | Background | Vibe |
|-------|---------|------------|------|
| **Midnight Black** | `#00FF88` | `#0A0A0A` | Pure dark |
| **Charcoal Gray** | `#6C63FF` | `#1A1A2E` | Deep purple |
| **Deep Ocean** | `#00B4D8` | `#0D1B2A` | Blue tones |
| **Forest Night** | `#2ECC71` | `#0F1F0F` | Green calm |
| **Royal Dark** | `#BB86FC` | `#1E1E2E` | Purple luxury |

## 🤖 AI Features

FitTrack integrates **OpenRouter AI (GPT-4o-mini)** for:

- **Form Coach** — Tap any exercise → "AI Coach" modal for instant form guidance
- **AI Chat** — Full conversational assistant for workout planning, nutrition, recovery
- **Topic-Restricted** — The AI only answers fitness-related questions, politely refusing off-topic queries

To enable AI, set your `OPENROUTER_API_KEY` in `backend/.env` and restart the server.

## 🔐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Create account |
| `POST` | `/api/auth/signin` | Sign in |
| `GET` | `/api/auth/me` | Get user profile |
| `GET` | `/api/exercises` | List exercises (?search=, ?category=, ?muscleGroup=) |
| `GET` | `/api/exercises/:id` | Get exercise details |
| `GET` | `/api/workouts` | List user workouts |
| `POST` | `/api/workouts` | Create workout |
| `GET` | `/api/workouts/active` | Get active workout |
| `PUT` | `/api/workouts/:id` | Update workout |
| `POST` | `/api/workouts/:id/complete` | Complete workout |
| `DELETE` | `/api/workouts/:id` | Delete workout |
| `POST` | `/api/ai/coach` | Get form guidance for an exercise |
| `POST` | `/api/ai/chat` | Chat with AI fitness assistant |

## 📄 License

MIT — feel free to use, modify, and distribute.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/amiitdev">amiitdev</a></sub>
  <br/>
  <sub>FitTrack — No gym required. Just you, your body, and AI.</sub>
</div>
