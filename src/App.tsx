import { useState, useCallback, createContext, useContext, useRef } from 'react';
import { nanoid } from 'nanoid';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { Message } from './types/chat';
import { sendChatMessage } from './services/chatApi';
import { useSocket } from './hooks/useSocket';

interface VoiceContextType {
  isMuted: boolean;
  toggleMute: () => void;
}

const VoiceContext = createContext<VoiceContextType>({
  isMuted: false,
  toggleMute: () => {},
});

export const useVoiceContext = () => useContext(VoiceContext);

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [chatId] = useState(() => nanoid(10));
  const { logs, clearLogs } = useSocket(chatId);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      clearLogs();
    }
  }, [clearLogs]);

  const handleSendMessage = useCallback(async (userQuery: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: userQuery,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    clearLogs();

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await sendChatMessage(userQuery, chatId, abortControllerRef.current.signal);

      if (response.error) {
        setError(response.error);
        const errorMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          markdown_text: `**Error:** ${response.error}`,
          ai_voice: response.error,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          ai_voice: response.ai_voice,
          markdown_text: response.markdown_text,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to the server';
      
      // Don't show error message if request was cancelled
      if (errorMsg !== 'Request cancelled') {
        setError(errorMsg);
        const errorMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          markdown_text: `**Connection Error:** ${errorMsg}. Please check if the API server is running.`,
          ai_voice: `Connection error: ${errorMsg}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [chatId, clearLogs]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return (
    <VoiceContext.Provider value={{ isMuted, toggleMute }}>
      <div className="h-screen bg-[#1a1a1a] flex flex-col relative overflow-hidden">
        <Header />
        <MessageList messages={messages} isLoading={isLoading} logs={logs} />
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} onCancel={handleCancelRequest} />
      </div>
    </VoiceContext.Provider>
  );
}

export default App;
