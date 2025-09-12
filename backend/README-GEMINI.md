Gemini setup

1) Create backend/.env with your key:

GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-pro

Optional:
ALLOWED_ORIGINS=http://localhost:5173
PORT=5000

2) Restart backend:

npm run dev

3) Verify startup logs show: GEMINI_API_KEY: ✅ Configured


