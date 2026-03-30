import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const C = Colors.light;

const SHARE_TIPS = [
  { icon: "share-2" as const, label: "生成分享海报", desc: "一键生成精美商品海报" },
  { icon: "users" as const, label: "邀请好友", desc: "好友下单你得佣金" },
  { icon: "gift" as const, label: "专属礼券", desc: "分享专属优惠码" },
];

const HOT_TOPICS = [
  { tag: "#今日必买", count: "2.3万人讨论" },
  { tag: "#618备战攻略", count: "1.8万人讨论" },
  { tag: "#薅羊毛指南", count: "3.1万人讨论" },
  { tag: "#隐藏优惠券", count: "1.2万人讨论" },
  { tag: "#好物推荐", count: "5.6万人讨论" },
];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ height: topPad + 10 }} />

      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>发现</Text>
      </View>

      {/* Share for rewards */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>分享有礼</Text>
          </View>
        </View>
        <View style={styles.shareCard}>
          <View style={styles.shareCardHeader}>
            <Feather name="zap" size={18} color={C.primary} />
            <Text style={styles.shareCardTitle}>分享商品，好友下单你得佣金</Text>
          </View>
          <Text style={styles.shareCardDesc}>
            复制专属链接或生成海报，分享给微信好友，每笔订单可获得额外奖励
          </Text>
          <View style={styles.shareTips}>
            {SHARE_TIPS.map((tip) => (
              <Pressable
                key={tip.label}
                style={({ pressed }) => [
                  styles.shareTipItem,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert("分享功能", `${tip.label}功能即将上线，敬请期待！`);
                }}
              >
                <View style={styles.shareTipIcon}>
                  <Feather name={tip.icon} size={20} color={C.primary} />
                </View>
                <Text style={styles.shareTipLabel}>{tip.label}</Text>
                <Text style={styles.shareTipDesc}>{tip.desc}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.shareNowBtn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/search");
            }}
          >
            <Feather name="share-2" size={16} color="#fff" />
            <Text style={styles.shareNowBtnText}>去分享商品</Text>
          </Pressable>
        </View>
      </View>

      {/* Hot topics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>热门话题</Text>
          </View>
        </View>
        <View style={styles.topicsCard}>
          {HOT_TOPICS.map((topic, idx) => (
            <React.Fragment key={topic.tag}>
              <Pressable
                style={({ pressed }) => [
                  styles.topicRow,
                  pressed && { backgroundColor: "#F9F9F9" },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  Alert.alert("话题", `${topic.tag} 功能即将上线`);
                }}
              >
                <View style={styles.topicLeft}>
                  <Text style={styles.topicRank}>{idx + 1}</Text>
                  <View>
                    <Text style={styles.topicTag}>{topic.tag}</Text>
                    <Text style={styles.topicCount}>{topic.count}</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={16} color={C.textTertiary} />
              </Pressable>
              {idx < HOT_TOPICS.length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Coming soon - 好物圈 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>好物圈</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>即将上线</Text>
            </View>
          </View>
        </View>
        <View style={styles.comingSoonCard}>
          <Feather name="image" size={36} color={C.textTertiary} />
          <Text style={styles.comingSoonDesc}>
            好物圈功能即将上线
          </Text>
          <Text style={styles.comingSoonSubDesc}>
            在这里晒单、种草、分享你的购物心得，与更多买家互动
          </Text>
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
  pageHeader: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: C.text,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 14,
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
  shareCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
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
  shareCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  shareCardTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: C.text,
  },
  shareCardDesc: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  shareTips: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  shareTipItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  shareTipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  shareTipLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: C.text,
    textAlign: "center",
  },
  shareTipDesc: {
    fontSize: 10,
    color: C.textTertiary,
    textAlign: "center",
  },
  shareNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
    borderRadius: 24,
    paddingVertical: 12,
    gap: 6,
  },
  shareNowBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600" as const,
  },
  topicsCard: {
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
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  topicLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  topicRank: {
    width: 20,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700" as const,
    color: C.primary,
  },
  topicTag: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: C.text,
  },
  topicCount: {
    fontSize: 11,
    color: C.textTertiary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 46,
  },
  comingSoonBadge: {
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  comingSoonText: {
    fontSize: 10,
    color: C.textSecondary,
  },
  comingSoonCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  comingSoonDesc: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: C.textSecondary,
  },
  comingSoonSubDesc: {
    fontSize: 13,
    color: C.textTertiary,
    textAlign: "center",
    lineHeight: 18,
  },
});
