import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// تنظيف الرابط من أي زوائد مثل /rest/v1
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const customStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return Promise.resolve(window.localStorage.getItem(key));
    }
    return Promise.resolve(null);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    return Promise.resolve();
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
