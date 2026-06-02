import { useState } from "react";
import { useToast } from "../context/ToastContext";

function AgentMap() {
  const { showToast } = useToast();

  const [containers, setContainers] = useState([
    {
      id: 1,
      name: "Conteneur Centre-ville",
      location: "Place Centrale",
      fill: 95,
      priority: "Critique",
      x: "24%",
      y: "30%",
      status: "À collecter",
    },
    {
      id: 2,
      name: "Conteneur Quartier Nord",
      location: "Rue des Écoles",
      fill: 72,
      priority: "Attention",
      x: "53%",
      y: "46%",
      status: "À collecter",
    },
    {
      id: 3,
      name: "Conteneur Parc Sud",
      location: "Avenue Verte",
      fill: 38,
      priority: "Normal",
      x: "76%",
      y: "66%",
      status: "Optionnel",
    },
  ]);

  const markCollected = (id) => {
    setContainers((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: "Collecté", priority: "Normal", fill: 0 }
          : item
      )
    );

    showToast("Collecte validée.", "success");
  };

  const getClass = (priority) => {
    if (priority === "Critique") return "critical";
    if (priority === "Attention") return "warning";
    return "normal";
  };

  const collectedCount = containers.filter(
    (item) => item.status === "Collecté"
  ).length;

  const priorityCount = containers.filter(
    (item) => item.priority !== "Normal"
  ).length;

  return (
    <div className="agent-map-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Navigation terrain</span>
          <h1>Carte de tournée</h1>
          <p>
            Suivez votre tournée en direct, visualisez les priorités et validez
            rapidement les conteneurs collectés.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Étapes</span>
          <strong>{containers.length}</strong>
        </div>

        <div className="overview-card success">
          <span>Collectés</span>
          <strong>{collectedCount}</strong>
        </div>

        <div className="overview-card warning">
          <span>Prioritaires</span>
          <strong>{priorityCount}</strong>
        </div>

        <div className="overview-card">
          <span>Distance</span>
          <strong>18.7 km</strong>
        </div>
      </div>

      <div className="agent-map-grid">
        <section className="agent-map-card">
          <div className="agent-tour-map">
            <div className="agent-tour-path"></div>

            <span className="agent-zone-label agent-zone-center">
              CENTRE-VILLE
            </span>
            <span className="agent-zone-label agent-zone-north">
              QUARTIER NORD
            </span>
            <span className="agent-zone-label agent-zone-south">
              PARC SUD
            </span>

            {containers.map((container) => (
              <button
                key={container.id}
                className={`agent-tour-marker ${getClass(container.priority)}`}
                style={{ left: container.x, top: container.y }}
                title={container.name}
              >
                {container.fill}%
              </button>
            ))}
          </div>
        </section>

        <section className="agent-map-results">
          <h2>Étapes terrain</h2>

          <div className="agent-map-list">
            {containers.map((container) => (
              <article className="agent-map-row" key={container.id}>
                <div>
                  <h3>{container.name}</h3>
                  <p>{container.location}</p>

                  <div className="agent-step-tags">
                    <span className={getClass(container.priority)}>
                      {container.priority}
                    </span>
                    <span>{container.status}</span>
                  </div>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => markCollected(container.id)}
                  disabled={container.status === "Collecté"}
                >
                  Valider
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AgentMap;