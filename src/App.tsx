import { useState, useCallback, createContext, useContext, useRef } from 'react';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { Header } from './components/Header';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { VoiceWaveform } from './components/VoiceWaveform';
import { sendChatMessage } from './services/chatApi';
import { useSocket } from './hooks/useSocket';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { addMessage, setLoading, setError, newChat } from './store/chatSlice';
import { Message } from './types/chat';

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
  const dispatch = useAppDispatch();
  const { currentChatId, messages, isLoading, error } = useAppSelector((state) => state.chat);
  const [isMuted, setIsMuted] = useState(false);
  const [stopStreaming, setStopStreaming] = useState(false);
  const { logs, clearLogs } = useSocket(currentChatId);
  const { isSpeaking } = useTextToSpeech();
  const abortControllerRef = useRef<AbortController | null>(null);
  const stopVoiceRef = useRef<(() => void) | null>(null);

  const handleNewChat = useCallback(() => {
    dispatch(newChat());
    clearLogs();
    setStopStreaming(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (stopVoiceRef.current) {
      stopVoiceRef.current();
      stopVoiceRef.current = null;
    }
  }, [dispatch, clearLogs]);

  const handleCancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      // If request is loading, abort it
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      dispatch(setLoading(false));
      clearLogs();
    }
    
    // Stop voice if playing
    if (stopVoiceRef.current) {
      stopVoiceRef.current();
      stopVoiceRef.current = null;
    }
    
    // Stop streaming text
    setStopStreaming(true);
  }, [dispatch, clearLogs]);

  const handleSendMessage = useCallback(async (userQuery: string) => {
    // Add user message to store
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: userQuery,
      timestamp: Date.now(),
    };
    dispatch(addMessage(userMessage));
    dispatch(setLoading(true));
    dispatch(setError(null));
    setStopStreaming(false);
    clearLogs();

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await sendChatMessage(userQuery, currentChatId, abortControllerRef.current.signal);

      if (response.error) {
        dispatch(setError(response.error));
        const errorMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          markdown_text: `**Error:** ${response.error}`,
          ai_voice: response.error,
          timestamp: Date.now(),
        };
        dispatch(addMessage(errorMessage));
      } else if (response.markdown_text || response.ai_voice) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          markdown_text: response.markdown_text,
          ai_voice: response.ai_voice,
          timestamp: Date.now(),
        };
        dispatch(addMessage(aiMessage));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to the server';
      
      // Don't show error message if request was cancelled
      if (errorMsg !== 'Request cancelled') {
        dispatch(setError(errorMsg));
        const errorMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          markdown_text: `**Connection Error:** ${errorMsg}. Please check if the API server is running.`,
          ai_voice: `Connection error: ${errorMsg}`,
          timestamp: Date.now(),
        };
        dispatch(addMessage(errorMessage));
      }
    } finally {
      dispatch(setLoading(false));
      abortControllerRef.current = null;
    }
  }, [currentChatId, dispatch, clearLogs]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return (
    <VoiceContext.Provider value={{ isMuted, toggleMute }}>
      <div className="h-screen flex flex-col relative overflow-hidden">
        <BackgroundAnimation isSpeaking={isSpeaking} />
        <div className="relative z-10 h-screen flex flex-col">
          <Header onNewChat={handleNewChat} />
          <div className="h-[80vh] overflow-y-auto px-4 py-6 scroll-smooth custom-scrollbar" id="message-scroll-container">
            <MessageList 
              messages={messages}
              isLoading={isLoading} 
              logs={logs}
              stopStreaming={stopStreaming}
              setStopVoiceRef={(stopFn) => { stopVoiceRef.current = stopFn; }}
              onSendMessage={handleSendMessage}
            />
          </div>
          <div className="h-[20vh] flex items-center justify-center flex-shrink-0 relative z-20">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} onCancel={handleCancelRequest} />
          </div>
          <VoiceWaveform isSpeaking={isSpeaking && !isMuted} />
        </div>
      </div>
    </VoiceContext.Provider>
  );
}

export default App;
