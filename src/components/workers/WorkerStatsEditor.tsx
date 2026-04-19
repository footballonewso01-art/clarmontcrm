"use client";

import { useState } from "react";
import { inlineRecordConversion } from "@/actions/conversions";

interface ModelStat {
  modelId: string;
  modelName: string;
  linkName: string | null;
  currentSubscribers: number;
}

interface WorkerStatsEditorProps {
  workerId: string;
  initialStats: ModelStat[];
}

export function WorkerStatsEditor({ workerId, initialStats }: WorkerStatsEditorProps) {
  return (
    <div className="glass-card" style={{ overflow: "hidden", marginBottom: "1.5rem" }}>
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>⚡ Обновление статистики</h3>
      </div>
      
      {initialStats.length === 0 ? (
        <div className="empty-state">
          <p>У данного воркера пока нет активных моделей.</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>Добавьте трекинговую ссылку в разделе Трекинг.</p>
        </div>
      ) : (
        <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {initialStats.map((stat) => (
            <StatRow key={stat.modelId} workerId={workerId} stat={stat} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatRow({ workerId, stat }: { workerId: string; stat: ModelStat }) {
  const [subscribers, setSubscribers] = useState(stat.currentSubscribers);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await inlineRecordConversion(workerId, stat.modelId, subscribers);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      setError("Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = subscribers !== stat.currentSubscribers;

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "minmax(120px, 1fr) 1fr auto", 
      gap: "1rem", 
      alignItems: "center",
      padding: "0.5rem",
      backgroundColor: hasChanges ? "var(--color-bg-tertiary)" : "transparent",
      borderRadius: "var(--radius-sm)",
      transition: "background-color 0.2s"
    }}>
      <div>
        <div style={{ fontWeight: 600 }}>{stat.modelName}</div>
        {stat.linkName && (
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{stat.linkName}</div>
        )}
      </div>
      
      <div>
        <label style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>Подписчики</label>
        <input 
          type="number" 
          value={subscribers} 
          onChange={(e) => setSubscribers(parseInt(e.target.value) || 0)}
          className="input"
          min="0"
          style={{ padding: "0.25rem 0.5rem", height: "auto" }}
        />
      </div>

      <div style={{ alignSelf: "end" }}>
        <button 
          onClick={handleSave} 
          disabled={!hasChanges || loading}
          className={`btn btn-sm ${hasChanges ? "btn-primary" : "btn-secondary"}`}
        >
          {loading ? "..." : success ? "✓ Записано" : "Сохранить"}
        </button>
      </div>
      
      {error && <div style={{ gridColumn: "1 / -1", color: "var(--color-danger)", fontSize: "0.75rem" }}>{error}</div>}
    </div>
  );
}
