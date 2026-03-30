import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BigCouponCard, ProductCard } from "@/components/ProductCard";
import Colors from "@/constants/colors";
import {
  BIG_COUPON_PRODUCTS,
  HOT_PRODUCTS,
  PLATFORMS,
  RECOMMEND_PRODUCTS,
} from "@/data/products";
import { Product } from "@/context/AppContext";

const C = Colors.light;

const RANK_TABS = ["热销榜", "飙升榜", "高返榜"];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [rankTab, setRankTab] = useState(0);
  const [searchText, setSearchText] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({ pathname: "/search", params: { q: searchText.trim() } });
    }
  };

  const handleProductPress = (product: Product) => {
    router.push({ pathname: "/product/[id]", params: { id: product.id } });
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
    >
      {/* Sticky header */}
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={C.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜商品或粘贴电商链接领券..."
            placeholderTextColor={C.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText ? (
            <Pressable onPress={() => setSearchText("")}>
              <Feather name="x" size={16} color={C.textTertiary} />
            </Pressable>
          ) : null}
          <Pressable style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>搜索</Text>
          </Pressable>
        </View>
      </View>

      {/* Platform categories */}
      <View style={styles.section}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.platformList}
        >
          {PLATFORMS.map((p) => (
            <Pressable
              key={p.id}
              style={[
                styles.platformChip,
                selectedPlatform === p.id && styles.platformChipActive,
              ]}
              onPress={() => setSelectedPlatform(p.id)}
            >
              <Text
                style={[
                  styles.platformChipText,
                  selectedPlatform === p.id && styles.platformChipTextActive,
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Hot Ranking */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>爆款榜单</Text>
          </View>
          <View style={styles.rankTabs}>
            {RANK_TABS.map((tab, idx) => (
              <Pressable
                key={tab}
                style={[
                  styles.rankTab,
                  rankTab === idx && styles.rankTabActive,
                ]}
                onPress={() => setRankTab(idx)}
              >
                <Text
                  style={[
                    styles.rankTabText,
                    rankTab === idx && styles.rankTabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <FlatList
          data={HOT_PRODUCTS}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hotList}
          renderItem={({ item, index }) => (
            <View style={{ width: 140 }}>
              <View style={styles.rankBadgeContainer}>
                <View
                  style={[
                    styles.rankBadge,
                    index < 3 && styles.rankBadgeTop,
                  ]}
                >
                  <Text
                    style={[
                      styles.rankBadgeText,
                      index < 3 && styles.rankBadgeTextTop,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
              </View>
              <ProductCard
                product={item}
                onPress={() => handleProductPress(item)}
              />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        />
      </View>

      {/* Big Coupon Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>大额券专区</Text>
            <View style={styles.hotBadge}>
              <Text style={styles.hotBadgeText}>隐藏好价</Text>
            </View>
          </View>
          <Pressable>
            <Text style={styles.moreText}>查看更多</Text>
          </Pressable>
        </View>
        {BIG_COUPON_PRODUCTS.map((product) => (
          <BigCouponCard
            key={product.id}
            product={product}
            onPress={() => handleProductPress(product)}
          />
        ))}
      </View>

      {/* Recommend */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>为你推荐</Text>
          </View>
        </View>
        <View style={styles.grid}>
          {RECOMMEND_PRODUCTS.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard
                product={product}
                onPress={() => handleProductPress(product)}
              />
            </View>
          ))}
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
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    padding: 0,
  },
  searchBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600" as const,
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 14,
  },
  platformList: {
    paddingVertical: 8,
    gap: 8,
  },
  platformChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  platformChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  platformChipText: {
    fontSize: 13,
    color: C.textSecondary,
    fontWeight: "500" as const,
  },
  platformChipTextActive: {
    color: "#fff",
    fontWeight: "600" as const,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionDot: {
    width: 4,
    height: 16,
    backgroundColor: C.primary,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: C.text,
  },
  hotBadge: {
    backgroundColor: "#FFF0F0",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  hotBadgeText: {
    fontSize: 10,
    color: C.primary,
    fontWeight: "600" as const,
  },
  moreText: {
    fontSize: 12,
    color: C.textTertiary,
  },
  rankTabs: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 14,
    padding: 2,
  },
  rankTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankTabActive: {
    backgroundColor: C.primary,
  },
  rankTabText: {
    fontSize: 11,
    color: C.textSecondary,
  },
  rankTabTextActive: {
    color: "#fff",
    fontWeight: "600" as const,
  },
  hotList: {
    paddingBottom: 4,
  },
  rankBadgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  rankBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeTop: {
    backgroundColor: C.primary,
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#666",
  },
  rankBadgeTextTop: {
    color: "#fff",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "47.5%",
  },
});
