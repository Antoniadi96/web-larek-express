import { celebrate, Joi, Segments } from 'celebrate';

// Валидация для создания товара
export const validateCreateProduct = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string()
      .required()
      .min(2)
      .max(30)
      .messages({
        'string.empty': 'Поле "title" должно быть заполнено',
        'string.min': 'Минимальная длина поля "title" - 2 символа',
        'string.max': 'Максимальная длина поля "title" - 30 символов',
        'any.required': 'Поле "title" обязательно',
      }),

    image: Joi.object({
      fileName: Joi.string()
        .required()
        .messages({
          'string.empty': 'Поле "fileName" должно быть заполнено',
          'any.required': 'Поле "fileName" обязательно',
        }),
      originalName: Joi.string()
        .required()
        .messages({
          'string.empty': 'Поле "originalName" должно быть заполнено',
          'any.required': 'Поле "originalName" обязательно',
        }),
    })
      .required()
      .messages({
        'object.base': 'Поле "image" должно быть объектом',
        'any.required': 'Поле "image" обязательно',
      }),

    category: Joi.string()
      .required()
      .messages({
        'string.empty': 'Поле "category" должно быть заполнено',
        'any.required': 'Поле "category" обязательно',
      }),

    description: Joi.string()
      .allow('')
      .optional(),

    price: Joi.number()
      .allow(null)
      .optional()
      .messages({
        'number.base': 'Поле "price" должно быть числом',
      }),
  }),
});

// Валидация для создания заказа
export const validateCreateOrder = celebrate({
  [Segments.BODY]: Joi.object({
    payment: Joi.string()
      .valid('card', 'online')
      .required()
      .messages({
        'any.only': 'Поле "payment" должно быть "card" или "online"',
        'any.required': 'Поле "payment" обязательно',
      }),

    email: Joi.string()
      .required()
      .email()
      .messages({
        'string.email': 'Некорректный формат email',
        'string.empty': 'Поле "email" должно быть заполнено',
        'any.required': 'Поле "email" обязательно',
      }),

    phone: Joi.string()
      .required()
      .pattern(/^\+?[\d\s\-()]+$/)
      .messages({
        'string.pattern.base': 'Некорректный формат телефона. Пример: +7 (999) 123-45-67',
        'string.empty': 'Поле "phone" должно быть заполнено',
        'any.required': 'Поле "phone" обязательно',
      }),

    address: Joi.string()
      .required()
      .messages({
        'string.empty': 'Поле "address" должно быть заполнено',
        'any.required': 'Поле "address" обязательно',
      }),

    total: Joi.number()
      .required()
      .min(0)
      .messages({
        'number.base': 'Поле "total" должно быть числом',
        'number.min': 'Сумма заказа не может быть отрицательной',
        'any.required': 'Поле "total" обязательно',
      }),

    items: Joi.array()
      .items(
        Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .message('Некорректный формат ID товара'),
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Заказ должен содержать хотя бы один товар',
        'array.base': 'Поле "items" должно быть массивом',
        'any.required': 'Поле "items" обязательно',
      }),
  }),
});
