import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CatalogPage from '../pages/CatalogPage';
import OrderPage from '../pages/OrderPage';
import PaymentPage from '../pages/PaymentPage';
import SuccessPage from '../pages/SuccessPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="*" element={<div>404: Страница не найдена</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;