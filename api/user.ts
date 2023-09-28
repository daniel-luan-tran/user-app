import { User } from '@/types';
import axios, { authConfig } from './axios'; // authConfig

export const checkUserRole = async (): Promise<User> => {
  const res = await axios.get('/v1/azureUsers/check-role', authConfig);
  return res.data;
};
