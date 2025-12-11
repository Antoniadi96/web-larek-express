import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import notFoundHandler from './middleware/notFoundHandler';
import errorHandler from './middleware/errorHandler';
import { requestLogger, errorLogger } from './middleware/logger';
import { requestInfo } from './middleware/requestInfo';

// Создаем папку для логов

// Загружаем переменные окружения
dotenv.config();

const app = express();

// Middleware для CORS
app.use(cors());

// Middleware для парсинга JSON
app.use(express.json());
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Логгер запросов
app.use(requestLogger);

app.use(requestInfo);

// Подключение к MongoDB
const MONGODB_URI = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Успешное подключение к MongoDB');
  })
  .catch((error) => {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  });

// Обработка событий подключения к MongoDB
mongoose.connection.on('connected', () => {
  console.log('Подключено к базе данных: weblarek');
});

mongoose.connection.on('error', (err) => {
  console.error('Ошибка MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Отключено от MongoDB');
});

// Раздача статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Маршруты
app.use('/product', productRoutes);
app.use('/order', orderRoutes);

// Простой маршрут для проверки работы базы данных
app.get('/api/check-db', async (req, res, next) => {
  try {
    const dbState = mongoose.connection.readyState;

    let stateText: string;
    switch (dbState) {
      case 0: stateText = 'disconnected'; break;
      case 1: stateText = 'connected'; break;
      case 2: stateText = 'connecting'; break;
      case 3: stateText = 'disconnecting'; break;
      default: stateText = 'unknown';
    }

    res.json({
      status: 'success',
      database: {
        state: stateText,
        readyState: dbState,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'Backend WebLarek API',
    version: '1.0.0',
    endpoints: {
      products: {
        getAll: 'GET /product',
        create: 'POST /product',
      },
      order: 'POST /order',
      health: 'GET /api/check-db',
    },
  });
});

// Middleware для обработки 404 ошибок
app.use(notFoundHandler);

// Логгер ошибок
app.use(errorLogger);

// Централизованный обработчик ошибок
app.use(errorHandler);

// Запуск сервера на порту 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
  console.log(`API товаров: http://localhost:${PORT}/product`);
  console.log(`API заказов: http://localhost:${PORT}/order`);
  console.log(`Статические файлы: http://localhost:${PORT}/images/`);
  console.log(`Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log('Логирование: включено (logs/request.log, logs/error.log)');
});
