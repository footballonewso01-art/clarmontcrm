interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: { value: number; label: string };
  variant?: "default" | "accent" | "success" | "warning" | "danger" | "purple";
}

const variantColors = {
  default: "var(--color-accent)",
  accent: "var(--color-accent)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  purple: "var(--color-purple)",
};

export function StatsCard({ title, value, subtitle, icon, trend, variant = "default" }: StatsCardProps) {
  const color = variantColors[variant];

  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          background: `color-mix(in oklch, ${color}, transparent 80%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
        }}>
          {icon}
        </div>
        {trend && (
          <div style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: trend.value >= 0 ? "var(--color-success)" : "var(--color-danger)",
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div style={{
        fontSize: "1.75rem",
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1.2,
        color: "var(--color-text-primary)",
      }}>
        {value}
      </div>
      <div style={{
        fontSize: "0.8125rem",
        color: "var(--color-text-secondary)",
        marginTop: "0.25rem",
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          fontSize: "0.75rem",
          color: "var(--color-text-muted)",
          marginTop: "0.25rem",
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
