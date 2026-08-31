import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme-context';
import CustomerHome from '@/components/CustomerHome';
import TechnicianHome from '@/components/TechnicianHome';

export default function IndexScreen() {
  const { user, profile, loading } = useAuth();
  const { colors } = useTheme();

  // 1. أثناء التحميل والتحقق من الجلسة
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors?.bg || '#ffffff' }]}>
        <ActivityIndicator size="large" color={colors?.primary || '#2563eb'} />
      </View>
    );
  }

  // 2. إذا لم يكن المستخدم مسجلاً، التوجيه لصفحة تسجيل الدخول
  if (!user || !profile) {
    return <Redirect href="/login" />;
  }

  // 3. إذا كان المستخدم مدير (Admin)، التوجيه لصفحة لوحة التحكم
  if (profile.role === 'admin') {
    return <Redirect href="/admin" />;
  }

  // 4. إذا كان الحساب فني صيانة، عرض شاشة الفني
  if (profile.role === 'technician') {
    return <TechnicianHome />;
  }

  // 5. افتراضياً (حساب زبون)، عرض شاشة الزبون
  return <CustomerHome />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
