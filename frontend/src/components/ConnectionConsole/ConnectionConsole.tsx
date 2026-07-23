import { StatusBadge, BroadcastForm, ProtocolSelector } from './components';

import type { ProtocolMode, ConnectionStatus, NotificationType } from '@packages/types';
import type { FC } from 'react';

interface ConnectionConsoleProps {
  mode: ProtocolMode;
  status: ConnectionStatus;
  latency: number | null;
  onSelectMode: (mode: ProtocolMode) => void;
  onSendNotification: (message: string, type: NotificationType) => void;
}

export const ConnectionConsole: FC<ConnectionConsoleProps> = ({
  mode,
  status,
  latency,
  onSelectMode,
  onSendNotification,
}) => {
  const isShowBroadcastForm = mode !== 'websockets' || status !== 'connected';

  return (
    <section className="dashboard-card panel-controls">
      <h2 className="section-title">Консоль подключения</h2>
      <StatusBadge mode={mode} status={status} latency={latency} />
      <ProtocolSelector currentMode={mode} onSelectMode={onSelectMode} />
      {!isShowBroadcastForm && (
        <BroadcastForm mode={mode} status={status} onSend={onSendNotification} />
      )}
    </section>
  );
};
