import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vendingApi } from '../../api/vendingApi';

interface FilterState {
  brandId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  brands: { id: number; name: string }[];
  loading: boolean;
  error: string | null;
}

const initialState: FilterState = {
  brandId: null,
  minPrice: null,
  maxPrice: null,
  brands: [],
  loading: false,
  error: null,
};

export const fetchBrands = createAsyncThunk('filter/fetchBrands', async (_, { rejectWithValue }) => {
  try {
    const response = await vendingApi.getBrands();
    return response;
  } catch (error) {
    return rejectWithValue('Не удалось загрузить бренды');
  }
});

export const fetchPriceRange = createAsyncThunk('filter/fetchPriceRange', async (brandId?: number, { rejectWithValue }) => {
  try {
    const response = await vendingApi.getPriceRange(brandId);
    return response;
  } catch (error) {
    return rejectWithValue('Не удалось загрузить диапазон цен');
  }
});

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setBrandId: (state, action) => {
      state.brandId = action.payload;
    },
    setMaxPrice: (state, action) => {
      state.maxPrice = action.payload; // Устанавливаем только maxPrice
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
        state.brands = action.payload;
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
        state.minPrice = action.payload.MinPrice;
        state.maxPrice = action.payload.MaxPrice;
      })
      .addCase(fetchPriceRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setBrandId, setMaxPrice } = filterSlice.actions; // Экспортируем setMaxPrice
export default filterSlice.reducer;