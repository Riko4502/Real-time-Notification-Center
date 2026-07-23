import { useState, useEffect, memo, type FC } from 'react';

import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { Input, Select, Button, Space, Flex } from 'antd';

import { type NotificationFilterSource, type NotificationFilterType } from '@packages/types';

import { SOURCE_OPTIONS, TYPE_SELECT_OPTIONS } from '@constants/notification';
import { useDebounce } from '@hooks/useDebounce';

import type { FilterState } from '../../types';

interface NotificationFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onResetFiltersRef?: (resetFn: () => void) => void;
}

export const NotificationFilters: FC<NotificationFiltersProps> = memo(function ({
  onFilterChange,
  onResetFiltersRef,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<NotificationFilterType>('all');
  const [sourceFilter, setSourceFilter] = useState<NotificationFilterSource>('all');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const isFilterActive =
    searchQuery.trim() !== '' || typeFilter !== 'all' || sourceFilter !== 'all';

  const handleReset = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setSourceFilter('all');
  };

  useEffect(() => {
    if (onResetFiltersRef) {
      onResetFiltersRef(handleReset);
    }
  }, [onResetFiltersRef]);

  useEffect(() => {
    onFilterChange({
      query: debouncedSearchQuery.trim(),
      type: typeFilter,
      source: sourceFilter,
    });
  }, [debouncedSearchQuery, typeFilter, sourceFilter, onFilterChange]);

  return (
    <Flex className="notif-filters-bar" vertical gap="8px">
      <Input
        placeholder="Поиск по тексту..."
        prefix={<SearchOutlined className="notif-filter-search-icon" />}
        allowClear
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <Flex wrap justify="space-between">
        <Space wrap>
          <Select
            value={typeFilter}
            className="notif-filter-type-select"
            onChange={(val) => setTypeFilter(val)}
            options={TYPE_SELECT_OPTIONS}
          />

          <Select
            value={sourceFilter}
            className="notif-filter-source-select"
            onChange={(val) => setSourceFilter(val)}
            options={SOURCE_OPTIONS}
          />
        </Space>

        {isFilterActive && (
          <Button size="small" icon={<FilterOutlined />} onClick={handleReset}>
            Сброс
          </Button>
        )}
      </Flex>
    </Flex>
  );
});
