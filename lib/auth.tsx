import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';
import type { Session } from '@supabase/supabase-js';

export const ADMIN_PHONE = '0930656956';

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  deleteAccount: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string, userPhone?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('خطأ في جلب بيانات الملف الشخصي:', error);
        setProfile(null);
        return;
      }

      if (data) {
        let currentProfile = data as Profile;
        const cleanPhone = (userPhone || currentProfile.phone || '').trim();

        if (cleanPhone === ADMIN_PHONE && currentProfile.role !== 'admin') {
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId)
            .select()
            .single();

          if (updatedProfile) {
            currentProfile = updatedProfile as Profile;
          }
        }
        setProfile(currentProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('حدث خطأ غير متوقع أثناء تحميل البيانات:', err);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      const phone = session.user.email?.replace('@services.ly', '') || '';
      await loadProfile(session.user.id, phone);
    }
  }, [session, loadProfile]);

  useEffect(() => {
    let isMounted = true;

    // مؤقت أمان: فك شاشة التحميل تلقائياً بعد 3 ثوانٍ إذا علق الاتصال
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    // 1. جلب الجلسة الحالية
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (!isMounted) return;
      setSession(initSession);
      if (initSession?.user) {
        const phone = initSession.user.email?.replace('@services.ly', '') || '';
        loadProfile(initSession.user.id, phone).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // 2. الاستماع لتغييرات الحالة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      if (currentSession?.user) {
        const phone = currentSession.user.email?.replace('@services.ly', '') || '';
        await loadProfile(currentSession.user.id, phone);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('خطأ أثناء تسجيل الخروج:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!session?.user) return;
    try {
      setLoading(true);
      await supabase.from('profiles').delete().eq('id', session.user.id);
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('خطأ أثناء حذف الحساب:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signOut,
        refreshProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
