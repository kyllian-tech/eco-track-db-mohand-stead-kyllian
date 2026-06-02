import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Reports() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [agentReports, setAgentReports] = useState([
    {
      id: 1,
      title: "Accès partiellement bloqué",
      type: "Accès bloqué",
      location: "Rue des Écoles",
      priority: "Élevée",
      status: "Nouveau",
      comment: "Stationnement gênant devant le conteneur.",
    },
    {
      id: 2,
      title: "Conteneur endommagé",
      type: "Matériel endommagé",
      location: "Place Centrale",
      priority: "Critique",
      status: "En traitement",
      comment: "Couvercle cassé, collecte possible avec prudence.",
    },
  ]);

  const [newReport, setNewReport] = useState({
    type: "Accès bloqué",
    location: "",
    priority: "Normale",
    comment: "",
  });

  const managerReports = [
    {
      id: 1,
      title: "Conteneur plein",
      location: "Place Centrale",
      author: "Citoyen",
      status: "Nouveau",
      priority: "Critique",
    },
    {
      id: 2,
      title: "Conteneur endommagé",
      location: "Rue des Écoles",
      author: "Agent A",
      status: "En traitement",
      priority: "Élevée",
    },
    {
      id: 3,
      title: "Dépôt sauvage",
      location: "Avenue Verte",
      author: "Citoyen",
      status: "Résolu",
      priority: "Normale",
    },
  ];

  const handleNewReportChange = (event) => {
    const { name, value } = event.target;

    setNewReport((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateAgentReport = (event) => {
    event.preventDefault();

    if (!newReport.location.trim() || !newReport.comment.trim()) {
      showToast("Veuillez renseigner la localisation et le commentaire.", "error");
      return;
    }

    const createdReport = {
      id: Date.now(),
      title: newReport.type,
      type: newReport.type,
      location: newReport.location,
      priority: newReport.priority,
      status: "Nouveau",
      comment: newReport.comment,
    };

    setAgentReports((current) => [createdReport, ...current]);

    setNewReport({
      type: "Accès bloqué",
      location: "",
      priority: "Normale",
      comment: "",
    });

    showToast("Anomalie terrain enregistrée.", "success");
  };

  const updateAgentReportStatus = (id, status) => {
    setAgentReports((current) =>
      current.map((report) =>
        report.id === id ? { ...report, status } : report
      )
    );

    showToast("Statut de l’anomalie mis à jour.", "success");
  };

  const getPriorityClass = (priority) => {
    if (priority === "Critique") return "critical";
    if (priority === "Élevée") return "warning";
    return "normal";
  };

  const getStatusClass = (status) => {
    if (status === "Nouveau") return "new";
    if (status === "En traitement") return "processing";
    if (status === "Résolu" || status === "Traité") return "done";
    return "default";
  };

  if (user?.role === "agent") {
    const newCount = agentReports.filter(
      (report) => report.status === "Nouveau"
    ).length;

    const processingCount = agentReports.filter(
      (report) => report.status === "En traitement"
    ).length;

    const doneCount = agentReports.filter(
      (report) => report.status === "Traité"
    ).length;

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
            <strong>{agentReports.length}</strong>
          </div>

          <div className="overview-card danger">
            <span>Nouveaux</span>
            <strong>{newCount}</strong>
          </div>

          <div className="overview-card warning">
            <span>En traitement</span>
            <strong>{processingCount}</strong>
          </div>

          <div className="overview-card success">
            <span>Traités</span>
            <strong>{doneCount}</strong>
          </div>
        </div>

        <div className="agent-reports-grid">
          <section className="agent-report-card">
            <h2>Nouvelle anomalie</h2>

            <form className="agent-report-form" onSubmit={handleCreateAgentReport}>
              <div className="form-group">
                <label>Type d’anomalie</label>
                <select
                  name="type"
                  value={newReport.type}
                  onChange={handleNewReportChange}
                >
                  <option>Accès bloqué</option>
                  <option>Matériel endommagé</option>
                  <option>Conteneur inaccessible</option>
                  <option>Dépôt sauvage</option>
                  <option>Autre anomalie terrain</option>
                </select>
              </div>

              <div className="form-group">
                <label>Localisation</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Ex : Rue des Écoles"
                  value={newReport.location}
                  onChange={handleNewReportChange}
                />
              </div>

              <div className="form-group">
                <label>Priorité</label>
                <select
                  name="priority"
                  value={newReport.priority}
                  onChange={handleNewReportChange}
                >
                  <option>Normale</option>
                  <option>Élevée</option>
                  <option>Critique</option>
                </select>
              </div>

              <div className="form-group">
                <label>Commentaire</label>
                <textarea
                  name="comment"
                  placeholder="Décrivez le problème constaté..."
                  value={newReport.comment}
                  onChange={handleNewReportChange}
                  rows="5"
                ></textarea>
              </div>

              <button type="submit" className="primary-btn">
                Enregistrer l’anomalie
              </button>
            </form>
          </section>

          <section className="agent-report-card large">
            <h2>Anomalies déclarées</h2>

            <div className="agent-report-list">
              {agentReports.map((report) => (
                <article className="agent-report-row" key={report.id}>
                  <div>
                    <h3>{report.title}</h3>
                    <p>{report.location}</p>
                    <span>{report.comment}</span>

                    <div className="agent-report-tags">
                      <strong className={getPriorityClass(report.priority)}>
                        {report.priority}
                      </strong>
                      <strong className={getStatusClass(report.status)}>
                        {report.status}
                      </strong>
                    </div>
                  </div>

                  <div className="agent-report-actions">
                    <button
                      className="secondary-btn"
                      onClick={() =>
                        updateAgentReportStatus(report.id, "En traitement")
                      }
                    >
                      En traitement
                    </button>

                    <button
                      className="primary-btn"
                      onClick={() => updateAgentReportStatus(report.id, "Traité")}
                    >
                      Marquer traité
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const totalReports = managerReports.length;
  const newReports = managerReports.filter(
    (report) => report.status === "Nouveau"
  ).length;
  const processingReports = managerReports.filter(
    (report) => report.status === "En traitement"
  ).length;
  const resolvedReports = managerReports.filter(
    (report) => report.status === "Résolu"
  ).length;

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
          <strong>{totalReports}</strong>
        </div>

        <div className="overview-card danger">
          <span>Nouveaux</span>
          <strong>{newReports}</strong>
        </div>

        <div className="overview-card warning">
          <span>En traitement</span>
          <strong>{processingReports}</strong>
        </div>

        <div className="overview-card success">
          <span>Résolus</span>
          <strong>{resolvedReports}</strong>
        </div>
      </div>

      <section className="reports-panel-pro">
        {managerReports.map((report) => (
          <article className="report-row-pro" key={report.id}>
            <div>
              <h3>{report.title}</h3>
              <p>{report.location}</p>
            </div>

            <div className="report-row-meta">
              <span>{report.author}</span>
              <strong className={getPriorityClass(report.priority)}>
                {report.priority}
              </strong>
              <strong className={getStatusClass(report.status)}>
                {report.status}
              </strong>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Reports;