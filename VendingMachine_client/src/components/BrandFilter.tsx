import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { setBrandId } from '../store/slices/filterSlice';

const BrandFilter: React.FC = () => {
  const dispatch = useDispatch();
  const brands = useSelector((state: RootState) => state.filter.brands);
  const selectedBrandId = useSelector((state: RootState) => state.filter.brandId);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === '0' ? undefined : Number(e.target.value);
    dispatch(setBrandId(value));
  };

  return (
    <div className="mb-4">
      <label htmlFor="brand" className="mr-2">Бренд:</label>
      <select
        id="brand"
        value={selectedBrandId ?? 0}
        onChange={handleChange}
        className="border rounded px-2 py-1"
      >
        {brands.map(brand => (
          <option key={brand.id} value={brand.id}>{brand.name}</option>
        ))}
      </select>
    </div>
  );
};

export default BrandFilter;