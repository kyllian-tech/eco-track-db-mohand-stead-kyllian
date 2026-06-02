function AdminSpace() {
  return (
    <div className="role-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Profil administrateur</span>
          <h1>Espace Administrateur</h1>
          <p>
            Gérez les utilisateurs, les rôles, les permissions, la sécurité et
            la configuration globale de la plateforme.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Utilisateurs</span>
          <strong>68</strong>
        </div>

        <div className="overview-card success">
          <span>Rôles actifs</span>
          <strong>4</strong>
        </div>

        <div className="overview-card warning">
          <span>Règles sécurité</span>
          <strong>15</strong>
        </div>

        <div className="overview-card danger">
          <span>Alertes cyber</span>
          <strong>3</strong>
        </div>
      </div>

      <div className="role-grid">
        <section className="role-card">
          <h2>Administration</h2>

          <div className="role-actions-list">
            <div>
              <strong>Gestion des utilisateurs</strong>
              <span>Créer, modifier ou désactiver un compte.</span>
            </div>

            <div>
              <strong>Rôles et permissions</strong>
              <span>Attribuer les droits selon les profils.</span>
            </div>

            <div>
              <strong>Configuration plateforme</strong>
              <span>Gérer les seuils, alertes et paramètres globaux.</span>
            </div>
          </div>
        </section>

        <section className="role-card">
          <h2>Sécurité</h2>

          <div className="role-list">
            <div>
              <strong>Supervision cyber</strong>
              <span>IDS, SIEM, logs et alertes critiques.</span>
            </div>

            <div>
              <strong>Audit trail</strong>
              <span>Toutes les actions sensibles sont tracées.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminSpace;