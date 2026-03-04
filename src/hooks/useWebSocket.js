import { useEffect, useRef, useState } from 'react';

export function useWebSocket() {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const WS_URL =
      import.meta.env.VITE_WS_URL ||
      'wss://beemonitor-production.up.railway.app';

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsOpen(true);
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = () => {
      setIsOpen(false);
    };

    ws.onerror = () => {
      setIsOpen(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
    }
  };

  return { messages, sendMessage, isOpen };
}

