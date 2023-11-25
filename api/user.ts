import { User } from '@/types';
import axios, { authConfig, authConfigToken } from './axios'; // authConfig

export const checkUserRole = async (): Promise<User> => {
  const res = await axios.get(
    '/v1/jwtUsers/check-role',
    await authConfigToken(),
  );
  console.log('res jwt', res.data);
  return res.data;
};
