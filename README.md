# CalorieOS 🔥

A minimal calorie calculator app — Node.js + MongoDB + Nginx, fully Dockerized.

## Stack
- **Frontend**: Plain HTML/CSS/JS (served by Nginx)
- **Backend**: Node.js + Express REST API
- **Database**: MongoDB (persists profiles)
- **Reverse Proxy**: Nginx (port 80 → static files + /api → Node)

## Quick Start (Docker — recommended)

```bash
# 1. Clone / unzip this project
cd calorie-app

# 2. Build and start everything
docker compose up --build -d

# 3. Open browser
open http://localhost
```

### Stop
```bash
docker compose down          # stop containers
docker compose down -v       # stop + wipe MongoDB data
```

---

## Run Manually (without Docker)

### Prerequisites
- Node.js ≥ 18
- MongoDB running on localhost:27017
- nginx installed

### 1. Start MongoDB
```bash
mongod --dbpath /tmp/mongo-data
```

### 2. Start Backend
```bash
cd backend
npm install
MONGO_URI=mongodb://localhost:27017/calorieapp PORT=3000 node server.js
```

### 3. Serve Frontend via Nginx

Copy `nginx/default.conf` to your nginx config directory, update the proxy to
`http://127.0.0.1:3000`, then update the root path to point to `./frontend/`.

```nginx
# Update these two lines for local use:
root /absolute/path/to/calorie-app/frontend;
proxy_pass http://127.0.0.1:3000;
```

Then restart nginx:
```bash
sudo nginx -s reload
```

### 4. Open browser
```
http://localhost
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/health | Health check |
| POST   | /api/profiles | Create profile + calculate |
| GET    | /api/profiles | List last 20 profiles |
| DELETE | /api/profiles/:id | Delete a profile |

### POST /api/profiles — Body
```json
{
  "name": "Alex",
  "age": 28,
  "heightCm": 175,
  "weightKg": 72,
  "gender": "male",
  "activityLevel": "moderate",
  "goal": "fat_loss"
}
```

`goal` values: `fat_loss` | `maintain` | `muscle_gain`

`activityLevel` values: `sedentary` | `light` | `moderate` | `active` | `very_active`

### Calorie Formula
- **BMR**: Mifflin-St Jeor equation
- **Maintenance**: BMR × activity multiplier
- **Fat Loss**: Maintenance × 0.80 (−20%)
- **Maintain**: Maintenance
- **Muscle Gain**: Maintenance × 1.10 (+10%)
- **Macros**: 30% protein · 40% carbs · 30% fat
