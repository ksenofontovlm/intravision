import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { vendingApi } from '../../api/vendingApi';
import { type Product } from '../../types';
import { AxiosError } from 'axios';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async ({ brandId, minPrice, maxPrice }: { brandId?: number; minPrice?: number; maxPrice?: number }, { rejectWithValue }) => {
    try {
      const response = await vendingApi.getProducts(brandId, minPrice, maxPrice);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data as string || 'Ошибка загрузки продуктов');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
       state.loading = false;
       state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default productSlice.reducer;