import { Feather } from "@expo/vector-icons";
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
import { ProductCard } from "@/components/ProductCard";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { Product } from "@/context/AppContext";
import { RECOMMEND_PRODUCTS } from "@/data/products";

const C = Colors.light;

export default function FootprintScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { footprints } = useApp();

  const displayProducts: Product[] = footprints.length > 0 ? footprints : RECOMMEND_PRODUCTS.slice(0, 4);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.pageTitle}>历史足迹</Text>
        <View style={{ width: 40 }} />
      </View>

      {displayProducts.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="eye-off" size={40} color={C.textTertiary} />
          <Text style={styles.emptyText}>暂无浏览记录</Text>
          <Pressable style={styles.goBtn} onPress={() => router.push("/search")}>
            <Text style={styles.goBtnText}>去逛逛</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.grid}>
          {displayProducts.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard
                product={product}
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: product.id },
                  })
                }
              />
            </View>
          ))}
        </View>
      )}

      <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 20 }} />
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 14,
  },
  gridItem: { width: "47.5%" },
  empty: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 12,
  },
  emptyText: { fontSize: 15, color: C.textTertiary },
  goBtn: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 9,
    marginTop: 4,
  },
  goBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" as const },
});
