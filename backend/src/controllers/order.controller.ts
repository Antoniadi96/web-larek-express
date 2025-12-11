import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product.model';
import { BadRequestError, InternalServerError } from '../errors';

// Функция для нормализации номера телефона
const normalizePhone = (phone: string): string => {
  // Удаляем все символы кроме цифр и плюса в начале
  return phone.replace(/(?!^\+)\D/g, '');
};

// Валидация email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Создание заказа
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { payment, email, phone, address, total, items } = req.body;

    // Нормализуем телефон для проверки (убираем пробелы, скобки, дефисы)
    const normalizedPhone = normalizePhone(phone);

    // Проверяем, что после нормализации номер валиден
    if (!normalizedPhone.match(/^\+?[1-9]\d{9,14}$/)) {
      throw new BadRequestError('Некорректный формат телефона');
    }

    // Проверка обязательных полей
    if (!payment || !email || !phone || !address || total === undefined || !items) {
      throw new BadRequestError('Не все обязательные поля заполнены');
    }

    // Проверка payment
    if (!['card', 'online'].includes(payment)) {
      throw new BadRequestError('Поле payment должно быть "card" или "online"');
    }

    // Проверка email
    if (!validateEmail(email)) {
      throw new BadRequestError('Некорректный email');
    }

    // Проверка items (массив не пустой)
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Items должен быть непустым массивом');
    }

    // Проверка существования товаров и их цены
    const products = await Product.find({ _id: { $in: items } });

    // Проверяем, что все товары найдены
    if (products.length !== items.length) {
      const foundIds = products.map(p => p._id.toString());
      const missingIds = items.filter((id: string) => !foundIds.includes(id));

      throw new BadRequestError(`Товары с ID не найдены: ${missingIds.join(', ')}`);
    }

    // Проверяем, что все товары продаются (price не null)
    const unavailableProducts = products.filter(p => p.price === null);
    if (unavailableProducts.length > 0) {
      const unavailableIds = unavailableProducts.map(p => p._id.toString());
      throw new BadRequestError(`Товары не продаются (цена null): ${unavailableIds.join(', ')}`);
    }

    // Проверяем общую сумму
    const calculatedTotal = products.reduce((sum, product) => {
      return sum + (product.price || 0);
    }, 0);

    if (calculatedTotal !== total) {
      throw new BadRequestError(`Неверная сумма заказа. Ожидалось: ${calculatedTotal}, получено: ${total}`);
    }

    // Генерация ID заказа
    const orderId = faker.string.uuid();

    // Возвращаем успешный ответ
    res.status(201).json({
      id: orderId,
      total: calculatedTotal
    });

  } catch (error: any) {
    // Если это уже наша кастомная ошибка
    if (error.statusCode) {
      next(error);
      return;
    }

    // Все остальные ошибки
    next(new InternalServerError('Ошибка при создании заказа'));
  }
};