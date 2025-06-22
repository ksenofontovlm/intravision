import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../store/store';
import { fetchOrderDetails } from '../store/slices/orderSlice';
import OrderItem from '../components/OrderItem';

const OrderPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector((state: RootState) => state.order.order);
  const orderId = useSelector((state: RootState) => state.cart.orderId);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
  }, [dispatch, orderId]);

  if (!order || !order.orderItems.length) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center text-xl">У вас нет ни одного товара, вернитесь на страницу каталога</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Вернуться
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Оформление заказа</h1>
      <div className="mb-6">
        {order.orderItems.map(item => (
          <OrderItem key={item.id} item={item} orderId={order.id} />
        ))}
      </div>
      <p className="text-xl font-semibold mb-4">Итоговая сумма: {order.totalAmount.toFixed(2)} ₽</p>
      <div className="flex justify-between">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Вернуться
        </button>
        <button
          onClick={() => navigate('/payment')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Оплата
        </button>
      </div>
    </div>
  );
};

export default OrderPage;