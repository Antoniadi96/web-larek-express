/* eslint-disable max-classes-per-file */

// Базовый класс ошибки
class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Ошибка 400 - Некорректные данные
class BadRequestError extends ApiError {
  constructor(message: string = 'Переданы некорректные данные') {
    super(400, message);
  }
}

// Ошибка 404 - Не найдено
class NotFoundError extends ApiError {
  constructor(message: string = 'Ресурс не найден') {
    super(404, message);
  }
}

// Ошибка 409 - Конфликт
class ConflictError extends ApiError {
  constructor(message: string = 'Конфликт данных') {
    super(409, message);
  }
}

// Ошибка 500 - Внутренняя ошибка сервера
class InternalServerError extends ApiError {
  constructor(message: string = 'Внутренняя ошибка сервера') {
    super(500, message);
  }
}

export {
  ApiError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
