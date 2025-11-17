interface Cache<T> {
  get: () => T | null;
  set: (value: T) => void;
  remove: () => void;
  clear: () => void;
}

export function createCache<T>(key: string): Cache<T> {
  const get = (): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item "${key}" from localStorage`, error);
      return null;
    }
  };

  const set = (value: T): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item "${key}" in localStorage`, error);
    }
  };

  const remove = (): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item "${key}" from localStorage`, error);
    }
  };

  const clear = (): void => {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage", error);
    }
  };

  return { get, set, remove, clear };
}
