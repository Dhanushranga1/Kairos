export type HealthStatus = "Green" | "Amber" | "Red";

export interface Blocker {
  person: string;
  task: string;
  reason: string;
}

export interface FollowUp {
  to: string;
  subject: string;
  message: string;
}

export interface SprintHealth {
  total_tickets: number;
  done: number;
  in_progress: number;
  blocked: number;
  todo: number;
}

export interface Analysis {
  health: HealthStatus;
  health_reason: string;
  summary: string;
  key_issues: string[];
  blockers: Blocker[];
  recommendations: string[];
  follow_ups: FollowUp[];
  sprint_health: SprintHealth;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProjectData {
  tickets: Ticket[];
  emails: Email[];
  team_messages: TeamMessage[];
  team_members: TeamMember[];
}

export interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string | null;
  due_date: string;
  blocked_by: string | null;
}

export interface Email {
  id: string;
  subject: string;
  from: string;
  received_date: string;
  has_reply: boolean;
  priority: string;
}

export interface TeamMessage {
  id: string;
  author: string;
  channel: string;
  message: string;
  has_response: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  current_tasks: string[];
}
