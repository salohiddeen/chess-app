import { useEffect, useState } from 'react';
import { useUser } from '@repo/store/useUser';

const WS_URL =
  import.meta.env.VITE_APP_WS_URL ||
  (window.location.protocol === 'https:'
    ? 'wss://chess-app-6g4f.onrender.com'
    : 'ws://localhost:8080');

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
