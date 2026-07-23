import type { NotificationFilterSource, NotificationFilterType } from '@packages/types';

export interface FilterState {
  query: string;
  type: NotificationFilterType;
  source: NotificationFilterSource;
}
