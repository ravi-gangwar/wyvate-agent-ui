import { useState, useCallback, createContext, useContext } from 'react';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { Message } from './types/chat';
import { sendChatMessage } from './services/chatApi';

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

    try {
      const response = await sendChatMessage(userQuery);

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
      setError(errorMsg);
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        markdown_text: `**Connection Error:** ${errorMsg}. Please check if the API server is running.`,
        ai_voice: `Connection error: ${errorMsg}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return (
    <VoiceContext.Provider value={{ isMuted, toggleMute }}>
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col relative">
        <Header />
        <MessageList messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </VoiceContext.Provider>
  );
}

export default App;
