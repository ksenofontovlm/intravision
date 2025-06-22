import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { type Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();

  const handleSelect = () => {
    if (product.quantityInStock > 0) {
      dispatch(addToCart({ productId: product.id, quantity: 1 }));
    }
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col items-center">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600">{product.price} ₽</p>
      <button
        onClick={handleSelect}
        disabled={product.quantityInStock === 0}
        className={`mt-2 px-4 py-2 rounded ${
          product.quantityInStock === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {product.quantityInStock === 0 ? 'Закончился' : 'Выбрать'}
      </button>
    </div>
  );
};

export default ProductCard;