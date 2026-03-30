import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const C = Colors.light;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [pushEnabled, setPushEnabled] = useState(true);
  const [cashbackPush, setCashbackPush] = useState(true);
  const [activityPush, setActivityPush] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.pageTitle}>设置</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>账号设置</Text>
        <View style={styles.card}>
          {[
            { label: "绑定手机号", value: "138****8888" },
            { label: "绑定微信", value: "已绑定" },
            { label: "绑定支付宝", value: "未绑定", valueColor: C.warning },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.label}>
              <Pressable
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: "#F9F9F9" }]}
                onPress={() => Haptics.selectionAsync()}
              >
                <Text style={styles.rowLabel}>{item.label}</Text>
                <View style={styles.rowRight}>
                  <Text style={[styles.rowValue, item.valueColor ? { color: item.valueColor } : {}]}>
                    {item.value}
                  </Text>
                  <Feather name="chevron-right" size={16} color={C.textTertiary} />
                </View>
              </Pressable>
              {idx < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Push notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>推送设置</Text>
        <View style={styles.card}>
          {[
            { label: "消息推送", value: pushEnabled, setter: setPushEnabled },
            { label: "返利到账提醒", value: cashbackPush, setter: setCashbackPush },
            { label: "活动消息推送", value: activityPush, setter: setActivityPush },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.label}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Switch
                  value={item.value}
                  onValueChange={(v) => {
                    Haptics.selectionAsync();
                    item.setter(v);
                  }}
                  trackColor={{ false: C.border, true: C.primary }}
                  thumbColor="#fff"
                />
              </View>
              {idx < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Help */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>帮助与反馈</Text>
        <View style={styles.card}>
          {[
            { label: "常见问题" },
            { label: "联系客服" },
            { label: "意见反馈" },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.label}>
              <Pressable
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: "#F9F9F9" }]}
                onPress={() => Haptics.selectionAsync()}
              >
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={16} color={C.textTertiary} />
              </Pressable>
              {idx < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: "#F9F9F9" }]}
            onPress={() => Haptics.selectionAsync()}
          >
            <Text style={styles.rowLabel}>关于智选</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>v1.0.0</Text>
              <Feather name="chevron-right" size={16} color={C.textTertiary} />
            </View>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: "#F9F9F9" }]}
            onPress={() => Haptics.selectionAsync()}
          >
            <Text style={styles.rowLabel}>隐私政策</Text>
            <Feather name="chevron-right" size={16} color={C.textTertiary} />
          </Pressable>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <Pressable
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert("退出登录", "确定要退出登录吗？", [
              { text: "取消", style: "cancel" },
              { text: "退出", style: "destructive", onPress: () => {} },
            ])
          }
        >
          <Text style={styles.logoutText}>退出登录</Text>
        </Pressable>
      </View>

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
  section: { padding: 14, gap: 8 },
  sectionTitle: { fontSize: 13, color: C.textSecondary, fontWeight: "600" as const },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      web: { boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: { fontSize: 15, color: C.text },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  rowValue: { fontSize: 13, color: C.textTertiary },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 16 },
  logoutBtn: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFCCCC",
  },
  logoutText: { fontSize: 15, fontWeight: "600" as const, color: C.error },
});
