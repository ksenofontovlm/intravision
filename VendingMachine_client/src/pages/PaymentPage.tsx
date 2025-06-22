import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../store/store';
import { fetchOrderDetails, fetchCoins, processPayment } from '../store/slices/orderSlice';
import CoinInput from '../components/CoinInput';

const PaymentPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector((state: RootState) => state.order.order);
  const coins = useSelector((state: RootState) => state.order.coins);
  const insertedCoins = useSelector((state: RootState) => state.order.insertedCoins);
  const error = useSelector((state: RootState) => state.order.error);
  const orderId = useSelector((state: RootState) => state.cart.orderId);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
      dispatch(fetchCoins());
    }
  }, [dispatch, orderId]);

  if (!order) {
    return <div className="container mx-auto p-4">Загрузка...</div>;
  }

  const totalInserted = Object.entries(insertedCoins).reduce((sum, [denom, count]) => sum + Number(denom) * count, 0);
  const isEnough = totalInserted >= order.totalAmount;

  const handlePay = () => {
    if (isEnough && orderId) {
      dispatch(processPayment({ orderId, insertedCoins })).then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          navigate('/success');
        }
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Оплата</h1>
      <div className="mb-6">
        <h2 className="text-xl mb-2">Внесите монеты</h2>
        {coins.map(coin => (
          <CoinInput
            key={coin.id}
            denomination={coin.denomination}
            count={insertedCoins[coin.denomination] || 0}
          />
        ))}
      </div>
      <p className="text-xl mb-2">Итоговая сумма заказа: {order.totalAmount.toFixed(2)} ₽</p>
      <p className={`text-xl mb-4 ${isEnough ? 'text-green-500' : 'text-red-500'}`}>
        Внесено: {totalInserted.toFixed(2)} ₽
      </p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex justify-between">
        <button
          onClick={() => navigate('/order')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Вернуться
        </button>
        <button
          onClick={handlePay}
          disabled={!isEnough}
          className={`px-4 py-2 rounded ${
            isEnough ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Оплатить
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;