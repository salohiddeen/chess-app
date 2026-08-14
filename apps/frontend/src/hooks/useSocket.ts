import { useEffect, useState } from 'react';
import { useUser } from '@repo/store/useUser';

const WS_URL const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://chess-app-6g4f.onrender.com');

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const user = useUser();

  useEffect(() => {
    const token = localStorage.getItem('token') || user?.token;

    const url = token ? `${WS_URL}?token=${token}` : WS_URL;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WS: Ulandi ✅');
      setSocket(ws);
    };

    ws.onerror = (err) => {
      console.error('WS Error:', err);
    };

    ws.onclose = () => {
      console.warn('WS: Uzildi');
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [user]);

  return socket;
};
