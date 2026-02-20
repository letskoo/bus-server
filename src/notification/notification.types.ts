import { NotificationType } from '@prisma/client';

export type NotificationRequest = {
  organizationId: number;
  routeId: number;
  stopId: number;
  phone: string;
  message: string;
  type: NotificationType;
};

export type NotificationResult = {
  sent: boolean;
  skipped: boolean;
  channel?: 'ALIMTALK' | 'SMS';
  costPoints?: number;
  reason?: 'DUPLICATE' | 'NO_POINTS' | 'PROVIDER_FAIL' | 'NO_POINTS_BLOCK';
};