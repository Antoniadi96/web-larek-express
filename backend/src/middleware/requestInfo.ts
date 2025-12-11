import { Request, Response, NextFunction } from 'express';

// Middleware для добавления информации о запросе
const requestInfo = (req: Request, res: Response, next: NextFunction) => {
  res.locals.requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);

  res.locals.startTime = Date.now();

  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} (ID: ${res.locals.requestId})`);

  const originalEnd = res.end;
  res.end = function end(chunk?: any, encoding?: any) {
    const duration = Date.now() - res.locals.startTime;
    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms) (ID: ${res.locals.requestId})`);

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default requestInfo;