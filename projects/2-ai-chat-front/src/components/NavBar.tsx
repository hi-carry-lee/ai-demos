import { MessageSquare, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface NavBarProps {
  title: string;
  showNavigation?: boolean;
  onLogout?: () => void;
  onNavigation?: (path: string) => void;
}

const NavBar = ({ title, onLogout }: NavBarProps) => {
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-glass px-10 py-3 glass-effect">
      <div className="flex items-center gap-4 text-glass-primary">
        <div className="size-4">
          <MessageSquare className="w-4 h-4 text-glass-primary" />
        </div>
        <h2 className="text-glass-primary text-lg font-bold leading-tight tracking-[-0.015em]">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* 主题切换按钮 */}
        <button
          onClick={toggleTheme}
          className={`flex items-center justify-center w-10 h-10 rounded-lg bg-glass-button glass-button hover-lift transition-all duration-300 ${
            theme === 'dark' ? 'text-white' : 'text-glass-primary'
          }`}
          title={`切换到${theme === 'dark' ? '浅色' : '深色'}主题`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
        <div className="flex flex-1 justify-end gap-8">
          <button
            onClick={handleLogout}
            className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-glass-button text-sm font-bold leading-normal tracking-[0.015em] glass-button hover-lift ${
              theme === 'dark' ? 'text-white' : 'text-glass-primary'
            }`}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="truncate">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
