import { useEffect, useRef, type FC, type MouseEventHandler, type CSSProperties } from 'react';

import { DeleteOutlined, CodeOutlined, LoadingOutlined } from '@ant-design/icons';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Collapse, Button, Empty, Tag, Space, Spin } from 'antd';

import { LogItem } from './components/LogItem';

import './NetworkLog.css';
import type { ConnectionStatus, LogEntry } from '@packages/types';

interface NetworkLogProps {
  logs: LogEntry[];
  status?: ConnectionStatus;
  onClear: () => void;
}

export const NetworkLog: FC<NetworkLogProps> = ({ logs, status, onClear }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const handleClear: MouseEventHandler<HTMLElement> = (e) => {
    e.stopPropagation();
    onClear();
  };

  const isLogs = logs.length;
  const isConnecting = status === 'connecting';

  const logVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    getItemKey: (index) => logs[index]?.id ?? index,
    overscan: 5,
  });

  useEffect(() => {
    if (logs.length > 0) {
      logVirtualizer.scrollToIndex(logs.length - 1);
    }
  }, [logs.length, logVirtualizer]);

  const collapseHeader = (
    <div className="network-log-collapse-header">
      <Space size="middle">
        <CodeOutlined className="network-log-header-icon" />
        <span className="collapse-title">Лог сетевой активности</span>
        <Tag color="default" className="network-log-badge-tag">
          {logs.length}
        </Tag>
      </Space>
      <Button
        danger
        size="small"
        icon={<DeleteOutlined />}
        onClick={handleClear}
        disabled={!isLogs}
      >
        Очистить консоль
      </Button>
    </div>
  );

  return (
    <section className="network-log-card">
      <Collapse
        defaultActiveKey={['network-log']}
        bordered={false}
        className="network-log-collapse"
        items={[
          {
            key: 'network-log',
            label: collapseHeader,
            children: (
              <div className="logs-terminal" ref={parentRef}>
                {!isLogs ? (
                  isConnecting ? (
                    <div className="network-log-loader-container">
                      <Spin
                        indicator={<LoadingOutlined spin className="network-log-loader-icon" />}
                      >
                        Инициализация сетевого соединения...
                      </Spin>
                    </div>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Лог пуст. Ожидание сетевой активности..."
                      className="network-log-empty-state"
                    />
                  )
                ) : (
                  <div
                    className="virtual-list-inner"
                    style={
                      { '--total-size': `${logVirtualizer.getTotalSize()}px` } as CSSProperties
                    }
                  >
                    {logVirtualizer.getVirtualItems().map((virtualRow) => {
                      const log = logs[virtualRow.index];
                      return (
                        <div
                          key={log.id}
                          ref={logVirtualizer.measureElement}
                          data-index={virtualRow.index}
                          className="virtual-item-wrapper"
                          style={{ '--item-y': `${virtualRow.start}px` } as CSSProperties}
                        >
                          <LogItem log={log} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </section>
  );
};
