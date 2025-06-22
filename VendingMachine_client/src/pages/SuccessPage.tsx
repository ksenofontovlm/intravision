import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const order = useSelector((state: RootState) => state.order.order);
  const paymentResult = useSelector((state: RootState) => state.order.paymentResult); // Предполагается поле в orderSlice

  if (!order || !paymentResult) {
    return <div className="container mx-auto p-4">Ошибка загрузки</div>;
  }

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-6">Спасибо за вашу покупку!</h1>
      <p className="text-xl mb-4">Пожалуйста, возьмите вашу сдачу</p>
      <p className="text-lg mb-2">Сумма сдачи: {paymentResult.ChangeAmount.toFixed(2)} ₽</p>
      <ul className="mb-6">
        {Object.entries(paymentResult.ChangeCoins).map(([denom, count]) => (
          <li key={denom}>{denom} ₽ x {count}</li>
        ))}
      </ul>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Каталог напитков
      </button>
    </div>
  );
};

export default SuccessPage;