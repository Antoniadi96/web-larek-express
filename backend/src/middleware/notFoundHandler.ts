import { Request, Response, NextFunction } from 'express';

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Маршрут не найден: ${req.originalUrl}`);
  (error as any).statusCode = 404;
  next(error);
};

export default notFoundHandler;
