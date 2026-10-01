# Nexus CRM

An enterprise CRM portfolio project for tracking leads, customers, deal stages, sales performance, and team activity.

## Stack

- Frontend: React + Vite
- API: Node.js + Express
- Database: MongoDB with Mongoose
- Authentication foundation: JWT and role-based access middleware

## Run with Docker

```powershell
docker compose up --build
```

The dashboard runs on `http://localhost:5174` and the API on `http://localhost:4000`.

## Run locally

```powershell
cd backend
npm install
npm run dev
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

## Included features

- Deal tracking across prospecting, qualification, proposal, negotiation, and won stages
- Revenue and conversion dashboards
- Lead contact records and activity logs
- Team roles for Admin, Manager, and Sales Representative access
- REST API routes for contacts, deals, activities, and dashboard metrics
