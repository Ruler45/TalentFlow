import { useContext } from 'react';
import AuthContext from '../context/AuthContextInstance';

export function useAuth() {
  return useContext(AuthContext);
}