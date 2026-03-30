import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
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
import { Message } from "@/context/AppContext";

const C = Colors.light;

const MSG_TABS = [
  { id: "all", label: "全部" },
  { id: "system", label: "系统公告" },
  { id: "cashback", label: "返利提醒" },
];

const MSG_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  system: "bell",
  cashback: "dollar-sign",
  interaction: "heart",
};

const MSG_COLORS: Record<string, string> = {
  system: "#3B82F6",
  cashback: "#22C55E",
  interaction: "#EC4899",
};

function MessageItem({
  message,
  onPress,
}: {
  message: Message;
  onPress: () => void;
}) {
  const iconName = MSG_ICONS[message.type] ?? "bell";
  const iconColor = MSG_COLORS[message.type] ?? C.primary;
  const iconBg = iconColor + "20";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.messageItem,
        pressed && { backgroundColor: "#F9F9F9" },
      ]}
      onPress={onPress}
    >
      <View style={[styles.msgIconBg, { backgroundColor: iconBg }]}>
        <Feather name={iconName} size={18} color={iconColor} />
      </View>
      <View style={styles.msgContent}>
        <View style={styles.msgTitleRow}>
          <Text style={styles.msgTitle}>{message.title}</Text>
          {!message.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.msgText} numberOfLines={2}>
          {message.content}
        </Text>
        <Text style={styles.msgTime}>{message.time}</Text>
      </View>
    </Pressable>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [activeTab, setActiveTab] = useState("all");
  const { messages, markMessageRead, unreadCount } = useApp();

  const filtered = messages.filter(
    (m) => activeTab === "all" || m.type === activeTab
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.headerTitle}>
          <Text style={styles.pageTitle}>消息</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.tabBar}>
          {MSG_TABS.map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={40} color={C.textTertiary} />
            <Text style={styles.emptyText}>暂无消息</Text>
          </View>
        ) : (
          <View style={styles.messagesCard}>
            {filtered.map((msg, idx) => (
              <React.Fragment key={msg.id}>
                <MessageItem
                  message={msg}
                  onPress={() => markMessageRead(msg.id)}
                />
                {idx < filtered.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </View>
        )}
        <View
          style={{
            height: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84,
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: C.text,
  },
  unreadBadge: {
    backgroundColor: C.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  tabBar: {
    flexDirection: "row",
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: C.primary,
  },
  tabText: {
    fontSize: 14,
    color: C.textSecondary,
  },
  tabTextActive: {
    color: C.primary,
    fontWeight: "700" as const,
  },
  list: {
    flex: 1,
    padding: 14,
  },
  messagesCard: {
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
  messageItem: {
    flexDirection: "row",
    padding: 14,
    gap: 12,
  },
  msgIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  msgContent: {
    flex: 1,
    gap: 4,
  },
  msgTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  msgTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: C.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  msgText: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
  },
  msgTime: {
    fontSize: 11,
    color: C.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 68,
  },
  empty: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.textTertiary,
  },
});
