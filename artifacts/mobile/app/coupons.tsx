import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
import { Coupon, useApp } from "@/context/AppContext";

const C = Colors.light;

function CouponItem({ coupon }: { coupon: Coupon }) {
  const isExpired = new Date(coupon.expireDate) < new Date();
  const today = new Date();
  const expDate = new Date(coupon.expireDate);
  const daysLeft = Math.ceil(
    (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = daysLeft <= 3 && daysLeft > 0;

  return (
    <View
      style={[
        styles.couponCard,
        (isExpired || coupon.used) && styles.couponCardDimmed,
      ]}
    >
      {/* Left dashed pattern */}
      <View style={styles.couponLeft}>
        <Text style={styles.couponAmount}>¥{coupon.discount}</Text>
        <Text style={styles.couponAmountLabel}>优惠券</Text>
      </View>

      {/* Dashed separator */}
      <View style={styles.couponSep} />

      {/* Right info */}
      <View style={styles.couponRight}>
        <View style={styles.couponProductRow}>
          <Image
            source={{ uri: coupon.product.image }}
            style={styles.couponProductImg}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.couponProductTitle} numberOfLines={1}>
              {coupon.product.title}
            </Text>
            <Text style={styles.couponCond}>
              满¥{coupon.product.originalPrice}可用
            </Text>
          </View>
        </View>
        <View style={styles.couponFooter}>
          <Text
            style={[
              styles.expireText,
              isExpiringSoon && styles.expireTextWarning,
              (isExpired || coupon.used) && styles.expireTextGray,
            ]}
          >
            {isExpired
              ? "已过期"
              : coupon.used
              ? "已使用"
              : isExpiringSoon
              ? `即将过期 (${daysLeft}天)`
              : `有效至 ${coupon.expireDate}`}
          </Text>
          {!isExpired && !coupon.used && (
            <Pressable
              style={styles.useBtn}
              onPress={() =>
                router.push({
                  pathname: "/product/[id]",
                  params: { id: coupon.product.id },
                })
              }
            >
              <Text style={styles.useBtnText}>去使用</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

export default function CouponsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { coupons } = useApp();

  const valid = coupons.filter((c) => !c.used && new Date(c.expireDate) >= new Date());
  const expired = coupons.filter((c) => c.used || new Date(c.expireDate) < new Date());

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.pageTitle}>我的卡包</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Valid coupons */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>可用券 ({valid.length})</Text>
        {valid.length === 0 ? (
          <View style={styles.emptySmall}>
            <Feather name="tag" size={28} color={C.textTertiary} />
            <Text style={styles.emptySmallText}>暂无可用优惠券</Text>
            <Pressable
              style={styles.goGetBtn}
              onPress={() => router.push("/search")}
            >
              <Text style={styles.goGetBtnText}>去领取</Text>
            </Pressable>
          </View>
        ) : (
          valid.map((c) => <CouponItem key={c.id} coupon={c} />)
        )}
      </View>

      {/* Expired coupons */}
      {expired.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>已使用 / 已过期 ({expired.length})</Text>
          {expired.map((c) => (
            <CouponItem key={c.id} coupon={c} />
          ))}
        </View>
      )}

      <View
        style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
      />
    </ScrollView>
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
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  pageTitle: { fontSize: 17, fontWeight: "700" as const, color: C.text },
  section: { padding: 14, gap: 10 },
  sectionLabel: { fontSize: 13, color: C.textSecondary, fontWeight: "600" as const },
  couponCard: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderRadius: 12,
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
  couponCardDimmed: { opacity: 0.5 },
  couponLeft: {
    width: 80,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 2,
  },
  couponAmount: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: C.primary,
  },
  couponAmountLabel: { fontSize: 11, color: C.primary },
  couponSep: {
    width: 1,
    backgroundColor: C.border,
    borderStyle: "dashed",
    marginVertical: 10,
  },
  couponRight: { flex: 1, padding: 12, gap: 8 },
  couponProductRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  couponProductImg: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: C.skeleton,
  },
  couponProductTitle: { fontSize: 13, color: C.text, fontWeight: "500" as const },
  couponCond: { fontSize: 11, color: C.textTertiary, marginTop: 2 },
  couponFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expireText: { fontSize: 11, color: C.textTertiary },
  expireTextWarning: { color: C.warning, fontWeight: "600" as const },
  expireTextGray: { color: C.textTertiary },
  useBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  useBtnText: { fontSize: 12, color: "#fff", fontWeight: "600" as const },
  emptySmall: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    gap: 10,
  },
  emptySmallText: { fontSize: 14, color: C.textTertiary },
  goGetBtn: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  goGetBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" as const },
});
