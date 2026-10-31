# AI Notes Summarizer & Quiz Generator

A full stack web application: paste study notes, get an AI summary and a 5-question MCQ quiz, solve it, and keep every note in your history.

**Stack:** React (Vite) · Node.js · Express · MongoDB (Mongoose) · JWT + bcrypt · Gemini API

## Features
1. Sign up / Log in (JWT auth, password hashing)
2. Paste notes **or upload a PDF / TXT file** (max 5 MB; PDFs need selectable text, scanned image PDFs are not supported) → **Generate** → AI summary + 5 MCQs
3. Solve the quiz → Submit → score, right/wrong marking, explanations → Try Again
4. History: every note is saved per user; open or delete any of them
5. Logout

## Folder structure
```
ai-notes-quiz-app/
├── server/
│   ├── basic-server.js          # plain Node http server (no Express)
│   ├── .env.example
│   └── src/
│       ├── server.js            # connects MongoDB, starts the app
│       ├── app.js               # Express app + middleware + routes
│       ├── models/              # User.js, Note.js (Mongoose)
│       ├── routes/              # auth.js, notes.js
│       ├── middleware/          # auth (JWT), requestLogger, errorHandler
│       ├── services/ai.js       # Gemini API call + JSON validation
│       ├── services/pdf.js      # reads text out of an uploaded PDF (Buffer)
│       └── utils/logger.js      # fs logging + EventEmitter
└── client/
    ├── vite.config.js
    └── src/
        ├── main.jsx, App.jsx, api.js, styles.css
        ├── context/AuthContext.jsx   # useContext login state
        ├── hooks/useQuiz.js          # custom hook
        ├── components/               # Layout, ProtectedRoute, Quiz (+ CSS Module)
        └── pages/                    # AuthPage, Home, History (lazy loaded)
```

## Quick start (easiest way, Windows)

1. Install **Node.js LTS** from https://nodejs.org (one time).
2. Unzip, then in VS Code: **File → Open Folder → ai-notes-quiz-app**.
3. Double-click **`setup.bat`** (installs all packages for backend and frontend). 
   *(or in VS Code: Terminal → Run Task → "1. Install all packages")*
4. Open **`server/.env`** and paste:
   - `MONGODB_URI` = your MongoDB Atlas connection string (Step 3 below)
   - `GEMINI_API_KEY` = your free key from https://aistudio.google.com  
   (`JWT_SECRET` is already filled in.)
5. Double-click **`start.bat`**. It opens the backend, the frontend and the browser.  
   *(or in VS Code: Terminal → Run Task → "2. Start app (backend + frontend)")*

The detailed steps below explain the same thing manually.

## Setup (Windows / VS Code)

You need: **Node.js 18+** (LTS), **VS Code**, and either local MongoDB or a free **MongoDB Atlas** cluster.

### 1. Get a free Gemini API key
Open https://aistudio.google.com → "Get API key". Keep it private; it goes only in `server/.env`.

### 2. Backend
```bash
cd server
npm install
copy .env.example .env   # skip this: server/.env is already created for you
```
Edit `server/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/ai_notes_quiz   # or your Atlas connection string
JWT_SECRET=any_long_random_text_here
GEMINI_API_KEY=paste_your_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_FALLBACK_MODEL=        # optional backup model, used when the main one is overloaded
```
Then run:
```bash
npm run dev
```
You should see `Server running on http://localhost:5000` and `AI: Gemini enabled`.

> If `GEMINI_API_KEY` is empty the app runs in **demo mode**: the summary is the first few sentences and the quiz is a generic placeholder. The app shows a yellow "Demo mode" banner. Do not present demo mode as the AI feature.
>
> If the AI returns "request was rejected", the model name may have changed. Pick a currently free model in Google AI Studio and put its ID in `GEMINI_MODEL`.

### 3. Frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the URL Vite prints (usually http://localhost:5173).

### 4. Basic Node.js server (syllabus Module 4)
```bash
cd server
npm run basic
```
Open http://localhost:4000, http://localhost:4000/health and http://localhost:4000/logs (shows the last 20 lines of the log the Express app writes).

## API routes
| Method | Route | Auth | What it does |
|---|---|---|---|
| POST | /api/auth/signup | – | create account, returns JWT |
| POST | /api/auth/login | – | login, returns JWT |
| POST | /api/notes/extract | JWT | upload a PDF (multipart, field `file`), returns its text |
| POST | /api/notes/generate | JWT | AI summary + quiz, saved to MongoDB |
| GET | /api/notes/history | JWT | list the user's notes |
| GET | /api/notes/:id | JWT | one note with its quiz |
| DELETE | /api/notes/:id | JWT | delete a note |
| GET | /api/health | – | server check |

## Syllabus coverage (Modules 2–6)

| Module | Where it appears |
|---|---|
| **2. JavaScript** | async/await + fetch (`client/src/api.js`, `server/src/services/ai.js`), arrow functions, destructuring, `map` / `filter` / `reduce` (quiz score), form validation (`AuthPage.jsx`), DOM events, ES6 modules, localStorage for the token, Promises (`.then/.catch/.finally` in `History.jsx`), `AbortSignal.timeout` |
| **3. React** | Components + props, JSX, `useState`, `useEffect`, lists with keys, conditional rendering (loading / error / quiz), forms, React Router with protected routes (`ProtectedRoute.jsx`), `useContext` (`AuthContext.jsx`), custom hook (`useQuiz.js`), `useMemo` / `useCallback` / `React.memo`, `React.lazy` + `Suspense` (`App.jsx`), CSS Modules (`Quiz.module.css`) |
| **4. Node.js** | npm + `package.json`, `fs.appendFile` / `fs.readFile`, `path`, `EventEmitter` (`utils/logger.js`), event-driven streams (`req.on("data")`), Buffers (an uploaded PDF is held in memory as a Buffer in `services/pdf.js`), basic HTTP server without Express (`server/basic-server.js`), async programming, environment variables |
| **5. Express** | Routing, middleware (`cors`, `express.json`, request logger, JWT auth middleware), RESTful CRUD API, file upload middleware (`multer`), error-handling middleware + 404 handler (`middleware/errorHandler.js`), logging, JWT + bcrypt authentication |
| **6. Databases & integration** | MongoDB + Mongoose models (`models/`), React ↔ Express connection via fetch, CORS config (`app.js`), `.env` files, deployment basics (below) |

(Module 1 is skipped.) Note: the project uses `bcryptjs`, the pure-JavaScript version of bcrypt. It works the same and installs without build tools on Windows.

## Deployment basics (for the report; optional to do)

**Database:** create a free MongoDB Atlas cluster and use its connection string as `MONGODB_URI`.

**Backend on Render:** New → Web Service → connect the GitHub repo → Root Directory `server` → Build command `npm install` → Start command `npm start` → add the env vars from `.env.example`, with `CLIENT_URL` set to your Vercel URL.

**Frontend on Vercel:** Import the repo → Root Directory `client` → Framework Vite → add env var `VITE_API_URL=https://YOUR-RENDER-URL/api`. `client/vercel.json` already makes React Router links work on refresh.

## Troubleshooting
- **Blank page:** check the browser console (F12). Make sure `npm install` was run inside `client`.
- **"Cannot reach the server":** start the backend first and check `VITE_API_URL`.
- **CORS error:** `CLIENT_URL` in `server/.env` must match the frontend URL exactly.
- **MongoDB connection failed:** start local MongoDB, or use an Atlas connection string (allow your IP in Atlas Network Access).
- **429 from AI:** free-tier rate limit; wait a minute.
- **"The AI is busy right now":** Google's model is overloaded for a moment. The server already retries 3 times (and tries `GEMINI_FALLBACK_MODEL` if set); wait a minute and click Generate again.
