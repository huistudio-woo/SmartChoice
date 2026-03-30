import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductCard } from "@/components/ProductCard";
import Colors from "@/constants/colors";
import { Product } from "@/context/AppContext";
import { ALL_PRODUCTS, searchProducts } from "@/data/products";

const C = Colors.light;

const SORT_OPTIONS = ["综合", "销量", "价格"];

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [query, setQuery] = useState(q ?? "");
  const [sort, setSort] = useState(0);
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (query.trim()) {
      let found = searchProducts(query);
      if (sort === 1) found = [...found].sort((a, b) => b.sales - a.sales);
      if (sort === 2)
        found = [...found].sort((a, b) => a.couponPrice - b.couponPrice);
      setResults(found);
    } else {
      let all = [...ALL_PRODUCTS];
      if (sort === 1) all = all.sort((a, b) => b.sales - a.sales);
      if (sort === 2)
        all = all.sort((a, b) => a.couponPrice - b.couponPrice);
      setResults(all);
    }
  }, [query, sort]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.searchBar}>
          <Feather name="search" size={15} color={C.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="搜商品或粘贴链接..."
            placeholderTextColor={C.textTertiary}
            returnKeyType="search"
            autoFocus={!q}
          />
          {query ? (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={15} color={C.textTertiary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Sort bar */}
      <View style={styles.sortBar}>
        {SORT_OPTIONS.map((opt, idx) => (
          <Pressable
            key={opt}
            style={[styles.sortBtn, sort === idx && styles.sortBtnActive]}
            onPress={() => setSort(idx)}
          >
            <Text
              style={[
                styles.sortText,
                sort === idx && styles.sortTextActive,
              ]}
            >
              {opt}
            </Text>
            {sort === idx && (
              <Feather name="chevron-down" size={12} color={C.primary} />
            )}
          </Pressable>
        ))}
        <View style={styles.filterBtn}>
          <Feather name="sliders" size={14} color={C.textSecondary} />
          <Text style={styles.filterText}>筛选</Text>
        </View>
      </View>

      {/* Results count */}
      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>
          共找到 {results.length} 件商品
        </Text>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProductCard
              product={item}
              onPress={() =>
                router.push({
                  pathname: "/product/[id]",
                  params: { id: item.id },
                })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={40} color={C.textTertiary} />
            <Text style={styles.emptyText}>未找到相关商品</Text>
            <Text style={styles.emptySubText}>换个关键词试试看</Text>
          </View>
        }
        ListFooterComponent={
          <View
            style={{
              height: Platform.OS === "web" ? 34 : insets.bottom + 20,
            }}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.primary,
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    padding: 0,
  },
  sortBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 4,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 2,
  },
  sortBtnActive: {
    backgroundColor: "#FFF0F0",
  },
  sortText: {
    fontSize: 13,
    color: C.textSecondary,
  },
  sortTextActive: {
    color: C.primary,
    fontWeight: "600" as const,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterText: {
    fontSize: 13,
    color: C.textSecondary,
  },
  resultCount: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  resultCountText: {
    fontSize: 12,
    color: C.textTertiary,
  },
  grid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    gap: 10,
  },
  row: {
    gap: 10,
  },
  gridItem: {
    flex: 1,
  },
  empty: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: C.textSecondary,
  },
  emptySubText: {
    fontSize: 13,
    color: C.textTertiary,
  },
});
