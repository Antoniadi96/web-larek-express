import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product.model';
import { BadRequestError, InternalServerError } from '../errors';

// Функция для нормализации номера телефона
const normalizePhone = (phone: string): string => phone.replace(/(?!^\+)\D/g, '');

// Валидация email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Создание заказа
const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone.match(/^\+?[1-9]\d{9,14}$/)) {
      throw new BadRequestError('Некорректный формат телефона');
    }

    if (!payment || !email || !phone || !address || total === undefined || !items) {
      throw new BadRequestError('Не все обязательные поля заполнены');
    }

    if (!['card', 'online'].includes(payment)) {
      throw new BadRequestError('Поле payment должно быть "card" или "online"');
    }

    if (!validateEmail(email)) {
      throw new BadRequestError('Некорректный email');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Items должен быть непустым массивом');
    }

    const products = await Product.find({ _id: { $in: items } });

    // Проверяем, что все товары найдены
    if (products.length !== items.length) {
      const foundIds = products.map((p) => p._id.toString());
      const missingIds = items.filter((id: string) => !foundIds.includes(id));

      throw new BadRequestError(`Товары с ID не найдены: ${missingIds.join(', ')}`);
    }

    // Проверяем, что все товары продаются (price не null)
    const unavailableProducts = products.filter((p) => p.price === null);
    if (unavailableProducts.length > 0) {
      const unavailableIds = unavailableProducts.map((p) => p._id.toString());
      throw new BadRequestError(`Товары не продаются (цена null): ${unavailableIds.join(', ')}`);
    }

    const calculatedTotal = products.reduce(
      (sum, product) => sum + (product.price || 0),
      0,
    );

    if (calculatedTotal !== total) {
      throw new BadRequestError(`Неверная сумма заказа. Ожидалось: ${calculatedTotal}, получено: ${total}`);
    }

    // Генерация ID заказа
    const orderId = faker.string.uuid();

    // Возвращаем успешный ответ
    res.status(200).json({
      id: orderId,
      total: calculatedTotal,
    });
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
      return;
    }

    next(new InternalServerError('Ошибка при создании заказа'));
  }
};

export default createOrder;
