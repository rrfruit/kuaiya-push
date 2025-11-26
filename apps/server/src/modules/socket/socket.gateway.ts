import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SocketGateway.name)
  private static instance: SocketGateway

  @WebSocketServer()
  server: Server

  afterInit(_server: Server) {
    this.logger.log('Socket.IO server initialized')
  }

  public static getInstance(): SocketGateway {
    return SocketGateway.instance
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('events')
  handleEvent(_client: Socket, data: string): string {
    return data
  }

  public emit(event: string, data: any) {
    return this.server.emit(event, data)
  }
}
