import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketLogEvent } from '../types/socket';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  logs: SocketLogEvent[];
  clearLogs: () => void;
}

export const useSocket = (chatId: string): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<SocketLogEvent[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!chatId) return;

    const newSocket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const identifySocket = () => {
      console.log('Identifying socket with chatId:', chatId);
      newSocket.emit('identify', { chatId });
    };

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      identifySocket();
    });

    newSocket.on('reconnect', () => {
      console.log('Socket reconnected');
      identifySocket();
    });

    newSocket.on('identified', (data) => {
      console.log('Chat identified:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('log', (logEvent: SocketLogEvent) => {
      console.log('Log event received:', logEvent);
      setLogs((prevLogs) => [...prevLogs, logEvent]);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [chatId]);

  const clearLogs = () => {
    setLogs([]);
  };

  return {
    socket,
    isConnected,
    logs,
    clearLogs,
  };
};

