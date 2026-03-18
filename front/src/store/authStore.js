import { create } from 'zustand';

const STORAGE_KEY = 'rb_auth';

function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { token: null, user: null, roles: [], permissions: [] };
    }

    const parsed = JSON.parse(raw);
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null,
      roles: parsed.roles ?? [],
      permissions: parsed.permissions ?? [],
    };
  } catch {
    return { token: null, user: null, roles: [], permissions: [] };
  }
}

function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export const useAuthStore = create((set, get) => ({
  ...getStoredAuth(),

  setAuth: ({ token, user, roles = [], permissions = [] }) => {
    const auth = { token, user, roles, permissions };
    saveAuth(auth);
    set(auth);
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null, roles: [], permissions: [] });
  },

  hasPermission: (permission) => get().permissions.includes(permission),
  hasRole: (role) => get().roles.includes(role),
}));
