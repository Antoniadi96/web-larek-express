import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CelebrateError } from 'celebrate';

// Определяем типы для ошибок
interface CustomError extends Error {
  statusCode?: number;
}

// Middleware для обработки ошибок
const errorHandler = (
  err: CustomError | CelebrateError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.locals.error = err;

  // Обработка ошибок celebrate
  if (err instanceof CelebrateError) {
    const errorBody = err.details.get('body') || err.details.get('params') || err.details.get('query');
    const details = errorBody?.details[0];

    return res.status(400).json({
      message: details?.message || 'Ошибка валидации данных',
      validation: {
        field: details?.path.join('.'),
        type: details?.type,
      },
    });
  }

  // Устанавливаем статус по умолчанию
  const statusCode = (err as CustomError).statusCode || 500;

  // Формируем ответ с ошибкой
  const response: any = {
    message: err.message || 'Внутренняя ошибка сервера',
  };

  // В режиме разработки добавляем stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Обработка ошибок Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    response.message = 'Ошибка валидации данных';
    if (process.env.NODE_ENV === 'development') {
      response.errors = err.errors;
    }
  } else if (err instanceof mongoose.Error.CastError) {
    response.message = 'Некорректный формат данных';
  }

  // Обработка ошибки дубликата уникального поля
  if (err.message && err.message.includes('E11000')) {
    response.message = 'Товар с таким названием уже существует';
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
