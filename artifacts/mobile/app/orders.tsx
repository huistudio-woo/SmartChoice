import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Order, useApp } from "@/context/AppContext";

const C = Colors.light;

const STATUS_CONFIG = {
  pending: { label: "待结算", color: C.warning, bg: "#FFF8E1" },
  settled: { label: "已结算", color: "#22C55E", bg: "#F0FDF4" },
  invalid: { label: "已失效", color: C.textTertiary, bg: "#F5F5F5" },
};

const TABS = ["全部", "待结算", "已结算", "已失效"];

function OrderItem({ order }: { order: Order }) {
  const cfg = STATUS_CONFIG[order.status];
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>订单号: {order.id.toUpperCase()}</Text>
        <View style={[styles.statusTag, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
      </View>
      <View style={styles.orderBody}>
        <Image
          source={{ uri: order.product.image }}
          style={styles.productImage}
        />
        <View style={styles.orderInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {order.product.title}
          </Text>
          <Text style={styles.orderTime}>{order.orderTime}</Text>
          <View style={styles.orderAmounts}>
            <Text style={styles.orderAmount}>¥{order.amount}</Text>
            <View style={styles.cashbackInfo}>
              <Feather name="trending-up" size={11} color={C.cashback} />
              <Text style={styles.cashbackText}>
                返利 ¥{order.cashback}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { orders } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  const STATUS_MAP = ["all", "pending", "settled", "invalid"];

  const filtered =
    activeTab === 0
      ? orders
      : orders.filter((o) => o.status === STATUS_MAP[activeTab]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.pageTitle}>我的订单</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab, idx) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === idx && styles.tabActive]}
            onPress={() => setActiveTab(idx)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === idx && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="shopping-bag" size={40} color={C.textTertiary} />
            <Text style={styles.emptyText}>暂无相关订单</Text>
          </View>
        ) : (
          filtered.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: C.text,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: C.primary,
  },
  tabText: {
    fontSize: 13,
    color: C.textSecondary,
  },
  tabTextActive: {
    color: C.primary,
    fontWeight: "700" as const,
  },
  list: { flex: 1, padding: 14 },
  orderCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      web: { boxShadow: "0 1px 6px rgba(0,0,0,0.05)" },
    }),
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 11,
    color: C.textTertiary,
  },
  statusTag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  orderBody: {
    flexDirection: "row",
    gap: 12,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: C.skeleton,
  },
  orderInfo: { flex: 1, gap: 4 },
  productTitle: {
    fontSize: 13,
    color: C.text,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  orderTime: {
    fontSize: 11,
    color: C.textTertiary,
  },
  orderAmounts: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: C.text,
  },
  cashbackInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFF0F0",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cashbackText: {
    fontSize: 11,
    color: C.cashback,
    fontWeight: "600" as const,
  },
  empty: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyText: { fontSize: 15, color: C.textTertiary },
});
