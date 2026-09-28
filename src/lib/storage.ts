/**
 * Safe LocalStorage Wrapper
 * Protects against SecurityError: "Failed to read the 'localStorage' property from 'Window': Access is denied for this document."
 * which happens in Incognito modes, in-app WebViews (Instagram/WhatsApp/Telegram), and browsers with strict privacy/cookie settings.
 */

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Storage access blocked or restricted
    }
    return null;
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch {
      // Storage access blocked or quota exceeded
    }
    return false;
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Storage access blocked
    }
  },

  clear: (): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
      }
    } catch {
      // Storage access blocked
    }
  }
};
