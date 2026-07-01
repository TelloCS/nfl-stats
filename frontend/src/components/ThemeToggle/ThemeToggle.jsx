import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-geodude-800 text-paper-400 hover:text-foreground transition-colors border border-transparent hover:border-geodude-800"
      aria-label="Toggle theme"
    >
      {isDark ? <Moon size={24} /> : <Sun size={24} />}
    </button>
  );
}