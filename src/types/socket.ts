export interface SocketLogEvent {
  chatId: string;
  step: string;
  message: string;
  timestamp: string;
  metadata?: {
    duration?: number;
    resultCount?: number;
    [key: string]: any;
  };
}

