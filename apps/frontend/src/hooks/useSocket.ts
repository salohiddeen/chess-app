import { useEffect, useState } from 'react';

const WS_URL =
  import.meta.env.VITE_APP_WS_URL ||
  (window.location.protocol === 'https:'
    ? 'wss://chess-app-6g4f.onrender.com'
    : 'ws://localhost:8080');

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WS: Muvaffaqiyatli ulandi ✅');
      setSocket(ws);
    };

    ws.onerror = (error) => {
      console.error('WS: Ulanishda xatolik ❌', error);
    };

    ws.onclose = () => {
      console.warn('WS: Ulanish uzildi');
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, []);

  return socket;
};
