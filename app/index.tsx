import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import CustomerHome from '../components/CustomerHome';
import TechnicianHome from '../components/TechnicianHome';

export default function Index() {
  const auth = useAuth() as any;
  const [forceRedirect, setForceRedirect] = useState(false);

  // مؤقت حماية: منع الشاشة البيضاء إذا تعثر الاتصال
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceRedirect(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!auth || forceRedirect) {
    return <Redirect href="/login" />;
  }

  const { session, profile, isLoading, loading } = auth;
  const isAuthLoading = isLoading || loading;

  if (isAuthLoading) {
    return null;
  }

  if (session) {
    const role = profile?.role || 'customer';
    if (role === 'admin') return <Redirect href="/admin" />;
    if (role === 'technician') return <TechnicianHome />;
    return <CustomerHome />;
  }

  return <Redirect href="/login" />;
}
