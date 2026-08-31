import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function Index() {
  const { session, profile, loading } = useAuth();

  // إيقاف التوجيه لأجزاء من الثانية حتى تكتمل قراءة الجلسة بدون إظهار أي عجلة
  if (loading) {
    return null;
  }

  // إذا كان المستخدم مسجل دخوله، التوجيه حسب نوع الحساب (مع افتراض زبون كخيار افتراضي)
  if (session) {
    const role = profile?.role || 'customer';
    if (role === 'admin') return <Redirect href="/admin" />;
    if (role === 'technician') return <Redirect href="/technician" />;
    return <Redirect href="/customer" />;
  }

  // إذا لم يكن مسجل الدخول
  return <Redirect href="/login" />;
}
