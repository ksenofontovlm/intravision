import axios from "axios";
import {
  type Product,
  type Brand,
  type Coin,
  type Order,
  type CartItem,
} from "../types";

const API_BASE_URL = "https://localhost:7053/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Простой кэш для запросов
const cache: { [key: string]: Promise<any> } = {};

export const vendingApi = {
  getProducts: (brandId?: number, minPrice?: number, maxPrice?: number) => {
    const cacheKey = `products_${brandId}_${minPrice}_${maxPrice}`;
    console.log(`Fetching products: ${cacheKey}`);
    if (!cache[cacheKey]) {
      cache[cacheKey] = api
        .get<Product[]>('/products', { params: { brandId, minPrice, maxPrice } })
        .then(response => {
          console.log('Products response:', response.data);
          return response.data;
        })
        .catch(error => {
          console.error('Products error:', error);
          throw error;
        });
    }
    return cache[cacheKey];
  },
  getBrands: () => {
    const cacheKey = 'brands';
    console.log('Fetching brands');
    if (!cache[cacheKey]) {
      cache[cacheKey] = api
        .get<Brand[]>('/products/brands')
        .then(response => {
          console.log('Brands response:', response.data);
          return response.data;
        })
        .catch(error => {
          console.error('Brands error:', error);
          throw error;
        });
    }
    return cache[cacheKey];
  },
  getPriceRange: (brandId?: number) => {
    const cacheKey = `priceRange_${brandId}`;
    console.log(`Fetching price range: ${cacheKey}`);
    if (!cache[cacheKey]) {
      cache[cacheKey] = api
        .get<{ MinPrice: number; MaxPrice: number }>('/products/price-range', { params: { brandId } })
        .then(response => {
          console.log('Price range response:', response.data);
          return response.data;
        })
        .catch(error => {
          console.error('Price range error:', error);
          throw error;
        });
    }
    return cache[cacheKey];
  },
  importProducts: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(response => response.data)
      .catch(error => {
        console.error('Import products error:', error);
        throw error;
      });
  },
  updateStock: (productId: number, quantity: number) =>
    api
      .put(`/products/${productId}/stock`, quantity)
      .then(response => response.data)
      .catch(error => {
        console.error('Update stock error:', error);
        throw error;
      }),
  isMachineBusy: () =>
    api
      .get<{ IsBusy: boolean }>('/orders/is-machine-busy')
      .then(response => {
        console.log('Is machine busy response:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Is machine busy error:', error);
        throw error;
      }),
  lockMachine: () =>
    api
      .post('/orders/lock-machine')
      .then(response => {
        console.log('Lock machine response:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Lock machine error:', error);
        throw error;
      }),
  unlockMachine: () =>
    api
      .post('/orders/unlock-machine')
      .then(response => {
        console.log('Unlock machine response:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Unlock machine error:', error);
        throw error;
      }),
  createOrder: (cartItems: CartItem[]) =>
    api
      .post<{ OrderId: number; TotalAmount: number }>('/orders', cartItems)
      .then(response => response.data)
      .catch(error => {
        console.error('Create order error:', error);
        throw error;
      }),
  getOrderDetails: (orderId: number) =>
    api
      .get<Order>(`/orders/${orderId}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Get order details error:', error);
        throw error;
      }),
  updateCartItem: (orderId: number, cartItem: CartItem) =>
    api
      .put(`/orders/cart?orderId=${orderId}`, cartItem)
      .then(response => response.data)
      .catch(error => {
        console.error('Update cart item error:', error);
        throw error;
      }),
  removeCartItem: (orderId: number, productId: number) =>
    api
      .delete(`/orders/cart/${productId}?orderId=${orderId}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Remove cart item error:', error);
        throw error;
      }),
  getCoins: () =>
    api
      .get<Coin[]>('/orders/coins')
      .then(response => response.data)
      .catch(error => {
        console.error('Get coins error:', error);
        throw error;
      }),
  processPayment: (orderId: number, insertedCoins: Record<number, number>) =>
    api
      .post<{
        Message: string;
        ChangeAmount: number;
        ChangeCoins: Record<number, number>;
      }>(`/orders/${orderId}/pay`, insertedCoins)
      .then(response => response.data)
      .catch(error => {
        console.error('Process payment error:', error);
        throw error;
      }),
};