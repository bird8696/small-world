import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

// ── localStorage 키 ───────────────────────────────────────────
const LS_USERS = "sw_users";
const lsHoldings = (id) => `sw_holdings_${id}`;

const lsGetUsers = () => JSON.parse(localStorage.getItem(LS_USERS) || "{}");
const lsSaveUsers = (u) => localStorage.setItem(LS_USERS, JSON.stringify(u));
const lsGetHoldings = (id) =>
  JSON.parse(localStorage.getItem(lsHoldings(id)) || "{}");
export const lsSaveHoldings = (id, h) =>
  localStorage.setItem(lsHoldings(id), JSON.stringify(h));

// ── Supabase 헬퍼 ─────────────────────────────────────────────
async function fetchProfile(userId) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

async function fetchHoldings(userId) {
  const { data } = await supabase
    .from("holdings")
    .select("*")
    .eq("user_id", userId);
  return Object.fromEntries(
    (data ?? [])
      .filter((h) => h.qty > 0)
      .map((h) => [h.ticker, { qty: h.qty, avgCost: h.avg_cost }]),
  );
}

// ── 스토어 ───────────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  _holdings: {},
  loading: true,
  error: null,
  _forceLogin: false,

  // 항상 로그아웃 상태로 시작
  init: async () => {
    set({ loading: false, user: null, profile: null });
  },

  // ── 회원가입 ────────────────────────────────────────────
  signUp: async (email, password, username) => {
    set({ error: null });

    if (!isSupabaseConfigured) {
      const users = lsGetUsers();
      if (users[email]) {
        set({ error: "이미 사용 중인 이메일입니다" });
        return false;
      }
      if (Object.values(users).find((u) => u.username === username)) {
        set({ error: "이미 사용 중인 닉네임입니다" });
        return false;
      }
      const id = `local_${Date.now()}`;
      users[email] = { id, email, username, password, cash: 10_000_000 };
      lsSaveUsers(users);
      set({
        user: { id, email },
        profile: { id, username, cash: 10_000_000 },
        _holdings: {},
      });
      return true;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        set({ error: error.message });
        return false;
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: data.user.id, username });
      if (profileError) {
        set({ error: profileError.message });
        return false;
      }
      const profile = await fetchProfile(data.user.id);
      set({ user: data.user, profile, _holdings: {} });
      return true;
    } catch (e) {
      set({ error: "네트워크 오류가 발생했습니다" });
      return false;
    }
  },

  // ── 로그인 ──────────────────────────────────────────────
  signIn: async (email, password) => {
    set({ error: null });

    if (!isSupabaseConfigured) {
      const users = lsGetUsers();
      const found = users[email];
      if (!found || found.password !== password) {
        set({ error: "이메일 또는 비밀번호가 올바르지 않습니다" });
        return false;
      }
      const holdings = lsGetHoldings(found.id);
      set({
        user: { id: found.id, email: found.email },
        profile: { id: found.id, username: found.username, cash: found.cash },
        _holdings: holdings,
      });
      return true;
    }

    try {
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error("요청 시간이 초과됐습니다")), 10000),
        ),
      ]);
      if (result.error) {
        set({ error: result.error.message });
        return false;
      }
      const user = result.data.user;
      const profile = await fetchProfile(user.id);
      const holdings = await fetchHoldings(user.id);
      set({ user, profile, _holdings: holdings });
      return true;
    } catch (e) {
      set({ error: e.message ?? "로그인에 실패했습니다" });
      return false;
    }
  },

  // ── 로그아웃 ────────────────────────────────────────────
  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ user: null, profile: null, _holdings: {}, _forceLogin: false });
  },

  // ── 로컬 cash 업데이트 ──────────────────────────────────
  updateLocalCash: (newCash) => {
    const { user, profile } = get();
    if (!user || isSupabaseConfigured) return;
    const users = lsGetUsers();
    if (users[user.email]) {
      users[user.email].cash = newCash;
      lsSaveUsers(users);
    }
    set({ profile: { ...profile, cash: newCash } });
  },
}));
