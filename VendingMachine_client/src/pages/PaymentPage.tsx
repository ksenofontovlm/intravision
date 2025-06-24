import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { fetchCoins } from '../store/slices/orderSlice';

const PaymentPage: React.FC = () => {
  const dispatch = useDispatch();
  const coins = useSelector((state: RootState) => state.order.coins);
  const order = useSelector((state: RootState) => state.order.order);
  const orderId = useSelector((state: RootState) => state.cart.orderId);
  const loading = useSelector((state: RootState) => state.order.loading);
  const error = useSelector((state: RootState) => state.order.error);

  useEffect(() => {
    if (!coins && orderId) {
      dispatch(fetchCoins());
    }
  }, [dispatch, coins, orderId]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;
  if (!order || !order.orderItems.length) return <p>Заказ пуст</p>;
  if (!coins) return <p>Монеты не загружены</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Оплата заказа</h1>
      <p>Сумма к оплате: {order.totalAmount.toFixed(2)} ₽</p>
      <div>
        {coins.map(coin => (
          <button key={coin.value} className="m-2 px-4 py-2 bg-blue-500 text-white rounded">
            {coin.value} ₽
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentPage;