import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { vendingApi } from '../../api/vendingApi';
import { Brand } from '../../types';

interface FilterState {
  brandId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  brands: Brand[];
  priceRange: { min: number; max: number } | null;
  loading: boolean;
  error: string | null;
}

const initialState: FilterState = {
  brandId: null,
  minPrice: null,
  maxPrice: null,
  brands: [],
  priceRange: null,
  loading: false,
  error: null,
};

export const fetchBrands = createAsyncThunk(
  'filter/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendingApi.getBrands();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка загрузки брендов');
    }
  }
);

export const fetchPriceRange = createAsyncThunk(
  'filter/fetchPriceRange',
  async (brandId: number | undefined, { rejectWithValue }) => {
    try {
      const response = await vendingApi.getPriceRange(brandId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка загрузки ценового диапазона');
    }
  }
);

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setBrandId: (state, action: PayloadAction<number | null>) => {
      state.brandId = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<{ minPrice: number; maxPrice: number }>) => {
      state.minPrice = action.payload.minPrice;
      state.maxPrice = action.payload.maxPrice;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = [{ id: 0, name: 'Все бренды' }, ...action.payload];
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPriceRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPriceRange.fulfilled, (state, action) => {
        state.loading = false;
        state.priceRange = { min: action.payload.MinPrice, max: action.payload.MaxPrice };
      })
      .addCase(fetchPriceRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setBrandId, setPriceRange } = filterSlice.actions;
export default filterSlice.reducer;