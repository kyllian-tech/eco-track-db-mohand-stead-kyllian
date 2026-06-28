import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoutes, getRouteSteps } from "../api/routes";
import { getSignalements } from "../api/signalements";

const STATUT_LABEL = {
  PLANIFIEE: "Planifiée",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

function AgentSpace() {
  const { user } = useAuth();

  const [route, setRoute] = useState(null);
  const [steps, setSteps] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [routes, signalements] = await Promise.all([
          getRoutes({ statut: "EN_COURS", agent_id: user?.id }),
          getSignalements({ statut: "OUVERT" }),
        ]);

        const activeRoute = Array.isArray(routes) ? routes[0] : null;
        setRoute(activeRoute ?? null);
        setIncidents(Array.isArray(signalements) ? signalements.slice(0, 5) : []);

        if (activeRoute?.id) {
          const routeSteps = await getRouteSteps(activeRoute.id);
          setSteps(Array.isArray(routeSteps) ? routeSteps : []);
        }
      } catch {
        // charge silencieuse en cas d'erreur
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completedSteps = steps.filter((s) => s.collecte_effectuee === true).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="agent-dashboard-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Espace agent</span>
          <h1>Dashboard Agent de collecte</h1>
          <p>
            Suivez votre tournée du jour, validez les collectes et remontez les
            anomalies constatées sur le terrain.
          </p>
        </div>

        <Link to="/space/agent/routes" className="primary-btn">
          Voir la tournée
        </Link>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <>
          <div className="containers-overview">
            <div className="overview-card">
              <span>Tournée du jour</span>
              <strong>{route ? 1 : 0}</strong>
            </div>

            <div className="overview-card success">
              <span>Étapes validées</span>
              <strong>{completedSteps}</strong>
            </div>

            <div className="overview-card warning">
              <span>Restantes</span>
              <strong>{totalSteps - completedSteps}</strong>
            </div>

            <div className="overview-card danger">
              <span>Anomalies terrain</span>
              <strong>{incidents.length}</strong>
            </div>
          </div>

          <div className="agent-dashboard-grid">
            <section className="agent-card-pro large">
              {route ? (
                <>
                  <div className="agent-card-header">
                    <div>
                      <h2>Tournée assignée</h2>
                      <p>
                        {route.nom ?? `Tournée #${route.id?.slice(0, 8)}`}
                        {route.date_debut
                          ? ` — ${new Date(route.date_debut).toLocaleDateString("fr-FR")}`
                          : ""}
                      </p>
                    </div>

                    <span className="agent-status-badge">
                      {STATUT_LABEL[route.statut] ?? route.statut}
                    </span>
                  </div>

                  {totalSteps > 0 && (
                    <div className="agent-progress-block">
                      <div className="agent-progress-info">
                        <span>Progression ({completedSteps}/{totalSteps} étapes)</span>
                        <strong>{progress}%</strong>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-fill green"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {steps.length > 0 ? (
                    <div className="agent-route-steps">
                      {steps.slice(0, 5).map((step) => (
                        <article className="agent-step-card" key={step.id}>
                          <div>
                            <h3>Étape {step.ordre_passage ?? "—"}</h3>
                            <p>{step.container_id ?? "Conteneur non précisé"}</p>
                          </div>

                          <div className="agent-step-meta">
                            <strong>{step.collecte_effectuee ? "Collecté" : "À collecter"}</strong>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p>Aucune étape définie pour cette tournée.</p>
                  )}
                </>
              ) : (
                <div className="agent-card-header">
                  <div>
                    <h2>Aucune tournée en cours</h2>
                    <p>Aucune tournée avec statut EN_COURS ne vous est assignée pour le moment.</p>
                  </div>
                </div>
              )}
            </section>

            <section className="agent-card-pro">
              <h2>Actions rapides</h2>

              <div className="agent-action-list">
                <Link to="/space/agent/routes">
                  <strong>Valider une collecte</strong>
                  <span>Confirmer le passage et le volume collecté.</span>
                </Link>

                <Link to="/space/agent/reports">
                  <strong>Signaler une anomalie</strong>
                  <span>Conteneur inaccessible, endommagé ou accès bloqué.</span>
                </Link>

                <Link to="/space/agent/routes">
                  <strong>Voir les étapes restantes</strong>
                  <span>Consulter l'ordre de passage de la tournée.</span>
                </Link>
              </div>
            </section>

            <section className="agent-card-pro">
              <h2>Anomalies ouvertes</h2>

              {incidents.length === 0 ? (
                <p>Aucune anomalie ouverte.</p>
              ) : (
                <div className="agent-incidents-list">
                  {incidents.map((incident) => (
                    <article className="agent-incident-card" key={incident.id}>
                      <div>
                        <h3>{incident.type_incident}</h3>
                        <p>{incident.description ?? "—"}</p>
                      </div>

                      <span>{STATUT_LABEL[incident.statut] ?? incident.statut}</span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default AgentSpace;
