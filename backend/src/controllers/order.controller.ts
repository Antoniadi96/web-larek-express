import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product.model';
import { BadRequestError, InternalServerError } from '../errors';

// Создание заказа
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    // Проверка существования товаров и их цены
    const products = await Product.find({ _id: { $in: items } });

    // Проверяем, что все товары найдены
    if (products.length !== items.length) {
      const foundIds = products.map((p) => p._id.toString());
      const missingIds = items.filter((id: string) => !foundIds.includes(id));

      throw new BadRequestError(`Товары с ID не найдены: ${missingIds.join(', ')}`);
    }

    // Проверяем, что все товары продаются
    const unavailableProducts = products.filter((p) => p.price === null);
    if (unavailableProducts.length > 0) {
      const unavailableIds = unavailableProducts.map((p) => p._id.toString());
      throw new BadRequestError(`Товары не продаются (цена null): ${unavailableIds.join(', ')}`);
    }

    // Проверяем общую сумму
    const calculatedTotal = products.reduce((sum, product) => sum + (product.price || 0), 0);

    if (calculatedTotal !== total) {
      throw new BadRequestError(`Неверная сумма заказа. Ожидалось: ${calculatedTotal}, получено: ${total}`);
    }

    // Генерация ID заказа
    const orderId = faker.string.uuid();

    // Возвращаем успешный ответ
    res.status(201).json({
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
