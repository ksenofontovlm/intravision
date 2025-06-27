import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { vendingApi } from '../../api/vendingApi';
import { type Order, type Coin } from '../../types';
import { type AppDispatch } from '../store';

interface OrderState {
  order: Order | null;
  coins: Coin[] | null;
  insertedCoins: Record<number, number>; // Состояние внесенных монет
  paymentResult: { message: string; сhangeAmount: number; сhangeCoins: Record<number, number> } | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  order: null,
  coins: null,
  insertedCoins: {},
  paymentResult: null,
  loading: false,
  error: null,
};

export const fetchOrderDetails = createAsyncThunk(
  'order/fetchOrderDetails',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await vendingApi.getOrderDetails(orderId);
      return response;
    } catch (error) {
      return rejectWithValue('Не удалось загрузить детали заказа');
    }
  }
);

export const fetchCoins = createAsyncThunk(
  'order/fetchCoins',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendingApi.getCoins();
      return response;
    } catch (error) {
      return rejectWithValue('Не удалось загрузить монеты');
    }
  }
);

export const processPayment = createAsyncThunk(
  'order/processPayment',
  async (
    { orderId, insertedCoins }: { orderId: number; insertedCoins: Record<number, number> },
    { rejectWithValue }
  ) => {
    try {
      console.log('Sending payment request:', { orderId, insertedCoins }); // Лог запроса
      const response = await vendingApi.processPayment(orderId, insertedCoins);
      console.log('Payment response:', response); // Лог ответа
      return response;
    } catch (error) {
      console.error('Payment error:', error); // Лог ошибки
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data?.Message || 'Ошибка оплаты');
    }
  }
);

export const setInsertedCoins = createAsyncThunk(
  'order/setInsertedCoins',
  async (
    { denomination, count }: { denomination: number; count: number },
    { getState }
  ) => {
    const state = getState() as RootState;
    const newInsertedCoins = { ...state.order.insertedCoins, [denomination]: count };
    console.log('New inserted coins in thunk:', newInsertedCoins); // Лог для отладки
    return newInsertedCoins;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.order = null;
      state.coins = null;
      state.insertedCoins = {};
      state.paymentResult = null;
      state.loading = false;
      state.error = null;
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
        state.paymentResult = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentResult = action.payload;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(setInsertedCoins.fulfilled, (state, action: PayloadAction<Record<number, number>>) => {
        state.insertedCoins = action.payload;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;