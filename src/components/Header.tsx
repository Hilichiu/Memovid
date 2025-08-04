import React from 'react';
import { Play, Sun, Moon, Languages } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../types';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh-TW' : 'en');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Play className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('title')}
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title={language === 'en' ? 'Switch to 繁體中文' : 'Switch to English'}
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'en' ? '繁中' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;