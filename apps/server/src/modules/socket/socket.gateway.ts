import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import WebSocket, { WebSocketServer, RawData } from "ws";
import type { Server } from "http";

interface ClientData {
  id: string;
  isAlive: boolean;
}

@Injectable()
export class SocketGateway implements OnModuleDestroy {
  private readonly logger = new Logger(SocketGateway.name);
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private clientData: Map<WebSocket, ClientData> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private static instance: SocketGateway;

  constructor() {
    SocketGateway.instance = this;
  }

  /**
   * 获取 SocketGateway 单例实例
   */
  public static getInstance(): SocketGateway | null {
    return SocketGateway.instance ?? null;
  }

  /**
   * 初始化 WebSocket 服务器
   * @param server HTTP 服务器实例
   */
  init(server: Server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on("connection", (ws: WebSocket) => {
      const id = this.generateId();
      const data: ClientData = { id, isAlive: true };

      this.clients.set(id, ws);
      this.clientData.set(ws, data);
      this.logger.log(`Client connected: ${id}`);

      // 心跳检测
      ws.on("pong", () => {
        const clientData = this.clientData.get(ws);
        if (clientData) {
          clientData.isAlive = true;
        }
      });

      ws.on("message", (rawData: RawData) => {
        this.handleMessage(ws, rawData);
      });

      ws.on("close", () => {
        const clientData = this.clientData.get(ws);
        if (clientData) {
          this.clients.delete(clientData.id);
          this.clientData.delete(ws);
          this.logger.log(`Client disconnected: ${clientData.id}`);
        }
      });

      ws.on("error", (error) => {
        const clientData = this.clientData.get(ws);
        this.logger.error(`Client error: ${clientData?.id}`, error.message);
      });
    });

    // 启动心跳检测
    this.startHeartbeat();

    this.logger.log("WebSocket server initialized");
  }

  onModuleDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.wss) {
      this.wss.close();
    }
  }

  /**
   * 处理收到的消息
   */
  private handleMessage(ws: WebSocket, rawData: RawData) {
    const clientData = this.clientData.get(ws);
    try {
      const message = JSON.parse(rawData.toString());
      this.logger.debug(`Received message from ${clientData?.id}: ${JSON.stringify(message)}`);

      // 处理不同的事件类型
      if (message.event === "events") {
        this.send(clientData?.id ?? "", { event: "events", data: message.data });
      }
    } catch {
      this.logger.warn(`Invalid message format from ${clientData?.id}`);
    }
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clientData.forEach((data, ws) => {
        if (!data.isAlive) {
          this.logger.log(`Client ${data.id} heartbeat timeout, terminating`);
          ws.terminate();
          this.clients.delete(data.id);
          this.clientData.delete(ws);
          return;
        }

        data.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30秒心跳间隔
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 向指定客户端发送消息
   */
  send(clientId: string, data: { event: string; data: unknown }) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  /**
   * 向所有客户端广播消息
   */
  emit(event: string, data: unknown) {
    const message = JSON.stringify({ event, data });
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * 获取当前连接的客户端数量
   */
  getClientCount(): number {
    return this.clients.size;
  }
}
