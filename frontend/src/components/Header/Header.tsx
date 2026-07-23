import { SunOutlined, MoonOutlined } from '@ant-design/icons';

import type { ThemeMode } from '@hooks/useTheme';
import type { FC, SyntheticEvent } from 'react';

import './Header.css';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: (event?: SyntheticEvent) => void;
}

export const Header: FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  const isDark = theme === 'dark';

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="header-title-group">
          <p className="subtitle">Демо-панель уведомлений реального времени (4 потока)</p>
        </div>
        <button
          type="button"
          className={`theme-toggle-pill ${isDark ? 'is-dark' : 'is-light'}`}
          onClick={(e) => onToggleTheme(e)}
          aria-label="Переключить тему"
        >
          <div className="toggle-track">
            <div className="toggle-thumb">
              {isDark ? (
                <MoonOutlined className="theme-icon moon-icon" />
              ) : (
                <SunOutlined className="theme-icon sun-icon" />
              )}
            </div>
            <span className="theme-label">{isDark ? 'Тёмная' : 'Светлая'}</span>
          </div>
        </button>
      </div>
    </header>
  );
};
