import { ConfigProvider, theme as antTheme } from 'antd';

import { ConnectionConsole, Header, NotificationFeed, NetworkLog } from './components';
import { useNotifications } from './hooks/useNotifications';
import { useTheme } from './hooks/useTheme';

import type { FC } from 'react';
import './App.css';

export const App: FC = () => {
  const { theme, toggleTheme } = useTheme();

  const {
    mode,
    setMode,
    status,
    notifications,
    logs,
    latency,
    sendCustomNotification,
    clearNotifications,
    clearLogs,
  } = useNotifications();

  const isDark = theme === 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 10,
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        },
      }}
    >
      <div className="app-container">
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <main className="dashboard-grid">
          <ConnectionConsole
            mode={mode}
            status={status}
            latency={latency}
            onSelectMode={setMode}
            onSendNotification={sendCustomNotification}
          />
          <div className="main-content-column">
            <NotificationFeed
              notifications={notifications}
              status={status}
              onClear={clearNotifications}
            />
            <NetworkLog logs={logs} status={status} onClear={clearLogs} />
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default App;
