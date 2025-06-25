import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../store/slices/cartSlice";
import { type RootState } from "../store/store";
import { type Product } from "../types";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const orderId = useSelector((state: RootState) => state.cart.orderId);
  const cartError = useSelector((state: RootState) => state.cart.error);

  const cartItem = cartItems.find(item => item.productId === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    if (quantity >= product.quantityInStock) {
      console.warn(`Нельзя добавить больше ${product.quantityInStock} единиц продукта ${product.id}`);
      return;
    }
    const newQuantity = quantity + 1;
    const cartItem = { productId: product.id, quantity: newQuantity };
    console.log('handleAdd:', { orderId, cartItem });
    if (orderId) {
      dispatch(updateCartItem({ orderId, item: cartItem }));
    } else {
      dispatch(addToCart(cartItem));
    }
  };

  const handleRemove = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      if (orderId && newQuantity === 0) {
        dispatch(removeCartItem({ orderId, productId: product.id }));
      } else if (orderId) {
        dispatch(updateCartItem({ orderId, item: { productId: product.id, quantity: newQuantity } }));
      } else {
        dispatch(addToCart({ productId: product.id, quantity: newQuantity }));
      }
    }
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col items-center">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600">{product.price} ₽</p>
      {cartError && (
        <p className="text-red-500 text-sm mt-2">{cartError}</p>
      )}
      {quantity > 0 ? (
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={handleRemove}
            disabled={quantity <= 0}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            -
          </button>
          <span className="text-center w-12">{quantity}</span>
          <button
            onClick={handleAdd}
            disabled={quantity >= product.quantityInStock}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            +
          </button>
        </div>
      ) : (
        <button
          onClick={handleAdd}
          disabled={product.quantityInStock === 0}
          className={`mt-2 px-4 py-2 rounded ${
            product.quantityInStock === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Выбрать
        </button>
      )}
    </div>
  );
};

export default ProductCard;
