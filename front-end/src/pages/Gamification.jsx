function Gamification() {
  const player = {
    name: "Citoyen engagé",
    points: 1280,
    level: "Ambassadeur Eco",
    rank: 4,
    reports: 18,
    co2Saved: "42 kg",
  };

  const badges = [
    {
      id: 1,
      title: "Premier signalement",
      description: "A envoyé son premier signalement citoyen.",
      status: "Obtenu",
    },
    {
      id: 2,
      title: "Quartier propre",
      description: "A contribué à 5 signalements résolus.",
      status: "Obtenu",
    },
    {
      id: 3,
      title: "Eco Ambassadeur",
      description: "A dépassé 1000 points d’engagement.",
      status: "Obtenu",
    },
    {
      id: 4,
      title: "Champion zéro dépôt",
      description: "Participer à 3 défis collectifs.",
      status: "À débloquer",
    },
  ];

  const challenges = [
    {
      id: 1,
      title: "Zéro débordement - Quartier Centre",
      description: "Signaler rapidement les conteneurs proches du débordement.",
      progress: 72,
      reward: "250 points",
      status: "En cours",
    },
    {
      id: 2,
      title: "Ville propre ce mois-ci",
      description: "Réduire les dépôts sauvages grâce aux signalements citoyens.",
      progress: 48,
      reward: "Badge collectif",
      status: "En cours",
    },
    {
      id: 3,
      title: "Participation citoyenne",
      description: "Atteindre 100 signalements utiles sur la plateforme.",
      progress: 86,
      reward: "Classement premium",
      status: "Bientôt terminé",
    },
  ];

  const leaderboard = [
    { id: 1, name: "Sarah M.", points: 2240, city: "Centre-ville" },
    { id: 2, name: "Karim B.", points: 1980, city: "Quartier Nord" },
    { id: 3, name: "Julie R.", points: 1560, city: "Parc Sud" },
    { id: 4, name: "Citoyen engagé", points: 1280, city: "Centre-ville" },
  ];

  const unlockedBadges = badges.filter((badge) => badge.status === "Obtenu").length;
  const activeChallenges = challenges.filter(
    (challenge) => challenge.status === "En cours"
  ).length;

  return (
    <div className="gamification-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Engagement citoyen</span>
          <h1>Gamification</h1>
          <p>
            Encouragez la participation citoyenne grâce aux points, badges,
            défis collectifs et classements écoresponsables.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card success">
          <span>Points</span>
          <strong>{player.points}</strong>
        </div>

        <div className="overview-card">
          <span>Rang</span>
          <strong>#{player.rank}</strong>
        </div>

        <div className="overview-card warning">
          <span>Badges obtenus</span>
          <strong>{unlockedBadges}</strong>
        </div>

        <div className="overview-card">
          <span>CO₂ évité</span>
          <strong>{player.co2Saved}</strong>
        </div>
      </div>

      <div className="gamification-layout">
        <section className="gamification-profile-card">
          <div className="gamification-avatar">
            {player.name.charAt(0).toUpperCase()}
          </div>

          <h2>{player.name}</h2>
          <p>{player.level}</p>

          <div className="gamification-score-box">
            <span>Score citoyen</span>
            <strong>{player.points} pts</strong>
          </div>

          <div className="gamification-stats-list">
            <div>
              <span>Signalements utiles</span>
              <strong>{player.reports}</strong>
            </div>

            <div>
              <span>Classement local</span>
              <strong>#{player.rank}</strong>
            </div>

            <div>
              <span>Défis actifs</span>
              <strong>{activeChallenges}</strong>
            </div>
          </div>
        </section>

        <section className="gamification-card">
          <h2>Défis actifs</h2>

          <div className="challenge-list">
            {challenges.map((challenge) => (
              <article className="challenge-card" key={challenge.id}>
                <div className="challenge-header">
                  <div>
                    <h3>{challenge.title}</h3>
                    <p>{challenge.description}</p>
                  </div>

                  <span className="challenge-status">{challenge.status}</span>
                </div>

                <div className="challenge-progress-info">
                  <span>Progression</span>
                  <strong>{challenge.progress}%</strong>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill green"
                    style={{ width: `${challenge.progress}%` }}
                  ></div>
                </div>

                <div className="challenge-reward">
                  <span>Récompense</span>
                  <strong>{challenge.reward}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="gamification-bottom-grid">
        <section className="gamification-card">
          <h2>Badges</h2>

          <div className="badges-grid">
            {badges.map((badge) => (
              <article
                className={
                  badge.status === "Obtenu"
                    ? "badge-card unlocked"
                    : "badge-card locked"
                }
                key={badge.id}
              >
                <h3>{badge.title}</h3>
                <p>{badge.description}</p>
                <span>{badge.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="gamification-card">
          <h2>Classement citoyen</h2>

          <div className="leaderboard-list">
            {leaderboard.map((user, index) => (
              <article
                className={
                  user.name === player.name
                    ? "leaderboard-row current"
                    : "leaderboard-row"
                }
                key={user.id}
              >
                <span className="leaderboard-rank">#{index + 1}</span>

                <div>
                  <h3>{user.name}</h3>
                  <p>{user.city}</p>
                </div>

                <strong>{user.points} pts</strong>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Gamification;