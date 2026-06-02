function ManagerSpace() {
  return (
    <div className="role-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Profil gestionnaire</span>
          <h1>Espace Gestionnaire</h1>
          <p>
            Supervisez les conteneurs, les tournées, les signalements, les
            alertes et les indicateurs de performance.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card success">
          <span>Conteneurs suivis</span>
          <strong>2000</strong>
        </div>

        <div className="overview-card danger">
          <span>Alertes critiques</span>
          <strong>12</strong>
        </div>

        <div className="overview-card warning">
          <span>Tournées planifiées</span>
          <strong>8</strong>
        </div>

        <div className="overview-card">
          <span>Remplissage moyen</span>
          <strong>69%</strong>
        </div>
      </div>

      <div className="role-grid">
        <section className="role-card">
          <h2>Responsabilités</h2>

          <div className="role-actions-list">
            <div>
              <strong>Monitoring temps réel</strong>
              <span>Identifier les conteneurs critiques et les alertes.</span>
            </div>

            <div>
              <strong>Optimisation des tournées</strong>
              <span>Créer et ajuster les tournées selon les priorités.</span>
            </div>

            <div>
              <strong>Analyse décisionnelle</strong>
              <span>Consulter les KPI et générer des rapports.</span>
            </div>
          </div>
        </section>

        <section className="role-card">
          <h2>Priorités du jour</h2>

          <div className="role-list">
            <div>
              <strong>Conteneurs critiques</strong>
              <span>12 alertes à traiter rapidement.</span>
            </div>

            <div>
              <strong>Signalements citoyens</strong>
              <span>34 signalements reçus aujourd’hui.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ManagerSpace;