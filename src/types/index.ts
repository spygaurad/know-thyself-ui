export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

export interface Workflow {
  id: string;
  name: string;
  steps: number;
  status: "running" | "completed" | "paused";
}

export interface Documentation {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
}
