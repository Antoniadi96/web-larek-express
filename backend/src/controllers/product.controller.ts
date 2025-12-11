import { Request, Response, NextFunction } from 'express';
import Product from '../models/product.model';
import { ConflictError, InternalServerError } from '../errors';

// Получить все товары
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find();

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

    const newProduct = new Product({
      title,
      image,
      category,
      description: description || '',
      price: price !== undefined ? price : null,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      id: savedProduct._id,
      title: savedProduct.title,
      image: savedProduct.image,
      category: savedProduct.category,
      description: savedProduct.description,
      price: savedProduct.price,
    });
  } catch (error: any) {
    // Обработка ошибки title
    if (error.message && error.message.includes('E11000')) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }

    // Обработка ошибок валидации
    if (error.name === 'ValidationError') {
      next(error);
      return;
    }

    // Все остальные ошибки
    next(new InternalServerError('Ошибка при создании товара'));
  }
};
