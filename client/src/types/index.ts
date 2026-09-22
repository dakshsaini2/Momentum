export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'ARCHIVED';
export type EnergyLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type BlockedReason = 'WAITING_FOR_PERSON' | 'WAITING_FOR_API' | 'TECHNICAL_ISSUE' | 'NEED_INFORMATION' | 'DEPENDENCY' | 'OTHER';
export type FocusFeedback = 'EASY' | 'NORMAL' | 'DIFFICULT' | 'BLOCKED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  xp: number;
  level: number;
  streak: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  taskCount?: number;
  completedTaskCount?: number;
  progress?: number;
  totalFocusMinutes?: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TaskTag {
  tag: Tag;
}

export interface TaskDependency {
  taskId: string;
  dependsOnId: string;
  dependsOn?: Task;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  energyLevel: EnergyLevel;
  dueDate?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  progress: number;
  blockedReason?: BlockedReason;
  blockedNote?: string;
  projectId?: string;
  project?: Project;
  parentTaskId?: string;
  subtasks?: Task[];
  tags?: TaskTag[];
  dependencies?: TaskDependency[];
  createdAt: string;
  completedAt?: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  task?: Task;
  startedAt: string;
  endedAt?: string;
  duration: number; // seconds
  completed: boolean;
  feedback?: FocusFeedback;
}

export interface DailyPlanSlot {
  time: string;
  taskId: string;
  title: string;
  duration: number;
  priority?: Priority;
}

export interface DailyPlan {
  id: string;
  date: string;
  schedule: DailyPlanSlot[];
}

export interface DailyReview {
  id: string;
  date: string;
  completedCount: number;
  totalCount: number;
  focusTime: number;
  biggestWin?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  user: User;
  momentumScore: number;
  focusNow: {
    task: Task | null;
    reasons: string[];
    score: number;
  };
  todayProgress: {
    completed: number;
    total: number;
    percent: number;
    focusMinutes: number;
  };
  needsAttention: {
    overdue: Task[];
    blocked: Task[];
    neglected: Task[];
    count: number;
  };
  quickWins: Task[];
}

export interface AnalyticsSummary {
  summary: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalFocusMinutes: number;
  };
  trendData: { date: string; completed: number; created: number }[];
  focusWeeklyData: { day: string; focusMinutes: number }[];
  projectDistribution: { name: string; color: string; count: number; completed: number }[];
  priorityDistribution: { priority: string; count: number }[];
  insights: string[];
}
