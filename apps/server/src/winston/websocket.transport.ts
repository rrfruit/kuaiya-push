import Transport, { TransportStreamOptions } from "winston-transport";
import { SocketGateway } from "../modules/socket/socket.gateway";

export class WebSocketTransport extends Transport {
  constructor(opts: TransportStreamOptions) {
    super(opts);
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    const socketGateway = SocketGateway.getInstance();
    if (socketGateway) {
      info.timestamp = new Date().toISOString();
      socketGateway.emit("log", info);
    }
    callback();
  }
}
