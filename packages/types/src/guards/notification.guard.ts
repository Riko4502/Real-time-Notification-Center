import type { NotificationType } from '../index';

export const VALID_NOTIFICATION_TYPES: readonly NotificationType[] = [
  'info',
  'warning',
  'success',
  'danger',
];

/**
 * Type Guard для безопасной проверки значения на undefined/null и сужения типа до NotificationType
 */
export function isNotificationType(type: unknown): type is NotificationType {
  return typeof type === 'string' && (VALID_NOTIFICATION_TYPES as readonly string[]).includes(type);
}
