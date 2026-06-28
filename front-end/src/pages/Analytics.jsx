import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import Loader from "../components/Loader";
import { getMeasurements } from "../api/measurements";
import { getContainers } from "../api/containers";
import { getSignalements } from "../api/signalements";
import { getRoutes } from "../api/routes";
import { useToast } from "../context/ToastContext";

const TYPE_LABELS = {
  OMR: "Ordures ménagères",
  RECYCLABLE: "Recyclable",
  VERRE: "Verre",
  COMPOST: "Compost",
};

const TYPE_COLORS = {
  OMR: "#ef4444",
  RECYCLABLE: "#22c55e",
  VERRE: "#3b82f6",
  COMPOST: "#a16207",
};

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function groupMeasurementsByDay(measurements) {
  const byDay = {};
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    byDay[key] = { values: [], label: DAY_LABELS[d.getDay()] };
  }

  for (const m of measurements) {
    const key = m.timestamp ? m.timestamp.slice(0, 10) : null;
    if (key && byDay[key]) {
      byDay[key].values.push(m.taux_remplissage);
    }
  }

  return Object.entries(byDay).map(([, { label, values }]) => ({
    label,
    remplissage: values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : null,
  }));
}

function groupContainersByType(containers) {
  const counts = {};
  for (const c of containers) {
    counts[c.type] = (counts[c.type] || 0) + 1;
  }
  return Object.entries(counts).map(([type, count]) => ({
    type,
    label: TYPE_LABELS[type] || type,
    count,
    color: TYPE_COLORS[type] || "#6b7280",
  }));
}

function Analytics() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState([]);
  const [containers, setContainers] = useState([]);
  const [signalements, setSignalements] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    Promise.all([
      getMeasurements({ limit: 200 }),
      getContainers(),
      getSignalements(),
      getRoutes(),
    ])
      .then(([m, c, s, r]) => {
        setMeasurements(Array.isArray(m) ? m : []);
        setContainers(Array.isArray(c) ? c : []);
        setSignalements(Array.isArray(s) ? s : []);
        setRoutes(Array.isArray(r) ? r : []);
      })
      .catch(() => showToast("Erreur lors du chargement des analytics.", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const avgFill = measurements.length
    ? Math.round(measurements.reduce((s, m) => s + m.taux_remplissage, 0) / measurements.length)
    : 0;

  const criticalContainers = (() => {
    const latest = {};
    for (const m of measurements) {
      const existing = latest[m.container_id];
      if (!existing || m.timestamp > existing.timestamp) {
        latest[m.container_id] = m;
      }
    }
    return Object.values(latest).filter((m) => m.taux_remplissage >= 90).length;
  })();

  const completedRoutes = routes.filter((r) => r.statut === "TERMINEE").length;
  const resolvedReports = signalements.filter((s) => s.statut === "RESOLU").length;

  const avgTemp = (() => {
    const withTemp = measurements.filter((m) => m.temperature !== null);
    if (!withTemp.length) return null;
    return (withTemp.reduce((s, m) => s + m.temperature, 0) / withTemp.length).toFixed(1);
  })();

  const avgBattery = (() => {
    const withBat = measurements.filter((m) => m.batterie_niveau !== null);
    if (!withBat.length) return null;
    return Math.round(withBat.reduce((s, m) => s + m.batterie_niveau, 0) / withBat.length);
  })();

  const chartData = groupMeasurementsByDay(measurements);
  const typeData = groupContainersByType(containers);

  const fillDistrib = [
    { label: "Normal (< 70%)", value: measurements.filter((m) => m.taux_remplissage < 70).length },
    { label: "Attention (70–89%)", value: measurements.filter((m) => m.taux_remplissage >= 70 && m.taux_remplissage < 90).length },
    { label: "Critique (≥ 90%)", value: measurements.filter((m) => m.taux_remplissage >= 90).length },
  ];

  return (
    <div className="analytics-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Analyse & performance</span>
          <h1>Analytics</h1>
          <p>
            Indicateurs clés en temps réel : remplissage IoT, performance des
            tournées et résolution des signalements.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Remplissage moyen</span>
          <strong>{avgFill}%</strong>
        </div>
        <div className="overview-card danger">
          <span>Conteneurs critiques</span>
          <strong>{criticalContainers}</strong>
        </div>
        <div className="overview-card success">
          <span>Tournées terminées</span>
          <strong>{completedRoutes}</strong>
        </div>
        <div className="overview-card warning">
          <span>Signalements résolus</span>
          <strong>{resolvedReports}</strong>
        </div>
      </div>

      <div className="analytics-grid">
        <section className="analytics-card large">
          <div className="analytics-card-header">
            <div>
              <h2>Évolution du remplissage</h2>
              <p>
                {measurements.length > 0
                  ? `Basé sur ${measurements.length} mesure(s) IoT — 7 derniers jours`
                  : "Aucune mesure disponible"}
              </p>
            </div>
          </div>

          {chartData.some((d) => d.remplissage !== null) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v}%`, "Remplissage moyen"]} />
                <Bar dataKey="remplissage" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ padding: "2rem", opacity: 0.5, textAlign: "center" }}>
              Pas encore de données IoT pour les 7 derniers jours.
            </p>
          )}
        </section>

        <section className="analytics-card">
          <h2>Répartition des mesures</h2>
          <div className="analytics-list">
            {fillDistrib.map((d) => (
              <div key={d.label}>
                <span>{d.label}</span>
                <strong>{d.value}</strong>
              </div>
            ))}
          </div>

          {avgTemp !== null && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
              <div className="analytics-list">
                <div>
                  <span>Temp. moyenne</span>
                  <strong>{avgTemp} °C</strong>
                </div>
                {avgBattery !== null && (
                  <div>
                    <span>Batterie moyenne</span>
                    <strong>{avgBattery}%</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="analytics-card">
          <h2>Conteneurs par type</h2>
          {typeData.length > 0 ? (
            <div className="analytics-list">
              {typeData.map((t) => (
                <div key={t.type} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: t.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1 }}>{t.label}</span>
                  <strong>{t.count}</strong>
                </div>
              ))}
              <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #e5e7eb" }}>
                <span>Total</span>
                <strong>{containers.length}</strong>
              </div>
            </div>
          ) : (
            <p style={{ opacity: 0.5 }}>Aucun conteneur.</p>
          )}
        </section>

        <section className="analytics-card">
          <h2>Performance collecte</h2>
          <div className="analytics-list">
            <div>
              <span>Tournées planifiées</span>
              <strong>{routes.filter((r) => r.statut === "PLANIFIEE").length}</strong>
            </div>
            <div>
              <span>En cours</span>
              <strong>{routes.filter((r) => r.statut === "EN_COURS").length}</strong>
            </div>
            <div>
              <span>Terminées</span>
              <strong>{completedRoutes}</strong>
            </div>
            <div>
              <span>Annulées</span>
              <strong>{routes.filter((r) => r.statut === "ANNULEE").length}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Analytics;
