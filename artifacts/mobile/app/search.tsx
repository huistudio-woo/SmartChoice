import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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

const SORT_OPTIONS = [
  { label: "综合", key: "default" },
  { label: "销量", key: "sales" },
  { label: "价格↑", key: "price_asc" },
  { label: "价格↓", key: "price_desc" },
  { label: "返利", key: "cashback" },
];

const PLATFORM_OPTIONS = [
  { id: "all", label: "全部" },
  { id: "taobao", label: "淘宝" },
  { id: "jd", label: "京东" },
  { id: "pdd", label: "拼多多" },
];

const HOT_SEARCHES = [
  "耳机", "护肤品", "运动鞋", "咖啡", "零食大礼包",
  "扫地机器人", "充电宝", "洗面奶", "保温杯", "蓝牙音箱",
];

const HISTORY_KEY = "zhixuan_search_history";
const MAX_HISTORY = 10;

function getSuggestions(query: string): string[] {
  if (!query.trim()) return [];
  const kw = query.toLowerCase();
  const titles = ALL_PRODUCTS.map((p) => p.title);
  const categories = [...new Set(ALL_PRODUCTS.map((p) => p.category))];
  const all = [...HOT_SEARCHES, ...categories, ...titles.map((t) => t.slice(0, 8))];
  return [...new Set(all.filter((s) => s.toLowerCase().includes(kw)))].slice(0, 6);
}

function sortResults(
  products: Product[],
  sortKey: string,
  platform: string
): Product[] {
  let list = platform === "all" ? products : products.filter((p) => p.platform === platform);
  switch (sortKey) {
    case "sales":
      return [...list].sort((a, b) => b.sales - a.sales);
    case "price_asc":
      return [...list].sort((a, b) => a.couponPrice - b.couponPrice);
    case "price_desc":
      return [...list].sort((a, b) => b.couponPrice - a.couponPrice);
    case "cashback":
      return [...list].sort((a, b) => b.cashback - a.cashback);
    default:
      return list;
  }
}

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState(q ?? "");
  const [committed, setCommitted] = useState(q ?? ""); // the query actually searched
  const [isFocused, setIsFocused] = useState(!q);
  const [sort, setSort] = useState("default");
  const [platform, setPlatform] = useState("all");
  const [history, setHistory] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const suggestions = getSuggestions(query);
  const showSuggestions = isFocused && query.trim().length > 0 && suggestions.length > 0;
  const showPreSearch = isFocused && query.trim().length === 0;

  // Load history
  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((data) => {
      if (data) setHistory(JSON.parse(data));
    });
  }, []);

  // Run search when committed query or filters change
  useEffect(() => {
    const base = committed.trim()
      ? searchProducts(committed)
      : [...ALL_PRODUCTS];
    setResults(sortResults(base, sort, platform));
  }, [committed, sort, platform]);

  const saveHistory = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((h) => h !== trimmed)].slice(0, MAX_HISTORY);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  const commitSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      Haptics.selectionAsync();
      setQuery(trimmed);
      setCommitted(trimmed);
      setIsFocused(false);
      inputRef.current?.blur();
      saveHistory(trimmed);
    },
    [saveHistory]
  );

  const handleTagPress = useCallback(
    (tag: string) => {
      setQuery(tag);
      commitSearch(tag);
    },
    [commitSearch]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setCommitted("");
    setIsFocused(true);
    inputRef.current?.focus();
  }, []);

  const activeFilters = (sort !== "default" ? 1 : 0) + (platform !== "all" ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Feather name="search" size={15} color={C.textTertiary} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            onSubmitEditing={() => commitSearch(query)}
            placeholder="搜商品或粘贴电商链接..."
            placeholderTextColor={C.textTertiary}
            returnKeyType="search"
            autoFocus={!q}
          />
          {query ? (
            <Pressable onPress={handleClear} hitSlop={8}>
              <Feather name="x-circle" size={16} color={C.textTertiary} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          style={styles.searchConfirmBtn}
          onPress={() => commitSearch(query)}
        >
          <Text style={styles.searchConfirmText}>搜索</Text>
        </Pressable>
      </View>

      {/* ── Autocomplete suggestions (inline, below header) ── */}
      {showSuggestions && (
        <View style={styles.suggestionsPanel}>
          {suggestions.map((s) => (
            <Pressable
              key={s}
              style={({ pressed }) => [
                styles.suggestionRow,
                pressed && { backgroundColor: "#F5F5F5" },
              ]}
              onPress={() => handleTagPress(s)}
            >
              <Feather name="search" size={14} color={C.textTertiary} />
              <Text style={styles.suggestionText} numberOfLines={1}>
                {s}
              </Text>
              <Pressable
                onPress={() => { setQuery(s); }}
                hitSlop={8}
                style={styles.fillIcon}
              >
                <Feather name="arrow-up-left" size={14} color={C.textTertiary} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      )}

      {/* ── Pre-search panel (history + hot) ── */}
      {!showSuggestions && showPreSearch ? (
        <ScrollView style={styles.preSearch} showsVerticalScrollIndicator={false}>
          {history.length > 0 && (
            <View style={styles.preSection}>
              <View style={styles.preSectionHeader}>
                <Text style={styles.preSectionTitle}>搜索历史</Text>
                <Pressable onPress={clearHistory} hitSlop={8}>
                  <Feather name="trash-2" size={16} color={C.textTertiary} />
                </Pressable>
              </View>
              <View style={styles.tagWrap}>
                {history.map((h) => (
                  <Pressable key={h} style={styles.historyTag} onPress={() => handleTagPress(h)}>
                    <Feather name="clock" size={12} color={C.textSecondary} />
                    <Text style={styles.historyTagText}>{h}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.preSection}>
            <View style={styles.preSectionHeader}>
              <Text style={styles.preSectionTitle}>🔥 热门搜索</Text>
            </View>
            <View style={styles.tagWrap}>
              {HOT_SEARCHES.map((h, idx) => (
                <Pressable key={h} style={styles.hotTag} onPress={() => handleTagPress(h)}>
                  {idx < 3 && (
                    <Text style={styles.hotRank}>{idx + 1}</Text>
                  )}
                  <Text style={[styles.hotTagText, idx < 3 && styles.hotTagTextTop]}>
                    {h}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* ── Sort + filter bar ── */}
          <View style={styles.sortBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
              {SORT_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  style={[styles.sortBtn, sort === opt.key && styles.sortBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSort(opt.key);
                  }}
                >
                  <Text style={[styles.sortText, sort === opt.key && styles.sortTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setShowFilter(true);
              }}
            >
              <Feather
                name="sliders"
                size={14}
                color={activeFilters > 0 ? C.primary : C.textSecondary}
              />
              <Text style={[styles.filterText, activeFilters > 0 && styles.filterTextActive]}>
                筛选
              </Text>
              {activeFilters > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilters}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* ── Result count + active platform chip ── */}
          <View style={styles.resultMeta}>
            <Text style={styles.resultCountText}>
              共 {results.length} 件商品
            </Text>
            {platform !== "all" && (
              <Pressable
                style={styles.activePlatformChip}
                onPress={() => setPlatform("all")}
              >
                <Text style={styles.activePlatformText}>
                  {PLATFORM_OPTIONS.find((p) => p.id === platform)?.label}
                </Text>
                <Feather name="x" size={12} color={C.primary} />
              </Pressable>
            )}
          </View>

          {/* ── Results grid ── */}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View style={styles.gridItem}>
                <ProductCard
                  product={item}
                  onPress={() =>
                    router.push({ pathname: "/product/[id]", params: { id: item.id } })
                  }
                />
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name="search" size={40} color={C.textTertiary} />
                <Text style={styles.emptyText}>未找到相关商品</Text>
                <Text style={styles.emptySubText}>换个关键词试试看</Text>
                <Pressable
                  style={styles.clearFilterBtn}
                  onPress={() => { setPlatform("all"); setSort("default"); }}
                >
                  <Text style={styles.clearFilterText}>清除筛选条件</Text>
                </Pressable>
              </View>
            }
            ListFooterComponent={
              <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 20 }} />
            }
          />
        </>
      )}

      {/* ── Filter bottom sheet ── */}
      <Modal
        visible={showFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowFilter(false)} />
        <View style={[styles.filterSheet, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 16 }]}>
          <View style={styles.sheetHandle} />

          <Text style={styles.sheetTitle}>筛选</Text>

          {/* Platform filter */}
          <Text style={styles.filterGroupLabel}>购物平台</Text>
          <View style={styles.filterOptions}>
            {PLATFORM_OPTIONS.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.filterOption, platform === p.id && styles.filterOptionActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setPlatform(p.id);
                }}
              >
                <Text style={[styles.filterOptionText, platform === p.id && styles.filterOptionTextActive]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Sort filter */}
          <Text style={styles.filterGroupLabel}>排序方式</Text>
          <View style={styles.filterOptions}>
            {SORT_OPTIONS.map((s) => (
              <Pressable
                key={s.key}
                style={[styles.filterOption, sort === s.key && styles.filterOptionActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSort(s.key);
                }}
              >
                <Text style={[styles.filterOptionText, sort === s.key && styles.filterOptionTextActive]}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sheetActions}>
            <Pressable
              style={styles.resetBtn}
              onPress={() => {
                Haptics.selectionAsync();
                setSort("default");
                setPlatform("all");
              }}
            >
              <Text style={styles.resetBtnText}>重置</Text>
            </Pressable>
            <Pressable
              style={styles.applyBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowFilter(false);
              }}
            >
              <Text style={styles.applyBtnText}>确认</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.primary,
    paddingHorizontal: 10,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  searchBarFocused: { borderColor: "rgba(255,255,255,0.6)" },
  searchInput: { flex: 1, fontSize: 14, color: C.text, padding: 0 },
  searchConfirmBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchConfirmText: { color: "#fff", fontSize: 15, fontWeight: "600" as const },

  // Autocomplete suggestions
  suggestionsPanel: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  suggestionText: { flex: 1, fontSize: 14, color: C.text },
  fillIcon: { padding: 4 },

  // Pre-search (history + hot)
  preSearch: { flex: 1 },
  preSection: { padding: 16, gap: 12 },
  preSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  preSectionTitle: { fontSize: 15, fontWeight: "700" as const, color: C.text },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  historyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
  },
  historyTagText: { fontSize: 13, color: C.textSecondary },
  hotTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
  },
  hotRank: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: C.primary,
    minWidth: 14,
  },
  hotTagText: { fontSize: 13, color: C.textSecondary },
  hotTagTextTop: { color: C.text, fontWeight: "600" as const },

  // Sort bar
  sortBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sortScroll: { paddingHorizontal: 8, paddingVertical: 8, gap: 2 },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  sortBtnActive: { backgroundColor: "#FFF0F0" },
  sortText: { fontSize: 13, color: C.textSecondary },
  sortTextActive: { color: C.primary, fontWeight: "700" as const },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    borderLeftWidth: 1,
    borderLeftColor: C.border,
    marginLeft: "auto",
    position: "relative",
  },
  filterBtnActive: { backgroundColor: "#FFF0F0" },
  filterText: { fontSize: 13, color: C.textSecondary },
  filterTextActive: { color: C.primary, fontWeight: "600" as const },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { fontSize: 9, color: "#fff", fontWeight: "700" as const },

  // Result meta
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  resultCountText: { fontSize: 12, color: C.textTertiary },
  activePlatformChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.primaryLight,
  },
  activePlatformText: { fontSize: 11, color: C.primary, fontWeight: "600" as const },

  // Grid
  grid: { paddingHorizontal: 10, paddingTop: 4, paddingBottom: 20, gap: 10 },
  row: { gap: 10 },
  gridItem: { flex: 1 },

  // Empty
  empty: { paddingVertical: 60, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "600" as const, color: C.textSecondary },
  emptySubText: { fontSize: 13, color: C.textTertiary },
  clearFilterBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.primary,
  },
  clearFilterText: { fontSize: 13, color: C.primary, fontWeight: "600" as const },

  // Filter modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  filterSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700" as const, color: C.text },
  filterGroupLabel: { fontSize: 13, fontWeight: "600" as const, color: C.textSecondary },
  filterOptions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  filterOptionActive: { borderColor: C.primary, backgroundColor: "#FFF0F0" },
  filterOptionText: { fontSize: 13, color: C.textSecondary },
  filterOptionTextActive: { color: C.primary, fontWeight: "700" as const },
  sheetActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  resetBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
  },
  resetBtnText: { fontSize: 15, color: C.textSecondary, fontWeight: "600" as const },
  applyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 24,
    backgroundColor: C.primary,
    alignItems: "center",
  },
  applyBtnText: { fontSize: 15, color: "#fff", fontWeight: "700" as const },
});
