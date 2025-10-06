import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { setToken, setUser } from '@/lib/axios';
import NavBar from '@/components/NavBar';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  interface LoginResponse {
    data: {
      token: string;
      user: Record<string, unknown>;
    };
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('请填写所有字段');
      return;
    }

    setLoading(true);

    try {
      // 调用登录接口
      const response = (await axiosInstance.post(
        '/auth/login',
        formData
      )) as LoginResponse;

      // 保存 token 和用户信息
      if (response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);

        // 跳转到聊天页面
        navigate('/chat');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-glass dark group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <NavBar title="ChatApp" />

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 flex-1">
            <div className="glass-card rounded-2xl p-8 hover-lift">
              <h2 className="text-glass-primary tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
                Welcome back
              </h2>

              {error && (
                <div className="mx-4 mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-glass-primary text-base font-medium leading-normal pb-2">
                      Email
                    </p>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-glass-primary focus:outline-0 focus:ring-0 border border-glass-input bg-glass-input focus:border-glass-input h-14 placeholder:text-glass-muted p-[15px] text-base font-normal leading-normal glass-input"
                    />
                  </label>
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-glass-primary text-base font-medium leading-normal pb-2">
                      Password
                    </p>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-glass-primary focus:outline-0 focus:ring-0 border border-glass-input bg-glass-input focus:border-glass-input h-14 placeholder:text-glass-muted p-[15px] text-base font-normal leading-normal glass-input"
                    />
                  </label>
                </div>
                <div className="flex px-4 py-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-glass-button text-glass-primary text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed glass-button hover-lift"
                  >
                    <span className="truncate">
                      {loading ? 'Loading...' : 'Log in'}
                    </span>
                  </button>
                </div>
              </form>
              <p
                onClick={goToRegister}
                className="text-glass-muted text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline cursor-pointer hover:text-glass-primary transition-colors"
              >
                Don't have an account? Sign up
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
