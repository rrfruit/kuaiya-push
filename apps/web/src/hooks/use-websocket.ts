import { useEffect, useState, useCallback, useRef } from "react";
import { wsManager, type ConnectionStatus, type MessageHandler } from "@/lib/websocket";

/**
 * 订阅 WebSocket 事件的 Hook
 * @param event 事件名称，传空字符串则不订阅
 * @param handler 事件处理函数
 */
export function useWebSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void
): void {
  // 使用 ref 保存 handler 避免重复订阅
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    // 空字符串表示不订阅
    if (!event) return;

    const wrappedHandler: MessageHandler = (data) => {
      handlerRef.current(data as T);
    };

    const unsubscribe = wsManager.on(event, wrappedHandler);
    return unsubscribe;
  }, [event]);
}

/**
 * 获取 WebSocket 连接状态的 Hook
 */
export function useWebSocketStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(wsManager.getStatus());

  useEffect(() => {
    const unsubscribe = wsManager.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  return status;
}

/**
 * 发送 WebSocket 消息的 Hook
 */
export function useWebSocketSend(): (event: string, data: unknown) => boolean {
  return useCallback((event: string, data: unknown) => {
    return wsManager.send(event, data);
  }, []);
}

/**
 * 组合 Hook：订阅事件 + 获取连接状态
 * @param event 事件名称，传空字符串则不订阅（但仍会获取连接状态）
 * @param handler 事件处理函数
 */
export function useWebSocket<T = unknown>(
  event: string,
  handler: (data: T) => void
): { status: ConnectionStatus; send: (event: string, data: unknown) => boolean } {
  useWebSocketEvent(event, handler);
  const status = useWebSocketStatus();
  const send = useWebSocketSend();

  return { status, send };
}
