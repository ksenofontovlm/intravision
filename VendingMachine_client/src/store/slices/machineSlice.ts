import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vendingApi } from '../../api/vendingApi';
import { AxiosError } from 'axios';

interface MachineState {
  isBusy: boolean;
  isOwner: boolean;
  loading: boolean;
  error: string | null;

}

const initialState: MachineState = {
  isBusy: false,
  loading: false,
  isOwner: false, 
  error: null,

};

export const checkMachineStatus = createAsyncThunk(
  'machine/checkMachineStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendingApi.isMachineBusy();
      return response.IsBusy;
    } catch (error) {
          const axiosError = error as AxiosError;
          return rejectWithValue(axiosError.response?.data as string ||  'Ошибка проверки статуса автомата');
    }
  }
);

export const lockMachine = createAsyncThunk(
  'machine/lockMachine',
  async (_, { rejectWithValue }) => {
    try {
      await vendingApi.lockMachine();
      return true;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data as string ||  'Ошибка блокировки автомата');
    }
  }
);

export const unlockMachine = createAsyncThunk(
  'machine/unlockMachine',
  async (_, { rejectWithValue }) => {
    try {
      await vendingApi.unlockMachine();
      return false;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data as string || 'Ошибка разблокировки автомата');
    }
  }
);

const machineSlice = createSlice({
  name: 'machine',
  initialState,
  reducers: {
    resetMachineState: (state) => {
      state.isBusy = false;
      state.isOwner = false;
      state.error = null;
    },
        setOwnership: (state, action) => {
      state.isOwner = action.payload;
    },
  },
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
      .addCase(lockMachine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(lockMachine.fulfilled, (state) => {
        state.loading = false;
        state.isBusy = true;
        state.isOwner = true; 
      })
      .addCase(lockMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(unlockMachine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unlockMachine.fulfilled, (state) => {
        state.loading = false;
        state.isBusy = false;
        state.isOwner = false;
      })
      .addCase(unlockMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const { resetMachineState, setOwnership } = machineSlice.actions;
export default machineSlice.reducer;