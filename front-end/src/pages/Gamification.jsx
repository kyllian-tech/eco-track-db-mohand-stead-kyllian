import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getBadges, getUserBadges, getChallenges } from "../api/badges";

function Gamification() {
  const { user } = useAuth();

  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = user?.id
      ? Promise.all([getBadges(), getUserBadges({ user_id: user.id }), getChallenges()])
      : Promise.all([getBadges(), Promise.resolve([]), getChallenges()]);

    fetchAll
      .then(([b, ub, c]) => {
        setBadges(Array.isArray(b) ? b : (b?.data ?? []));
        setUserBadges(Array.isArray(ub) ? ub : (ub?.data ?? []));
        setChallenges(Array.isArray(c) ? c : (c?.data ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const ownedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));
  const unlockedCount = ownedBadgeIds.size;

  const badgesDisplay = badges.map((b) => ({
    ...b,
    obtained: ownedBadgeIds.has(b.id),
  }));

  if (loading) {
    return (
      <div className="gamification-page-pro">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">Engagement citoyen</span>
            <h1>Gamification</h1>
          </div>
        </div>
        <p>Chargement…</p>
      </div>
    );
  }

  return (
    <div className="gamification-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Engagement citoyen</span>
          <h1>Gamification</h1>
          <p>
            Encouragez la participation citoyenne grâce aux badges et défis
            collectifs écoresponsables.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card success">
          <span>Badges obtenus</span>
          <strong>{unlockedCount}</strong>
        </div>

        <div className="overview-card">
          <span>Badges disponibles</span>
          <strong>{badges.length}</strong>
        </div>

        <div className="overview-card warning">
          <span>Défis actifs</span>
          <strong>{challenges.length}</strong>
        </div>
      </div>

      <div className="gamification-layout">
        <section className="gamification-profile-card">
          <div className="gamification-avatar">
            {(user?.full_name ?? "C").charAt(0).toUpperCase()}
          </div>

          <h2>{user?.full_name ?? "Citoyen"}</h2>
          <p>{user?.email}</p>

          <div className="gamification-stats-list">
            <div>
              <span>Badges débloqués</span>
              <strong>{unlockedCount} / {badges.length}</strong>
            </div>

            <div>
              <span>Défis disponibles</span>
              <strong>{challenges.length}</strong>
            </div>
          </div>
        </section>

        <section className="gamification-card">
          <h2>Défis</h2>

          {challenges.length === 0 ? (
            <p>Aucun défi disponible pour le moment.</p>
          ) : (
            <div className="challenge-list">
              {challenges.map((challenge) => (
                <article className="challenge-card" key={challenge.id}>
                  <div className="challenge-header">
                    <div>
                      <h3>{challenge.titre ?? challenge.title ?? "Défi"}</h3>
                      <p>{challenge.description}</p>
                    </div>

                    {challenge.statut && (
                      <span className="challenge-status">{challenge.statut}</span>
                    )}
                  </div>

                  {challenge.objectif_signalements && (
                    <div className="challenge-reward">
                      <span>Objectif</span>
                      <strong>{challenge.objectif_signalements} signalements</strong>
                    </div>
                  )}

                  {challenge.date_fin && (
                    <div className="challenge-reward">
                      <span>Fin</span>
                      <strong>
                        {new Date(challenge.date_fin).toLocaleDateString("fr-FR")}
                      </strong>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="gamification-bottom-grid">
        <section className="gamification-card">
          <h2>Badges</h2>

          {badgesDisplay.length === 0 ? (
            <p>Aucun badge disponible.</p>
          ) : (
            <div className="badges-grid">
              {badgesDisplay.map((badge) => (
                <article
                  className={badge.obtained ? "badge-card unlocked" : "badge-card locked"}
                  key={badge.id}
                >
                  <h3>{badge.nom ?? badge.name ?? "Badge"}</h3>
                  <p>{badge.description}</p>
                  <span>{badge.obtained ? "Obtenu" : "À débloquer"}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Gamification;
