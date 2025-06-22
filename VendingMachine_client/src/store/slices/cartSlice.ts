import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { vendingApi } from '../../api/vendingApi';
import { CartItem } from '../../types';

interface CartState {
  items: CartItem[];
  orderId: number | null;
  totalItems: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  orderId: null,
  totalItems: 0,
  loading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  'cart/createOrder',
  async (items: CartItem[], { rejectWithValue }) => {
    try {
      const response = await vendingApi.createOrder(items);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка создания заказа');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ orderId, item }: { orderId: number; item: CartItem }, { rejectWithValue }) => {
    try {
      await vendingApi.updateCartItem(orderId, item);
      return item;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка обновления корзины');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async ({ orderId, productId }: { orderId: number; productId: number }, { rejectWithValue }) => {
    try {
      await vendingApi.removeCartItem(orderId, productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка удаления товара');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.orderId = null;
      state.totalItems = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderId = action.payload.OrderId;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const item = action.payload;
        const existingItem = state.items.find(i => i.productId === item.productId);
        if (existingItem) {
          existingItem.quantity = item.quantity;
        } else {
          state.items.push(item);
        }
        state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.productId !== action.payload);
        state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
      });
  },
});

export const { addToCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;