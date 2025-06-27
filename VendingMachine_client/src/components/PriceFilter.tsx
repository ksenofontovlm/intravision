import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { setMaxPrice } from '../store/slices/filterSlice'; 

console.log('setMaxPrice imported:', setMaxPrice);

const PriceFilter: React.FC = () => {
  const dispatch = useDispatch();
  const maxPrice = useSelector((state: RootState) => state.filter.maxPrice);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setMaxPrice(Number(e.target.value)));
  };

  return (
    <div className="mb-4">
      <label htmlFor="price-slider" className="block mb-2">
        Максимальная цена: {maxPrice ?? 110} ₽
      </label>
      <input
        id="price-slider"
        type="range"
        min="0"
        max="110"
        value={maxPrice ?? 110}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};

export default PriceFilter;