import { useEffect, useRef } from "react";
import { useStore } from "../stores/store";

export function useWebSockets() {
  const socketRef = useRef<WebSocket | null>(null);
  const handleRealtimeEvent = useStore((state) => state.handleRealtimeEvent);
  const setRealtimeConnected = useStore((state) => state.setRealtimeConnected);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.close();
      }
      return;
    }

    let reconnectTimeout: number;
    
    function connect() {
      const apiBase = import.meta.env.VITE_API_URL;
      if (!apiBase) {
        throw new Error("Missing VITE_API_URL environment variable for websocket connection.");
      }
      const socketUrl = new URL("/ws", apiBase).toString().replace(/^http/, "ws");
      const ws = new WebSocket(socketUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("[WebSocket] Connected to operations streaming...");
        setRealtimeConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type && payload.data) {
            handleRealtimeEvent(payload.type, payload.data);
          }
        } catch (e) {
          console.error("[WebSocket] Failed to parse event packet", e);
        }
      };

      ws.onclose = () => {
        console.log("[WebSocket] Operations feed closed. Reconnecting in 3s...");
        setRealtimeConnected(false);
        reconnectTimeout = window.setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("[WebSocket] Error: ", err);
        ws.close();
      };
    }

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [isAuthenticated, handleRealtimeEvent, setRealtimeConnected]);
}
