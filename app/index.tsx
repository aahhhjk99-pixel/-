import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import CustomerHome from '../components/CustomerHome';
import TechnicianHome from '../components/TechnicianHome';

export default function Index() {
  const auth = useAuth() as any;

  // 1. حماية في حال كان الـ Auth غير معرف لا ينهار التطبيق بل يوجه مباشرة للتسجيل
  if (!auth) {
    return <Redirect href="/login" />;
  }

  const { session, profile, isLoading, loading } = auth;
  const isAuthLoading = isLoading || loading;

  // 2. إذا كان جاري التحقق من الجلسة ولم تكتمل بعد، انتظر ثوانٍ معدودة دون تجميد
  if (isAuthLoading) {
    return null;
  }

  // 3. في حالة تسجيل الدخول: التوجيه حسب نوع الحساب
  if (session) {
    const role = profile?.role || 'customer';

    if (role === 'admin') {
      return <Redirect href="/admin" />;
    }

    if (role === 'technician') {
      return <TechnicianHome />;
    }

    return <CustomerHome />;
  }

  // 4. التوجيه المباشر لصفحة الدخول في حالة عدم وجود جلسة
  return <Redirect href="/login" />;
}
