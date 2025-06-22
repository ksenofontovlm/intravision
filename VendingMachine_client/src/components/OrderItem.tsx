import { useDispatch } from 'react-redux';
import { updateCartItem, removeCartItem } from '../store/slices/cartSlice';
import { OrderItem as OrderItemType } from '../types';

interface OrderItemProps {
  item: OrderItemType;
  orderId: number;
}

const OrderItem: React.FC<OrderItemProps> = ({ item, orderId }) => {
  const dispatch = useDispatch();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= item.product.quantityInStock) {
      dispatch(updateCartItem({ orderId, item: { productId: item.productId, quantity: newQuantity } }));
    }
  };

  const handleRemove = () => {
    dispatch(removeCartItem({ orderId, productId: item.productId }));
  };

  return (
    <div className="flex justify-between items-center border-b py-2">
      <div>
        <h3 className="text-lg">{item.productName}</h3>
        <p className="text-gray-600">{item.brandName}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          -
        </button>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => handleQuantityChange(Number(e.target.value))}
          className="w-16 text-center border rounded"
          min="1"
          max={item.product.quantityInStock}
        />
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={item.quantity >= item.product.quantityInStock}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          +
        </button>
      </div>
      <p>{(item.unitPrice * item.quantity).toFixed(2)} ₽</p>
      <button onClick={handleRemove} className="text-red-500">Удалить</button>
    </div>
  );
};

export default OrderItem;