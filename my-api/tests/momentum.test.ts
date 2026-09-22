import { describe, it, expect } from "vitest";
import { MomentumService } from "../src/services/momentum/momentum.service";
import { RecommendationService } from "../src/services/recommendation/recommendation.service";
import { TaskStatus, Priority, EnergyLevel } from "@prisma/client";

describe("Momentum Engine Unit Tests", () => {
  it("should calculate high score for high priority overdue task", () => {
    const mockTask: any = {
      id: "task-1",
      title: "Fix Security Vulnerability",
      status: TaskStatus.TODO,
      priority: Priority.URGENT,
      progress: 40,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago (overdue)
      updatedAt: new Date(Date.now() - 50 * 60 * 60 * 1000), // 50h inactive
    };

    const result = MomentumService.calculateTaskMomentum(mockTask);
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.factors.deadlineScore).toBe(35);
  });

  it("should return 0 score for completed task", () => {
    const mockTask: any = {
      id: "task-2",
      title: "Done Task",
      status: TaskStatus.COMPLETED,
      priority: Priority.HIGH,
      progress: 100,
      updatedAt: new Date(),
    };

    const result = MomentumService.calculateTaskMomentum(mockTask);
    expect(result.score).toBe(0);
  });

  it("should apply blocking penalty to blocked tasks", () => {
    const mockTask: any = {
      id: "task-3",
      title: "Blocked Task",
      status: TaskStatus.BLOCKED,
      priority: Priority.HIGH,
      progress: 20,
      updatedAt: new Date(),
    };

    const result = MomentumService.calculateTaskMomentum(mockTask);
    expect(result.factors.blockingPenalty).toBe(-30);
  });
});

describe("Recommendation Engine Unit Tests", () => {
  it("should not recommend completed or blocked tasks", () => {
    const mockTasks: any[] = [
      { id: "1", title: "Completed", status: TaskStatus.COMPLETED, priority: Priority.URGENT },
      { id: "2", title: "Blocked", status: TaskStatus.BLOCKED, priority: Priority.HIGH },
    ];

    const result = RecommendationService.recommendNextTask(mockTasks, EnergyLevel.HIGH);
    expect(result.task).toBeNull();
  });

  it("should favor tasks matching current energy level", () => {
    const mockTasks: any[] = [
      {
        id: "1",
        title: "Complex Refactoring",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        energyLevel: EnergyLevel.HIGH,
        progress: 30,
        updatedAt: new Date(),
        estimatedMinutes: 60,
      },
      {
        id: "2",
        title: "Read Docs",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        energyLevel: EnergyLevel.LOW,
        progress: 30,
        updatedAt: new Date(),
        estimatedMinutes: 60,
      },
    ];

    const result = RecommendationService.recommendNextTask(mockTasks, EnergyLevel.HIGH);
    expect(result.task?.id).toBe("1");
    expect(result.reasons).toContain("Matches your high energy mode");
  });
});
