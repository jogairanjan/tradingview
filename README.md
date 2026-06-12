# TradeSignal Pro

AI-powered trading signal platform with a premium TradingView-style frontend, Node.js REST API, MySQL database, and Python signal engine.

## Architecture

```
tradingview/
├── frontend/          React + Vite + Tailwind CSS
├── backend/           Node.js + Express + Sequelize + Socket.IO
├── python-engine/     Flask AI signal generator
└── docker-compose.yml Full stack orchestration
```

## Quick Start (Local)

### Prerequisites

- Node.js 20+
- MySQL 8+
- Python 3.11+
- npm

### 1. Database

```bash
mysql -u root -p < backend/database/schema.sql
```

Or let Sequelize auto-sync in development (`NODE_ENV=development`).

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with MySQL credentials and JWT secrets
npm install
npm run dev
```

API: http://localhost:5000  
Swagger: http://localhost:5000/api/docs  
Dev admin: `admin@tradingview.local` / `Admin@123456`

### 3. Python AI Engine

```bash
cd python-engine
pip install -r requirements.txt
cp .env.example .env
python app.py
```

Engine: http://localhost:8000

### 4. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:5173

## Docker

```bash
cp backend/.env.example backend/.env
# Set JWT_SECRET, DB passwords
docker compose up -d --build
```

| Service        | Port |
|----------------|------|
| Frontend       | 5173 |
| Backend API    | 5000 |
| Python Engine  | 8000 |
| MySQL          | 3306 |

## Features

### Frontend
- Landing page with hero, ticker tape, pricing, FAQ
- JWT authentication (login, register, OTP, reset password)
- Trading dashboard with live charts and signals
- Admin panel (users, signals, analytics)
- Dark/light theme, WebSocket live updates
- Protected routes, error boundaries, skeleton loaders

### Backend
- REST APIs with JWT + refresh tokens
- Role-based access (user / admin)
- WebSocket signal broadcasting
- Cron jobs for AI signal generation
- Payment structure (Stripe / Razorpay ready)
- Swagger documentation

### Python Engine
- RSI, MACD, EMA, SMA, Bollinger Bands, volume, candlestick patterns
- Confidence scoring and BUY/SELL predictions
- ccxt market data with synthetic fallback

## Environment Variables

See `.env.example` in each package (`frontend`, `backend`, `python-engine`).

## Production

- Use PM2: `pm2 start backend/ecosystem.config.js`
- Nginx reverse proxy for frontend + API
- Set strong `JWT_SECRET` values
- Enable MySQL SSL in production

## License

MIT
