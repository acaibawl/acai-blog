import { useState } from '#app';

export const useMessage = () => {
  return useState<string>('message', () => '');
};
