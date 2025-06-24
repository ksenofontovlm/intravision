import { useEffect, useRef, useState } from "react";
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
  const [isLockOwner, setIsLockOwner] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Функция для добавления отладочной информации
  const addDebug = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-10), `${timestamp}: ${message}`]);
    console.log(`[DEBUG] ${timestamp}: ${message}`);
  };

  useEffect(() => {
    addDebug("Загружаем базовые данные...");
    dispatch(fetchBrands());
    dispatch(fetchPriceRange(brandId));
    dispatch(fetchProducts({ brandId, minPrice, maxPrice }));
  }, [dispatch, brandId, minPrice, maxPrice]);

  useEffect(() => {
    addDebug("Проверяем статус машины...");
    
    dispatch(checkMachineStatus()).then((action) => {
      addDebug(`Статус машины получен. Тип: ${action.type}, Payload: ${JSON.stringify(action.payload)}`);
      
      // Проверяем, что действие выполнилось успешно
      if (checkMachineStatus.fulfilled.match(action)) {
        const isMachineBusy = action.payload;
        addDebug(`Машина занята: ${isMachineBusy}`);
        
        if (!isMachineBusy && !lockAttempted.current) {
          addDebug("Машина свободна, пытаемся заблокировать...");
          lockAttempted.current = true;
          dispatch(lockMachine()).then((lockAction) => {
            if (lockMachine.fulfilled.match(lockAction)) {
              addDebug("Машина успешно заблокирована нами");
              setIsLockOwner(true);
            } else {
              addDebug("Ошибка блокировки машины");
            }
          });
        } else if (isMachineBusy) {
          addDebug("Машина занята другим пользователем");
        }
      } else if (checkMachineStatus.rejected.match(action)) {
        addDebug(`Ошибка при проверке статуса: ${action.payload}`);
      }
    }).catch((error) => {
      addDebug(`Ошибка в checkMachineStatus: ${error}`);
    });

    return () => {
      if (lockAttempted.current && isLockOwner) {
        addDebug("Разблокируем машину при выходе...");
        dispatch(unlockMachine());
        dispatch(resetMachineState());
        lockAttempted.current = false;
        setIsLockOwner(false);
      }
    };
  }, [dispatch]);

  // Кнопка для принудительной разблокировки (для отладки)
  const handleForceUnlock = () => {
    addDebug("Принудительная разблокировка...");
    dispatch(unlockMachine()).then(() => {
      dispatch(resetMachineState());
      lockAttempted.current = false;
      setIsLockOwner(false);
      addDebug("Принудительная разблокировка выполнена");
    });
  };

  const handleTryLock = () => {
    addDebug("Попытка заблокировать...");
    dispatch(lockMachine()).then((action) => {
      if (lockMachine.fulfilled.match(action)) {
        addDebug("Блокировка успешна");
        setIsLockOwner(true);
      } else {
        addDebug("Блокировка не удалась");
      }
    });
  };
  

  if (machineError || productError || filterError) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500 text-center text-xl">
          Ошибка: {machineError || productError || filterError}
        </p>
        <button 
          onClick={handleForceUnlock}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Сбросить блокировку
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Газированные напитки</h1>
      
      {/* Расширенная отладочная информация */}
      <div className="mb-4 p-4 bg-gray-100 text-sm border rounded" hidden>
        <h3 className="font-bold mb-2">Отладочная информация:</h3>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <p><strong>isBusy:</strong> {isBusy !== undefined ? isBusy.toString() : 'undefined'}</p>
            <p><strong>isLockOwner:</strong> {isLockOwner !== undefined ? isLockOwner.toString() : 'undefined'}</p>
            <p><strong>lockAttempted:</strong> {lockAttempted.current !== undefined ? lockAttempted.current.toString() : 'undefined'}</p>
            <p><strong>Products count:</strong> {products ? products.length : 'undefined'}</p>
          </div>
          <div>
            <p><strong>Loading:</strong> {loading !== undefined ? loading.toString() : 'undefined'}</p>
            <p><strong>Machine Error:</strong> {machineError || 'нет'}</p>
            <p><strong>Product Error:</strong> {productError || 'нет'}</p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-2">
          <button 
            onClick={handleForceUnlock}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs"
          >
            Разблокировать
          </button>
          <button 
            onClick={handleTryLock}
            className="px-3 py-1 bg-green-500 text-white rounded text-xs"
          >
            Заблокировать
          </button>
        </div>
        
        <div className="max-h-32 overflow-y-auto">
          <h4 className="font-semibold">Лог событий:</h4>
          {debugInfo.map((info, index) => (
            <p key={index} className="text-xs">{info}</p>
          ))}
        </div>
      </div>

      {/* Показываем предупреждение, только если машина реально занята не нами */}
      {isBusy && !isLockOwner && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-yellow-800">
            ⚠️ Автомат занят. Если это ошибка, нажмите "Разблокировать" выше.
          </p>
        </div>
      )}
      
      <div className="flex space-x-4 mb-6">
        <BrandFilter />
        <PriceFilter />
      </div>
      
      {loading ? (
        <p className="text-center">Загрузка...</p>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-center text-gray-500">Нет доступных продуктов</p>
          )}
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