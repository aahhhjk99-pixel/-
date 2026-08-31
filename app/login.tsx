import { useState } from 'react';
import { router } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Phone, Star, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme-context';
import { useToast } from '@/lib/toast';
import { BRAND_NAME, BRAND_LOGO } from '@/lib/constants';
import { ADMIN_PHONE } from '@/lib/auth';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { show } = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    if (!cleanPhone || !password.trim()) {
      setError('الرجاء إدخال رقم الهاتف وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const email = `${cleanPhone}@services.ly`;
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw new Error('رقم الهاتف أو كلمة المرور غير صحيحة');

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('remember_me', rememberMe ? 'true' : 'false');
      }

      // جلب بيانات ملف المستخدم
      const userId = authData.user?.id;
      let userRole = 'customer';

      if (userId) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, id')
          .eq('id', userId)
          .maybeSingle();

        if (cleanPhone === ADMIN_PHONE) {
          userRole = 'admin';
          if (profileData && profileData.role !== 'admin') {
            await supabase.from('profiles').update({ role: 'admin' }).eq('id', profileData.id);
          }
        } else if (profileData?.role) {
          userRole = profileData.role;
        }
      }

      // التوجيه المباشر حسب نوع الحساب
      if (userRole === 'admin') {
        show('تم تسجيل الدخول كأدمن', 'success');
        router.replace('/admin');
      } else if (userRole === 'technician') {
        show('تم تسجيل الدخول بنجاح', 'success');
        router.replace('/(tech)');
      } else {
        show('تم تسجيل الدخول بنجاح', 'success');
        router.replace('/(tabs)');
      }

    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
      show('فشل تسجيل الدخول', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={['#2563eb', '#1d4ed8']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronRight color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تسجيل الدخول</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.iconCircle}>
          <Star color="#2563eb" size={32} fill="#2563eb" />
        </View>

        <Text style={[styles.brandName, { color: colors.text }]}>{BRAND_NAME} {BRAND_LOGO}</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>أدخل رقم هاتفك وكلمة المرور للمتابعة</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>رقم الهاتف</Text>
          <View style={[styles.phoneInput, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
            <Phone color={colors.subtext} size={20} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.phoneField, { color: colors.text }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="091XXXXXXX"
              placeholderTextColor={colors.subtext}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>كلمة المرور</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.inputBorder }]}
            value={password}
            onChangeText={setPassword}
            placeholder="******"
            placeholderTextColor={colors.subtext}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.rememberContainer}
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Check color="#fff" size={14} strokeWidth={3} />}
          </View>
          <Text style={[styles.rememberText, { color: colors.text }]}>تذكرني على هذا الجهاز</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginBtnText}>
            {loading ? 'جاري الدخول...' : 'دخول'}
          </Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={[styles.signupLabel, { color: colors.subtext }]}>ليس لديك حساب؟</Text>
          <View style={styles.signupLinksRow}>
            <TouchableOpacity onPress={() => router.push('/customer-signup')} style={styles.signupLinkBtn}>
              <Text style={styles.signupLinkText}>تسجيل كزبون</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.subtext }}>|</Text>
            <TouchableOpacity onPress={() => router.push('/technician-signup')} style={styles.signupLinkBtn}>
              <Text style={styles.signupLinkText}>تسجيل كفني</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 20,
    color: '#fff',
  },
  body: { padding: 24, paddingTop: 40 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontFamily: 'Cairo-Bold',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontFamily: 'Cairo-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Cairo-Regular',
    fontSize: 16,
    borderWidth: 1,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  phoneField: {
    flex: 1,
    fontFamily: 'Cairo-Regular',
    fontSize: 16,
    textAlign: 'left',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94a3b8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  rememberText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 14,
  },
  errorText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: '#fff',
  },
  signupContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  signupLabel: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  signupLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signupLinkBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  signupLinkText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    color: '#2563eb',
  },
});
