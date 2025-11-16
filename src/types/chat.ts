export interface Message {
  id: string;
  type: 'user' | 'ai';
  text?: string;
  ai_voice?: string;
  markdown_text?: string;
  timestamp: number;
}

export interface ChatResponse {
  ai_voice?: string;
  markdown_text?: string;
  error?: string;
}
