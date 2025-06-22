import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { vendingApi } from '../../api/vendingApi';
import { type Order, type Coin } from '../../types';
import { AxiosError } from 'axios';

interface PaymentResult {
  Message: string;
  ChangeAmount: number;
  ChangeCoins: Record<number, number>;
}

interface OrderState {
  order: Order | null;
  coins: Coin[];
  insertedCoins: Record<number, number>;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  order: null,
  coins: [],
  insertedCoins: { 1: 0, 2: 0, 5: 0, 10: 0 },
  loading: false,
  error: null,
};

export const fetchOrderDetails = createAsyncThunk(
  'order/fetchOrderDetails',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await vendingApi.getOrderDetails(orderId);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data as string || 'Ошибка загрузки Заказов');
    }
  }
);

export const fetchCoins = createAsyncThunk(
  'order/fetchCoins',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendingApi.getCoins();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка загрузки монет');
    }
  }
);

export const processPayment = createAsyncThunk(
  'order/processPayment',
  async ({ orderId, insertedCoins }: { orderId: number; insertedCoins: Record<number, number> }, { rejectWithValue }) => {
    try {
      const response = await vendingApi.processPayment(orderId, insertedCoins);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка обработки платежа');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setInsertedCoins: (state, action: PayloadAction<{ denomination: number; count: number }>) => {
      state.insertedCoins[action.payload.denomination] = action.payload.count;
    },
    resetOrder: (state) => {
      state.order = null;
      state.insertedCoins = { 1: 0, 2: 0, 5: 0, 10: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
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
      })
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setInsertedCoins, resetOrder } = orderSlice.actions;
export default orderSlice.reducer;