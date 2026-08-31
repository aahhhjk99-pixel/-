import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ADMIN_PHONE } from '@/lib/auth';

export default function Index() {
  useEffect(() => {
    let isMounted = true;

    async function checkSessionAndRedirect() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted) router.replace('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, phone')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!isMounted) return;

        if (profile?.role === 'admin' || profile?.phone === ADMIN_PHONE) {
          router.replace('/admin');
        } else if (profile?.role === 'technician') {
          router.replace('/(tech)/');
        } else {
          router.replace('/(tabs)/');
        }
      } catch (err) {
        if (isMounted) router.replace('/login');
      }
    }

    checkSessionAndRedirect();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
});

