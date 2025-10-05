import { useState, useEffect } from 'react';
import { api } from './config/api';
import { Button } from '@/components/ui/button';

function App() {
  const [message, setMessage] = useState('');

  async function fetchData() {
    const response = await api.get<{ message: string }>('/hello');
    setMessage(response.message);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="text-red-500 text-2xl flex flex-col items-center justify-center h-screen">
      <h1>AI Chat Frontend</h1>
      <Button variant="outline">{message}</Button>
    </div>
  );
}

export default App;
