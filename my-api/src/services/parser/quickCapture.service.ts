import { Priority } from "@prisma/client";

export interface ParsedTaskInput {
  title: string;
  dueDate: Date | null;
  priority: Priority;
  tags: string[];
  projectName: string | null;
  estimatedMinutes: number;
}

export class QuickCaptureService {
  /**
   * Parses natural language quick command input like:
   * "Finish API tomorrow 6pm #backend !high @Backend API ~45m"
   */
  public static parseCommand(input: string): ParsedTaskInput {
    let rawText = input.trim();
    const tags: string[] = [];
    let priority: Priority = Priority.MEDIUM;
    let projectName: string | null = null;
    let dueDate: Date | null = null;
    let estimatedMinutes = 30;

    // 1. Extract Priority (!urgent, !high, !medium, !low)
    const priorityMatch = rawText.match(/!(urgent|high|medium|low)\b/i);
    if (priorityMatch && priorityMatch[1]) {
      const p = priorityMatch[1].toUpperCase();
      if (p === "URGENT") priority = Priority.URGENT;
      else if (p === "HIGH") priority = Priority.HIGH;
      else if (p === "MEDIUM") priority = Priority.MEDIUM;
      else if (p === "LOW") priority = Priority.LOW;

      rawText = rawText.replace(priorityMatch[0], "");
    }

    // 2. Extract Tags (#tagname)
    const tagMatches = Array.from(rawText.matchAll(/#([a-zA-Z0-9_-]+)/g));
    for (const match of tagMatches) {
      if (match[1]) {
        tags.push(match[1].toLowerCase());
      }
      rawText = rawText.replace(match[0], "");
    }

    // 3. Extract Project (@project_name or @"Project Name")
    const projectMatch = rawText.match(/@(?:"([^"]+)"|([a-zA-Z0-9_-]+))/);
    if (projectMatch) {
      projectName = projectMatch[1] || projectMatch[2] || null;
      rawText = rawText.replace(projectMatch[0], "");
    }

    // 4. Extract Estimated Minutes (~30m, ~45, ~1h)
    const timeMatch = rawText.match(/~(\d+)(m|h)?/i);
    if (timeMatch && timeMatch[1]) {
      const val = parseInt(timeMatch[1], 10);
      const unit = (timeMatch[2] || "m").toLowerCase();
      estimatedMinutes = unit === "h" ? val * 60 : val;
      rawText = rawText.replace(timeMatch[0], "");
    }

    // 5. Extract Due Date indicators (today, tomorrow, next monday, in X days)
    const now = new Date();
    if (/\btoday\b/i.test(rawText)) {
      dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
      rawText = rawText.replace(/\btoday\b/i, "");
    } else if (/\btomorrow\b/i.test(rawText)) {
      dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 0, 0);
      rawText = rawText.replace(/\btomorrow\b/i, "");
    } else if (/\bnext week\b/i.test(rawText)) {
      dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 18, 0, 0);
      rawText = rawText.replace(/\bnext week\b/i, "");
    }

    const title = rawText.replace(/\s+/g, " ").trim();

    return {
      title: title || input.trim(),
      dueDate,
      priority,
      tags,
      projectName,
      estimatedMinutes,
    };
  }
}
