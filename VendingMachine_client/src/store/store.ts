import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import filterReducer from './slices/filterSlice';
import orderReducer from './slices/orderSlice';
import machineReducer from './slices/machineSlice';
import productReducer from './slices/productSlice.ts';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    filter: filterReducer,
    order: orderReducer,
    machine: machineReducer,
    product: productReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;