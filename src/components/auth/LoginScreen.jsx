import { useState } from "react";
import { useAuthStore } from "../../store/authStore";

export default function LoginScreen({ onClose }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const error = useAuthStore((s) => s.error);

  const submit = async () => {
    if (busy) return;
    setBusy(true);

    if (mode === "login") {
      const ok = await signIn(email, pw);
      if (ok && onClose) onClose();
    } else {
      if (!name.trim()) {
        setBusy(false);
        return;
      }
      const ok = await signUp(email, pw, name.trim());
      if (ok && onClose) onClose();
    }

    setBusy(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          width: 380,
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: 14,
          padding: "36px 32px",
        }}
      >
        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🌐</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
            작은 세상 거래소
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
            {mode === "login"
              ? "계좌에 로그인해서 거래를 시작하세요"
              : "계좌를 개설하면 시작 자금 ₩10,000,000이 지급됩니다"}
          </div>
        </div>

        {/* 입력 필드 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mode === "register" && (
            <div>
              <div
                style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}
              >
                닉네임
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="다른 유저에게 보여지는 이름"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div>
            <div
              style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}
            >
              이메일
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={{
                width: "100%",
                padding: "9px 12px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <div
              style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}
            >
              비밀번호
            </div>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="6자 이상"
              style={{
                width: "100%",
                padding: "9px 12px",
                boxSizing: "border-box",
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              background: "#ef444418",
              border: "0.5px solid #ef444455",
              borderRadius: 8,
              fontSize: 11,
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          onClick={submit}
          disabled={busy || !email || !pw || (mode === "register" && !name)}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "11px 0",
            fontSize: 13,
            fontWeight: 600,
            background: "var(--blue)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "처리중..." : mode === "login" ? "로그인" : "계좌 개설"}
        </button>

        {/* 모드 전환 */}
        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          {mode === "login"
            ? "아직 계좌가 없으신가요?"
            : "이미 계좌가 있으신가요?"}{" "}
          <span
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              useAuthStore.setState({ error: null });
            }}
            style={{ color: "var(--blue)", cursor: "pointer", fontWeight: 600 }}
          >
            {mode === "login" ? "계좌 개설" : "로그인"}
          </span>
        </div>

        {/* 게스트 계속하기 */}
        {onClose && (
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <span
              onClick={onClose}
              style={{
                fontSize: 11,
                color: "var(--muted)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              로그인 없이 게스트로 계속하기
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
