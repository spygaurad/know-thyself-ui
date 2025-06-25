import { Tool, Workflow, Documentation, Message } from "@/types";

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    content: "Hi Suraj! 👋\n\nHow can I help you today?",
    sender: "assistant",
    timestamp: new Date(),
  },
];

export const TOOLS: Tool[] = [
  {
    id: "1",
    name: "Data Parser",
    description: "Parse CSV and JSON files",
    status: "active",
  },
  {
    id: "2",
    name: "Image Generator",
    description: "Generate images from text",
    status: "active",
  },
  {
    id: "3",
    name: "Code Analyzer",
    description: "Analyze code quality",
    status: "inactive",
  },
  {
    id: "4",
    name: "PDF Reader",
    description: "Extract text from PDFs",
    status: "active",
  },
  {
    id: "5",
    name: "Web Scraper",
    description: "Scrape web content",
    status: "inactive",
  },
];

export const WORKFLOWS: Workflow[] = [
  { id: "1", name: "Data Processing Pipeline", steps: 5, status: "running" },
  { id: "2", name: "Content Generation Flow", steps: 3, status: "completed" },
  { id: "3", name: "Analysis Workflow", steps: 4, status: "paused" },
  { id: "4", name: "Report Generation", steps: 6, status: "completed" },
  { id: "5", name: "Batch Processing", steps: 8, status: "running" },
];

export const DOCUMENTATION: Documentation[] = [
  {
    id: "1",
    title: "Getting Started Guide",
    category: "Basics",
    lastUpdated: "2 days ago",
  },
  {
    id: "2",
    title: "API Reference",
    category: "Development",
    lastUpdated: "1 week ago",
  },
  {
    id: "3",
    title: "Tool Configuration",
    category: "Configuration",
    lastUpdated: "3 days ago",
  },
  {
    id: "4",
    title: "Workflow Best Practices",
    category: "Guide",
    lastUpdated: "5 days ago",
  },
  {
    id: "5",
    title: "Troubleshooting",
    category: "Support",
    lastUpdated: "1 day ago",
  },
];

export const RECENT_CHATS: string[] = [
  "Tailwind CSS Installation",
  "Next.js Repo Naming Guide",
  "Display HTML in Gradio",
  "TB IGRA Test Interpretation",
  "Verocell Vaccine Documentation",
  "Expose LangGraph Dev Network",
  "LaTeX Table Creation",
  "Amazon Linux pnpm setup",
  "Vercel deployment issue",
  "LangGraph FastAPI Backend",
];

export const TABS = ["home", "documentation", "tools", "workflows", "settings"];
