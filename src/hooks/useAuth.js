import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useWorldStore } from "../store/worldStore";

export function useAuth() {
  const init = useAuthStore((s) => s.init);
  const profile = useAuthStore((s) => s.profile);
  const holdings = useAuthStore((s) => s._holdings);

  // 로그인 완료되면 Supabase 계좌 → worldStore에 주입
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!profile) return;
    useWorldStore.setState({
      portfolio: {
        cash: profile.cash,
        holdings: holdings ?? {},
      },
    });
  }, [profile?.id]);
}
