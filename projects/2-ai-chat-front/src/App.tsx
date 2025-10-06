import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Chat from '@/pages/Chat';
import { getToken } from '@/lib/axios';

// 私有路由组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// 公共路由组件（已登录用户重定向到聊天页）
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  return token ? <Navigate to="/chat" replace /> : <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
