interface StreamEvent {
  event: "data" | "end" | "error" | string;
  data: unknown;
}

// --- Correction 2: Use `unknown` for the index signature in Assistant ---
// This is the type-safe way to allow for additional, unspecified properties.
export interface Assistant {
  assistant_id: string;
  name: string;
  // Add other known assistant properties here
  [key: string]: unknown; // Replaces `any` for full type safety
}

export interface LangGraphMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string; // Using string to align with JSON data, can be converted to Date
}

// --- Correction 3: Define a type for the history response ---
// This avoids the implicit `any` from response.json() in getThreadHistory.
export interface HistoryResponse {
  messages?: LangGraphMessage[];
}

export interface Thread {
  thread_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface RunResponse {
  run_id: string;
  thread_id: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

interface SendMessageBody {
  input: {
    message: string;
  };
  config: {
    configurable: {
      thread_id: string;
    };
  };
  assistant_id?: string;
}

class LangGraphService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = "http://localhost:2024", apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["X-Api-Key"] = this.apiKey;
    }

    return headers;
  }

  // Create a new thread
  async createThread(metadata?: Record<string, unknown>): Promise<Thread> {
    const response = await fetch(`${this.baseUrl}/threads`, {
      method: "POST",
      headers: this.getHeaders(),
      body: metadata ? JSON.stringify({ metadata }) : JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create thread: ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  // Get thread details
  async getThread(threadId: string): Promise<Thread> {
    const response = await fetch(`${this.baseUrl}/threads/${threadId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get thread: ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  // Send message and get streaming response
  async sendMessage(
    threadId: string,
    message: string,
    assistantId?: string,
    onChunk?: (chunk: string) => void
  ): Promise<RunResponse> {
    const body: SendMessageBody = {
      input: { message },
      config: {
        configurable: {
          thread_id: threadId,
        },
      },
    };

    if (assistantId) {
      body.assistant_id = assistantId;
    }

    const response = await fetch(
      `${this.baseUrl}/threads/${threadId}/runs/stream`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to send message: ${response.statusText} - ${errorText}`
      );
    }

    let runResponse: RunResponse | null = null;

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk
            .split("\n")
            .filter((line) => line.startsWith("data: "));

          for (const line of lines) {
            try {
              // Using our StreamEvent interface to type the parsed data
              const parsed: StreamEvent = JSON.parse(line.substring(5));

              if (parsed.event === "data" && onChunk) {
                // You might want to stringify or cast `parsed.data` depending on what you expect
                onChunk(JSON.stringify(parsed.data));
              } else if (parsed.event === "end") {
                // Here we cast the data to the expected RunResponse type.
                // A validation library like Zod would make this even safer.
                runResponse = parsed.data as RunResponse;
              }
            } catch (e) {
              console.error("Failed to parse stream chunk:", e);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }

    if (!runResponse) {
      throw new Error("Stream ended without a final run response object.");
    }

    return runResponse;
  }

  // Get thread history
  async getThreadHistory(threadId: string): Promise<LangGraphMessage[]> {
    const response = await fetch(
      `${this.baseUrl}/threads/${threadId}/history`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get thread history: ${response.statusText} - ${errorText}`
      );
    }

    // Explicitly type the awaited JSON response
    const data: HistoryResponse = await response.json();
    return data.messages || [];
  }

  // Get available assistants
  async getAssistants(): Promise<Assistant[]> {
    const response = await fetch(`${this.baseUrl}/assistants`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get assistants: ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }
}

export default LangGraphService;
