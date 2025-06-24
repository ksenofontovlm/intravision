import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vendingApi } from '../../api/vendingApi';
import { type Order, type Coin } from '../../types';
import { AxiosError } from 'axios';

interface OrderState {
  order: Order | null;
  coins: Coin[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  order: null,
  coins: null,
  loading: false,
  error: null,
};

export const fetchOrderDetails = createAsyncThunk(
  'order/fetchOrderDetails',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await vendingApi.getOrderDetails(orderId);
      console.log('Fetch order details response:', response);
      if (!response.orderItems || !response.orderItems.length) {
        console.warn('Order details returned empty orderItems');
      }
      return response;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Fetch order details error:', axiosError);
      return rejectWithValue(axiosError.response?.data as string || 'Ошибка загрузки деталей заказа');
    }
  }
);

export const fetchCoins = createAsyncThunk(
  'order/fetchCoins',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendingApi.getCoins();
      console.log('Fetch coins response:', response);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data as string || 'Ошибка загрузки монет');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        console.log('Order updated in state:', state.order);
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCoins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoins.fulfilled, (state, action) => {
        state.loading = false;
        state.coins = action.payload;
      })
      .addCase(fetchCoins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default orderSlice.reducer;