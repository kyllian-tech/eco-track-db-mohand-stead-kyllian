function Exports() {
  const reports = [
    {
      id: 1,
      title: "Rapport mensuel des conteneurs",
      description: "Synthèse des niveaux de remplissage et alertes critiques.",
      format: "PDF",
      period: "Mai 2026",
      status: "Disponible",
    },
    {
      id: 2,
      title: "Performance des tournées",
      description: "Analyse des distances, durées et tournées optimisées.",
      format: "CSV",
      period: "Semaine courante",
      status: "Disponible",
    },
    {
      id: 3,
      title: "Signalements citoyens",
      description: "Historique des signalements reçus et traités.",
      format: "PDF",
      period: "30 derniers jours",
      status: "En attente",
    },
    {
      id: 4,
      title: "Rapport analytics global",
      description: "Vue consolidée des indicateurs de performance ECOTRACK.",
      format: "XLSX",
      period: "Trimestre",
      status: "Disponible",
    },
  ];

  const available = reports.filter((report) => report.status === "Disponible").length;
  const pending = reports.filter((report) => report.status === "En attente").length;
  const pdfCount = reports.filter((report) => report.format === "PDF").length;

  return (
    <div className="exports-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Rapports & exports</span>
          <h1>Exports</h1>
          <p>
            Consultez, préparez et téléchargez les rapports opérationnels de la
            plateforme ECOTRACK.
          </p>
        </div>

        <button className="primary-btn">Générer un rapport</button>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total rapports</span>
          <strong>{reports.length}</strong>
        </div>

        <div className="overview-card success">
          <span>Disponibles</span>
          <strong>{available}</strong>
        </div>

        <div className="overview-card warning">
          <span>En attente</span>
          <strong>{pending}</strong>
        </div>

        <div className="overview-card">
          <span>Formats PDF</span>
          <strong>{pdfCount}</strong>
        </div>
      </div>

      <div className="panel-pro">
        <div className="exports-grid">
          {reports.map((report) => (
            <article className="export-card-pro" key={report.id}>
              <div className="export-header">
                <div>
                  <span className="export-format">{report.format}</span>
                  <h3>{report.title}</h3>
                </div>

                <span
                  className={
                    report.status === "Disponible"
                      ? "export-status available"
                      : "export-status pending"
                  }
                >
                  {report.status}
                </span>
              </div>

              <p>{report.description}</p>

              <div className="export-meta">
                <span>Période</span>
                <strong>{report.period}</strong>
              </div>

              <button
                className={
                  report.status === "Disponible"
                    ? "primary-btn export-btn"
                    : "secondary-btn export-btn"
                }
                disabled={report.status !== "Disponible"}
              >
                {report.status === "Disponible"
                  ? "Télécharger"
                  : "Indisponible"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Exports;