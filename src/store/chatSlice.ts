import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import { Message } from '../types/chat';

interface ChatState {
  currentChatId: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  currentChatId: nanoid(10),
  messages: [],
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatId: (state, action: PayloadAction<string>) => {
      state.currentChatId = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
    newChat: (state) => {
      state.currentChatId = nanoid(10);
      state.messages = [];
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const { setChatId, addMessage, setLoading, setError, clearMessages, newChat } = chatSlice.actions;
export default chatSlice.reducer;

