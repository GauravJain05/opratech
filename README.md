# Cotton Junction: Counter Capture and Lapsed Customer Tracker
Demo project for Cotton Junction (TechSprint Team 26). React (Vite) + Flask + SQLAlchemy.

## 📖 Presentation & Evaluation Documentation
- **[Judges' Guide](file:///d:/Cotton%20Junction/cotton-junction-counter/cotton-junction-counter/JUDGES_GUIDE.md)**: Business crisis context, 5 core pillars, guardrails, and architecture.
- **[Demo Walkthrough Script](file:///d:/Cotton%20Junction/cotton-junction-counter/cotton-junction-counter/DEMO_WALKTHROUGH.md)**: 90-second step-by-step acceptance demo script for presenting to judges.

## Run locally (two terminals)
    cd backend && python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
    pip install -r requirements.txt && python app.py                   # http://localhost:5000
    cd frontend && npm install && npm run dev                          # http://localhost:5173

Demo logins: cashier / cashier123 (counter only), manager / manager123 (counter, customers, campaigns).
Override with env vars CASHIER_USER, CASHIER_PASS, MANAGER_USER, MANAGER_PASS, SECRET_KEY.

## One domain / deploy
`cd frontend && npm run build`, then run `gunicorn app:app` inside /backend. Flask serves the built React app and the /api routes from the same address, so there is no CORS setup.
Set DATABASE_URL to a Postgres URL (Neon or Supabase) on any host without a persistent disk. SQLite is the default for local use. 300 sample customers are seeded when the database is empty.

## What is real vs simulated
- Real: phone capture with consent, anonymous default, households with members, 60-day lapsed flag, RFM scoring, VIP top 10%, receipt-link enrichment with 50 bonus points, campaign filters, token login.
- WhatsApp: the Lapsed list opens a pre-filled WhatsApp chat (wa.me) per person. Nothing is sent automatically; staff tap Send. The receipt-link SMS is not part of the demo flow.
- People, not phones: each family member has their own profile, purchase history and last-visit date, even when they share one phone number.
- Delete backend/instance/cj.db after updating so the database is rebuilt with the new columns and demo data.
- Demo-level: login has no rate limiting; passwords come from env vars.
- Sample customers are generated data. The logo is a recreated SVG: replace frontend/public/logo.svg with the real file.