import { useState } from '#app';

export const useNotificationMessage = () => {
  return useState<string>('notificationMessage', () => '');
};
