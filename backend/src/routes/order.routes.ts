import { Router } from 'express';
import { createOrder } from '../controllers/order.controller';
import { validateCreateOrder } from '../middleware/validation';

const router = Router();

// POST /order - создать новый заказ (с валидацией)
router.post('/', validateCreateOrder, createOrder);

export default router;
