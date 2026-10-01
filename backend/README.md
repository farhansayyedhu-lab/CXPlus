# CXPulse AI Backend Platform

> **AI-Powered Customer Experience Intelligence Platform — REST API**

Built with **Node.js, Express.js, Supabase PostgreSQL, JWT Authentication, bcrypt, Zod validation, and Google Gemini 1.5 Flash AI**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | API Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | `eyJh...` |
| `JWT_SECRET` | Secret for signing auth tokens | `your-32-character-secret` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |

### 3. Setup Supabase Database
1. Open your Supabase project dashboard -> **SQL Editor**.
2. Run the contents of [`scripts/schema.sql`](file:///c:/Users/Farhan%20sayyed/Downloads/CXPulse/backend/scripts/schema.sql).
3. (Optional) Run the seed script:
```bash
npm run seed
```

### 4. Start the Backend Server
```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm start
```
Server starts at `http://localhost:5000`.

---

## 📡 REST API Reference (`/api/v1`)

### 🔐 Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Create a new agent / admin user
- `POST /api/v1/auth/login` — Sign in and receive JWT token
- `GET /api/v1/auth/me` — Get current user profile (Bearer token)
- `PUT /api/v1/auth/profile` — Update user details

### 📊 CX Metrics & Intelligence (`/api/v1/metrics`)
- `GET /api/v1/metrics/overview` — Total customers, open tickets, at-risk count, and CX score with sparklines
- `GET /api/v1/metrics/hero-insight` — AI Pattern detection banner
- `GET /api/v1/metrics/distribution` — Sentiment breakdown and channel volume

### 🎫 Tickets & Priority Queue (`/api/v1/tickets`)
- `GET /api/v1/tickets/priority-queue` — Top churn-risk customer tickets
- `GET /api/v1/tickets/:id` — Single ticket details and customer journey
- `POST /api/v1/tickets` — Create a new customer issue
- `PATCH /api/v1/tickets/:id` — Update ticket status, risk score, assignment
- `POST /api/v1/tickets/:id/resolve` — Mark ticket as resolved

### 🤖 AI Copilot Services (`/api/v1/ai`)
- `POST /api/v1/ai/generate-response` — Generate tailored response in requested tone (`default`, `shorter`, `empathetic`, `professional`, `firm`) via Google Gemini API
- `POST /api/v1/ai/analyze-sentiment` — Deep emotion, sentiment score, and risk factor classification
- `POST /api/v1/ai/predict-churn` — Predict churn drivers and recommended actions
- `POST /api/v1/ai/summarize` — Summarize multi-turn support threads

### 💬 Multi-Channel Feedback (`/api/v1/feedback`)
- `GET /api/v1/feedback` — List reviews & survey responses (filter by channel/sentiment)
- `POST /api/v1/feedback` — Ingest feedback with auto-sentiment detection

---

## 🧪 Testing with cURL

```bash
# Health Check
curl http://localhost:5000/api/v1/health

# AI Copilot Response Generation
curl -X POST http://localhost:5000/api/v1/ai/generate-response \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Marcus Vance",
    "issue": "Refund delayed for 7 days & Tier 1 API sync offline",
    "tone": "empathetic",
    "riskScore": 88
  }'
```
