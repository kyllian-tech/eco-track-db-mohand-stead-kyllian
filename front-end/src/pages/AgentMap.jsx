import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { getContainers } from "../api/containers";
import { createMeasurement } from "../api/measurements";
import { useAuth } from "../context/AuthContext";

function getFillClass(fill) {
  if (fill >= 85) return "critical";
  if (fill >= 60) return "warning";
  return "normal";
}

function AgentMap() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [containers, setContainers] = useState([]);
  const [collected, setCollected] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContainers()
      .then((data) => setContainers(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markCollected = async (container) => {
    try {
      await createMeasurement({
        container_id: container.id,
        taux_remplissage: 0,
        source: "agent_terrain",
      });

      setCollected((prev) => new Set([...prev, container.id]));
      showToast(`Collecte validée pour ${container.code}.`, "success");
    } catch {
      // fallback : marquer localement même si l'API échoue
      setCollected((prev) => new Set([...prev, container.id]));
      showToast("Collecte validée (hors ligne).", "success");
    }
  };

  const collectedCount = collected.size;
  const priorityCount = containers.filter((c) => {
    const fill = c.last_fill ?? c.taux_remplissage ?? 0;
    return fill >= 60 && !collected.has(c.id);
  }).length;

  return (
    <div className="agent-map-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Navigation terrain</span>
          <h1>Carte de tournée</h1>
          <p>
            Visualisez les conteneurs, consultez leur niveau et validez les
            collectes sur le terrain.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Conteneurs</span>
          <strong>{containers.length}</strong>
        </div>

        <div className="overview-card success">
          <span>Collectés</span>
          <strong>{collectedCount}</strong>
        </div>

        <div className="overview-card warning">
          <span>Prioritaires</span>
          <strong>{priorityCount}</strong>
        </div>

        <div className="overview-card">
          <span>Restants</span>
          <strong>{containers.length - collectedCount}</strong>
        </div>
      </div>

      <div className="agent-map-grid">
        <section className="agent-map-card">
          <div className="agent-tour-map">
            <div className="agent-tour-path" />

            <span className="agent-zone-label agent-zone-center">ZONE A</span>
            <span className="agent-zone-label agent-zone-north">ZONE B</span>
            <span className="agent-zone-label agent-zone-south">ZONE C</span>

            {containers.slice(0, 6).map((c, i) => {
              const positions = [
                { left: "24%", top: "30%" },
                { left: "53%", top: "46%" },
                { left: "76%", top: "66%" },
                { left: "35%", top: "60%" },
                { left: "65%", top: "28%" },
                { left: "45%", top: "75%" },
              ];
              const pos = positions[i] ?? { left: `${20 + i * 10}%`, top: "50%" };
              const fill = c.last_fill ?? 0;
              return (
                <button
                  key={c.id}
                  className={`agent-tour-marker ${collected.has(c.id) ? "normal" : getFillClass(fill)}`}
                  style={pos}
                  title={`${c.code} — ${c.type}`}
                >
                  {collected.has(c.id) ? "✓" : `${fill}%`}
                </button>
              );
            })}
          </div>
        </section>

        <section className="agent-map-results">
          <h2>Étapes terrain</h2>

          {loading ? (
            <p>Chargement…</p>
          ) : containers.length === 0 ? (
            <p>Aucun conteneur disponible.</p>
          ) : (
            <div className="agent-map-list">
              {containers.map((c) => {
                const fill = c.last_fill ?? 0;
                const isCollected = collected.has(c.id);
                return (
                  <article className="agent-map-row" key={c.id}>
                    <div>
                      <h3>{c.code} — {c.type}</h3>
                      <p>{c.zone_id ? `Zone ${c.zone_id}` : "Zone non précisée"}</p>

                      <div className="agent-step-tags">
                        <span className={isCollected ? "normal" : getFillClass(fill)}>
                          {isCollected ? "Collecté" : fill >= 85 ? "Critique" : fill >= 60 ? "Attention" : "Normal"}
                        </span>
                        <span>{fill}% remplissage</span>
                      </div>
                    </div>

                    <button
                      className="primary-btn"
                      onClick={() => markCollected(c)}
                      disabled={isCollected}
                    >
                      {isCollected ? "Validé" : "Valider"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AgentMap;
