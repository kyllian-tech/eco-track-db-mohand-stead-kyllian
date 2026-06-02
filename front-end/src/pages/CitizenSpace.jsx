function CitizenSpace() {
  return (
    <div className="role-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Profil citoyen</span>
          <h1>Espace Citoyen</h1>
          <p>
            Suivez vos signalements, votre engagement citoyen, vos points et
            votre impact environnemental.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card success">
          <span>Points</span>
          <strong>1280</strong>
        </div>

        <div className="overview-card">
          <span>Signalements envoyés</span>
          <strong>18</strong>
        </div>

        <div className="overview-card warning">
          <span>Défis actifs</span>
          <strong>3</strong>
        </div>

        <div className="overview-card">
          <span>CO₂ évité</span>
          <strong>42 kg</strong>
        </div>
      </div>

      <div className="role-grid">
        <section className="role-card">
          <h2>Actions citoyennes</h2>

          <div className="role-actions-list">
            <div>
              <strong>Signaler un problème</strong>
              <span>Déclarer un conteneur plein ou une anomalie.</span>
            </div>

            <div>
              <strong>Participer aux défis</strong>
              <span>Contribuer aux objectifs collectifs de propreté.</span>
            </div>

            <div>
              <strong>Consulter son impact</strong>
              <span>Suivre les points, badges et économies carbone.</span>
            </div>
          </div>
        </section>

        <section className="role-card">
          <h2>Derniers signalements</h2>

          <div className="role-list">
            <div>
              <strong>Conteneur plein</strong>
              <span>Place Centrale — Envoyé</span>
            </div>

            <div>
              <strong>Dépôt sauvage</strong>
              <span>Avenue Verte — En cours d’analyse</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CitizenSpace;