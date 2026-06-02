function CitizenHistory() {
  const reports = [
    {
      id: 1,
      type: "Conteneur plein",
      location: "Place Centrale",
      date: "Aujourd’hui",
      status: "Envoyé",
      points: 20,
    },
    {
      id: 2,
      type: "Dépôt sauvage",
      location: "Avenue Verte",
      date: "Hier",
      status: "En cours",
      points: 35,
    },
    {
      id: 3,
      type: "Conteneur endommagé",
      location: "Rue des Écoles",
      date: "Cette semaine",
      status: "Traité",
      points: 50,
    },
  ];

  const badges = [
    {
      id: 1,
      title: "Premier signalement",
      description: "Premier problème déclaré sur la plateforme.",
      status: "Obtenu",
    },
    {
      id: 2,
      title: "Citoyen actif",
      description: "Plus de 10 signalements utiles envoyés.",
      status: "Obtenu",
    },
    {
      id: 3,
      title: "Quartier propre",
      description: "Contribution à la résolution de plusieurs anomalies.",
      status: "En progression",
    },
  ];

  const totalPoints = reports.reduce((sum, report) => sum + report.points, 0);
  const treatedReports = reports.filter((report) => report.status === "Traité").length;
  const activeReports = reports.filter((report) => report.status !== "Traité").length;

  return (
    <div className="citizen-history-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Suivi personnel</span>
          <h1>Historique citoyen</h1>
          <p>
            Consultez vos signalements, les points gagnés, vos badges et votre
            progression dans l’espace citoyen.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Signalements</span>
          <strong>{reports.length}</strong>
        </div>

        <div className="overview-card success">
          <span>Points gagnés</span>
          <strong>{totalPoints}</strong>
        </div>

        <div className="overview-card warning">
          <span>En cours</span>
          <strong>{activeReports}</strong>
        </div>

        <div className="overview-card success">
          <span>Traités</span>
          <strong>{treatedReports}</strong>
        </div>
      </div>

      <div className="citizen-history-grid">
        <section className="citizen-history-card large">
          <h2>Mes signalements</h2>

          <div className="citizen-history-list">
            {reports.map((report) => (
              <article className="citizen-history-row" key={report.id}>
                <div>
                  <h3>{report.type}</h3>
                  <p>{report.location}</p>
                </div>

                <div className="citizen-history-meta">
                  <span>{report.date}</span>
                  <span>{report.status}</span>
                  <strong>{report.points} pts</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="citizen-history-card">
          <h2>Progression</h2>

          <div className="citizen-progress-box">
            <span>Niveau actuel</span>
            <strong>Citoyen engagé</strong>

            <div className="progress-bar">
              <div className="progress-fill green" style={{ width: "68%" }}></div>
            </div>

            <p>Encore 320 points pour atteindre le niveau Ambassadeur Eco.</p>
          </div>
        </section>

        <section className="citizen-history-card">
          <h2>Badges</h2>

          <div className="citizen-badges-list">
            {badges.map((badge) => (
              <article className="citizen-badge-row" key={badge.id}>
                <div>
                  <h3>{badge.title}</h3>
                  <p>{badge.description}</p>
                </div>

                <span>{badge.status}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CitizenHistory;