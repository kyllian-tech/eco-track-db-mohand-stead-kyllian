import { Link } from "react-router-dom";

function AgentSpace() {
  const routeSteps = [
    {
      id: 1,
      container: "Conteneur Quartier Nord",
      location: "Rue des Écoles",
      fillLevel: 72,
      status: "À collecter",
      priority: "Attention",
    },
    {
      id: 2,
      container: "Conteneur Centre-ville",
      location: "Place Centrale",
      fillLevel: 95,
      status: "Prioritaire",
      priority: "Critique",
    },
    {
      id: 3,
      container: "Conteneur Parc Sud",
      location: "Avenue Verte",
      fillLevel: 38,
      status: "Optionnel",
      priority: "Normal",
    },
  ];

  const incidents = [
    {
      id: 1,
      title: "Accès partiellement bloqué",
      location: "Rue des Écoles",
      status: "À vérifier",
    },
    {
      id: 2,
      title: "Conteneur endommagé",
      location: "Place Centrale",
      status: "Urgent",
    },
  ];

  const completedSteps = 15;
  const totalSteps = 24;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="agent-dashboard-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Espace agent</span>
          <h1>Dashboard Agent de collecte</h1>
          <p>
            Suivez votre tournée du jour, validez les collectes et remontez les
            anomalies constatées sur le terrain.
          </p>
        </div>

        <Link to="/space/agent/routes" className="primary-btn">
          Voir la tournée
        </Link>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Tournée du jour</span>
          <strong>1</strong>
        </div>

        <div className="overview-card success">
          <span>Collectes validées</span>
          <strong>{completedSteps}</strong>
        </div>

        <div className="overview-card warning">
          <span>Restantes</span>
          <strong>{totalSteps - completedSteps}</strong>
        </div>

        <div className="overview-card danger">
          <span>Anomalies terrain</span>
          <strong>{incidents.length}</strong>
        </div>
      </div>

      <div className="agent-dashboard-grid">
        <section className="agent-card-pro large">
          <div className="agent-card-header">
            <div>
              <h2>Tournée assignée</h2>
              <p>Quartier Nord — Agent Collecte</p>
            </div>

            <span className="agent-status-badge">En cours</span>
          </div>

          <div className="agent-route-summary">
            <div>
              <span>Distance estimée</span>
              <strong>18.7 km</strong>
            </div>

            <div>
              <span>Durée estimée</span>
              <strong>2h10</strong>
            </div>

            <div>
              <span>Conteneurs</span>
              <strong>{totalSteps}</strong>
            </div>
          </div>

          <div className="agent-progress-block">
            <div className="agent-progress-info">
              <span>Progression de la tournée</span>
              <strong>{progress}%</strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill green"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="agent-route-steps">
            {routeSteps.map((step) => (
              <article className="agent-step-card" key={step.id}>
                <div>
                  <h3>{step.container}</h3>
                  <p>{step.location}</p>
                </div>

                <div className="agent-step-meta">
                  <span>{step.fillLevel}%</span>
                  <strong>{step.status}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="agent-card-pro">
          <h2>Actions rapides</h2>

          <div className="agent-action-list">
            <Link to="/space/agent/routes">
              <strong>Valider une collecte</strong>
              <span>Confirmer le passage et le volume collecté.</span>
            </Link>

            <Link to="/space/agent/reports">
              <strong>Signaler une anomalie</strong>
              <span>Conteneur inaccessible, endommagé ou accès bloqué.</span>
            </Link>

            <Link to="/space/agent/routes">
              <strong>Voir les étapes restantes</strong>
              <span>Consulter l’ordre de passage de la tournée.</span>
            </Link>
          </div>
        </section>

        <section className="agent-card-pro">
          <h2>Anomalies à traiter</h2>

          <div className="agent-incidents-list">
            {incidents.map((incident) => (
              <article className="agent-incident-card" key={incident.id}>
                <div>
                  <h3>{incident.title}</h3>
                  <p>{incident.location}</p>
                </div>

                <span>{incident.status}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AgentSpace;