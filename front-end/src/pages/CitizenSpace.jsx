import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getSignalements } from "../api/signalements";
import { getUserBadges, getChallenges } from "../api/badges";

function CitizenSpace() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    signalements: 0,
    badges: 0,
    challenges: 0,
  });
  const [lastReports, setLastReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      getSignalements({ user_id: user.id }),
      getUserBadges({ user_id: user.id }),
      getChallenges(),
    ])
      .then(([rpts, ub, challenges]) => {
        const reports = Array.isArray(rpts) ? rpts : (rpts?.data ?? []);
        const badges = Array.isArray(ub) ? ub : (ub?.data ?? []);
        const challs = Array.isArray(challenges) ? challenges : (challenges?.data ?? []);

        setStats({
          signalements: reports.length,
          badges: badges.length,
          challenges: challs.length,
        });
        setLastReports(reports.slice(0, 2));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const STATUT_LABEL = {
    OUVERT: "Envoyé",
    EN_COURS: "En traitement",
    RESOLU: "Résolu",
  };

  return (
    <div className="role-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Profil citoyen</span>
          <h1>Espace Citoyen</h1>
          <p>
            Suivez vos signalements, votre engagement citoyen, vos badges et
            votre impact environnemental.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Signalements envoyés</span>
          <strong>{loading ? "…" : stats.signalements}</strong>
        </div>

        <div className="overview-card success">
          <span>Badges obtenus</span>
          <strong>{loading ? "…" : stats.badges}</strong>
        </div>

        <div className="overview-card warning">
          <span>Défis disponibles</span>
          <strong>{loading ? "…" : stats.challenges}</strong>
        </div>

        <div className="overview-card">
          <span>Bienvenue</span>
          <strong>{user?.full_name?.split(" ")[0] ?? "Citoyen"}</strong>
        </div>
      </div>

      <div className="role-grid">
        <section className="role-card">
          <h2>Actions citoyennes</h2>

          <div className="role-actions-list">
            <div>
              <strong>Signaler un problème</strong>
              <span>Déclarer un conteneur plein ou une anomalie.</span>
            </div>

            <div>
              <strong>Participer aux défis</strong>
              <span>Contribuer aux objectifs collectifs de propreté.</span>
            </div>

            <div>
              <strong>Consulter son impact</strong>
              <span>Suivre les badges et l'historique de vos actions.</span>
            </div>
          </div>
        </section>

        <section className="role-card">
          <h2>Derniers signalements</h2>

          {loading ? (
            <p>Chargement…</p>
          ) : lastReports.length === 0 ? (
            <p>Aucun signalement pour le moment.</p>
          ) : (
            <div className="role-list">
              {lastReports.map((r) => (
                <div key={r.id}>
                  <strong>{r.type_incident}</strong>
                  <span>{STATUT_LABEL[r.statut] ?? r.statut}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CitizenSpace;
