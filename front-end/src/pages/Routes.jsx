import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getRoutes, createRoute, updateRoute, getRouteSteps } from "../api/routes";
import { getProfiles } from "../api/profiles";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", { dateStyle: "medium" });
  } catch {
    return dateStr;
  }
}

function getPriorityClass(statut) {
  const s = statut?.toLowerCase?.() || "";
  if (s === "critique") return "critical";
  if (s === "en_cours" || s === "haute") return "warning";
  return "normal";
}

function getStatusClass(statut) {
  if (statut === "EN_COURS") return "active";
  if (statut === "PLANIFIEE") return "planned";
  if (statut === "TERMINEE") return "done";
  if (statut === "ANNULEE") return "cancelled";
  return "default";
}

function formatStatut(statut) {
  const map = {
    PLANIFIEE: "Planifiée",
    EN_COURS: "En cours",
    TERMINEE: "Terminée",
    ANNULEE: "Annulée",
  };
  return map[statut] || statut || "—";
}

function Routes() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [routes, setRoutes] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulaire de création (manager)
  const [newRoute, setNewRoute] = useState({
    nom: "",
    date_prevue: "",
    distance_estimee_km: "",
    agent_id: "",
  });

  // Pour la vue agent : étapes simulées (pas encore branchées sur route_steps)
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const params = user?.role === "agent"
          ? { statut: "EN_COURS", agent_id: user.id }
          : {};
        const [data, profiles] = await Promise.all([
          getRoutes(params),
          user?.role !== "agent" ? getProfiles() : Promise.resolve([]),
        ]);
        setRoutes(data);

        // Vue agent : charger les étapes de la tournée en cours
        if (user?.role === "agent" && data.length > 0) {
          const routeSteps = await getRouteSteps(data[0].id);
          setSteps(Array.isArray(routeSteps) ? routeSteps : []);
        }

        // Garder uniquement les agents
        const allProfiles = Array.isArray(profiles) ? profiles : (profiles?.data ?? []);
        setAgents(allProfiles.filter(p => p.role === "agent"));
      } catch {
        showToast("Erreur lors du chargement des tournées.", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleNewRouteChange = (event) => {
    const { name, value } = event.target;
    setNewRoute(current => ({ ...current, [name]: value }));
  };

  const handleCreateRoute = async (event) => {
    event.preventDefault();

    if (!newRoute.nom.trim() || !newRoute.date_prevue) {
      showToast("Veuillez renseigner le nom et la date de la tournée.", "error");
      return;
    }

    try {
      const created = await createRoute({
        nom: newRoute.nom.trim(),
        date_prevue: newRoute.date_prevue,
        statut: "PLANIFIEE",
        distance_estimee_km: newRoute.distance_estimee_km
          ? Number(newRoute.distance_estimee_km)
          : null,
        agent_id: newRoute.agent_id || null,
      });

      setRoutes(current => [created, ...current]);
      setNewRoute({ nom: "", date_prevue: "", distance_estimee_km: "", agent_id: "" });
      showToast("Tournée créée avec succès.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la création.", "error");
    }
  };

  const handleUpdateStatut = async (id, statut) => {
    try {
      const updated = await updateRoute(id, { statut });
      setRoutes(current => current.map(r => r.id === id ? { ...r, ...updated } : r));
      showToast("Statut de la tournée mis à jour.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la mise à jour.", "error");
    }
  };

  const managerStats = useMemo(() => ({
    total: routes.length,
    inProgress: routes.filter(r => r.statut === "EN_COURS").length,
    planned: routes.filter(r => r.statut === "PLANIFIEE").length,
    completed: routes.filter(r => r.statut === "TERMINEE").length,
  }), [routes]);

  // ── Vue AGENT ──────────────────────────────────────────────────────────────
  if (user?.role === "agent") {
    const todayRoute = routes[0] || null;

    return (
      <div className="agent-routes-page-pro">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">Tournée terrain</span>
            <h1>Tournée du jour</h1>
            <p>
              Consultez l'ordre de passage, validez les collectes effectuées et
              signalez les étapes non réalisables.
            </p>
          </div>
        </div>

        {loading && <p style={{ padding: "1rem" }}>Chargement…</p>}

        {!loading && !todayRoute && (
          <div className="empty-state-pro" style={{ marginTop: "2rem" }}>
            <h3>Aucune tournée en cours</h3>
            <p>Votre gestionnaire n'a pas encore assigné de tournée active.</p>
          </div>
        )}

        {!loading && todayRoute && (
          <section className="agent-route-detail-card">
            <div className="agent-card-header">
              <div>
                <h2>{todayRoute.nom}</h2>
                <p>
                  Date prévue : {formatDate(todayRoute.date_prevue)}
                  {todayRoute.distance_estimee_km
                    ? ` — Distance estimée : ${todayRoute.distance_estimee_km} km`
                    : ""}
                </p>
              </div>
              <span className="agent-status-badge">{formatStatut(todayRoute.statut)}</span>
            </div>

            <div className="agent-route-steps-list">
              {steps.length === 0 ? (
                <div className="empty-state-pro">
                  <p>Aucune étape définie pour cette tournée.</p>
                </div>
              ) : (
                steps.map((step) => (
                  <article className="agent-step-card" key={step.id}>
                    <div>
                      <h3>Étape {step.ordre_passage}</h3>
                      <p>{step.container_id}</p>
                    </div>
                    <div className="agent-step-meta">
                      <strong style={{ color: step.collecte_effectuee ? "var(--success)" : "inherit" }}>
                        {step.collecte_effectuee ? "✓ Collecté" : "À collecter"}
                      </strong>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="manager-route-actions" style={{ marginTop: "1rem" }}>
              <button
                className="primary-btn"
                onClick={() => handleUpdateStatut(todayRoute.id, "TERMINEE")}
                disabled={todayRoute.statut === "TERMINEE"}
              >
                Terminer la tournée
              </button>
            </div>
          </section>
        )}
      </div>
    );
  }

  // ── Vue MANAGER ────────────────────────────────────────────────────────────
  return (
    <div className="routes-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Optimisation collecte</span>
          <h1>Tournées</h1>
          <p>
            Créez et gérez les tournées de collecte, suivez leur avancement et
            mettez à jour leur statut.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total</span>
          <strong>{loading ? "…" : managerStats.total}</strong>
        </div>

        <div className="overview-card success">
          <span>En cours</span>
          <strong>{loading ? "…" : managerStats.inProgress}</strong>
        </div>

        <div className="overview-card warning">
          <span>Planifiées</span>
          <strong>{loading ? "…" : managerStats.planned}</strong>
        </div>

        <div className="overview-card">
          <span>Terminées</span>
          <strong>{loading ? "…" : managerStats.completed}</strong>
        </div>
      </div>

      <section className="manager-route-form-card">
        <h2>Créer une tournée</h2>

        <form className="manager-route-form enhanced" onSubmit={handleCreateRoute}>
          <div className="form-group">
            <label>Nom de la tournée</label>
            <input
              type="text"
              name="nom"
              placeholder="Ex : Tournée Centre critique"
              value={newRoute.nom}
              onChange={handleNewRouteChange}
            />
          </div>

          <div className="form-group">
            <label>Date prévue</label>
            <input
              type="date"
              name="date_prevue"
              value={newRoute.date_prevue}
              onChange={handleNewRouteChange}
            />
          </div>

          <div className="form-group">
            <label>Distance estimée (km)</label>
            <input
              type="number"
              name="distance_estimee_km"
              placeholder="Ex : 12.5"
              step="0.1"
              min="0"
              value={newRoute.distance_estimee_km}
              onChange={handleNewRouteChange}
            />
          </div>

          <div className="form-group">
            <label>Agent assigné</label>
            <select name="agent_id" value={newRoute.agent_id} onChange={handleNewRouteChange}>
              <option value="">-- Aucun agent --</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.full_name ?? a.email}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="primary-btn">
            Créer la tournée
          </button>
        </form>
      </section>

      <section className="routes-panel-pro">
        {loading && <p style={{ padding: "1rem" }}>Chargement…</p>}

        {!loading && routes.length === 0 && (
          <div className="empty-state-pro">
            <h3>Aucune tournée</h3>
            <p>Créez votre première tournée ci-dessus.</p>
          </div>
        )}

        {!loading && routes.map(route => (
          <article className="manager-route-card enhanced" key={route.id}>
            <div className="manager-route-main">
              <div>
                <h3>{route.nom}</h3>
                <p>Date prévue : {formatDate(route.date_prevue)}</p>
              </div>

              <div className="manager-route-tags">
                <span className={getStatusClass(route.statut)}>
                  {formatStatut(route.statut)}
                </span>
              </div>
            </div>

            <div className="manager-route-metrics">
              {route.distance_estimee_km && (
                <div>
                  <span>Distance</span>
                  <strong>{route.distance_estimee_km} km</strong>
                </div>
              )}
              <div>
                <span>Agent</span>
                <strong>
                  {route.agent_id
                    ? (agents.find(a => a.id === route.agent_id)?.full_name
                        ?? agents.find(a => a.id === route.agent_id)?.email
                        ?? "Assigné")
                    : "Non assigné"}
                </strong>
              </div>
            </div>

            <div className="manager-route-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => handleUpdateStatut(route.id, "EN_COURS")}
                disabled={route.statut === "EN_COURS"}
              >
                Démarrer
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => handleUpdateStatut(route.id, "TERMINEE")}
                disabled={route.statut === "TERMINEE"}
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

export default Routes;
