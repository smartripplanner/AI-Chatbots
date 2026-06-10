# SmartTripPlanner — Destination Discovery Widget

AI chatbot widget that helps travelers answer **"Where should I go?"** and redirects them to the [itinerary planner](https://smarttripplannerai.netlify.app).

## Project Structure

```
├── api/index.js        # Express API (Gemini + leads)
├── public/
│   ├── widget.js       # Embeddable chatbot widget
│   └── index.html      # Demo page
├── server.js           # Local dev server
├── vercel.json         # Vercel deployment config
├── package.json
└── .env.example
```

## Quick Start (Local)

```bash
npm install
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the demo.

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key ([get one here](https://aistudio.google.com/apikey)) |

## Embed on Any Website

```html
<script src="https://yourdomain.com/widget.js"></script>
```

If the API is on a different domain:

```html
<script src="https://cdn.yourdomain.com/widget.js" data-api-url="https://api.yourdomain.com"></script>
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add `GEMINI_API_KEY` in **Settings → Environment Variables**
4. Deploy

The widget will be available at `https://your-project.vercel.app/widget.js`.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/recommend` | Generate 5 destination recommendations |
| `POST` | `/api/followup` | Handle follow-up queries |
| `POST` | `/api/leads` | Capture name + email |

## What It Does NOT Do

- No itinerary generation
- No day-by-day plans
- No booking assistance

It recommends destinations and sends users to the itinerary planner with the destination pre-filled.
