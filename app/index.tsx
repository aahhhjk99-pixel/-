import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ADMIN_PHONE } from '@/lib/auth';

export default function Index() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }

      supabase
        .from('profiles')
        .select('role, phone')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (profile?.role === 'admin' || profile?.phone === ADMIN_PHONE) {
            router.replace('/admin');
          } else if (profile?.role === 'technician') {
            router.replace('/(tech)');
          } else {
            router.replace('/(tabs)');
          }
        });
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

