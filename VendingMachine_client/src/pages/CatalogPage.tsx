import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { type RootState, useAppDispatch } from "../store/store";
import { fetchBrands, fetchPriceRange } from "../store/slices/filterSlice";
import {
  checkMachineStatus,
  lockMachine,
  unlockMachine,
  resetMachineState,
} from "../store/slices/machineSlice";
import { fetchProducts } from "../store/slices/productSlice";
import ProductCard from "../components/ProductCard";
import BrandFilter from "../components/BrandFilter";
import PriceFilter from "../components/PriceFilter";
import CartButton from "../components/CartButton";
import AdminImport from "../components/AdminImport";

const CatalogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const isBusy = useSelector((state: RootState) => state.machine.isBusy);
  const lockAttempted = useRef(false);
  const machineError = useSelector((state: RootState) => state.machine.error);
  const productError = useSelector((state: RootState) => state.product.error);
  const filterError = useSelector((state: RootState) => state.filter.error);
  const brandId = useSelector((state: RootState) => state.filter.brandId);
  const minPrice = useSelector((state: RootState) => state.filter.minPrice);
  const maxPrice = useSelector((state: RootState) => state.filter.maxPrice);
  const products = useSelector((state: RootState) => state.product.products);
  const loading = useSelector((state: RootState) => state.product.loading);

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchPriceRange(brandId));
    dispatch(fetchProducts({ brandId, minPrice, maxPrice }));
  }, [dispatch, brandId, minPrice, maxPrice]);

 
  useEffect(() => {
    dispatch(checkMachineStatus());
    if (!isBusy && !lockAttempted.current) {
      lockAttempted.current = true;
      dispatch(lockMachine());
    }

    return () => {
      if (lockAttempted.current) {
        dispatch(unlockMachine());
        dispatch(resetMachineState());
        lockAttempted.current = false;
      }
    };
  }, [dispatch]); // Убрали isBusy из зависимостей

  if (machineError || productError || filterError) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500 text-center text-xl">
          Ошибка: {machineError || productError || filterError}
        </p>
      </div>
    );
  }

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
          {products.map((product) => (
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
