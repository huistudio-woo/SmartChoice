import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { useApp } from "@/context/AppContext";
import { ALL_PRODUCTS, formatSales } from "@/data/products";

const C = Colors.light;

const PLATFORM_LABELS: Record<string, string> = {
  taobao: "淘宝",
  jd: "京东",
  pdd: "拼多多",
};

const PLATFORM_COLORS: Record<string, string> = {
  taobao: "#FF6000",
  jd: "#E53935",
  pdd: "#E65C00",
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { claimCoupon, addFootprint, coupons } = useApp();
  const [claimed, setClaimed] = useState(false);

  const product = ALL_PRODUCTS.find((p) => p.id === id);

  useEffect(() => {
    if (product) {
      addFootprint(product);
      const already = coupons.find((c) => c.product.id === product.id);
      if (already) setClaimed(true);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>商品不存在</Text>
      </View>
    );
  }

  const discount = Math.round(product.originalPrice - product.couponPrice);
  const discountRate = Math.round(
    (1 - product.couponPrice / product.originalPrice) * 100
  );
  const platformColor = PLATFORM_COLORS[product.platform] ?? C.primary;

  const handleClaim = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    claimCoupon(product);
    setClaimed(true);
    Alert.alert(
      "领券成功！",
      `已成功领取 ¥${discount} 优惠券\n预计获得返利 ¥${product.cashback}\n\n点击确认跳转${PLATFORM_LABELS[product.platform]}完成购买`,
      [
        { text: "稍后再说", style: "cancel" },
        {
          text: `去${PLATFORM_LABELS[product.platform]}购买`,
          style: "default",
          onPress: () => {},
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Navigation header */}
      <View style={[styles.navbar, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle}>商品详情</Text>
        <Pressable style={styles.navBtn}>
          <Feather name="share-2" size={22} color={C.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product image */}
        <Image source={{ uri: product.image }} style={styles.productImage} />

        {/* Product info */}
        <View style={styles.infoCard}>
          <Text style={styles.productTitle}>{product.title}</Text>

          {/* Price row */}
          <View style={styles.priceSection}>
            <View style={styles.priceMain}>
              <Text style={styles.couponLabel}>券后价</Text>
              <Text style={styles.couponPrice}>¥{product.couponPrice}</Text>
              <Text style={styles.originalPrice}>¥{product.originalPrice}</Text>
            </View>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountRate}折</Text>
            </View>
          </View>

          {/* Cashback highlight */}
          <View style={styles.cashbackBanner}>
            <Feather name="trending-up" size={14} color={C.cashback} />
            <Text style={styles.cashbackBannerText}>
              购买后可获得返利{" "}
              <Text style={styles.cashbackAmount}>¥{product.cashback}</Text>，预计3个工作日到账
            </Text>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            <View
              style={[styles.platformTag, { backgroundColor: platformColor }]}
            >
              <Text style={styles.platformTagText}>
                {PLATFORM_LABELS[product.platform]}
              </Text>
            </View>
            <View style={styles.infoTag}>
              <Text style={styles.infoTagText}>
                销量 {formatSales(product.sales)}
              </Text>
            </View>
            <View style={styles.infoTag}>
              <Text style={styles.infoTagText}>好评率 {product.rating}%</Text>
            </View>
          </View>
        </View>

        {/* Coupon detail */}
        <View style={styles.couponCard}>
          <View style={styles.couponCardLeft}>
            <View style={styles.couponAmount}>
              <Text style={styles.couponAmountLabel}>¥</Text>
              <Text style={styles.couponAmountValue}>{discount}</Text>
            </View>
            <View style={styles.couponAmountSub}>
              <Text style={styles.couponAmountSubText}>优惠券</Text>
              <Text style={styles.couponClaimedText}>
                已领 {formatSales(product.couponCount)} 人
              </Text>
            </View>
          </View>
          <View style={styles.couponCardDivider} />
          <View style={styles.couponCardRight}>
            <Text style={styles.couponCondText}>满 ¥{product.originalPrice} 可用</Text>
            <Text style={styles.couponExpireText}>有效期：领取后7天内有效</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>商品详情</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailKey}>商品编号</Text>
            <Text style={styles.detailVal}>{product.id.toUpperCase()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailKey}>商品分类</Text>
            <Text style={styles.detailVal}>{product.category}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailKey}>购物平台</Text>
            <Text style={[styles.detailVal, { color: platformColor }]}>
              {PLATFORM_LABELS[product.platform]}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailKey}>返利比例</Text>
            <Text style={[styles.detailVal, { color: C.cashback }]}>
              {((product.cashback / product.couponPrice) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={{ height: bottomPad + 90 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12 }]}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomCouponPrice}>¥{product.couponPrice}</Text>
          <Text style={styles.bottomCashback}>返 ¥{product.cashback}</Text>
        </View>
        <Pressable
          style={[styles.claimBtn, claimed && styles.claimBtnClaimed]}
          onPress={handleClaim}
          disabled={claimed}
        >
          <Feather
            name={claimed ? "check" : "tag"}
            size={16}
            color="#fff"
          />
          <Text style={styles.claimBtnText}>
            {claimed ? "已领券" : "一键领券"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 16,
    color: C.textSecondary,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: C.text,
  },
  productImage: {
    width: "100%",
    height: 320,
    backgroundColor: C.skeleton,
    resizeMode: "cover",
  },
  infoCard: {
    backgroundColor: C.card,
    padding: 16,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: C.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  priceMain: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  couponLabel: {
    fontSize: 12,
    color: C.primary,
    fontWeight: "600" as const,
    backgroundColor: "#FFF0F0",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  couponPrice: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: C.primary,
  },
  originalPrice: {
    fontSize: 13,
    color: C.textTertiary,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  cashbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
    padding: 10,
    gap: 6,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.cashback,
  },
  cashbackBannerText: {
    fontSize: 13,
    color: C.textSecondary,
    flex: 1,
  },
  cashbackAmount: {
    fontWeight: "700" as const,
    color: C.cashback,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  platformTag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  platformTagText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600" as const,
  },
  infoTag: {
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  infoTagText: {
    color: C.textSecondary,
    fontSize: 11,
  },
  couponCard: {
    flexDirection: "row",
    backgroundColor: C.card,
    marginHorizontal: 0,
    marginBottom: 8,
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  couponCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  couponAmount: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  couponAmountLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: C.primary,
  },
  couponAmountValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: C.primary,
  },
  couponAmountSub: {
    marginLeft: 6,
    gap: 2,
  },
  couponAmountSubText: {
    fontSize: 13,
    color: C.text,
    fontWeight: "600" as const,
  },
  couponClaimedText: {
    fontSize: 11,
    color: C.textTertiary,
  },
  couponCardDivider: {
    width: 1,
    height: 40,
    backgroundColor: C.border,
    marginHorizontal: 16,
    borderStyle: "dashed",
  },
  couponCardRight: {
    flex: 1,
    gap: 4,
  },
  couponCondText: {
    fontSize: 13,
    color: C.text,
  },
  couponExpireText: {
    fontSize: 11,
    color: C.textTertiary,
  },
  detailSection: {
    backgroundColor: C.card,
    padding: 16,
    gap: 12,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: C.text,
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailKey: {
    fontSize: 14,
    color: C.textSecondary,
  },
  detailVal: {
    fontSize: 14,
    color: C.text,
    fontWeight: "500" as const,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  bottomPriceInfo: {
    gap: 2,
  },
  bottomCouponPrice: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: C.primary,
  },
  bottomCashback: {
    fontSize: 12,
    color: C.cashback,
    fontWeight: "600" as const,
  },
  claimBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.primary,
    borderRadius: 26,
    paddingHorizontal: 28,
    paddingVertical: 13,
    gap: 6,
  },
  claimBtnClaimed: {
    backgroundColor: C.textTertiary,
  },
  claimBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
