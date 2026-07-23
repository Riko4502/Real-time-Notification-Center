import {
  useState,
  useMemo,
  useCallback,
  useRef,
  type MouseEventHandler,
  type FC,
  type CSSProperties,
} from 'react';

import { DeleteOutlined, BellOutlined, LoadingOutlined } from '@ant-design/icons';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Collapse, Button, Tag, Empty, Space, Spin } from 'antd';

import { NotificationItem, NotificationFilters } from './components';

import './NotificationFeed.css';
import type { FilterState } from './types';
import type { ConnectionStatus, Notification } from '@packages/types';

interface NotificationFeedProps {
  notifications: Notification[];
  status?: ConnectionStatus;
  onClear: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  query: '',
  type: 'all',
  source: 'all',
};

export const NotificationFeed: FC<NotificationFeedProps> = ({ notifications, status, onClear }) => {
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const parentRef = useRef<HTMLDivElement>(null);

  const isConnecting = status === 'connecting';

  /**
   * Ссылка на функцию сброса фильтров внутри мемоизированного дочернего компонента NotificationFilters.
   * Обертывание (() => resetFn) требуется в React useState, чтобы передать саму функцию в стейт,
   * а не вызывать ее как functional state updater (prevState => newState).
   */
  const [resetFiltersFn, setResetFiltersFn] = useState<(() => void) | null>(null);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setAppliedFilters(newFilters);
  }, []);

  /**
   * Регистрирует функцию сброса инпутов/селекторов дочернего компонента NotificationFilters,
   * чтобы родительская карточка могла сбросить фильтры по кнопке в состоянии Empty ("Ничего не найдено").
   */
  const handleRegisterReset = useCallback((resetFn: () => void) => {
    setResetFiltersFn(() => resetFn);
  }, []);

  const handleClear: MouseEventHandler<HTMLElement> = useCallback(
    (e) => {
      e.stopPropagation();
      onClear();
    },
    [onClear],
  );

  const isFilterActive =
    appliedFilters.query !== '' || appliedFilters.type !== 'all' || appliedFilters.source !== 'all';

  const filteredNotifications = useMemo(() => {
    if (!isFilterActive) return notifications;

    const lowerQuery = appliedFilters.query.toLowerCase();

    return notifications.filter((notif) => {
      const matchesSearch = !lowerQuery || notif.message.toLowerCase().includes(lowerQuery);
      const matchesType = appliedFilters.type === 'all' || notif.type === appliedFilters.type;
      const matchesSource =
        appliedFilters.source === 'all' || notif.source === appliedFilters.source;
      return matchesSearch && matchesType && matchesSource;
    });
  }, [notifications, appliedFilters, isFilterActive]);

  const reversedNotifications = useMemo(
    () => [...filteredNotifications].reverse(),
    [filteredNotifications],
  );

  const rowVirtualizer = useVirtualizer({
    count: reversedNotifications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 84,
    getItemKey: (index) => reversedNotifications[index]?.id ?? index,
    overscan: 5,
  });

  const collapseHeader = (
    <div className="notif-feed-collapse-header">
      <Space size="middle">
        <BellOutlined className="notif-feed-header-icon" />
        <span className="collapse-title">Лента уведомлений</span>
        {notifications.length > 0 && (
          <Tag color="purple" className="notif-feed-badge-tag">
            {filteredNotifications.length}
            {isFilterActive && ` из ${notifications.length}`}
          </Tag>
        )}
      </Space>
      <Button
        danger
        size="small"
        icon={<DeleteOutlined />}
        onClick={handleClear}
        disabled={notifications.length === 0}
      >
        Очистить список
      </Button>
    </div>
  );

  return (
    <section className="notif-feed-card">
      <Collapse
        defaultActiveKey={['notif-feed']}
        bordered={false}
        className="notif-feed-collapse"
        items={[
          {
            key: 'notif-feed',
            label: collapseHeader,
            children: (
              <div className="notif-feed-content">
                <NotificationFilters
                  onFilterChange={handleFilterChange}
                  onResetFiltersRef={handleRegisterReset}
                />

                <div className="notifications-list" ref={parentRef}>
                  {notifications.length === 0 ? (
                    isConnecting ? (
                      <div className="notif-feed-loader-container">
                        <Spin
                          indicator={<LoadingOutlined spin className="notif-feed-loader-icon" />}
                          size="large"
                        >
                          Подключение к серверу и загрузка потока...
                        </Spin>
                      </div>
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Ожидание потока событий..."
                        className="notif-empty-large"
                      />
                    )
                  ) : filteredNotifications.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Ничего не найдено по выбранным фильтрам"
                      className="notif-empty-medium"
                    >
                      {resetFiltersFn && (
                        <Button type="primary" onClick={resetFiltersFn}>
                          Сбросить фильтры
                        </Button>
                      )}
                    </Empty>
                  ) : (
                    <div
                      className="virtual-list-inner"
                      style={
                        { '--total-size': `${rowVirtualizer.getTotalSize()}px` } as CSSProperties
                      }
                    >
                      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const notif = reversedNotifications[virtualRow.index];
                        return (
                          <div
                            key={notif.id}
                            ref={rowVirtualizer.measureElement}
                            data-index={virtualRow.index}
                            className="virtual-item-wrapper"
                            style={{ '--item-y': `${virtualRow.start}px` } as CSSProperties}
                          >
                            <NotificationItem {...notif} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
};
