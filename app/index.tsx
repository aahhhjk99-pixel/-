import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, Wrench, ShieldAlert, UserCheck, Sparkles } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme-context';
import { BRAND_NAME } from '@/lib/constants';

export default function IndexScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.role) {
        setUserRole(profile.role);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={['#2563eb', '#1d4ed8']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.brandTitle}>{BRAND_NAME}</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut color="#fff" size={20} />
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>مرحباً بك في منصة الخدمات</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body}>
        {userRole === 'admin' && (
          <TouchableOpacity
            style={[styles.adminBanner, { backgroundColor: '#ef4444' }]}
            onPress={() => router.push('/admin')}
          >
            <ShieldAlert color="#fff" size={24} />
            <Text style={styles.adminBannerText}>الانتقال إلى لوحة التحكم (الأدمن)</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>الخدمات المتاحة</Text>

        <View style={styles.grid}>
          <TouchableOpacity style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
            <Wrench color="#2563eb" size={32} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>طلب صيانة</Text>
            <Text style={[styles.cardSub, { color: colors.subtext }]}>إرسال طلب فني جديد</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
            <Sparkles color="#2563eb" size={32} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>خدمات ممتازة</Text>
            <Text style={[styles.cardSub, { color: colors.subtext }]}>تصفح جميع العروض</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={[styles.linkRow, { backgroundColor: colors.cardBg }]}
            onPress={() => router.push('/recharges')}
          >
            <UserCheck color={colors.text} size={20} />
            <Text style={[styles.linkText, { color: colors.text }]}>إدارة الحساب والشحن</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, { backgroundColor: colors.cardBg }]}
            onPress={() => router.push('/disputes')}
          >
            <ShieldAlert color={colors.text} size={20} />
            <Text style={[styles.linkText, { color: colors.text }]}>الشكاوى والنزاعات</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 22,
    color: '#fff',
  },
  welcomeText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 16,
    color: '#dbeafe',
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  body: { padding: 20 },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  adminBannerText: {
    color: '#fff',
    fontFamily: 'Cairo-Bold',
    fontSize: 15,
  },
  sectionTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 15,
    marginTop: 4,
  },
  cardSub: {
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  quickLinks: { gap: 10 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  linkText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 15,
  },
});
