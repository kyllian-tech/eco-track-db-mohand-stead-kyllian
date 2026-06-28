import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getSignalements } from "../api/signalements";
import { getUserBadges, getBadges } from "../api/badges";

const STATUT_LABEL = {
  OUVERT: "Envoyé",
  EN_COURS: "En cours",
  RESOLU: "Traité",
};

function CitizenHistory() {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      getSignalements({ user_id: user.id }),
      getUserBadges({ user_id: user.id }),
      getBadges(),
    ])
      .then(([rpts, ub, badges]) => {
        setReports(Array.isArray(rpts) ? rpts : (rpts?.data ?? []));
        setUserBadges(Array.isArray(ub) ? ub : (ub?.data ?? []));
        setAllBadges(Array.isArray(badges) ? badges : (badges?.data ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const resolvedCount = reports.filter((r) => r.statut === "RESOLU").length;
  const activeCount = reports.filter((r) => r.statut !== "RESOLU").length;

  const ownedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));
  const badgesDisplay = allBadges.map((b) => ({
    ...b,
    obtained: ownedBadgeIds.has(b.id),
  }));

  return (
    <div className="citizen-history-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Suivi personnel</span>
          <h1>Historique citoyen</h1>
          <p>
            Consultez vos signalements, vos badges et votre progression dans
            l'espace citoyen.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Signalements</span>
          <strong>{reports.length}</strong>
        </div>

        <div className="overview-card success">
          <span>Badges obtenus</span>
          <strong>{userBadges.length}</strong>
        </div>

        <div className="overview-card warning">
          <span>En cours</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="overview-card success">
          <span>Traités</span>
          <strong>{resolvedCount}</strong>
        </div>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div className="citizen-history-grid">
          <section className="citizen-history-card large">
            <h2>Mes signalements</h2>

            {reports.length === 0 ? (
              <p>Aucun signalement pour le moment.</p>
            ) : (
              <div className="citizen-history-list">
                {reports.map((report) => (
                  <article className="citizen-history-row" key={report.id}>
                    <div>
                      <h3>{report.type_incident}</h3>
                      <p>{report.description ?? "—"}</p>
                    </div>

                    <div className="citizen-history-meta">
                      <span>
                        {new Date(report.created_at).toLocaleDateString("fr-FR")}
                      </span>
                      <span>{STATUT_LABEL[report.statut] ?? report.statut}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="citizen-history-card">
            <h2>Progression</h2>

            <div className="citizen-progress-box">
              <span>Signalements traités</span>
              <strong>
                {resolvedCount} / {reports.length}
              </strong>

              <div className="progress-bar">
                <div
                  className="progress-fill green"
                  style={{
                    width:
                      reports.length > 0
                        ? `${Math.round((resolvedCount / reports.length) * 100)}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </section>

          <section className="citizen-history-card">
            <h2>Badges</h2>

            {badgesDisplay.length === 0 ? (
              <p>Aucun badge disponible.</p>
            ) : (
              <div className="citizen-badges-list">
                {badgesDisplay.map((badge) => (
                  <article className="citizen-badge-row" key={badge.id}>
                    <div>
                      <h3>{badge.nom ?? badge.name ?? "Badge"}</h3>
                      <p>{badge.description}</p>
                    </div>

                    <span>{badge.obtained ? "Obtenu" : "À débloquer"}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default CitizenHistory;
