import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getSignalements, createSignalement, updateSignalement } from "../api/signalements";
import { getContainers } from "../api/containers";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return dateStr;
  }
}

function getPriorityClass(statut) {
  if (statut === "OUVERT") return "critical";
  if (statut === "EN_COURS") return "warning";
  return "normal";
}

function getStatusClass(statut) {
  if (statut === "OUVERT") return "new";
  if (statut === "EN_COURS") return "processing";
  if (statut === "RESOLU") return "done";
  return "default";
}

function formatStatut(statut) {
  const map = {
    OUVERT: "Ouvert",
    EN_COURS: "En traitement",
    RESOLU: "Résolu",
  };
  return map[statut] || statut || "—";
}

function Reports() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reports, setReports] = useState([]);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newReport, setNewReport] = useState({
    type: "Accès bloqué",
    container_id: "",
    description: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const params = user?.role === "agent" ? { user_id: user.id } : {};
        const [data, ctrs] = await Promise.all([
          getSignalements(params),
          getContainers(),
        ]);
        setReports(data);
        setContainers(Array.isArray(ctrs) ? ctrs : (ctrs?.data ?? []));
      } catch {
        showToast("Erreur lors du chargement des signalements.", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleNewReportChange = (event) => {
    const { name, value } = event.target;
    setNewReport(current => ({ ...current, [name]: value }));
  };

  const handleCreateReport = async (event) => {
    event.preventDefault();

    if (!newReport.description.trim()) {
      showToast("Veuillez renseigner une description.", "error");
      return;
    }

    if (!newReport.container_id) {
      showToast("Veuillez sélectionner un conteneur concerné.", "error");
      return;
    }

    try {
      const created = await createSignalement({
        user_id: user.id,
        container_id: newReport.container_id,
        type_incident: newReport.type,
        description: newReport.description,
        statut: "OUVERT",
      });

      setReports(current => [created, ...current]);
      setNewReport({ type: "Accès bloqué", container_id: "", description: "" });
      showToast("Signalement enregistré.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'envoi.", "error");
    }
  };

  const handleUpdateStatut = async (id, statut) => {
    try {
      const updated = await updateSignalement(id, { statut });
      setReports(current => current.map(r => r.id === id ? { ...r, ...updated } : r));
      showToast("Statut mis à jour.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la mise à jour.", "error");
    }
  };

  // ── Vue AGENT ──────────────────────────────────────────────────────────────
  if (user?.role === "agent") {
    const newCount = reports.filter(r => r.statut === "OUVERT").length;
    const processingCount = reports.filter(r => r.statut === "EN_COURS").length;
    const doneCount = reports.filter(r => r.statut === "RESOLU").length;

    return (
      <div className="agent-reports-page-pro">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">Anomalies terrain</span>
            <h1>Signalements terrain</h1>
            <p>
              Déclarez les anomalies rencontrées pendant la tournée et suivez
              leur état de traitement.
            </p>
          </div>
        </div>

        <div className="containers-overview">
          <div className="overview-card">
            <span>Total</span>
            <strong>{loading ? "…" : reports.length}</strong>
          </div>

          <div className="overview-card danger">
            <span>Nouveaux</span>
            <strong>{loading ? "…" : newCount}</strong>
          </div>

          <div className="overview-card warning">
            <span>En traitement</span>
            <strong>{loading ? "…" : processingCount}</strong>
          </div>

          <div className="overview-card success">
            <span>Traités</span>
            <strong>{loading ? "…" : doneCount}</strong>
          </div>
        </div>

        <div className="agent-reports-grid">
          <section className="agent-report-card">
            <h2>Nouvelle anomalie</h2>

            <form className="agent-report-form" onSubmit={handleCreateReport}>
              <div className="form-group">
                <label>Type d'anomalie</label>
                <select name="type" value={newReport.type} onChange={handleNewReportChange}>
                  <option>Accès bloqué</option>
                  <option>Matériel endommagé</option>
                  <option>Conteneur inaccessible</option>
                  <option>Dépôt sauvage</option>
                  <option>Autre anomalie terrain</option>
                </select>
              </div>

              <div className="form-group">
                <label>Conteneur concerné</label>
                <select name="container_id" value={newReport.container_id} onChange={handleNewReportChange} required>
                  <option value="">-- Sélectionner un conteneur --</option>
                  {containers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.type} {c.zone_id ? `(zone ${c.zone_id})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Décrivez le problème constaté..."
                  value={newReport.description}
                  onChange={handleNewReportChange}
                  rows="5"
                />
              </div>

              <button type="submit" className="primary-btn">
                Enregistrer l'anomalie
              </button>
            </form>
          </section>

          <section className="agent-report-card large">
            <h2>Anomalies déclarées</h2>

            {loading ? (
              <p>Chargement…</p>
            ) : (
              <div className="agent-report-list">
                {reports.length === 0 && (
                  <div className="empty-state-pro">
                    <h3>Aucun signalement</h3>
                    <p>Déclarez votre première anomalie ci-contre.</p>
                  </div>
                )}
                {reports.map(report => (
                  <article className="agent-report-row" key={report.id}>
                    <div>
                      <h3>{report.type_incident}</h3>
                      <p>{formatDate(report.created_at)}</p>
                      {report.description && <span>{report.description}</span>}

                      <div className="agent-report-tags">
                        <strong className={getStatusClass(report.statut)}>
                          {formatStatut(report.statut)}
                        </strong>
                      </div>
                    </div>

                    <div className="agent-report-actions">
                      <button
                        className="secondary-btn"
                        onClick={() => handleUpdateStatut(report.id, "en_cours")}
                        disabled={report.statut === "EN_COURS"}
                      >
                        En traitement
                      </button>

                      <button
                        className="primary-btn"
                        onClick={() => handleUpdateStatut(report.id, "RESOLU")}
                        disabled={report.statut === "RESOLU"}
                      >
                        Marquer traité
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ── Vue MANAGER ────────────────────────────────────────────────────────────
  const totalReports = reports.length;
  const newReports = reports.filter(r => r.statut === "OUVERT").length;
  const processingReports = reports.filter(r => r.statut === "EN_COURS").length;
  const resolvedReports = reports.filter(r => r.statut === "RESOLU").length;

  return (
    <div className="reports-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Incidents terrain</span>
          <h1>Signalements</h1>
          <p>
            Suivi des signalements citoyens et anomalies terrain pour améliorer
            la réactivité des services de collecte.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total</span>
          <strong>{loading ? "…" : totalReports}</strong>
        </div>

        <div className="overview-card danger">
          <span>Nouveaux</span>
          <strong>{loading ? "…" : newReports}</strong>
        </div>

        <div className="overview-card warning">
          <span>En traitement</span>
          <strong>{loading ? "…" : processingReports}</strong>
        </div>

        <div className="overview-card success">
          <span>Résolus</span>
          <strong>{loading ? "…" : resolvedReports}</strong>
        </div>
      </div>

      <section className="reports-panel-pro">
        {loading && <p style={{ padding: "1rem" }}>Chargement…</p>}

        {!loading && reports.length === 0 && (
          <div className="empty-state-pro">
            <h3>Aucun signalement</h3>
            <p>Les signalements citoyens et agents apparaîtront ici.</p>
          </div>
        )}

        {!loading && reports.map(report => (
          <article className="report-row-pro" key={report.id}>
            <div>
              <h3>{report.type_incident}</h3>
              <p>{report.description || "—"}</p>
              <small style={{ color: "var(--text-muted, #888)" }}>
                {formatDate(report.created_at)}
              </small>
            </div>

            <div className="report-row-meta">
              <strong className={getPriorityClass(report.statut)}>
                {formatStatut(report.statut)}
              </strong>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  className="secondary-btn"
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem" }}
                  onClick={() => handleUpdateStatut(report.id, "EN_COURS")}
                  disabled={report.statut === "EN_COURS"}
                >
                  En traitement
                </button>
                <button
                  className="primary-btn"
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem" }}
                  onClick={() => handleUpdateStatut(report.id, "RESOLU")}
                  disabled={report.statut === "RESOLU"}
                >
                  Résoudre
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Reports;
