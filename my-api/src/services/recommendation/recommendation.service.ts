import { Task, TaskStatus, EnergyLevel, Priority, TaskDependency } from "@prisma/client";
import { MomentumService } from "../momentum/momentum.service";

export interface TaskWithDetails extends Task {
  subtasks?: Task[];
  dependencies?: (TaskDependency & { dependsOn?: Task })[];
}

export interface RecommendationResult {
  task: TaskWithDetails | null;
  score: number;
  reasons: string[];
}

export class RecommendationService {
  /**
   * Recommends the single best task to focus on right now.
   * Evaluates urgency, priority, momentum score, deadline, progress, dependencies, and user energy level.
   */
  public static recommendNextTask(
    tasks: TaskWithDetails[],
    currentEnergy: EnergyLevel = EnergyLevel.MEDIUM
  ): RecommendationResult {
    const candidates = tasks.filter((task) => {
      // 1. Must not be completed or archived
      if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.ARCHIVED) {
        return false;
      }

      // 2. Must not be explicitly blocked
      if (task.status === TaskStatus.BLOCKED) {
        return false;
      }

      // 3. Must not have incomplete dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        const hasUnfinishedDependency = task.dependencies.some(
          (dep) => dep.dependsOn && dep.dependsOn.status !== TaskStatus.COMPLETED
        );
        if (hasUnfinishedDependency) {
          return false; // Locked task
        }
      }

      return true;
    });

    if (candidates.length === 0) {
      return { task: null, score: 0, reasons: ["No pending actionable tasks remaining!"] };
    }

    let bestTask: TaskWithDetails | null = null;
    let maxScore = -1;
    let bestReasons: string[] = [];

    for (const task of candidates) {
      const momentumResult = MomentumService.calculateTaskMomentum(task);
      let score = momentumResult.score;
      const reasons: string[] = [];

      // Energy level fit adjustment
      if (task.energyLevel === currentEnergy) {
        score += 15;
        reasons.push(`Matches your ${currentEnergy.toLowerCase()} energy mode`);
      } else if (
        (currentEnergy === EnergyLevel.LOW && task.energyLevel === EnergyLevel.HIGH) ||
        (currentEnergy === EnergyLevel.HIGH && task.energyLevel === EnergyLevel.LOW)
      ) {
        score -= 10;
      }

      // Deadline reasons
      if (task.dueDate) {
        const now = new Date().getTime();
        const due = new Date(task.dueDate).getTime();
        const hoursLeft = (due - now) / (1000 * 60 * 60);

        if (hoursLeft < 0) {
          reasons.push("Overdue - immediate action needed");
          score += 25;
        } else if (hoursLeft <= 24) {
          reasons.push("Due within 24 hours");
          score += 15;
        } else if (hoursLeft <= 72) {
          reasons.push("Due in the next few days");
        }
      }

      // Priority reasons
      if (task.priority === Priority.URGENT) {
        reasons.push("Urgent priority task");
      } else if (task.priority === Priority.HIGH) {
        reasons.push("High priority");
      }

      // Progress reasons (partially done tasks have momentum momentum)
      if (task.progress >= 50) {
        reasons.push(`${task.progress}% already completed`);
      } else if (task.status === TaskStatus.IN_PROGRESS) {
        reasons.push("Currently in progress");
      }

      // Quick win check
      if (task.estimatedMinutes <= 15) {
        reasons.push(`Quick win (${task.estimatedMinutes} min estimated)`);
      }

      // Dependency check reason
      if (task.dependencies && task.dependencies.length > 0) {
        reasons.push("All prerequisite dependencies completed");
      }

      if (score > maxScore) {
        maxScore = score;
        bestTask = task;
        bestReasons = reasons.length > 0 ? reasons.slice(0, 4) : ["High calculated momentum score"];
      }
    }

    return {
      task: bestTask,
      score: maxScore,
      reasons: bestReasons,
    };
  }
}
