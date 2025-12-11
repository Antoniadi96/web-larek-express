import expressWinston from 'express-winston';
import winston from 'winston';
import path from 'path';

// Middleware для логирования запросов
export const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'request.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
  ),
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: false,
  colorize: false,
  ignoreRoute(req, _res) {
    return req.url.startsWith('/images') || req.url === '/api/check-db';
  },
  requestWhitelist: ['url', 'method', 'headers', 'query', 'body'],
  responseWhitelist: ['statusCode', 'responseTime'],
  dynamicMeta: (req, _res) => ({
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  }),
});

// Middleware для логирования ошибок
export const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
  ),
  meta: true,
  msg: 'Error: {{err.message}}',
  requestWhitelist: ['url', 'method', 'headers', 'query', 'body'],
  dynamicMeta: (req, _res) => ({
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
    errorStack: _res.locals.error?.stack,
  }),
});
