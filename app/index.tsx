import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function Index() {
  const { session, profile } = useAuth();

  // 1. إذا كان المستخدم مسجل دخوله مسبقاً، وجهه لصفحته الخاصة حسب نوع الحساب
  if (session && profile) {
    if (profile.role === 'admin') {
      return <Redirect href="/admin" />;
    }
    if (profile.role === 'technician') {
      return <Redirect href="/technician" />;
    }
    return <Redirect href="/customer" />;
  }

  // 2. إذا لم يكن مسجل الدخول (أو أول مرة يفتح الرابط)، توجيه مباشر وفوري لصفحة تسجيل الدخول بدون أي عجلة تحميل
  return <Redirect href="/login" />;
}
