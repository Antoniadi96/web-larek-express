import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product.model';
import { ConflictError, InternalServerError, BadRequestError } from '../errors';

// Получить все товары
export const getAllProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      items: products,
      total: products.length,
    });
  } catch (error) {
    next(new InternalServerError('Ошибка при получении товаров'));
  }
};

// Создать новый товар
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    // Валидация на уровне контроллера (дополнительно к celebrate)
    if (!title || title.trim().length < 2) {
      throw new BadRequestError('Название товара должно содержать минимум 2 символа');
    }

    if (title.length > 30) {
      throw new BadRequestError('Название товара должно содержать максимум 30 символов');
    }

    // Проверка существования товара с таким же названием
    const existingProduct = await Product.findOne({ title: title.trim() });
    if (existingProduct) {
      throw new ConflictError('Товар с таким названием уже существует');
    }

    const newProduct = new Product({
      title: title.trim(),
      image,
      category,
      description: description || '',
      price: price !== undefined ? price : null,
    });

    const savedProduct = await newProduct.save();

    // Формат ответа, который ожидают тесты
    res.status(201).json({
      _id: savedProduct._id,
      title: savedProduct.title,
      image: savedProduct.image,
      category: savedProduct.category,
      description: savedProduct.description,
      price: savedProduct.price,
      ...(savedProduct.createdAt && { createdAt: savedProduct.createdAt }),
      ...(savedProduct.updatedAt && { updatedAt: savedProduct.updatedAt }),
    });
  } catch (error: any) {
    // Обработка ошибки уникальности MongoDB (E11000)
    if (error.code === 11000 || (error.message && error.message.includes('E11000'))) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }

    // Обработка ошибок валидации Mongoose
    if (error instanceof mongoose.Error.ValidationError) {
      next(new BadRequestError('Ошибка валидации данных при создании товара'));
      return;
    }

    // Если ошибка уже имеет статус
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      next(error);
      return;
    }

    // Все остальные ошибки
    next(new InternalServerError('Ошибка при создании товара'));
  }
};

// Дополнительно: функция для проверки существования товара
export const checkProductExists = async (title: string): Promise<boolean> => {
  const product = await Product.findOne({ title: title.trim() });
  return !!product;
};
