import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const C = Colors.light;

function MenuRow({
  icon,
  label,
  value,
  onPress,
  valueColor,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string;
  onPress: () => void;
  valueColor?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuRow,
        pressed && { backgroundColor: "#F9F9F9" },
      ]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIconBg}>
          <Feather name={icon} size={16} color={C.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {value ? (
          <Text
            style={[styles.menuValue, valueColor ? { color: valueColor } : {}]}
          >
            {value}
          </Text>
        ) : null}
        <Feather name="chevron-right" size={16} color={C.textTertiary} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const {
    estimatedIncome,
    settledAmount,
    withdrawableAmount,
    orders,
    coupons,
  } = useApp();

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const settledCount = orders.filter((o) => o.status === "settled").length;
  const validCoupons = coupons.filter((c) => !c.used).length;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Top gradient header */}
      <View style={[styles.topHeader, { paddingTop: topPad + 10 }]}>
        <View style={styles.userRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Feather name="user" size={28} color="#fff" />
            </View>
            <View style={styles.vipBadge}>
              <Text style={styles.vipText}>会员</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>智选用户</Text>
            <Text style={styles.userDesc}>已累计省钱 ¥{(estimatedIncome + settledAmount).toFixed(2)}</Text>
          </View>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/settings");
            }}
          >
            <Feather name="settings" size={22} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>

        {/* Cashback stats */}
        <View style={styles.cashbackCard}>
          <View style={styles.cashbackItem}>
            <Text style={styles.cashbackAmount}>¥{estimatedIncome.toFixed(2)}</Text>
            <Text style={styles.cashbackLabel}>预估收入</Text>
          </View>
          <View style={styles.cashbackDivider} />
          <View style={styles.cashbackItem}>
            <Text style={styles.cashbackAmount}>¥{settledAmount.toFixed(2)}</Text>
            <Text style={styles.cashbackLabel}>已结算</Text>
          </View>
          <View style={styles.cashbackDivider} />
          <View style={styles.cashbackItem}>
            <Text style={[styles.cashbackAmount, { color: C.primary }]}>
              ¥{withdrawableAmount.toFixed(2)}
            </Text>
            <Text style={styles.cashbackLabel}>可提现</Text>
          </View>
          <Pressable
            style={styles.withdrawBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/withdraw");
            }}
          >
            <Text style={styles.withdrawBtnText}>提现</Text>
          </Pressable>
        </View>
      </View>

      {/* Order stats */}
      <View style={styles.section}>
        <View style={styles.orderStatsCard}>
          <View style={styles.orderStatsHeader}>
            <Text style={styles.orderStatsTitle}>我的订单</Text>
            <Pressable onPress={() => router.push("/orders")}>
              <Text style={styles.viewAllText}>全部订单 ›</Text>
            </Pressable>
          </View>
          <View style={styles.orderStatsRow}>
            {[
              { label: "待结算", count: pendingCount, icon: "clock" as const },
              { label: "已结算", count: settledCount, icon: "check-circle" as const },
              { label: "我的卡包", count: validCoupons, icon: "credit-card" as const },
            ].map((item) => (
              <Pressable
                key={item.label}
                style={styles.orderStatItem}
                onPress={() => {
                  if (item.label === "我的卡包") router.push("/coupons");
                  else router.push("/orders");
                }}
              >
                <Feather name={item.icon} size={24} color={C.primary} />
                {item.count > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.count}</Text>
                  </View>
                )}
                <Text style={styles.orderStatLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <View style={styles.menuCard}>
          <MenuRow
            icon="credit-card"
            label="我的卡包"
            value={`${validCoupons}张可用`}
            valueColor={validCoupons > 0 ? C.primary : undefined}
            onPress={() => router.push("/coupons")}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="shopping-bag"
            label="我的订单"
            value={pendingCount > 0 ? `${pendingCount}笔待结算` : undefined}
            valueColor={C.warning}
            onPress={() => router.push("/orders")}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="clock"
            label="历史足迹"
            onPress={() => router.push("/footprint")}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="map-pin"
            label="收货地址"
            onPress={() => {
              Haptics.selectionAsync();
            }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuCard}>
          <MenuRow
            icon="help-circle"
            label="帮助与反馈"
            onPress={() => {
              Haptics.selectionAsync();
            }}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="settings"
            label="设置"
            onPress={() => router.push("/settings")}
          />
        </View>
      </View>

      <View
        style={{
          height: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84,
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  topHeader: {
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  vipBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: C.accent,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  vipText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "700" as const,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
  },
  userDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  cashbackCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  cashbackItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  cashbackAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: C.text,
  },
  cashbackLabel: {
    fontSize: 11,
    color: C.textSecondary,
  },
  cashbackDivider: {
    width: 1,
    height: 30,
    backgroundColor: C.border,
    marginHorizontal: 4,
  },
  withdrawBtn: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginLeft: 8,
  },
  withdrawBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  section: {
    marginTop: 12,
    paddingHorizontal: 14,
  },
  orderStatsCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
    }),
  },
  orderStatsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  orderStatsTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: C.text,
  },
  viewAllText: {
    fontSize: 13,
    color: C.textTertiary,
  },
  orderStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  orderStatItem: {
    alignItems: "center",
    gap: 6,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: C.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  orderStatLabel: {
    fontSize: 12,
    color: C.textSecondary,
  },
  menuCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
    }),
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 15,
    color: C.text,
    fontWeight: "500" as const,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  menuValue: {
    fontSize: 12,
    color: C.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 58,
  },
});
