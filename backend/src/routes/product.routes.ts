import { Router } from 'express';
import { getAllProducts, createProduct } from '../controllers/product.controller';
import { validateCreateProduct } from '../middleware/validation';

const router = Router();

// GET /product - получить все товары
router.get('/', getAllProducts);

// POST /product - создать новый товар (с валидацией)
router.post('/', validateCreateProduct, createProduct);

export default router;
