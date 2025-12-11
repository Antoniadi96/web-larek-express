import mongoose, { Schema, Document } from 'mongoose';

// TS-интерфейс для товара
export interface IProduct extends Document {
  title: string;
  image: {
    fileName: string;
    originalName: string;
  };
  category: string;
  description?: string;
  price?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Схема товара с полной валидацией
const productSchema: Schema = new Schema({
  title: {
    type: String,
    unique: true,
    required: [true, 'Поле "title" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
    trim: true,
  },
  image: {
    fileName: {
      type: String,
      required: [true, 'Поле "fileName" должно быть заполнено'],
    },
    originalName: {
      type: String,
      required: [true, 'Поле "originalName" должно быть заполнено'],
    },
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

const Product = mongoose.model<IProduct>('product', productSchema);

export default Product;
