import { useDispatch } from 'react-redux';
import { setInsertedCoins } from '../store/slices/orderSlice';

interface CoinInputProps {
  denomination: number;
  count: number;
}

const CoinInput: React.FC<CoinInputProps> = ({ denomination, count }) => {
  const dispatch = useDispatch();

  const handleChange = (newCount: number) => {
    if (newCount >= 0) {
      dispatch(setInsertedCoins({ denomination, count: newCount }));
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-2">
      <span>{denomination} ₽</span>
      <button
        onClick={() => handleChange(count - 1)}
        disabled={count <= 0}
        className="px-2 py-1 bg-gray-200 rounded"
      >
        -
      </button>
      <input
        type="number"
        value={count}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="w-16 text-center border rounded"
        min="0"
      />
      <button
        onClick={() => handleChange(count + 1)}
        className="px-2 py-1 bg-gray-200 rounded"
      >
        +
      </button>
    </div>
  );
};

export default CoinInput;