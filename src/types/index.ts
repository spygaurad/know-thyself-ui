export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  additional_kwargs?: {
    token?: string[];
    attention?: number[][];
    bert_viz_view?: string;
  };

  // additional_kwargs?: Partial<AttentionData>; // Use Partial since these are optional
}

// export interface CircuitsVisVisualizerProps {
//   additionalKwargs: {
//     token: string[];
//     attention: number[];
//   };
// }

export interface AttentionData {
  token: string[];
  attention: number[][]; // A 2D array of numbers for the attention matrix
  // bert_attention: number[][][]; // A 3D array for layer/head-specific attention
  // is_type_attention: boolean;
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
