import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import filterReducer from './slices/filterSlice';
import orderReducer from './slices/orderSlice';
import machineReducer from './slices/machineSlice';
import productReducer from './slices/productSlice';

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


// Добавляем хук для типизированного диспетчера
import { useDispatch } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();