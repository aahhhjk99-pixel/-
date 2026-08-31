import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import CustomerHome from '../components/CustomerHome';
import TechnicianHome from '../components/TechnicianHome';

export default function Index() {
  const auth = useAuth() as any;

  if (!auth) {
    return <Redirect href="/login" />;
  }

  const { session, profile, isLoading, loading } = auth;
  const isAuthLoading = isLoading || loading;

  // أثناء الفحص السريع (أجزاء من الثانية) لا نعرض أي نص
  if (isAuthLoading) {
    return null;
  }

  // التوجيه للمستخدم المسجّل
  if (session) {
    const role = profile?.role || 'customer';

    if (role === 'admin') return <Redirect href="/admin" />;
    if (role === 'technician') return <TechnicianHome />;
    return <CustomerHome />;
  }

  // التوجيه المباشر لصفحة الدخول
  return <Redirect href="/login" />;
}
