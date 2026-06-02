import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function RoutesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [steps, setSteps] = useState([
    {
      id: 1,
      container: "Conteneur Quartier Nord",
      location: "Rue des Écoles",
      fillLevel: 72,
      priority: "Attention",
      status: "À collecter",
      volume: "Moyen",
    },
    {
      id: 2,
      container: "Conteneur Centre-ville",
      location: "Place Centrale",
      fillLevel: 95,
      priority: "Critique",
      status: "À collecter",
      volume: "Élevé",
    },
    {
      id: 3,
      container: "Conteneur Parc Sud",
      location: "Avenue Verte",
      fillLevel: 38,
      priority: "Normal",
      status: "Optionnel",
      volume: "Faible",
    },
    {
      id: 4,
      container: "Conteneur Châtelet",
      location: "Châtelet",
      fillLevel: 70,
      priority: "Attention",
      status: "À collecter",
      volume: "Moyen",
    },
  ]);

  const [availableContainers] = useState([
    {
      id: 1,
      name: "Conteneur Centre-ville",
      location: "Place Centrale",
      zone: "Centre-ville",
      fillLevel: 95,
      distance: 2.4,
      priority: "Critique",
    },
    {
      id: 2,
      name: "Conteneur Quartier Nord",
      location: "Rue des Écoles",
      zone: "Quartier Nord",
      fillLevel: 72,
      distance: 4.8,
      priority: "Attention",
    },
    {
      id: 3,
      name: "Conteneur Parc Sud",
      location: "Avenue Verte",
      zone: "Parc Sud",
      fillLevel: 38,
      distance: 6.2,
      priority: "Normal",
    },
    {
      id: 4,
      name: "Conteneur Châtelet",
      location: "Centre historique",
      zone: "Centre-ville",
      fillLevel: 70,
      distance: 3.1,
      priority: "Attention",
    },
    {
      id: 5,
      name: "Conteneur Gare",
      location: "Avenue de la Gare",
      zone: "Centre-ville",
      fillLevel: 88,
      distance: 5.3,
      priority: "Attention",
    },
    {
      id: 6,
      name: "Conteneur Marché Nord",
      location: "Marché couvert",
      zone: "Quartier Nord",
      fillLevel: 91,
      distance: 4.1,
      priority: "Critique",
    },
  ]);

  const [routes, setRoutes] = useState([
    {
      id: 1,
      name: "Tournée Centre-ville",
      date: "Aujourd’hui",
      zone: "Centre-ville",
      agent: "Agent A",
      fillThreshold: 70,
      maxDistance: 15,
      containers: 18,
      distance: "12.4 km",
      duration: "1h45",
      status: "En cours",
      optimization: "Optimisée",
      priority: "Haute",
      notified: true,
      itinerary: [
        "Place Centrale",
        "Centre historique",
        "Avenue de la Gare",
      ],
    },
    {
      id: 2,
      name: "Tournée Quartier Nord",
      date: "Demain",
      zone: "Quartier Nord",
      agent: "Agent B",
      fillThreshold: 70,
      maxDistance: 20,
      containers: 24,
      distance: "18.7 km",
      duration: "2h10",
      status: "Planifiée",
      optimization: "À optimiser",
      priority: "Critique",
      notified: false,
      itinerary: ["Rue des Écoles", "Marché couvert"],
    },
    {
      id: 3,
      name: "Tournée Parc Sud",
      date: "Hier",
      zone: "Parc Sud",
      agent: "Agent C",
      fillThreshold: 60,
      maxDistance: 10,
      containers: 12,
      distance: "8.9 km",
      duration: "1h05",
      status: "Terminée",
      optimization: "Optimisée",
      priority: "Normale",
      notified: true,
      itinerary: ["Avenue Verte"],
    },
  ]);

  const [newRoute, setNewRoute] = useState({
    name: "",
    date: "",
    zone: "Centre-ville",
    agent: "Agent A",
    fillThreshold: 70,
    maxDistance: 20,
    priority: "Normale",
  });

  const completedSteps = steps.filter((step) => step.status === "Collecté").length;
  const ignoredSteps = steps.filter((step) => step.status === "Ignoré").length;
  const pendingSteps = steps.length - completedSteps - ignoredSteps;
  const progress = Math.round((completedSteps / steps.length) * 100);

  const selectedContainers = useMemo(() => {
    return availableContainers
      .filter((container) => {
        const sameZone = container.zone === newRoute.zone;
        const enoughFill = container.fillLevel >= Number(newRoute.fillThreshold);
        const insideDistance = container.distance <= Number(newRoute.maxDistance);

        return sameZone && enoughFill && insideDistance;
      })
      .sort((a, b) => b.fillLevel - a.fillLevel);
  }, [availableContainers, newRoute]);

  const estimatedDistance = selectedContainers.reduce(
    (sum, container) => sum + container.distance,
    0
  );

  const estimatedDurationMinutes = Math.max(
    30,
    Math.round(selectedContainers.length * 18 + estimatedDistance * 4)
  );

  const estimatedDuration = `${Math.floor(estimatedDurationMinutes / 60)}h${
    estimatedDurationMinutes % 60 < 10 ? "0" : ""
  }${estimatedDurationMinutes % 60}`;

  const updateStepStatus = (id, status) => {
    setSteps((current) =>
      current.map((step) => (step.id === id ? { ...step, status } : step))
    );

    showToast(
      status === "Collecté"
        ? "Collecte validée."
        : "Étape marquée comme ignorée.",
      "success"
    );
  };

  const getPriorityClass = (priority) => {
    if (priority === "Critique") return "critical";
    if (priority === "Haute" || priority === "Attention") return "warning";
    return "normal";
  };

  const getStatusClass = (status) => {
    if (status === "En cours") return "active";
    if (status === "Planifiée") return "planned";
    if (status === "Terminée") return "done";
    return "default";
  };

  const handleNewRouteChange = (event) => {
    const { name, value } = event.target;

    setNewRoute((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const notifyAgent = (route) => {
    const logs = JSON.parse(localStorage.getItem("ecotrack_audit_logs") || "[]");

    const notificationLog = {
      id: `${route.id}-agent-notification-${logs.length + 1}`,
      action: "Notification agent",
      target: route.agent,
      module: "Tournées",
      actor: "Gestionnaire",
      date: "Maintenant",
      detail: `${route.agent} notifié pour ${route.name}`,
    };

    localStorage.setItem(
      "ecotrack_audit_logs",
      JSON.stringify([notificationLog, ...logs])
    );
  };

  const handleCreateRoute = (event) => {
    event.preventDefault();

    if (!newRoute.name.trim() || !newRoute.date.trim()) {
      showToast("Veuillez renseigner le nom et la date de la tournée.", "error");
      return;
    }

    if (selectedContainers.length === 0) {
      showToast(
        "Aucun conteneur ne correspond aux critères sélectionnés.",
        "error"
      );
      return;
    }

    const createdRoute = {
      id: Date.now(),
      name: newRoute.name,
      date: newRoute.date,
      zone: newRoute.zone,
      agent: newRoute.agent,
      fillThreshold: Number(newRoute.fillThreshold),
      maxDistance: Number(newRoute.maxDistance),
      containers: selectedContainers.length,
      distance: `${estimatedDistance.toFixed(1)} km`,
      duration: estimatedDuration,
      status: "Planifiée",
      optimization: "Optimisée",
      priority: newRoute.priority,
      notified: true,
      itinerary: selectedContainers.map((container) => container.location),
    };

    setRoutes((current) => [createdRoute, ...current]);

    notifyAgent(createdRoute);

    setNewRoute({
      name: "",
      date: "",
      zone: "Centre-ville",
      agent: "Agent A",
      fillThreshold: 70,
      maxDistance: 20,
      priority: "Normale",
    });

    showToast(
      "Tournée optimisée créée et agent notifié avec succès.",
      "success"
    );
  };

  const updateRouteStatus = (id, status) => {
    setRoutes((current) =>
      current.map((route) => (route.id === id ? { ...route, status } : route))
    );

    showToast("Statut de la tournée mis à jour.", "success");
  };

  const optimizeRoute = (id) => {
    setRoutes((current) =>
      current.map((route) =>
        route.id === id
          ? {
              ...route,
              optimization: "Optimisée",
              notified: true,
            }
          : route
      )
    );

    const route = routes.find((item) => item.id === id);

    if (route) {
      notifyAgent(route);
    }

    showToast("Optimisation simulée et agent notifié.", "success");
  };

  const managerStats = useMemo(() => {
    return {
      total: routes.length,
      inProgress: routes.filter((route) => route.status === "En cours").length,
      planned: routes.filter((route) => route.status === "Planifiée").length,
      completed: routes.filter((route) => route.status === "Terminée").length,
    };
  }, [routes]);

  if (user?.role === "agent") {
    return (
      <div className="agent-routes-page-pro">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">Tournée terrain</span>
            <h1>Tournée du jour</h1>
            <p>
              Consultez l’ordre de passage, validez les collectes effectuées et
              signalez les étapes non réalisables.
            </p>
          </div>
        </div>

        <div className="containers-overview">
          <div className="overview-card">
            <span>Étapes</span>
            <strong>{steps.length}</strong>
          </div>

          <div className="overview-card success">
            <span>Collectées</span>
            <strong>{completedSteps}</strong>
          </div>

          <div className="overview-card warning">
            <span>Restantes</span>
            <strong>{pendingSteps}</strong>
          </div>

          <div className="overview-card danger">
            <span>Ignorées</span>
            <strong>{ignoredSteps}</strong>
          </div>
        </div>

        <section className="agent-route-detail-card">
          <div className="agent-card-header">
            <div>
              <h2>Tournée Quartier Nord</h2>
              <p>Distance estimée : 18.7 km — Durée estimée : 2h10</p>
            </div>

            <span className="agent-status-badge">En cours</span>
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

          <div className="agent-route-steps-list">
            {steps.map((step, index) => (
              <article className="agent-route-step-row" key={step.id}>
                <div className="agent-step-order">{index + 1}</div>

                <div className="agent-step-content">
                  <h3>{step.container}</h3>
                  <p>{step.location}</p>

                  <div className="agent-step-tags">
                    <span className={getPriorityClass(step.priority)}>
                      {step.priority}
                    </span>
                    <span>Remplissage {step.fillLevel}%</span>
                    <span>Volume {step.volume}</span>
                    <span>{step.status}</span>
                  </div>
                </div>

                <div className="agent-step-actions">
                  <button
                    className="primary-btn"
                    onClick={() => updateStepStatus(step.id, "Collecté")}
                    disabled={step.status === "Collecté"}
                  >
                    Valider collecte
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => updateStepStatus(step.id, "Ignoré")}
                    disabled={step.status === "Ignoré"}
                  >
                    Marquer ignoré
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="routes-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Optimisation collecte</span>
          <h1>Tournées</h1>
          <p>
            Créez une tournée optimisée selon la zone, le seuil de remplissage,
            la distance maximale et l’agent assigné.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total</span>
          <strong>{managerStats.total}</strong>
        </div>

        <div className="overview-card success">
          <span>En cours</span>
          <strong>{managerStats.inProgress}</strong>
        </div>

        <div className="overview-card warning">
          <span>Planifiées</span>
          <strong>{managerStats.planned}</strong>
        </div>

        <div className="overview-card">
          <span>Terminées</span>
          <strong>{managerStats.completed}</strong>
        </div>
      </div>

      <section className="manager-route-form-card">
        <h2>Créer une tournée optimisée</h2>

        <form className="manager-route-form enhanced" onSubmit={handleCreateRoute}>
          <div className="form-group">
            <label>Nom de la tournée</label>
            <input
              type="text"
              name="name"
              placeholder="Ex : Tournée Centre critique"
              value={newRoute.name}
              onChange={handleNewRouteChange}
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={newRoute.date}
              onChange={handleNewRouteChange}
            />
          </div>

          <div className="form-group">
            <label>Zone</label>
            <select
              name="zone"
              value={newRoute.zone}
              onChange={handleNewRouteChange}
            >
              <option>Centre-ville</option>
              <option>Quartier Nord</option>
              <option>Parc Sud</option>
              <option>Avenue Verte</option>
            </select>
          </div>

          <div className="form-group">
            <label>Seuil remplissage</label>
            <select
              name="fillThreshold"
              value={newRoute.fillThreshold}
              onChange={handleNewRouteChange}
            >
              <option value="60">Plus de 60%</option>
              <option value="70">Plus de 70%</option>
              <option value="80">Plus de 80%</option>
              <option value="90">Plus de 90%</option>
            </select>
          </div>

          <div className="form-group">
            <label>Distance max</label>
            <select
              name="maxDistance"
              value={newRoute.maxDistance}
              onChange={handleNewRouteChange}
            >
              <option value="10">10 km</option>
              <option value="15">15 km</option>
              <option value="20">20 km</option>
              <option value="30">30 km</option>
            </select>
          </div>

          <div className="form-group">
            <label>Agent assigné</label>
            <select
              name="agent"
              value={newRoute.agent}
              onChange={handleNewRouteChange}
            >
              <option>Agent A</option>
              <option>Agent B</option>
              <option>Agent C</option>
              <option>Agent Collecte</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priorité</label>
            <select
              name="priority"
              value={newRoute.priority}
              onChange={handleNewRouteChange}
            >
              <option>Normale</option>
              <option>Haute</option>
              <option>Critique</option>
            </select>
          </div>

          <button type="submit" className="primary-btn">
            Créer et notifier
          </button>
        </form>
      </section>

      <section className="route-preview-card">
        <div>
          <span className="eyebrow">Prévisualisation optimisée</span>
          <h2>Itinéraire proposé</h2>
          <p>
            {selectedContainers.length} conteneur(s) sélectionné(s),{" "}
            {estimatedDistance.toFixed(1)} km estimés, durée {estimatedDuration}.
          </p>
        </div>

        <div className="route-preview-list">
          {selectedContainers.length === 0 ? (
            <div className="empty-state-pro">
              <h3>Aucun conteneur sélectionné</h3>
              <p>Modifiez les critères pour générer un itinéraire optimal.</p>
            </div>
          ) : (
            selectedContainers.map((container, index) => (
              <article className="route-preview-row" key={container.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{container.name}</strong>
                  <p>
                    {container.location} — {container.fillLevel}% —{" "}
                    {container.distance} km
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="routes-panel-pro">
        {routes.map((route) => (
          <article className="manager-route-card enhanced" key={route.id}>
            <div className="manager-route-main">
              <div>
                <h3>{route.name}</h3>
                <p>
                  {route.zone} — {route.date} — assignée à {route.agent}
                </p>
              </div>

              <div className="manager-route-tags">
                <span className={getPriorityClass(route.priority)}>
                  {route.priority}
                </span>
                <span className={getStatusClass(route.status)}>
                  {route.status}
                </span>
                <span>{route.optimization}</span>
                <span>{route.notified ? "Agent notifié" : "Non notifié"}</span>
              </div>
            </div>

            <div className="manager-route-metrics">
              <div>
                <span>Conteneurs</span>
                <strong>{route.containers}</strong>
              </div>

              <div>
                <span>Distance</span>
                <strong>{route.distance}</strong>
              </div>

              <div>
                <span>Durée</span>
                <strong>{route.duration}</strong>
              </div>
            </div>

            <div className="manager-itinerary">
              <span>Itinéraire</span>
              <p>{route.itinerary.join(" → ")}</p>
            </div>

            <div className="manager-route-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => optimizeRoute(route.id)}
              >
                Optimiser
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => updateRouteStatus(route.id, "En cours")}
              >
                Démarrer
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => updateRouteStatus(route.id, "Terminée")}
              >
                Terminer
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default RoutesPage;