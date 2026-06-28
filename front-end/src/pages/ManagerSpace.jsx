import { useState, useEffect } from "react";
import { getContainers } from "../api/containers";
import { getSignalements } from "../api/signalements";
import { getRoutes } from "../api/routes";

function ManagerSpace() {
  const [stats, setStats] = useState({ containers: 0, signalements: 0, tournees: 0, totalSignalements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [containers, signalements, routes] = await Promise.all([
          getContainers(),
          getSignalements(),
          getRoutes(),
        ]);

        const openStatuts = ["OUVERT", "EN_COURS"];
        const plannedStatuts = ["PLANIFIEE"];

        setStats({
          containers: containers.length,
          signalements: signalements.filter(s => openStatuts.includes(s.statut)).length,
          tournees: routes.filter(r => plannedStatuts.includes(r.statut)).length,
          totalSignalements: signalements.length,
        });
      } catch {
        // silently fail — page reste affichable avec 0
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="role-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Profil gestionnaire</span>
          <h1>Espace Gestionnaire</h1>
          <p>
            Supervisez les conteneurs, les tournées, les signalements, les
            alertes et les indicateurs de performance.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card success">
          <span>Conteneurs suivis</span>
          <strong>{loading ? "…" : stats.containers}</strong>
        </div>

        <div className="overview-card danger">
          <span>Signalements ouverts</span>
          <strong>{loading ? "…" : stats.signalements}</strong>
        </div>

        <div className="overview-card warning">
          <span>Tournées planifiées</span>
          <strong>{loading ? "…" : stats.tournees}</strong>
        </div>

        <div className="overview-card">
          <span>Total signalements</span>
          <strong>{loading ? "…" : stats.totalSignalements}</strong>
        </div>
      </div>

      <div className="role-grid">
        <section className="role-card">
          <h2>Responsabilités</h2>

          <div className="role-actions-list">
            <div>
              <strong>Monitoring temps réel</strong>
              <span>Identifier les conteneurs critiques et les alertes.</span>
            </div>

            <div>
              <strong>Optimisation des tournées</strong>
              <span>Créer et ajuster les tournées selon les priorités.</span>
            </div>

            <div>
              <strong>Analyse décisionnelle</strong>
              <span>Consulter les KPI et générer des rapports.</span>
            </div>
          </div>
        </section>

        <section className="role-card">
          <h2>Priorités du jour</h2>

          <div className="role-list">
            <div>
              <strong>Signalements ouverts</strong>
              <span>
                {loading
                  ? "Chargement..."
                  : `${stats.signalements} signalement(s) en attente de traitement.`}
              </span>
            </div>

            <div>
              <strong>Tournées à lancer</strong>
              <span>
                {loading
                  ? "Chargement..."
                  : `${stats.tournees} tournée(s) planifiée(s) en attente.`}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ManagerSpace;
