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

// Matches NormalizedData from backend
export interface ProjectData {
  tickets: NormalizedTicket[];
  emails: NormalizedEmail[];
  messages: NormalizedMessage[];
  members: NormalizedMember[];
}

export interface NormalizedTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  assignee_email: string | null;
  due_date: string;
  sprint: string;
  story_points: number;
  blocked_by: string | null;
  labels: string[];
}

export interface NormalizedEmail {
  id: string;
  subject: string;
  sender_name: string;
  sender_address: string;
  received_at: string;
  body: string;
  is_read: boolean;
  has_reply: boolean;
  importance: string;
}

export interface NormalizedMessage {
  id: string;
  author: string;
  channel: string;
  body: string;
  created_at: string;
  mentions: string[];
  has_response: boolean;
}

export interface NormalizedMember {
  name: string;
  email: string;
  role: string;
  current_tasks: string[];
}
