import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ADMIN_PHONE } from '@/lib/auth';

export default function Index() {
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // 1. التثبت من وجود الجلسة (Login Session)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      // 2. قراءة دور الحساب (Customer / Technician / Admin)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, phone')
        .eq('id', session.user.id)
        .maybeSingle();

      // 3. التوجيه حسب نوع الحساب
      if (profile?.role === 'admin' || profile?.phone === ADMIN_PHONE) {
        router.replace('/admin');
      } else if (profile?.role === 'technician') {
        router.replace('/(tech)');
      } else {
        router.replace('/(tabs)');
      }
    };

    checkAuthAndRedirect();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}
