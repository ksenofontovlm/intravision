import { useState } from 'react';
import { vendingApi } from '../api/vendingApi';

const AdminImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setMessage('Выберите файл');
      return;
    }

    try {
      await vendingApi.importProducts(file);
      setMessage('Импорт успешно завершен');
    } catch (error: any) {
      setMessage(error.message || 'Ошибка импорта');
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Импорт товаров</h2>
      <input type="file" accept=".xlsx" onChange={handleFileChange} className="mb-2" />
      <button
        onClick={handleImport}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Импортировать
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};

export default AdminImport;