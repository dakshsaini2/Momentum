<div align="center">
  <h1>🚀 Momentum</h1>
  <p><strong>Intelligent Todo & Productivity Operating System</strong></p>
  <p>
    <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
    <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
    <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
  <p><em>"Stop managing tasks. Start making progress."</em></p>
</div>

Momentum is a full-stack, production-quality productivity platform designed to answer the core question: **"What should I work on right now, and why?"**

---

## ⚡ 1-Command Docker Quick Start

Run the entire platform (PostgreSQL + Express API + React Nginx Client) with **one single command**:

```bash
docker compose up --build
```

Access the application in your browser:
- 🌐 **Web Application**: [`http://localhost:3000`](http://localhost:3000)
- 🔌 **Backend REST API**: [`http://localhost:5000/api/health`](http://localhost:5000/api/health)

*(Demo login credentials: `demo@momentum.app` / `Password123!`)*

---

## 🌟 Key Features

1. **Momentum Engine (0–100 Score)**: Dynamic heuristic algorithm evaluating task priority, deadline proximity, sunk-cost progress inertia, inactivity penalties, and dependency lock states.
2. **"What's Next?" Recommendation Engine**: Recommends the single best task to focus on matching your current energy level (**High Energy ⚡**, **Medium Energy 🔋**, **Low Energy 🍃**).
3. **Quick Command Capture**: Natural language task parser supporting command syntax:
   `Finish API tomorrow 6pm #backend !high @Backend API ~45m`
4. **Distraction-Free Focus Mode**: Fullscreen countdown timer with Pomodoro controls, audio alerts, and post-focus reflection feedback (**😊 Easy**, **😐 Normal**, **😓 Difficult**, **🚫 Blocked**).
5. **Today's Focus Plan (`/today`)**: Morning planning breakdown into Focus Priorities, Quick Wins (≤ 15 mins), and Remaining Actions.
6. **Interactive Daily Planner & End-of-Day Review**: Time-blocked schedule setup and end-of-day summary wizard with carry-forward capability for incomplete tasks.
7. **Task Dependencies & Blocked Reasons**: Visual dependency mapping and explicit blocker resolution workflows.
8. **Subtask AI Breakdown**: Abstracted service interface for automated subtask generation.
9. **Recharts Productivity Analytics**: Visual trends for 7-day completion velocity, focus time distribution, task distribution by priority, and data-driven insights.
10. **Keyboard Shortcuts**: Full keyboard navigation (`N` for New Task, `⌘K` or `/` for Global Search, `D` for Dashboard, `T` for Today, `F` for Focus, `P` for Projects, `?` for Shortcuts cheat-sheet).

---

## 🏗️ Architecture & Stack

```mermaid
flowchart TD
    subgraph Frontend["Frontend Layer"]
        Client["📱 Momentum Client<br>(React 18, TS, Tailwind CSS v4, Nginx)<br>Port: 3000"]
    end

    subgraph Backend["Backend Layer"]
        API["⚙️ Momentum API<br>(Node.js, Express, Prisma ORM, Zod)<br>Port: 5000"]
    end

    subgraph Database["Database Layer"]
        DB[("🗄️ PostgreSQL 17<br>(Docker Volume)")]
    end

    Client -- "REST / JSON Proxy" --> API
    API -- "Prisma / TCP" --> DB
    
    style Client fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#e2e8f0;
    style API fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#e2e8f0;
    style DB fill:#0f172a,stroke:#6366f1,stroke-width:2px,color:#e2e8f0;
```

---

## 🛠️ Local Development (without Docker)

```bash
# 1. Start database in Docker
docker run --name momentum-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgrespassword -e POSTGRES_DB=momentum -p 5433:5432 -d postgres:17

# 2. Run backend
cd my-api
npm install
npm run db:push
npm run db:seed
npm run dev

# 3. Run frontend
cd ../client
npm install
npm run dev
```

---

## 🧪 Testing

```bash
cd my-api
npm test
```
