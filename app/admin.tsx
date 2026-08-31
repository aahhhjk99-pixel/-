import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator,
} from 'react-native';
import {
  Users, ClipboardList, DollarSign, AlertTriangle, TrendingUp,
  ChevronLeft, ShieldCheck, Clock, Star, LogOut, ArrowRight,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme-context';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, BRAND_NAME, BRAND_LOGO } from '@/lib/constants';
import type { Order, Dispute, Profile } from '@/types/database';

export default function AdminScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0, verifiedTechs: 0, pendingTechs: 0, todayOrders: 0,
    totalInvoices: 0, platformRevenue: 0, openDisputes: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pendingTechs, setPendingTechs] = useState<Profile[]>([]);
  const [openDisputes, setOpenDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      const { count: usersCount } = await supabase
        .from('profiles').select('*', { count: 'planned', head: true }).eq('role', 'customer');
      const { count: verifiedCount } = await supabase
        .from('profiles').select('*', { count: 'planned', head: true })
        .eq('role', 'technician').eq('verification_status', 'approved');
      const { count: pendingCount } = await supabase
        .from('profiles').select('*', { count: 'planned', head: true })
        .eq('role', 'technician').eq('verification_status', 'pending');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayOrdersCount } = await supabase
        .from('orders').select('*', { count: 'planned', head: true })
        .gte('created_at', today.toISOString());

      const { data: invoices } = await supabase.from('invoices').select('total, commission_amount, status');
      const totalInv = (invoices || []).reduce((sum, inv: any) => sum + Number(inv.total || 0), 0);
      const totalComm = (invoices || []).reduce((sum, inv: any) => sum + Number(inv.commission_amount || 0), 0);

      const { count: disputesCount } = await supabase
        .from('disputes').select('*', { count: 'planned', head: true }).eq('status', 'open');

      setStats({
        totalUsers: usersCount || 0,
        verifiedTechs: verifiedCount || 0,
        pendingTechs: pendingCount || 0,
        todayOrders: todayOrdersCount || 0,
        totalInvoices: totalInv,
        platformRevenue: totalComm,
        openDisputes: disputesCount || 0,
      });

      const { data: orders } = await supabase.from('orders').select(`
        *, service:services(*), customer:profiles!orders_customer_id_fkey(*),
        technician:profiles!orders_technician_id_fkey(*)
      `).order('created_at', { ascending: false }).limit(5);
      setRecentOrders((orders as Order[]) || []);

      const { data: techs } = await supabase.from('profiles').select('*')
        .eq('role', 'technician').eq('verification_status', 'pending')
        .order('created_at', { ascending: false }).limit(5);
      setPendingTechs((techs as Profile[]) || []);

      const { data: disputes } = await supabase.from('disputes').select(`
        *, order:orders(*), invoice:invoices(*),
        customer:profiles!disputes_customer_id_fkey(*),
        technician:profiles!disputes_technician_id_fkey(*)
      `).eq('status', 'open').order('created_at', { ascending: false }).limit(5);
      setOpenDisputes((disputes as Dispute[]) || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => router.replace('/')} style={styles.iconBtn}>
              <ArrowRight color={colors.text} size={22} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>لوحة التحكم</Text>
              <Text style={[styles.headerSub, { color: colors.subtext }]}>إدارة شاملة للنظام</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.brandBadge, { backgroundColor: colors.primaryLight }]}>
              <Star color={colors.primary} size={14} fill={colors.primary} />
              <Text style={[styles.brandText, { color: colors.primary }]}>{BRAND_NAME} {BRAND_LOGO}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
              <LogOut color={colors.text} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
      >
        <View style={styles.statsGrid}>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]} activeOpacity={0.7} onPress={() => router.push('/users')}>
            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
              <Users color="#2563eb" size={20} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalUsers}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>الزبائن</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]} activeOpacity={0.7} onPress={() => router.push('/users')}>
            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
              <ShieldCheck color="#16a34a" size={20} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.verifiedTechs}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>فنيون موثقون</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]} activeOpacity={0.7} onPress={() => router.push('/users')}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <Clock color="#f59e0b" size={20} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.pendingTechs}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>بانتظار التوثيق</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]} activeOpacity={0.7} onPress={() => router.push('/')}>
            <View style={[styles.statIcon, { backgroundColor: '#e0e7ff' }]}>
              <ClipboardList color="#6366f1" size={20} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.todayOrders}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>طلبات اليوم</Text>
          </TouchableOpacity>
          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: '#fce7f3' }]}>
              <DollarSign color="#ec4899" size={20} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(stats.totalInvoices)}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>إجمالي الفواتير</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: '#d1fae5' }]}>
              <TrendingUp color="#10b981" size={20} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(stats.platformRevenue)}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>أرباح المنصة</Text>
          </View>
        </View>

        {stats.openDisputes > 0 && (
          <TouchableOpacity style={[styles.alertBanner, { backgroundColor: colors.blockedBg || '#fee2e2', borderColor: colors.blockedBorder || '#fca5a5' }]} activeOpacity={0.7} onPress={() => router.push('/disputes')}>
            <AlertTriangle color={colors.error || '#ef4444'} size={20} />
            <Text style={[styles.alertText, { color: colors.error || '#ef4444' }]}>
              {stats.openDisputes} نزاع مفتوح يحتاج للتحكيم
            </Text>
            <ChevronLeft color={colors.error || '#ef4444'} size={20} />
          </TouchableOpacity>
        )}

        {pendingTechs.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>فنيون بانتظار المراجعة</Text>
            </View>
            {pendingTechs.map((tech) => (
              <TouchableOpacity
                key={tech.id}
                style={[styles.techRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                onPress={() => router.push('/users')}
              >
                <View style={[styles.techAvatar, { backgroundColor: '#fef3c7' }]}>
                  <Text style={[styles.techInitial, { color: '#92400e' }]}>{tech.full_name ? tech.full_name.charAt(0) : 'ف'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.techName, { color: colors.text }]}>{tech.full_name}</Text>
                  <Text style={[styles.techInfo, { color: colors.subtext }]}>{tech.specialty || 'غير محدد'} • {tech.phone}</Text>
                </View>
                <Clock color={colors.warning || '#f59e0b'} size={20} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {openDisputes.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>نزاعات مفتوحة</Text>
            </View>
            {openDisputes.map((dispute) => (
              <TouchableOpacity
                key={dispute.id}
                style={[styles.disputeRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                onPress={() => router.push('/disputes')}
              >
                <View style={[styles.disputeIcon, { backgroundColor: '#fee2e2' }]}>
                  <AlertTriangle color="#ef4444" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.disputeReason, { color: colors.text }]} numberOfLines={1}>{dispute.reason}</Text>
                  <Text style={[styles.disputeTime, { color: colors.subtext }]}>{formatDateTime(dispute.created_at)}</Text>
                </View>
                <ChevronLeft color={colors.subtext} size={20} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {recentOrders.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>أحدث الطلبات</Text>
            </View>
            {recentOrders.map((order) => (
              <View
                key={order.id}
                style={[styles.orderRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              >
                <View style={[styles.orderStatusDot, { backgroundColor: ORDER_STATUS_COLORS[order.status] || '#2563eb' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.orderService, { color: colors.text }]}>{order.service?.name || 'طلب خدمة'}</Text>
                  <Text style={[styles.orderCustomer, { color: colors.subtext }]}>
                    {order.customer?.full_name || 'زبون'} → {order.technician?.full_name || 'غير محدد'}
                  </Text>
                </View>
                <Text style={[styles.orderStatus, { color: ORDER_STATUS_COLORS[order.status] || '#2563eb' }]}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </Text>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity
          style={[styles.fullDashboardBtn, { backgroundColor: colors.primary || '#2563eb' }]}
          onPress={() => router.push('/users')}
        >
          <Text style={styles.fullDashboardBtnText}>إدارة جميع المستخدمين</Text>
          <ChevronLeft color="#fff" size={20} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 6, borderRadius: 8 },
  brandBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  brandText: { fontFamily: 'Cairo-Bold', fontSize: 12 },
  headerTitle: { fontFamily: 'Cairo-Bold', fontSize: 20 },
  headerSub: { fontFamily: 'Cairo-Regular', fontSize: 12, marginTop: 2 },
  body: { padding: 16, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: '48%', flexGrow: 1, borderRadius: 16, padding: 16, borderWidth: 1 },
  statIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontFamily: 'Cairo-Bold', fontSize: 18 },
  statLabel: { fontFamily: 'Cairo-Regular', fontSize: 12, marginTop: 2 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  alertText: { flex: 1, fontFamily: 'Cairo-Medium', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 16 },
  techRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1 },
  techAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  techInitial: { fontFamily: 'Cairo-Bold', fontSize: 18 },
  techName: { fontFamily: 'Cairo-Bold', fontSize: 14 },
  techInfo: { fontFamily: 'Cairo-Regular', fontSize: 12, marginTop: 2 },
  disputeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1 },
  disputeIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  disputeReason: { fontFamily: 'Cairo-Medium', fontSize: 14 },
  disputeTime: { fontFamily: 'Cairo-Regular', fontSize: 12, marginTop: 2 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1 },
  orderStatusDot: { width: 10, height: 10, borderRadius: 5 },
  orderService: { fontFamily: 'Cairo-Bold', fontSize: 14 },
  orderCustomer: { fontFamily: 'Cairo-Regular', fontSize: 12, marginTop: 2 },
  orderStatus: { fontFamily: 'Cairo-Medium', fontSize: 12 },
  fullDashboardBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, padding: 16, marginTop: 16 },
  fullDashboardBtnText: { fontFamily: 'Cairo-Bold', fontSize: 15, color: '#fff' },
});
