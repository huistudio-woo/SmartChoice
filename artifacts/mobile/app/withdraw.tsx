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
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const C = Colors.light;

const QUICK_AMOUNTS = [1, 5, 10, 20];

export default function WithdrawScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { withdrawableAmount, submitWithdraw, withdrawHistory } = useApp();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"wechat" | "alipay">("wechat");
  const [loading, setLoading] = useState(false);

  const parsedAmount = parseFloat(amount);
  const isValid =
    !isNaN(parsedAmount) &&
    parsedAmount >= 1 &&
    parsedAmount <= withdrawableAmount;

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert("提示", "提现金额不合法，请重新输入");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    await submitWithdraw(parsedAmount, method);
    setLoading(false);
    Alert.alert(
      "提交成功",
      `提现申请已提交，¥${parsedAmount} 预计1-3个工作日到账`,
      [{ text: "确定", onPress: () => router.back() }]
    );
  };

  const STATUS_LABELS = {
    processing: { label: "处理中", color: C.warning },
    success: { label: "成功", color: C.success },
    failed: { label: "失败", color: C.error },
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.pageTitle}>提现</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Available amount */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>可提现金额（元）</Text>
        <Text style={styles.balanceAmount}>¥{withdrawableAmount.toFixed(2)}</Text>
        <Text style={styles.balanceNote}>单次提现金额 ≥ ¥1.00</Text>
      </View>

      {/* Amount selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>提现金额</Text>
        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map((a) => (
            <Pressable
              key={a}
              style={[
                styles.quickBtn,
                amount === String(a) && styles.quickBtnActive,
                a > withdrawableAmount && styles.quickBtnDisabled,
              ]}
              onPress={() => setAmount(String(a))}
              disabled={a > withdrawableAmount}
            >
              <Text
                style={[
                  styles.quickBtnText,
                  amount === String(a) && styles.quickBtnTextActive,
                  a > withdrawableAmount && styles.quickBtnTextDisabled,
                ]}
              >
                ¥{a}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.quickBtn, !QUICK_AMOUNTS.map(String).includes(amount) && amount ? styles.quickBtnActive : {}]}
            onPress={() => setAmount("")}
          >
            <Text style={styles.quickBtnText}>自定义</Text>
          </Pressable>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.currencySymbol}>¥</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="输入提现金额"
            placeholderTextColor={C.textTertiary}
            keyboardType="decimal-pad"
          />
          {amount ? (
            <Pressable onPress={() => setAmount("")}>
              <Feather name="x-circle" size={18} color={C.textTertiary} />
            </Pressable>
          ) : null}
        </View>
        {amount && !isValid && (
          <Text style={styles.errorText}>
            {parsedAmount < 1
              ? "最低提现金额为 ¥1.00"
              : `最高可提现 ¥${withdrawableAmount.toFixed(2)}`}
          </Text>
        )}
      </View>

      {/* Payment method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>提现方式</Text>
        <View style={styles.methodsRow}>
          {(
            [
              { key: "wechat", label: "微信支付", icon: "message-circle" },
              { key: "alipay", label: "支付宝", icon: "credit-card" },
            ] as const
          ).map((m) => (
            <Pressable
              key={m.key}
              style={[
                styles.methodBtn,
                method === m.key && styles.methodBtnActive,
              ]}
              onPress={() => setMethod(m.key)}
            >
              <Feather
                name={m.icon}
                size={20}
                color={method === m.key ? C.primary : C.textSecondary}
              />
              <Text
                style={[
                  styles.methodLabel,
                  method === m.key && styles.methodLabelActive,
                ]}
              >
                {m.label}
              </Text>
              {method === m.key && (
                <View style={styles.checkMark}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
              )}
            </Pressable>
          ))}
        </View>
        <View style={styles.accountInfo}>
          <Feather name="info" size={14} color={C.textTertiary} />
          <Text style={styles.accountInfoText}>
            提现将转入您绑定的
            {method === "wechat" ? "微信" : "支付宝"}账户
          </Text>
        </View>
      </View>

      {/* Submit */}
      <View style={styles.section}>
        <Pressable
          style={[styles.submitBtn, (!isValid || loading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? "处理中..." : "确认提现"}
          </Text>
        </Pressable>
        <Text style={styles.submitNote}>预计1-3个工作日到账</Text>
      </View>

      {/* History */}
      {withdrawHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>提现记录</Text>
          <View style={styles.historyCard}>
            {withdrawHistory.map((record, idx) => {
              const st = STATUS_LABELS[record.status];
              return (
                <React.Fragment key={record.id}>
                  <View style={styles.historyRow}>
                    <View>
                      <Text style={styles.historyAmount}>
                        ¥{record.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.historyMeta}>
                        {record.method === "wechat" ? "微信" : "支付宝"} ·{" "}
                        {record.time}
                      </Text>
                    </View>
                    <Text style={[styles.historyStatus, { color: st.color }]}>
                      {st.label}
                    </Text>
                  </View>
                  {idx < withdrawHistory.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>
      )}

      <View style={{ height: bottomPad + 20 }} />
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
  balanceCard: {
    backgroundColor: C.primary,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  balanceLabel: { fontSize: 14, color: "rgba(255,255,255,0.85)" },
  balanceAmount: { fontSize: 40, fontWeight: "700" as const, color: "#fff" },
  balanceNote: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  section: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700" as const, color: C.text },
  quickAmounts: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  quickBtn: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    backgroundColor: C.card,
  },
  quickBtnActive: { borderColor: C.primary, backgroundColor: "#FFF0F0" },
  quickBtnDisabled: { opacity: 0.4 },
  quickBtnText: { fontSize: 14, fontWeight: "600" as const, color: C.text },
  quickBtnTextActive: { color: C.primary },
  quickBtnTextDisabled: { color: C.textTertiary },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    gap: 8,
  },
  currencySymbol: { fontSize: 20, color: C.text, fontWeight: "600" as const },
  amountInput: { flex: 1, fontSize: 22, fontWeight: "700" as const, color: C.text, paddingVertical: 12 },
  errorText: { fontSize: 12, color: C.error },
  methodsRow: { flexDirection: "row", gap: 12 },
  methodBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    position: "relative",
  },
  methodBtnActive: { borderColor: C.primary, backgroundColor: "#FFF0F0" },
  methodLabel: { fontSize: 14, color: C.textSecondary, fontWeight: "500" as const },
  methodLabelActive: { color: C.primary, fontWeight: "700" as const },
  checkMark: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  accountInfoText: { fontSize: 12, color: C.textTertiary },
  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: { backgroundColor: C.textTertiary },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const },
  submitNote: { fontSize: 12, color: C.textTertiary, textAlign: "center" },
  historyCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  historyAmount: { fontSize: 16, fontWeight: "700" as const, color: C.text },
  historyMeta: { fontSize: 11, color: C.textTertiary, marginTop: 2 },
  historyStatus: { fontSize: 13, fontWeight: "600" as const },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 14 },
});
