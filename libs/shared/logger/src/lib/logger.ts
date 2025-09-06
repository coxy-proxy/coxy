import pino from 'pino';
import 'pino-pretty';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true, // Enable colors
      singleLine: false, // Easier reading
    },
  },
});
