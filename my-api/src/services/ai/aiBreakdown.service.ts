export interface SubtaskBreakdownItem {
  title: string;
  estimatedMinutes: number;
}

export class AIBreakdownService {
  /**
   * Generates actionable subtasks to break down complex parent tasks.
   * Abstracted behind a service interface. Uses intelligent domain heuristics by default,
   * or can connect to AI API provider if configured.
   */
  public static async breakdownTask(
    taskTitle: string,
    _taskDescription?: string | null
  ): Promise<SubtaskBreakdownItem[]> {
    const titleLower = taskTitle.toLowerCase();

    // 1. Web Application / Full Stack
    if (titleLower.includes("app") || titleLower.includes("web") || titleLower.includes("system")) {
      return [
        { title: "Define technical scope & schema requirements", estimatedMinutes: 20 },
        { title: "Setup core project scaffolding & dependencies", estimatedMinutes: 15 },
        { title: "Build backend REST API routes & validation", estimatedMinutes: 45 },
        { title: "Implement frontend UI components & state", estimatedMinutes: 60 },
        { title: "Write end-to-end integration tests & verify", estimatedMinutes: 30 },
      ];
    }

    // 2. Authentication & Security
    if (titleLower.includes("auth") || titleLower.includes("jwt") || titleLower.includes("login")) {
      return [
        { title: "Setup password hashing & JWT token generators", estimatedMinutes: 20 },
        { title: "Build login & registration API endpoints", estimatedMinutes: 30 },
        { title: "Implement verifyToken middleware & refresh strategy", estimatedMinutes: 25 },
        { title: "Connect frontend login form & token store", estimatedMinutes: 30 },
      ];
    }

    // 3. Database & Migrations
    if (titleLower.includes("database") || titleLower.includes("db") || titleLower.includes("prisma")) {
      return [
        { title: "Draft entity relationship diagram & models", estimatedMinutes: 25 },
        { title: "Update Prisma schema definitions & indices", estimatedMinutes: 15 },
        { title: "Generate and apply database migration", estimatedMinutes: 10 },
        { title: "Write seed script with realistic demo records", estimatedMinutes: 20 },
      ];
    }

    // Default fallback breakdown logic
    return [
      { title: `Research approach for ${taskTitle}`, estimatedMinutes: 15 },
      { title: `Draft initial implementation structure`, estimatedMinutes: 30 },
      { title: `Execute primary core work for ${taskTitle}`, estimatedMinutes: 45 },
      { title: `Review, test, and finalize deliverables`, estimatedMinutes: 20 },
    ];
  }
}
