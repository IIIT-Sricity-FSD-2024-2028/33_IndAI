# IndAI Review–4 Run Instructions

## Folder Structure

```text
root/
├── front-end/
├── back-end/
│   ├── docs/
│   │   └── swagger.json
├── Videos/
├── REVIEW4_API_MAPPING.md
├── REVIEW4_WORKFLOWS.md
└── RUN_INSTRUCTIONS.md
```

## 1. Start Backend

Open the root folder in VS Code, then open a terminal:

```powershell
cd back-end
npm install
npm run start:dev
```

Backend base URL:

```text
http://localhost:3000/api
```

Swagger UI:

```text
http://localhost:3000/api/docs
```

Swagger JSON file:

```text
back-end/docs/swagger.json
```

## 2. Start Frontend

Open a second terminal:

```powershell
cd front-end
python -m http.server 5500
```

If Python command fails, use:

```powershell
py -m http.server 5500
```

Frontend URL:

```text
http://localhost:5500
```

Login page:

```text
http://localhost:5500/pages/login.html
```

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Super User | superadmin@indai.com | Admin@1234 |
| Admin | admin@indai.com | Admin@1234 |
| Instructor | instructor@indai.com | Inst@1234 |
| Course Provider | provider@indai.com | Prov@1234 |
| Learner | learner@indai.com | Learn@1234 |

## x-role Header Values

Backend accepts both Review–4 uppercase role names and frontend lowercase aliases.

```text
SUPER_USER / superuser
ADMIN / admin
INSTRUCTOR / instructor
COURSE_PROVIDER / provider
LEARNER / learner
```

## Quick Backend Tests

### Login

```powershell
$body = @{ email="learner@indai.com"; password="Learn@1234"; role="LEARNER" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{ "Content-Type"="application/json" } -Body $body
```

### RBAC should reject learner from user management

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET -Headers @{ "x-role"="LEARNER" }
```

Expected: `403 Forbidden`.

### Super User can list users

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET -Headers @{ "x-role"="SUPER_USER" }
```

### Place BUY order

```powershell
$body = @{ learnerId="u6"; symbol="TCS"; orderType="BUY"; orderCategory="MARKET"; quantity=2 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/trading/orders" -Method POST -Headers @{ "Content-Type"="application/json"; "x-role"="LEARNER" } -Body $body
```

### Check portfolio

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/portfolio/u6" -Method GET -Headers @{ "x-role"="LEARNER" }
```
