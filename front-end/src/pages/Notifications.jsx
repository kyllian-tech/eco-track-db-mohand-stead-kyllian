function Notifications() {
  const notifications = [
    {
      id: 1,
      title: "Conteneur critique détecté",
      message: "Le conteneur Centre-ville a atteint un niveau de remplissage élevé.",
      type: "Critique",
      time: "Il y a 5 min",
      status: "Non lu",
    },
    {
      id: 2,
      title: "Nouvelle tournée générée",
      message: "Une tournée optimisée a été planifiée pour le Quartier Nord.",
      type: "Information",
      time: "Il y a 20 min",
      status: "Lu",
    },
    {
      id: 3,
      title: "Signalement citoyen reçu",
      message: "Un nouveau signalement a été envoyé depuis Avenue Verte.",
      type: "Signalement",
      time: "Il y a 45 min",
      status: "Non lu",
    },
    {
      id: 4,
      title: "Rapport analytics disponible",
      message: "Les indicateurs de performance ont été mis à jour.",
      type: "Rapport",
      time: "Aujourd’hui",
      status: "Lu",
    },
  ];

  const unreadCount = notifications.filter(
    (notification) => notification.status === "Non lu"
  ).length;

  const criticalCount = notifications.filter(
    (notification) => notification.type === "Critique"
  ).length;

  return (
    <div className="notifications-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Centre d’alertes</span>
          <h1>Notifications</h1>
          <p>
            Suivez les alertes importantes liées aux conteneurs, tournées,
            signalements et rapports de la plateforme.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total</span>
          <strong>{notifications.length}</strong>
        </div>

        <div className="overview-card danger">
          <span>Critiques</span>
          <strong>{criticalCount}</strong>
        </div>

        <div className="overview-card warning">
          <span>Non lues</span>
          <strong>{unreadCount}</strong>
        </div>

        <div className="overview-card success">
          <span>État système</span>
          <strong>OK</strong>
        </div>
      </div>

      <div className="panel-pro">
        <div className="notifications-list-pro">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`notification-card-pro ${
                notification.status === "Non lu" ? "unread" : ""
              }`}
            >
              <div className="notification-main">
                <div className={`notification-indicator ${notification.type.toLowerCase()}`} />

                <div>
                  <div className="notification-title-row">
                    <h3>{notification.title}</h3>
                    <span className="notification-type">{notification.type}</span>
                  </div>

                  <p>{notification.message}</p>

                  <div className="notification-meta">
                    <span>{notification.time}</span>
                    <span>{notification.status}</span>
                  </div>
                </div>
              </div>

              <button className="secondary-btn notification-action">
                Voir détail
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Notifications;