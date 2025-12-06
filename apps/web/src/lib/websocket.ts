type MessageHandler = (data: unknown) => void;

interface WebSocketMessage {
  event: string;
  data: unknown;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected";
type StatusChangeHandler = (status: ConnectionStatus) => void;

class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, Set<MessageHandler>> = new Map();
  private statusHandlers: Set<StatusChangeHandler> = new Set();
  private status: ConnectionStatus = "disconnected";
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 3000;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  /**
   * 连接 WebSocket 服务器
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.setStatus("connecting");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.hostname}:3000`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.addEventListener("open", () => {
        this.reconnectAttempts = 0;
        this.setStatus("connected");
        console.log("[WebSocket] Connected");
      });

      this.ws.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.dispatchEvent(message.event, message.data);
        } catch {
          // 忽略解析错误
        }
      });

      this.ws.addEventListener("close", () => {
        this.setStatus("disconnected");
        console.log("[WebSocket] Disconnected");
        this.scheduleReconnect();
      });

      this.ws.addEventListener("error", (error) => {
        console.error("[WebSocket] Error:", error);
        this.setStatus("disconnected");
      });
    } catch (error) {
      console.error("[WebSocket] Connection failed:", error);
      this.setStatus("disconnected");
      this.scheduleReconnect();
    }
  }

  /**
   * 断开 WebSocket 连接
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // 阻止自动重连

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus("disconnected");
  }

  /**
   * 发送消息
   */
  send(event: string, data: unknown): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
      return true;
    }
    return false;
  }

  /**
   * 注册事件监听器
   */
  on(event: string, handler: MessageHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // 如果是第一个监听器，自动连接
    if (this.getTotalHandlerCount() === 1) {
      this.connect();
    }

    // 返回取消订阅函数
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * 移除事件监听器
   */
  off(event: string, handler: MessageHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }

    // 如果没有任何监听器了，断开连接
    if (this.getTotalHandlerCount() === 0) {
      this.disconnect();
    }
  }

  /**
   * 监听连接状态变化
   */
  onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusHandlers.add(handler);
    // 立即通知当前状态
    handler(this.status);

    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  /**
   * 获取当前连接状态
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * 分发事件到对应的处理器
   */
  private dispatchEvent(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WebSocket] Error in handler for event "${event}":`, error);
        }
      });
    }
  }

  /**
   * 设置连接状态并通知监听器
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusHandlers.forEach((handler) => {
        try {
          handler(status);
        } catch (error) {
          console.error("[WebSocket] Error in status handler:", error);
        }
      });
    }
  }

  /**
   * 计划重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[WebSocket] Max reconnect attempts reached");
      return;
    }

    if (this.getTotalHandlerCount() === 0) {
      return; // 没有监听器，不需要重连
    }

    if (this.reconnectTimer) {
      return; // 已经在等待重连
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 5);
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /**
   * 获取所有处理器的总数
   */
  private getTotalHandlerCount(): number {
    let count = 0;
    this.eventHandlers.forEach((handlers) => {
      count += handlers.size;
    });
    return count;
  }
}

// 导出单例
export const wsManager = WebSocketManager.getInstance();

// 导出类型
export type { MessageHandler, ConnectionStatus, StatusChangeHandler };

