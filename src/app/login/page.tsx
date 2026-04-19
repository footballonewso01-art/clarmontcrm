"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, oklch(0.10 0.03 260), oklch(0.14 0.04 280), oklch(0.10 0.02 240))",
      backgroundSize: "400% 400%",
      animation: "bgShift 15s ease infinite",
      padding: "1rem",
    }}>
      <style>{`
        @keyframes bgShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      <div style={{
        width: "100%",
        maxWidth: "420px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, var(--color-accent), var(--color-purple))",
            marginBottom: "1rem",
            fontSize: "1.5rem",
          }}>
            ⚡
          </div>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: "0.5rem",
          }}>
            ClarmontCRM
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
            Войдите в систему управления трафиком
          </p>
        </div>

        <div className="glass-card" style={{ padding: "2rem" }}>
          <form action={formAction}>
            <div className="form-group">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="password">Пароль</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {state?.error && (
              <div style={{
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                background: "var(--color-danger-muted)",
                color: "var(--color-danger)",
                fontSize: "0.8125rem",
                marginBottom: "1rem",
              }}>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {isPending ? "Вход..." : "Войти"}
            </button>
          </form>

          <div style={{
            textAlign: "center",
            marginTop: "1.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--color-border)",
          }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
              Нет аккаунта?{" "}
            </span>
            <Link href="/register" style={{
              color: "var(--color-accent)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              textDecoration: "none",
            }}>
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
