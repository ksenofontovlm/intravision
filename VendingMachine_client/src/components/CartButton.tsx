import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../store/slices/cartSlice';
import { type RootState } from '../store/store';

const CartButton: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totalItems = useSelector((state: RootState) => state.cart.totalItems);
  const items = useSelector((state: RootState) => state.cart.items);
  const orderId = useSelector((state: RootState) => state.cart.orderId);

  const handleCheckout = async () => {
    if (totalItems > 0) {
      console.log('Checkout initiated, items:', items, 'orderId:', orderId);
      if (!orderId) {
        try {
          const result = await dispatch(createOrder(items)).unwrap();
          console.log('Create order result:', result);
        } catch (error) {
          console.error('Ошибка создания заказа:', error);
          return;
        }
      }
      navigate('/order');
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="px-4 py-2 bg-green-500 text-white rounded"
    >
      Выбрано {totalItems} {totalItems === 1 ? 'товар' : 'товаров'}
    </button>
  );
};

export default CartButton;