import React from 'react';
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import CustomerHome from '../components/CustomerHome';
import TechnicianHome from '../components/TechnicianHome';

export default function Index() {
  const auth = useAuth() as any;

  // 1. إذا لم يكن Auth معرفاً، توجيه مباشر للدخول
  if (!auth) {
    return <Redirect href="/login" />;
  }

  const { session, profile, isLoading, loading } = auth;
  const isAuthLoading = isLoading || loading;

  // 2. بدلاً من return null (التي تسبب الشاشة البيضاء)، نعرض نصاً لمعرفة هل هو عالق هنا
  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <Text style={{ fontSize: 18, color: '#000' }}>جاري التحقق من الحساب...</Text>
      </View>
    );
  }

  // 3. توجيه الحسابات المسجلة
  if (session) {
    const role = profile?.role || 'customer';

    if (role === 'admin') return <Redirect href="/admin" />;
    if (role === 'technician') return <TechnicianHome />;
    return <CustomerHome />;
  }

  // 4. توجيه لصفحة الدخول
  return <Redirect href="/login" />;
}
