import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { Product } from "@/context/AppContext";
import { formatSales } from "@/data/products";

const C = Colors.light;

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  taobao: { bg: "#FF6000", text: "#fff" },
  jd: { bg: "#E53935", text: "#fff" },
  pdd: { bg: "#E65C00", text: "#fff" },
};

const PLATFORM_LABELS: Record<string, string> = {
  taobao: "淘宝",
  jd: "京东",
  pdd: "拼多多",
};

interface Props {
  product: Product;
  onPress: () => void;
  style?: object;
}

export function ProductCard({ product, onPress, style }: Props) {
  const platformColor = PLATFORM_COLORS[product.platform] ?? {
    bg: C.primary,
    text: "#fff",
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View
          style={[styles.platformBadge, { backgroundColor: platformColor.bg }]}
        >
          <Text style={[styles.platformText, { color: platformColor.text }]}>
            {PLATFORM_LABELS[product.platform]}
          </Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.couponPrice}>¥{product.couponPrice}</Text>
          <Text style={styles.originalPrice}>¥{product.originalPrice}</Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.cashbackTag}>
            <Feather name="trending-up" size={10} color={C.cashback} />
            <Text style={styles.cashbackText}>返¥{product.cashback}</Text>
          </View>
          <Text style={styles.sales}>
            {formatSales(product.sales)}人购买
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

interface BigCouponCardProps {
  product: Product;
  onPress: () => void;
}

export function BigCouponCard({ product, onPress }: BigCouponCardProps) {
  const discount = Math.round(product.originalPrice - product.couponPrice);

  return (
    <Pressable
      style={({ pressed }) => [styles.bigCard, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Image
        source={{ uri: product.image }}
        style={styles.bigImage}
        resizeMode="cover"
      />
      <View style={styles.bigInfo}>
        <Text style={styles.bigTitle} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.bigPriceRow}>
          <View style={styles.couponTagBig}>
            <Text style={styles.couponTagText}>券¥{discount}</Text>
          </View>
          <Text style={styles.bigCouponPrice}>¥{product.couponPrice}</Text>
          <Text style={styles.bigOriginalPrice}>¥{product.originalPrice}</Text>
        </View>
        <View style={styles.bigBottomRow}>
          <View style={styles.cashbackTagBig}>
            <Text style={styles.cashbackTagBigText}>返¥{product.cashback}</Text>
          </View>
          <Text style={styles.claimedText}>
            已领{formatSales(product.couponCount)}人
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: C.skeleton,
  },
  platformBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  platformText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  info: {
    padding: 8,
    gap: 4,
  },
  title: {
    fontSize: 12,
    color: C.text,
    lineHeight: 16,
    fontWeight: "500" as const,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  couponPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: C.primary,
  },
  originalPrice: {
    fontSize: 11,
    color: C.textTertiary,
    textDecorationLine: "line-through",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cashbackTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 2,
  },
  cashbackText: {
    fontSize: 10,
    color: C.cashback,
    fontWeight: "600" as const,
  },
  sales: {
    fontSize: 10,
    color: C.textTertiary,
  },
  // Big coupon card
  bigCard: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
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
  bigImage: {
    width: 90,
    height: 90,
    backgroundColor: C.skeleton,
  },
  bigInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  bigTitle: {
    fontSize: 13,
    color: C.text,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  bigPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  couponTagBig: {
    backgroundColor: C.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  couponTagText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "700" as const,
  },
  bigCouponPrice: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: C.primary,
  },
  bigOriginalPrice: {
    fontSize: 11,
    color: C.textTertiary,
    textDecorationLine: "line-through",
  },
  bigBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cashbackTagBig: {
    backgroundColor: "#FFF0F0",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cashbackTagBigText: {
    fontSize: 11,
    color: C.cashback,
    fontWeight: "600" as const,
  },
  claimedText: {
    fontSize: 11,
    color: C.textTertiary,
  },
});
