function CitizenNotifications() {
  const notifications = [
    {
      id: 1,
      title: "Signalement reçu",
      message:
        "Votre signalement concernant Place Centrale a bien été enregistré.",
      category: "Signalement",
      status: "Non lu",
      date: "Il y a 10 min",
    },
    {
      id: 2,
      title: "Signalement pris en charge",
      message:
        "Un agent a été affecté au traitement du dépôt sauvage Avenue Verte.",
      category: "Suivi",
      status: "Lu",
      date: "Hier",
    },
    {
      id: 3,
      title: "Nouveau badge obtenu",
      message:
        "Vous avez obtenu le badge Citoyen actif grâce à vos contributions.",
      category: "Gamification",
      status: "Non lu",
      date: "Cette semaine",
    },
    {
      id: 4,
      title: "Nouveau défi disponible",
      message:
        "Le défi Ville propre ce mois-ci est maintenant disponible dans votre espace.",
      category: "Défi",
      status: "Lu",
      date: "Cette semaine",
    },
  ];

  const unread = notifications.filter(
    (notification) => notification.status === "Non lu"
  ).length;

  const followUp = notifications.filter(
    (notification) => notification.category === "Suivi"
  ).length;

  const gamification = notifications.filter(
    (notification) => notification.category === "Gamification"
  ).length;

  return (
    <div className="citizen-notifications-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Messages citoyens</span>
          <h1>Notifications</h1>
          <p>
            Suivez les informations importantes liées à vos signalements, vos
            badges et vos défis citoyens.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total</span>
          <strong>{notifications.length}</strong>
        </div>

        <div className="overview-card warning">
          <span>Non lues</span>
          <strong>{unread}</strong>
        </div>

        <div className="overview-card success">
          <span>Suivi</span>
          <strong>{followUp}</strong>
        </div>

        <div className="overview-card">
          <span>Gamification</span>
          <strong>{gamification}</strong>
        </div>
      </div>

      <div className="panel-pro">
        <div className="citizen-notifications-list">
          {notifications.map((notification) => (
            <article
              className={
                notification.status === "Non lu"
                  ? "citizen-notification-card unread"
                  : "citizen-notification-card"
              }
              key={notification.id}
            >
              <div>
                <div className="citizen-notification-header">
                  <h3>{notification.title}</h3>
                  <span>{notification.category}</span>
                </div>

                <p>{notification.message}</p>

                <div className="citizen-notification-meta">
                  <span>{notification.date}</span>
                  <strong>{notification.status}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CitizenNotifications;