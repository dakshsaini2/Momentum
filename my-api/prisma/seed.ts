import { PrismaClient, Priority, TaskStatus, EnergyLevel, BlockedReason, FocusFeedback } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Momentum database...");

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dailyReview.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.focusSession.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create primary demo user
  const hashedPassword = await hashPassword("Password123!");
  const user = await prisma.user.create({
    data: {
      id: "clx_seed_user_id",
      name: "Alex Vance",
      email: "demo@momentum.app",
      password: hashedPassword,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      timezone: "America/New_York",
      xp: 720,
      level: 7,
      streak: 5,
    },
  });

  console.log(`👤 Created user: ${user.name} (${user.email})`);

  // Projects
  const projectBackend = await prisma.project.create({
    data: {
      name: "Backend API",
      description: "Node.js & Express REST microservices engine",
      color: "#6366f1",
      icon: "server",
      userId: user.id,
    },
  });

  const projectPortfolio = await prisma.project.create({
    data: {
      name: "Portfolio Website",
      description: "Interactive 3D portfolio build with Three.js & React",
      color: "#ec4899",
      icon: "briefcase",
      userId: user.id,
    },
  });

  const projectCollege = await prisma.project.create({
    data: {
      name: "Distributed Systems Course",
      description: "Raft consensus research paper & lab assignments",
      color: "#f59e0b",
      icon: "book-open",
      userId: user.id,
    },
  });

  const projectPersonal = await prisma.project.create({
    data: {
      name: "Personal & Health",
      description: "Habits, workouts, and life management",
      color: "#10b981",
      icon: "heart",
      userId: user.id,
    },
  });

  // Tags
  const tagBackend = await prisma.tag.create({
    data: { name: "backend", color: "#6366f1", userId: user.id },
  });
  const tagFrontend = await prisma.tag.create({
    data: { name: "frontend", color: "#ec4899", userId: user.id },
  });
  const tagDatabase = await prisma.tag.create({
    data: { name: "database", color: "#8b5cf6", userId: user.id },
  });
  const tagResearch = await prisma.tag.create({
    data: { name: "research", color: "#f59e0b", userId: user.id },
  });
  const tagQuick = await prisma.tag.create({
    data: { name: "quick-win", color: "#10b981", userId: user.id },
  });

  const now = new Date();
  const tomorrow = new Date(now.valueOf() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.valueOf() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.valueOf() - 24 * 60 * 60 * 1000);

  // 1. High-Priority Focus Now Candidate Task
  const taskJwtMiddleware = await prisma.task.create({
    data: {
      title: "Implement JWT Middleware & Refresh Token Logic",
      description: "Secure auth pipeline with sliding session refresh tokens and authorization scopes.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      energyLevel: EnergyLevel.HIGH,
      dueDate: tomorrow,
      estimatedMinutes: 45,
      actualMinutes: 30,
      progress: 70,
      userId: user.id,
      projectId: projectBackend.id,
      tags: {
        create: [{ tagId: tagBackend.id }, { tagId: tagDatabase.id }],
      },
      subtasks: {
        create: [
          {
            title: "Create JWT token generator utility",
            status: TaskStatus.COMPLETED,
            completedAt: yesterday,
            userId: user.id,
          },
          {
            title: "Build verifyAccessToken middleware",
            status: TaskStatus.COMPLETED,
            completedAt: yesterday,
            userId: user.id,
          },
          {
            title: "Implement refresh token revocation & rotation",
            status: TaskStatus.IN_PROGRESS,
            userId: user.id,
          },
          {
            title: "Add automated integration test suite for auth",
            status: TaskStatus.TODO,
            userId: user.id,
          },
        ],
      },
    },
  });

  // 2. Dependency Parent Task
  const taskDbSchema = await prisma.task.create({
    data: {
      title: "Design PostgreSQL Schema & Prisma Migrations",
      description: "Draft database ERD for users, projects, tasks, focus sessions and dependencies.",
      status: TaskStatus.COMPLETED,
      priority: Priority.URGENT,
      energyLevel: EnergyLevel.HIGH,
      dueDate: yesterday,
      estimatedMinutes: 60,
      actualMinutes: 55,
      progress: 100,
      completedAt: yesterday,
      userId: user.id,
      projectId: projectBackend.id,
      tags: { create: [{ tagId: tagDatabase.id }] },
    },
  });

  // 3. Dependent Task (Blocked by Db Schema - now unlocked because Db Schema is completed)
  const taskApiEndpoints = await prisma.task.create({
    data: {
      title: "Build Core REST API Endpoints for Task System",
      description: "Controllers and services for CRUD, status changes, and filter queries.",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      energyLevel: EnergyLevel.HIGH,
      dueDate: tomorrow,
      estimatedMinutes: 90,
      actualMinutes: 0,
      progress: 0,
      userId: user.id,
      projectId: projectBackend.id,
      dependencies: {
        create: [{ dependsOnId: taskDbSchema.id }],
      },
    },
  });

  // 4. Blocked Task with reason
  const taskStripeIntegration = await prisma.task.create({
    data: {
      title: "Integrate Stripe Webhook Handler for Subscriptions",
      description: "Process subscription upgraded events and update user entitlement tiers.",
      status: TaskStatus.BLOCKED,
      priority: Priority.URGENT,
      energyLevel: EnergyLevel.HIGH,
      dueDate: nextWeek,
      estimatedMinutes: 60,
      actualMinutes: 15,
      progress: 25,
      blockedReason: BlockedReason.WAITING_FOR_API,
      blockedNote: "Waiting for dev account webhook secrets from finance team",
      userId: user.id,
      projectId: projectBackend.id,
    },
  });

  // 5. Quick Wins (<= 15 mins)
  const taskUpdateReadme = await prisma.task.create({
    data: {
      title: "Update API Documentation & Swagger OpenAPI Spec",
      description: "Document new authentication headers and error responses in README.md",
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      energyLevel: EnergyLevel.LOW,
      dueDate: tomorrow,
      estimatedMinutes: 15,
      actualMinutes: 0,
      progress: 0,
      userId: user.id,
      projectId: projectBackend.id,
      tags: { create: [{ tagId: tagQuick.id }] },
    },
  });

  const taskFormatConfig = await prisma.task.create({
    data: {
      title: "Clean up ESLint and Prettier config warnings",
      description: "Fix linting warning regarding deprecated plugin rules.",
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      energyLevel: EnergyLevel.LOW,
      dueDate: tomorrow,
      estimatedMinutes: 10,
      actualMinutes: 0,
      progress: 0,
      userId: user.id,
      projectId: projectBackend.id,
      tags: { create: [{ tagId: tagQuick.id }] },
    },
  });

  // 6. Overdue / Neglected Task
  const taskRaftPaper = await prisma.task.create({
    data: {
      title: "Review Raft Consensus Algorithm Specification Paper",
      description: "Read chapters 3-5 on leader election, log replication, and safety guarantees.",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      energyLevel: EnergyLevel.MEDIUM,
      dueDate: yesterday, // Overdue
      estimatedMinutes: 45,
      actualMinutes: 0,
      progress: 0,
      userId: user.id,
      projectId: projectCollege.id,
      tags: { create: [{ tagId: tagResearch.id }] },
    },
  });

  // 7. Portfolio task
  const taskThreeJsHero = await prisma.task.create({
    data: {
      title: "Build Interactive 3D Canvas Hero Section",
      description: "Setup React Three Fiber scene with dynamic lighting and camera particle animation.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      energyLevel: EnergyLevel.HIGH,
      dueDate: nextWeek,
      estimatedMinutes: 120,
      actualMinutes: 40,
      progress: 35,
      userId: user.id,
      projectId: projectPortfolio.id,
      tags: { create: [{ tagId: tagFrontend.id }] },
    },
  });

  // 8. Health & Personal
  const taskHydrationTrack = await prisma.task.create({
    data: {
      title: "Set up Daily Workout & Water Intake Habits",
      description: "Log morning 30-minute cardio and hydration tracking goals.",
      status: TaskStatus.COMPLETED,
      priority: Priority.MEDIUM,
      energyLevel: EnergyLevel.LOW,
      dueDate: now,
      estimatedMinutes: 15,
      actualMinutes: 15,
      progress: 100,
      completedAt: now,
      userId: user.id,
      projectId: projectPersonal.id,
      tags: { create: [{ tagId: tagQuick.id }] },
    },
  });

  // Seed Focus Sessions
  await prisma.focusSession.createMany({
    data: [
      {
        userId: user.id,
        taskId: taskJwtMiddleware.id,
        startedAt: new Date(now.valueOf() - 3 * 60 * 60 * 1000),
        endedAt: new Date(now.valueOf() - 2.5 * 60 * 60 * 1000),
        duration: 1800, // 30 mins
        completed: true,
        feedback: FocusFeedback.EASY,
      },
      {
        userId: user.id,
        taskId: taskDbSchema.id,
        startedAt: new Date(yesterday.valueOf() - 5 * 60 * 60 * 1000),
        endedAt: new Date(yesterday.valueOf() - 4 * 60 * 60 * 1000),
        duration: 3300, // 55 mins
        completed: true,
        feedback: FocusFeedback.NORMAL,
      },
    ],
  });

  // Seed Daily Plan
  await prisma.dailyPlan.create({
    data: {
      userId: user.id,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      schedule: [
        { time: "09:00 AM", taskId: taskJwtMiddleware.id, title: taskJwtMiddleware.title, duration: 45 },
        { time: "10:30 AM", taskId: taskUpdateReadme.id, title: taskUpdateReadme.title, duration: 15 },
        { time: "11:00 AM", taskId: taskRaftPaper.id, title: taskRaftPaper.title, duration: 45 },
        { time: "02:00 PM", taskId: taskThreeJsHero.id, title: taskThreeJsHero.title, duration: 60 },
      ],
    },
  });

  // Seed Daily Review
  await prisma.dailyReview.create({
    data: {
      userId: user.id,
      date: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
      completedCount: 4,
      totalCount: 5,
      focusTime: 85,
      biggestWin: "Completed PostgreSQL schema design and migrations cleanly.",
      notes: "High energy morning focus session yielded great results.",
    },
  });

  // Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "Overdue Task",
        message: "Review Raft Consensus Algorithm Specification Paper was due yesterday.",
        type: "OVERDUE",
        read: false,
      },
      {
        userId: user.id,
        title: "Task Blocked",
        message: "Stripe Webhook Handler is blocked waiting for API credentials.",
        type: "BLOCKED",
        read: false,
      },
      {
        userId: user.id,
        title: "Momentum Streak!",
        message: "You have maintained a 5-day active focus streak. Keep it up!",
        type: "REVIEW",
        read: true,
      },
    ],
  });

  // Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: user.id,
        action: "COMPLETED_TASK",
        metadata: { taskId: taskDbSchema.id, title: taskDbSchema.title },
      },
      {
        userId: user.id,
        action: "STARTED_FOCUS_SESSION",
        metadata: { taskId: taskJwtMiddleware.id, durationMinutes: 30 },
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
