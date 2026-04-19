"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Обзор", icon: "📊" },
  { href: "/dashboard/workers", label: "Воркеры", icon: "👤" },
  { href: "/dashboard/models", label: "Модели", icon: "⭐" },
  { href: "/dashboard/agencies", label: "Агентства", icon: "🏢" },
  { href: "/dashboard/tracking", label: "Tracking Links", icon: "🔗" },
  { href: "/dashboard/conversions", label: "Конверсии", icon: "📈" },
  { href: "/dashboard/payouts", label: "Выплаты", icon: "💰" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const roleLabel: Record<string, string> = {
    ADMIN: "Администратор",
    WORKER: "Воркер",
    AGENCY: "Агентство",
  };

  return (
    <aside style={{
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      width: "260px",
      background: "var(--color-bg-secondary)",
      borderRight: "1px solid var(--color-border)",
      display: "flex",
      flexDirection: "column",
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{
        padding: "1.5rem 1.25rem",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, var(--color-accent), var(--color-purple))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
          }}>
            ⚡
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
              ClarmontCRM
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto" }}>
        <div style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--color-text-muted)",
          padding: "0 0.75rem",
          marginBottom: "0.5rem",
        }}>
          Меню
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <span style={{ fontSize: "1.1rem", width: "1.5rem", textAlign: "center" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div style={{
        padding: "1rem 1.25rem",
        borderTop: "1px solid var(--color-border)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "var(--color-bg-hover)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--color-accent)",
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {user.name}
            </div>
            <div style={{
              fontSize: "0.6875rem",
              color: "var(--color-text-muted)",
            }}>
              {roleLabel[user.role] || user.role}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", justifyContent: "center" }}
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}
