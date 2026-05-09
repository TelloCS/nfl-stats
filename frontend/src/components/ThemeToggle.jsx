import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-geodude-800 text-paper-400 hover:text-foreground transition-colors border border-transparent hover:border-geodude-800"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
}