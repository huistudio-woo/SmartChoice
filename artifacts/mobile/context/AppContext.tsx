import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Product {
  id: string;
  title: string;
  image: string;
  originalPrice: number;
  couponPrice: number;
  cashback: number;
  sales: number;
  platform: "taobao" | "jd" | "pdd";
  rating: number;
  couponCount: number;
  category: string;
}

export interface Order {
  id: string;
  product: Product;
  orderTime: string;
  amount: number;
  cashback: number;
  status: "pending" | "settled" | "invalid";
}

export interface Coupon {
  id: string;
  product: Product;
  discount: number;
  expireDate: string;
  used: boolean;
}

export interface Message {
  id: string;
  type: "system" | "cashback" | "interaction";
  title: string;
  content: string;
  time: string;
  read: boolean;
}

interface AppState {
  estimatedIncome: number;
  settledAmount: number;
  withdrawableAmount: number;
  orders: Order[];
  coupons: Coupon[];
  messages: Message[];
  footprints: Product[];
  withdrawHistory: WithdrawRecord[];
}

interface WithdrawRecord {
  id: string;
  amount: number;
  method: "wechat" | "alipay";
  time: string;
  status: "processing" | "success" | "failed";
}

interface AppContextType extends AppState {
  addFootprint: (product: Product) => void;
  claimCoupon: (product: Product) => void;
  placeOrder: (product: Product) => void;
  markMessageRead: (id: string) => void;
  submitWithdraw: (
    amount: number,
    method: "wechat" | "alipay"
  ) => Promise<void>;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "zhixuan_app_state";

const defaultState: AppState = {
  estimatedIncome: 12.5,
  settledAmount: 8.0,
  withdrawableAmount: 18.5,
  orders: [
    {
      id: "ord_001",
      product: {
        id: "p001",
        title: "耐克运动鞋 轻便透气跑步鞋",
        image: "https://picsum.photos/seed/shoes/200/200",
        originalPrice: 399,
        couponPrice: 259,
        cashback: 22.5,
        sales: 12300,
        platform: "taobao",
        rating: 98,
        couponCount: 15230,
        category: "运动",
      },
      orderTime: "2026-03-28 14:30",
      amount: 259,
      cashback: 22.5,
      status: "settled",
    },
    {
      id: "ord_002",
      product: {
        id: "p002",
        title: "苹果数据线 快充 MFi认证",
        image: "https://picsum.photos/seed/cable/200/200",
        originalPrice: 89,
        couponPrice: 39.9,
        cashback: 4.5,
        sales: 45600,
        platform: "jd",
        rating: 97,
        couponCount: 23100,
        category: "数码",
      },
      orderTime: "2026-03-26 10:15",
      amount: 39.9,
      cashback: 4.5,
      status: "pending",
    },
    {
      id: "ord_003",
      product: {
        id: "p003",
        title: "兰蔻小黑瓶精华液 30ml",
        image: "https://picsum.photos/seed/lancome/200/200",
        originalPrice: 699,
        couponPrice: 499,
        cashback: 45.0,
        sales: 8900,
        platform: "taobao",
        rating: 99,
        couponCount: 6700,
        category: "美妆",
      },
      orderTime: "2026-03-20 16:40",
      amount: 499,
      cashback: 45.0,
      status: "invalid",
    },
  ],
  coupons: [
    {
      id: "c001",
      product: {
        id: "p004",
        title: "小米蓝牙耳机 主动降噪",
        image: "https://picsum.photos/seed/earphones/200/200",
        originalPrice: 199,
        couponPrice: 129,
        cashback: 12.5,
        sales: 32000,
        platform: "jd",
        rating: 96,
        couponCount: 18500,
        category: "数码",
      },
      discount: 70,
      expireDate: "2026-04-10",
      used: false,
    },
    {
      id: "c002",
      product: {
        id: "p005",
        title: "格兰仕微波炉 家用 23L",
        image: "https://picsum.photos/seed/microwave/200/200",
        originalPrice: 399,
        couponPrice: 259,
        cashback: 28.0,
        sales: 15600,
        platform: "pdd",
        rating: 94,
        couponCount: 12300,
        category: "家电",
      },
      discount: 140,
      expireDate: "2026-03-31",
      used: false,
    },
  ],
  messages: [
    {
      id: "m001",
      type: "cashback",
      title: "返利到账通知",
      content: "恭喜！您的订单 #ORD20260328 返利 ¥22.50 已成功结算，可提现。",
      time: "2小时前",
      read: false,
    },
    {
      id: "m002",
      type: "system",
      title: "平台公告",
      content: "618大促即将开始！届时将有更多高额返利商品，敬请期待。",
      time: "昨天 10:00",
      read: false,
    },
    {
      id: "m003",
      type: "cashback",
      title: "提现成功通知",
      content: "您申请提现的 ¥30.00 已成功转入您的微信账户，请注意查收。",
      time: "2天前",
      read: true,
    },
    {
      id: "m004",
      type: "system",
      title: "新功能上线",
      content: "「大额隐藏券专区」全新上线！专属高额返利商品，每日更新。",
      time: "3天前",
      read: true,
    },
    {
      id: "m005",
      type: "cashback",
      title: "订单确认收货",
      content: "您的订单已确认收货，返利正在结算中，预计3个工作日内到账。",
      time: "4天前",
      read: true,
    },
  ],
  footprints: [],
  withdrawHistory: [
    {
      id: "w001",
      amount: 30.0,
      method: "wechat",
      time: "2026-03-28",
      status: "success",
    },
    {
      id: "w002",
      amount: 15.0,
      method: "alipay",
      time: "2026-03-20",
      status: "success",
    },
  ],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setState(JSON.parse(data));
        } catch {}
      }
    });
  }, []);

  const saveState = useCallback((newState: AppState) => {
    setState(newState);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const addFootprint = useCallback(
    (product: Product) => {
      const exists = state.footprints.find((p) => p.id === product.id);
      if (!exists) {
        saveState({
          ...state,
          footprints: [product, ...state.footprints].slice(0, 50),
        });
      }
    },
    [state, saveState]
  );

  const claimCoupon = useCallback(
    (product: Product) => {
      const exists = state.coupons.find((c) => c.product.id === product.id);
      if (!exists) {
        const newCoupon: Coupon = {
          id: `c_${Date.now()}`,
          product,
          discount: Math.round(product.originalPrice - product.couponPrice),
          expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          used: false,
        };
        saveState({
          ...state,
          coupons: [newCoupon, ...state.coupons],
        });
      }
    },
    [state, saveState]
  );

  const placeOrder = useCallback(
    (product: Product) => {
      const newOrder: Order = {
        id: `ord_${Date.now()}`,
        product,
        orderTime: new Date().toLocaleString("zh-CN"),
        amount: product.couponPrice,
        cashback: product.cashback,
        status: "pending",
      };
      saveState({
        ...state,
        orders: [newOrder, ...state.orders],
        estimatedIncome: state.estimatedIncome + product.cashback,
      });
    },
    [state, saveState]
  );

  const markMessageRead = useCallback(
    (id: string) => {
      saveState({
        ...state,
        messages: state.messages.map((m) =>
          m.id === id ? { ...m, read: true } : m
        ),
      });
    },
    [state, saveState]
  );

  const submitWithdraw = useCallback(
    async (amount: number, method: "wechat" | "alipay") => {
      const newRecord: WithdrawRecord = {
        id: `w_${Date.now()}`,
        amount,
        method,
        time: new Date().toISOString().split("T")[0],
        status: "processing",
      };
      saveState({
        ...state,
        withdrawableAmount: state.withdrawableAmount - amount,
        withdrawHistory: [newRecord, ...state.withdrawHistory],
      });
    },
    [state, saveState]
  );

  const unreadCount = state.messages.filter((m) => !m.read).length;

  return (
    <AppContext.Provider
      value={{
        ...state,
        addFootprint,
        claimCoupon,
        placeOrder,
        markMessageRead,
        submitWithdraw,
        unreadCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
