import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import CustomerHome from '../components/CustomerHome';
import TechnicianHome from '../components/TechnicianHome';

export default function Index() {
  const auth = useAuth() as any;
  const { session, profile, isLoading, loading } = auth || {};

  // في حالة جاري المعالجة، لا يتم عرض أي عجلة تحميل ويتم الانتقال فوراً
  if (isLoading || loading) {
    return null;
  }

  // عند وجود جلسة تسجيل دخول: التوجيه حسب دور المستخدم
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

  // في حالة عدم تسجيل الدخول: توجيه فوري لصفحة الدخول
  return <Redirect href="/login" />;
}
