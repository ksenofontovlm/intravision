import axios from 'axios';
import { Product, Brand, Coin, Order, CartItem } from '../types';

const API_BASE_URL = 'http://localhost:5000/api'; // Замените на ваш URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const vendingApi = {
  // Каталог
  getProducts: (brandId?: number, minPrice?: number, maxPrice?: number) =>
    api.get<Product[]>('/products', { params: { brandId, minPrice, maxPrice } }),
  getBrands: () => api.get<Brand[]>('/products/brands'),
  getPriceRange: (brandId?: number) =>
    api.get<{ MinPrice: number; MaxPrice: number }>('/products/price-range', { params: { brandId } }),
  importProducts: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateStock: (productId: number, quantity: number) =>
    api.put(`/products/${productId}/stock`, quantity),

  // Заказы
  isMachineBusy: () => api.get<{ IsBusy: boolean }>('/orders/is-machine-busy'),
  lockMachine: () => api.post('/orders/lock-machine'),
  unlockMachine: () => api.post('/orders/unlock-machine'),
  createOrder: (cartItems: CartItem[]) => api.post<{ OrderId: number; TotalAmount: number }>('/orders', cartItems),
  getOrderDetails: (orderId: number) => api.get<Order>(`/orders/${orderId}`),
  updateCartItem: (orderId: number, cartItem: CartItem) =>
    api.put(`/orders/cart?orderId=${orderId}`, cartItem),
  removeCartItem: (orderId: number, productId: number) =>
    api.delete(`/orders/cart/${productId}?orderId=${orderId}`),
  getCoins: () => api.get<Coin[]>('/orders/coins'),
  processPayment: (orderId: number, insertedCoins: Record<number, number>) =>
    api.post<{
      Message: string;
      ChangeAmount: number;
      ChangeCoins: Record<number, number>;
    }>(`/orders/${orderId}/pay`, insertedCoins),
};