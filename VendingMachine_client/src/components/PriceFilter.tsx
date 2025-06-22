import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { setPriceRange } from '../store/slices/filterSlice';

const PriceFilter: React.FC = () => {
  const dispatch = useDispatch();
  const priceRange = useSelector((state: RootState) => state.filter.priceRange);
  const minPrice = useSelector((state: RootState) => state.filter.minPrice);
  const maxPrice = useSelector((state: RootState) => state.filter.maxPrice);

  if (!priceRange) return null;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPriceRange({ minPrice: Number(e.target.value), maxPrice: maxPrice ?? priceRange.max }));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPriceRange({ minPrice: minPrice ?? priceRange.min, maxPrice: Number(e.target.value) }));
  };

  return (
    <div className="mb-4">
      <label className="block mb-2">Цена: {minPrice ?? priceRange.min} ₽ - {maxPrice ?? priceRange.max} ₽</label>
      <div className="flex space-x-4">
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          value={minPrice ?? priceRange.min}
          onChange={handleMinChange}
          className="w-full"
        />
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          value={maxPrice ?? priceRange.max}
          onChange={handleMaxChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default PriceFilter;