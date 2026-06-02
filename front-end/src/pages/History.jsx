function History() {
  const activities = [
    {
      id: 1,
      title: "Conteneur ajouté",
      description: "Un nouveau conteneur a été enregistré dans la zone Centre-ville.",
      category: "Conteneurs",
      actor: "Étudiant Dev",
      date: "Aujourd’hui",
      time: "13:45",
      level: "Succès",
    },
    {
      id: 2,
      title: "Tournée optimisée",
      description: "Une tournée a été générée automatiquement pour le Quartier Nord.",
      category: "Tournées",
      actor: "Système",
      date: "Aujourd’hui",
      time: "12:20",
      level: "Information",
    },
    {
      id: 3,
      title: "Signalement traité",
      description: "Le signalement concernant Avenue Verte a été marqué comme résolu.",
      category: "Signalements",
      actor: "Agent A",
      date: "Hier",
      time: "17:10",
      level: "Succès",
    },
    {
      id: 4,
      title: "Connexion utilisateur",
      description: "Connexion réussie à l’espace connecté ECOTRACK.",
      category: "Sécurité",
      actor: "Étudiant Dev",
      date: "Hier",
      time: "09:32",
      level: "Information",
    },
    {
      id: 5,
      title: "Alerte critique",
      description: "Un conteneur a dépassé le seuil critique de remplissage.",
      category: "Alertes",
      actor: "Système",
      date: "Cette semaine",
      time: "08:15",
      level: "Critique",
    },
  ];

  const total = activities.length;
  const success = activities.filter((item) => item.level === "Succès").length;
  const info = activities.filter((item) => item.level === "Information").length;
  const critical = activities.filter((item) => item.level === "Critique").length;

  const getLevelClass = (level) => {
    if (level === "Succès") return "success";
    if (level === "Critique") return "critical";
    return "info";
  };

  return (
    <div className="history-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Journal d’activité</span>
          <h1>Historique</h1>
          <p>
            Consultez les actions récentes de la plateforme : opérations,
            alertes, connexions et événements système.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total événements</span>
          <strong>{total}</strong>
        </div>

        <div className="overview-card success">
          <span>Succès</span>
          <strong>{success}</strong>
        </div>

        <div className="overview-card">
          <span>Informations</span>
          <strong>{info}</strong>
        </div>

        <div className="overview-card danger">
          <span>Critiques</span>
          <strong>{critical}</strong>
        </div>
      </div>

      <div className="panel-pro">
        <div className="history-timeline">
          {activities.map((activity) => (
            <article className="history-item" key={activity.id}>
              <div
                className={`history-marker ${getLevelClass(activity.level)}`}
              ></div>

              <div className="history-content">
                <div className="history-header">
                  <div>
                    <h3>{activity.title}</h3>
                    <p>{activity.description}</p>
                  </div>

                  <span
                    className={`history-level ${getLevelClass(activity.level)}`}
                  >
                    {activity.level}
                  </span>
                </div>

                <div className="history-meta">
                  <span>{activity.category}</span>
                  <span>{activity.actor}</span>
                  <span>
                    {activity.date} à {activity.time}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;