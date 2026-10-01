# CXPulse Frontend

Static frontend for CXPulse — Autonomous AI Customer Experience Intelligence.

## Deploy to Vercel

### 1. Push this `frontend/` folder to a GitHub repo

### 2. Import in Vercel
- Go to [vercel.com](https://vercel.com) → New Project → Import your repo
- Set **Root Directory** to `frontend`
- Framework Preset: **Other**

### 3. Set Environment Variables in Vercel Dashboard
| Variable | Value |
|---|---|
| `VITE_API_URL` | Your backend URL e.g. `https://cxpulse-api.railway.app` |

### 4. Deploy!
Vercel will run `node build.js` which injects your backend URL into `index.html`.

## Local Development
Just open `index.html` directly in a browser — the app has full offline fallback data.
