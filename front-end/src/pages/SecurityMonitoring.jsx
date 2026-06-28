import { useEffect, useState, useCallback } from "react";
import client from "../api/client";
import { useToast } from "../context/ToastContext";

function formatUptime(seconds) {
  const s = Math.floor(seconds);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}j ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s % 60}s`;
}

function parsePrometheusMetrics(text) {
  const result = {};
  const lines = text.split("\n").filter((l) => l && !l.startsWith("#"));
  for (const line of lines) {
    const spaceIdx = line.lastIndexOf(" ");
    if (spaceIdx === -1) continue;
    const key = line.slice(0, spaceIdx);
    const value = parseFloat(line.slice(spaceIdx + 1));
    if (!isNaN(value)) result[key] = value;
  }

  // Agrège http_requests_total par status
  const httpTotal = Object.entries(result)
    .filter(([k]) => k.startsWith("http_requests_total"))
    .reduce((sum, [, v]) => sum + v, 0);

  const http2xx = Object.entries(result)
    .filter(([k]) => k.startsWith("http_requests_total") && k.includes('status="2'))
    .reduce((sum, [, v]) => sum + v, 0);

  const http4xx5xx = Object.entries(result)
    .filter(([k]) => k.startsWith("http_requests_total") && (k.includes('status="4') || k.includes('status="5')))
    .reduce((sum, [, v]) => sum + v, 0);

  const signalements = Object.entries(result)
    .filter(([k]) => k.startsWith("ecotrack_signalements_created_total"))
    .reduce((sum, [, v]) => sum + v, 0);

  return { httpTotal, http2xx, http4xx5xx, signalements };
}

const STATIC_ALERTS = [
  { id: 1, title: "Bruteforce SSH détecté", source: "10.10.3.50", severity: "Critique", tool: "Suricata", status: "Bloqué" },
  { id: 2, title: "Scan de ports", source: "185.22.14.90", severity: "Élevé", tool: "Wazuh", status: "En analyse" },
  { id: 3, title: "Pic de logs applicatifs", source: "ECO-APP", severity: "Moyen", tool: "ELK", status: "Surveillé" },
];

const STATIC_RULES = [
  { id: 1, name: "Bruteforce SSH", description: "Détecte plusieurs tentatives SSH en moins d'une minute." },
  { id: 2, name: "Scan de ports", description: "Détecte un scan SYN vers plusieurs ports." },
  { id: 3, name: "Injection SQL", description: "Surveille les patterns SQL suspects dans les requêtes." },
  { id: 4, name: "Trafic IoT anormal", description: "Détecte un volume excessif provenant d'un capteur." },
];

function StatusDot({ status }) {
  const ok = status === "ok" || status === "alive" || status === "ready";
  return (
    <span style={{
      display: "inline-block", width: 10, height: 10, borderRadius: "50%",
      background: ok ? "#22c55e" : "#ef4444", marginRight: "0.4rem",
    }} />
  );
}

function SecurityMonitoring() {
  const { showToast } = useToast();
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [healthRes, metricsRes] = await Promise.allSettled([
        client.get("/health/full"),
        client.get("/metrics"),
      ]);

      if (healthRes.status === "fulfilled") setHealth(healthRes.value.data);
      if (metricsRes.status === "fulfilled") setMetrics(parsePrometheusMetrics(metricsRes.value.data));
      setLastRefresh(new Date());
    } catch {
      showToast("Erreur lors du chargement des métriques.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getSeverityClass = (s) => s === "Critique" ? "critical" : s === "Élevé" ? "high" : "medium";
  const getMemClass = (used, total) => {
    const pct = total ? (used / total) * 100 : 0;
    if (pct >= 80) return "critical";
    if (pct >= 60) return "warning";
    return "normal";
  };

  const dbStatus = health?.checks?.database?.status;
  const cacheStatus = health?.checks?.cache?.status;

  return (
    <div className="security-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Monitoring sécurité</span>
          <h1>Supervision Cyber</h1>
          <p>État temps réel du backend, base de données et métriques applicatives.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {lastRefresh && (
            <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>
              Mis à jour : {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button className="btn-secondary" onClick={fetchData}>Rafraîchir</button>
        </div>
      </div>

      {/* KPIs réels */}
      <div className="containers-overview">
        <div className={`overview-card ${health?.status === "ok" ? "success" : "danger"}`}>
          <span>API Backend</span>
          <strong>{loading ? "…" : health?.status === "ok" ? "Opérationnel" : "Erreur"}</strong>
        </div>
        <div className={`overview-card ${dbStatus === "ok" ? "success" : "danger"}`}>
          <span>Base de données</span>
          <strong>
            {loading ? "…" : dbStatus === "ok"
              ? `OK — ${health.checks.database.latency_ms} ms`
              : dbStatus ?? "—"}
          </strong>
        </div>
        <div className="overview-card">
          <span>Uptime</span>
          <strong>{health ? formatUptime(health.uptime) : "—"}</strong>
        </div>
        <div className="overview-card">
          <span>Mémoire heap</span>
          <strong>
            {health ? `${health.memory.heap_used_mb} / ${health.memory.heap_total_mb} Mo` : "—"}
          </strong>
        </div>
      </div>

      <div className="security-grid">
        {/* Alertes de sécurité — simulation */}
        <section className="security-card large">
          <div className="security-card-header">
            <div>
              <h2>Alertes de sécurité</h2>
              <p style={{ fontSize: "0.78rem", opacity: 0.55 }}>
                Simulation IDS — données fictives à des fins de démonstration
              </p>
            </div>
          </div>
          <div className="security-alerts-list">
            {STATIC_ALERTS.map((alert) => (
              <article className="security-alert-row" key={alert.id}>
                <div className="security-alert-main">
                  <span className={`security-dot ${getSeverityClass(alert.severity)}`} />
                  <div>
                    <h3>{alert.title}</h3>
                    <p>Source : {alert.source}</p>
                  </div>
                </div>
                <div className="security-alert-meta">
                  <span>{alert.tool}</span>
                  <strong className={`severity-badge ${getSeverityClass(alert.severity)}`}>
                    {alert.severity}
                  </strong>
                  <strong className="security-status">{alert.status}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Métriques applicatives réelles */}
        <section className="security-card">
          <h2>Métriques applicatives</h2>
          {metrics ? (
            <div className="analytics-list" style={{ marginTop: "0.5rem" }}>
              <div>
                <span>Requêtes HTTP totales</span>
                <strong>{metrics.httpTotal}</strong>
              </div>
              <div>
                <span>Requêtes 2xx</span>
                <strong style={{ color: "#22c55e" }}>{metrics.http2xx}</strong>
              </div>
              <div>
                <span>Requêtes 4xx/5xx</span>
                <strong style={{ color: metrics.http4xx5xx > 0 ? "#ef4444" : "inherit" }}>
                  {metrics.http4xx5xx}
                </strong>
              </div>
              <div>
                <span>Signalements créés</span>
                <strong>{metrics.signalements}</strong>
              </div>
            </div>
          ) : (
            <p style={{ opacity: 0.5, marginTop: "0.5rem" }}>
              {loading ? "Chargement…" : "Métriques indisponibles."}
            </p>
          )}

          {/* Infos système */}
          {health && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
              <div className="analytics-list">
                <div>
                  <span>Environnement</span>
                  <strong>{health.environment}</strong>
                </div>
                <div>
                  <span>Version API</span>
                  <strong>v{health.version}</strong>
                </div>
                <div>
                  <span>Node.js</span>
                  <strong>{health.node_version}</strong>
                </div>
                <div>
                  <span>Cache</span>
                  <strong>{cacheStatus ?? "—"}</strong>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Mémoire détaillée + Rules IDS */}
      <div className="security-grid" style={{ marginTop: "1rem" }}>
        <section className="security-card">
          <h2>Mémoire processus</h2>
          {health ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              {[
                { label: "Heap utilisé", used: health.memory.heap_used_mb, total: health.memory.heap_total_mb },
                { label: "RSS total", used: health.memory.rss_mb, total: health.memory.heap_total_mb },
              ].map(({ label, used, total }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", fontSize: "0.85rem" }}>
                    <span>{label}</span>
                    <strong>{used} Mo / {total} Mo</strong>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getMemClass(used, total)}`}
                      style={{ width: `${Math.min(100, Math.round((used / total) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ opacity: 0.5 }}>{loading ? "Chargement…" : "Indisponible."}</p>
          )}
        </section>

        <section className="security-card">
          <h2>Règles IDS <span style={{ fontSize: "0.75rem", opacity: 0.5, fontWeight: 400 }}>(simulation)</span></h2>
          <div className="security-rules-list">
            {STATIC_RULES.map((rule) => (
              <article className="security-rule-item" key={rule.id}>
                <div>
                  <h3>{rule.name}</h3>
                  <p>{rule.description}</p>
                </div>
                <span style={{ color: "#22c55e", fontSize: "0.8rem", fontWeight: 600 }}>Active</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default SecurityMonitoring;
