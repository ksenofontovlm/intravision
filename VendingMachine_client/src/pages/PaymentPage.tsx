import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { type RootState } from "../store/store";
import {
  fetchCoins,
  processPayment,
  setInsertedCoins,
  resetOrderState
} from "../store/slices/orderSlice";
import CoinInput from "../components/CoinInput";
import { resetCartState } from '../store/slices/cartSlice';

const PaymentPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const coins = useSelector((state: RootState) => state.order.coins);
  const order = useSelector((state: RootState) => state.order.order);
  const orderId = useSelector((state: RootState) => state.cart.orderId);
  const insertedCoins = useSelector(
    (state: RootState) => state.order.insertedCoins
  );
  const loading = useSelector((state: RootState) => state.order.loading);
  const error = useSelector((state: RootState) => state.order.error);
  const paymentResult = useSelector(
    (state: RootState) => state.order.paymentResult
  );

  // Инициализация состояния для внесенных монет
  const [localInsertedCoins, setLocalInsertedCoins] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    console.log("Coins loaded:", coins); // Лог для отладки
    if (!coins && orderId) {
      dispatch(fetchCoins());
    }
    // Синхронизация с глобальным состоянием
    if (insertedCoins) {
      console.log("Syncing insertedCoins:", insertedCoins); // Лог для отладки
      setLocalInsertedCoins({ ...insertedCoins });
    } else {
      setLocalInsertedCoins({});
    }
  }, [dispatch, coins, orderId, insertedCoins]);

  useEffect(() => {
    console.log("Inserted coins updated:", localInsertedCoins); // Лог для отладки
    console.log(
      "Total inserted:",
      Object.entries(localInsertedCoins).reduce(
        (sum, [denomination, count]) =>
          sum + (Number(denomination) * count || 0),
        0
      )
    ); // Лог общей суммы
  }, [localInsertedCoins]);

  // Расчет общей внесенной суммы
  const totalInserted = Object.entries(localInsertedCoins).reduce(
    (sum, [denomination, count]) => sum + (Number(denomination) * count || 0),
    0
  );

  // Проверка достаточности средств
  const isEnough = totalInserted >= (order?.totalAmount || 0);
  const colorClass = isEnough ? "text-green-500" : "text-red-500";
  console.log(
    "isEnough:",
    isEnough,
    "totalInserted:",
    totalInserted,
    "order.totalAmount:",
    order?.totalAmount
  ); // Лог для отладки

  // Обработчик оплаты
  const handlePay = async () => {
    if (orderId && isEnough) {
      console.log("Attempting payment with:", {
        orderId,
        insertedCoins: localInsertedCoins,
      });
      const result = await dispatch(
        processPayment({ orderId, insertedCoins: localInsertedCoins })
      ).unwrap();
      if (result.Message === "Спасибо за вашу покупку") {
        console.log("Payment successful, change:", result.ChangeCoins);
      }
    }
  };

const handleNavigateToCatalog = () => {
    dispatch(resetOrderState());
    dispatch(resetCartState());
    navigate('/');
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;
  if (!order || !order.orderItems.length) return <p>Заказ пуст</p>;
  if (!coins) return <p>Монеты не загружены</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Оплата заказа</h1>
      <div className="mb-6">
        <p>Сумма к оплате: {order.totalAmount.toFixed(2)} ₽</p>
        <p className={colorClass}>
          Внесено: {totalInserted.toFixed(2)} ₽{" "}
          {isEnough ? "(достаточно)" : "(недостаточно)"}
        </p>
      </div>
      <div className="mb-6">
        {coins.map((coin) => (
          <CoinInput
            key={coin.value}
            denomination={coin.value}
            count={localInsertedCoins[coin.value] || 0}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => navigate("/order")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Вернуться
        </button>
        <button
          onClick={handlePay}
          disabled={!isEnough || loading}
          className={`px-4 py-2 rounded ${
            isEnough
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
          } text-white`}
        >
          Оплатить
        </button>
      </div>
      {paymentResult && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg border border-green-400 max-w-md w-full animate-fade-in">
      <p className="text-green-800 text-lg font-semibold">{paymentResult.message}</p>
      {paymentResult.changeAmount > 0 && (
        <div className="mt-2">
          <p className="text-green-700 font-medium">Сдача: {paymentResult.changeAmount} ₽</p>
          <ul className="list-disc list-inside mt-1 text-green-700">
            {Object.entries(paymentResult.changeCoins).map(([denomination, count]) => (
              <li key={denomination}>
                {Number(denomination).toFixed(2)} ₽: {count} шт.
              </li>
            ))}
          </ul>
        </div>
      )}
     <button
              onClick={handleNavigateToCatalog}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
        Каталог напитков
      </button>
    </div>
  </div>
)}
      {error && error.includes("не может выдать сдачу") && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 rounded">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
