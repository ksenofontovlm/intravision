import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../store/store';

const CartButton: React.FC = () => {
  const navigate = useNavigate();
  const totalItems = useSelector((state: RootState) => state.cart.totalItems);

  const handleClick = () => {
    if (totalItems > 0) {
      navigate('/order');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={totalItems === 0}
      className={`px-6 py-2 rounded ${
        totalItems === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
      }`}
    >
      Выбрано ({totalItems})
    </button>
  );
};

export default CartButton;