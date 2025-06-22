import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { vendingApi } from '../../api/vendingApi';

interface MachineState {
  isBusy: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: MachineState = {
  isBusy: false,
  loading: false,
  error: null,
};

export const checkMachineStatus = createAsyncThunk(
  'machine/checkMachineStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendingApi.isMachineBusy();
      return response.data.IsBusy;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка проверки статуса автомата');
    }
  }
);

export const lockMachine = createAsyncThunk(
  'machine/lockMachine',
  async (_, { rejectWithValue }) => {
    try {
      await vendingApi.lockMachine();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка блокировки автомата');
    }
  }
);

export const unlockMachine = createAsyncThunk(
  'machine/unlockMachine',
  async (_, { rejectWithValue }) => {
    try {
      await vendingApi.unlockMachine();
      return false;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка разблокировки автомата');
    }
  }
);

const machineSlice = createSlice({
  name: 'machine',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkMachineStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkMachineStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isBusy = action.payload;
      })
      .addCase(checkMachineStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(lockMachine.fulfilled, (state) => {
        state.isBusy = true;
      })
      .addCase(unlockMachine.fulfilled, (state) => {
        state.isBusy = false;
      });
  },
});

export default machineSlice.reducer;