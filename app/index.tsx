import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function Index() {
  const { session, profile } = useAuth();

  // إذا كان المستخدم مسجلاً دخوله مسبقاً، وجهه فوراً لصفحته
  if (session) {
    const role = profile?.role || 'customer';
    if (role === 'admin') return <Redirect href="/admin" />;
    if (role === 'technician') return <Redirect href="/technician" />;
    return <Redirect href="/customer" />;
  }

  // في جميع الحالات الأخرى، توجيه فوري لصفحة تسجيل الدخول بدون أي صفحة بيضاء أو تأخير
  return <Redirect href="/login" />;
}
