import { useState, useEffect } from "react";
import { getProfiles } from "../api/profiles";
import { getContainers } from "../api/containers";
import { getSignalements } from "../api/signalements";

function AdminSpace() {
  const [stats, setStats] = useState({
    users: 0,
    containers: 0,
    signalements: 0,
    open: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProfiles(),
      getContainers(),
      getSignalements(),
    ])
      .then(([profiles, containers, signalements]) => {
        const p = Array.isArray(profiles) ? profiles : (profiles?.data ?? []);
        const c = Array.isArray(containers) ? containers : (containers?.data ?? []);
        const s = Array.isArray(signalements) ? signalements : (signalements?.data ?? []);
        setStats({
          users: p.length,
          containers: c.length,
          signalements: s.length,
          open: s.filter((sig) => sig.statut === "OUVERT").length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="role-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Profil administrateur</span>
          <h1>Espace Administrateur</h1>
          <p>
            Gérez les utilisateurs, les rôles, les permissions, la sécurité et
            la configuration globale de la plateforme.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Utilisateurs</span>
          <strong>{loading ? "…" : stats.users}</strong>
        </div>

        <div className="overview-card success">
          <span>Conteneurs</span>
          <strong>{loading ? "…" : stats.containers}</strong>
        </div>

        <div className="overview-card warning">
          <span>Signalements</span>
          <strong>{loading ? "…" : stats.signalements}</strong>
        </div>

        <div className="overview-card danger">
          <span>Signalements ouverts</span>
          <strong>{loading ? "…" : stats.open}</strong>
        </div>
      </div>

      <div className="role-grid">
        <section className="role-card">
          <h2>Administration</h2>

          <div className="role-actions-list">
            <div>
              <strong>Gestion des utilisateurs</strong>
              <span>Créer, modifier ou désactiver un compte.</span>
            </div>

            <div>
              <strong>Rôles et permissions</strong>
              <span>Attribuer les droits selon les profils.</span>
            </div>

            <div>
              <strong>Configuration plateforme</strong>
              <span>Gérer les seuils, alertes et paramètres globaux.</span>
            </div>
          </div>
        </section>

        <section className="role-card">
          <h2>Sécurité</h2>

          <div className="role-list">
            <div>
              <strong>Supervision cyber</strong>
              <span>IDS, SIEM, logs et alertes critiques.</span>
            </div>

            <div>
              <strong>Audit trail</strong>
              <span>Toutes les actions sensibles sont tracées.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminSpace;
