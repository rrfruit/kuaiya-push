import { utilities as nestWinstonUtils } from 'nest-winston'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { WebSocketTransport } from './websocket.transport'

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonUtils.format.nestLike('app', {
          colors: true,
          prettyPrint: true,
        }),
      ),
      level: 'verbose',
    }),
    // 文件输出（仅 error 级别）
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error', // 关键配置：只记录 error
      zippedArchive: true,
      maxSize: '200m',
      maxFiles: '30d', // 保留 30 天
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(), // JSON 格式便于分析
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'log',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new WebSocketTransport({ level: 'debug' }),
  ],
}
