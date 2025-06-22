import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { fetchBrands, fetchPriceRange } from '../store/slices/filterSlice';
import { checkMachineStatus, lockMachine } from '../store/slices/machineSlice';
import { vendingApi } from '../api/vendingApi';
import ProductCard from '../components/ProductCard';
import BrandFilter from '../components/BrandFilter';
import PriceFilter from '../components/PriceFilter';
import CartButton from '../components/CartButton';
import AdminImport from '../components/AdminImport';

const CatalogPage: React.FC = () => {
  const dispatch = useDispatch();
  const isBusy = useSelector((state: RootState) => state.machine.isBusy);
  const brandId = useSelector((state: RootState) => state.filter.brandId);
  const minPrice = useSelector((state: RootState) => state.filter.minPrice);
  const maxPrice = useSelector((state: RootState) => state.filter.maxPrice);
  const products = useSelector((state: RootState) => state.filter.products);
   const loading = useSelector((state: RootState) => state.product.loading);

  useEffect(() => {
    dispatch(checkMachineStatus());
    dispatch(fetchBrands());
    dispatch(fetchPriceRange(brandId));
    if (!isBusy) {
      dispatch(lockMachine());
    }
    // Загрузка продуктов
    vendingApi.getProducts(brandId, minPrice, maxPrice).then(response => {
      // Предполагается диспетчер для сохранения продуктов
    });

    return () => {
      dispatch(unlockMachine());
    };
  }, [dispatch, brandId, minPrice, maxPrice, isBusy]);

  if (isBusy) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500 text-center text-xl">
          Извините, в данный момент автомат занят
        </p>
      </div>
    );
  }

    return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Газированные напитки</h1>
      <div className="flex space-x-4 mb-6">
        <BrandFilter />
        <PriceFilter />
      </div>
      {loading ? (
        <p className="text-center">Загрузка...</p>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <CartButton />
      </div>
      <AdminImport />
    </div>
  );
};

export default CatalogPage;