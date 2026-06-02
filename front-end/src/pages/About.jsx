function About() {
  return (
    <div className="public-page">
      <h1>À propos d’ECOTRACK</h1>

      <p className="public-intro">
        ECOTRACK est une plateforme intelligente dédiée à l’optimisation de la
        gestion des déchets urbains grâce aux technologies IoT, data et
        cybersécurité.
      </p>

      <div className="about-grid">
        <div className="about-card">
          <h3>Notre objectif</h3>
          <p>
            Réduire les coûts de collecte, améliorer le suivi des conteneurs et
            limiter l’impact environnemental des tournées inutiles.
          </p>
        </div>

        <div className="about-card">
          <h3>Technologies utilisées</h3>
          <p>
            React.js pour le front-end, API backend, capteurs IoT, données en
            temps réel et tableaux de bord décisionnels.
          </p>
        </div>

        <div className="about-card">
          <h3>Vision Smart City</h3>
          <p>
            Aider les villes à devenir plus intelligentes, plus propres et plus
            efficaces grâce à une gestion pilotée par les données.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;