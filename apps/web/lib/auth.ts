import Cookies from 'js-cookie';

const TOKEN_KEY = 'px_token';

type AuthListener = () => void;
const listeners = new Set<AuthListener>();

function notifyAuthChanged() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      
    }
  });
}

export const auth = {
  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, { 
      expires: 7, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    notifyAuthChanged();
  },

  getToken: (): string | undefined => {
    return Cookies.get(TOKEN_KEY);
  },

  removeToken: () => {
    Cookies.remove(TOKEN_KEY);
    notifyAuthChanged();
  },

  isAuthenticated: (): boolean => {
    return !!Cookies.get(TOKEN_KEY);
  },
  subscribe: (listener: AuthListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};
