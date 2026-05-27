import { useState, useEffect } from 'react';
import { me, logout as apiLogout } from '../api/auth';
import { tokenKey } from '../api/client';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const token = localStorage.getItem(tokenKey);
      if (!token) {
        setBooting(false);
        return;
      }
      try {
        const data = await me();
        setUser(data.user);
      } catch {
        localStorage.removeItem(tokenKey);
        setUser(null);
      } finally {
        setBooting(false);
      }
    }
    loadSession();
  }, []);

  async function logout() {
    try {
      await apiLogout();
    } finally {
      localStorage.removeItem(tokenKey);
      setUser(null);
    }
  }

  return { user, setUser, booting, logout };
}
