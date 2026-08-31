import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme-context';
import { ADMIN_PHONE } from '@/lib/auth';

export default function Index() {
  const { colors } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // لو مش مسجل دخول يحوله لصفحة الدخول فوراً
      if (!session) {
        router.replace('/login');
        return;
      }

      // جلب نوع الحساب وتوجيهه للمكان المناسب
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, phone')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.role === 'admin' || profile?.phone === ADMIN_PHONE) {
        router.replace('/admin');
      } else if (profile?.role === 'technician') {
        router.replace('/(tech)');
      } else {
        router.replace('/(tabs)');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
