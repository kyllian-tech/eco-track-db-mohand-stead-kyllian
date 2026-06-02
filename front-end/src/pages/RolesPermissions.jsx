function RolesPermissions() {
  const roles = [
    {
      id: 1,
      name: "Citoyen",
      accessLevel: "Espace particulier",
      status: "Actif",
      modules: [
        "Accueil citoyen",
        "Carte citoyenne",
        "Déclarer un problème",
        "Gamification",
        "Historique personnel",
        "Notifications",
        "Profil",
        "Paramètres",
      ],
      permissions: [
        "Créer un signalement",
        "Consulter ses propres signalements",
        "Participer aux défis",
        "Consulter son impact environnemental",
      ],
    },
    {
      id: 2,
      name: "Agent de collecte",
      accessLevel: "Espace terrain",
      status: "Actif",
      modules: [
        "Accueil agent",
        "Tournée du jour",
        "Carte terrain",
        "Anomalies terrain",
        "Profil",
      ],
      permissions: [
        "Consulter sa tournée",
        "Valider une collecte",
        "Signaler une anomalie terrain",
        "Mettre à jour l’état d’une intervention",
      ],
    },
    {
      id: 3,
      name: "Gestionnaire",
      accessLevel: "Supervision opérationnelle",
      status: "Actif",
      modules: [
        "Dashboard",
        "Conteneurs",
        "Carte",
        "Tournées",
        "Signalements",
        "Analytics",
        "Exports",
        "Profil",
      ],
      permissions: [
        "Superviser les conteneurs",
        "Planifier les tournées",
        "Affecter les agents",
        "Consulter les KPIs",
        "Générer des rapports",
      ],
    },
    {
      id: 4,
      name: "Administrateur",
      accessLevel: "Gouvernance complète",
      status: "Actif",
      modules: [
        "Dashboard admin",
        "Utilisateurs",
        "Demandes d’inscription",
        "Rôles & permissions",
        "Paramètres",
        "Notifications",
        "Historique",
        "Supervision Cyber",
        "Profil",
      ],
      permissions: [
        "Créer, modifier ou désactiver un compte",
        "Valider les inscriptions citoyennes",
        "Gérer les rôles et permissions",
        "Configurer la plateforme",
        "Superviser la sécurité",
      ],
    },
  ];

  return (
    <div className="roles-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Contrôle d’accès</span>
          <h1>Rôles & permissions</h1>
          <p>
            Consultez les droits d’accès associés à chaque profil utilisateur de
            la plateforme ECOTRACK.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Rôles configurés</span>
          <strong>{roles.length}</strong>
        </div>

        <div className="overview-card success">
          <span>Rôles actifs</span>
          <strong>4</strong>
        </div>

        <div className="overview-card warning">
          <span>Niveaux d’accès</span>
          <strong>4</strong>
        </div>

        <div className="overview-card">
          <span>RBAC</span>
          <strong>OK</strong>
        </div>
      </div>

      <section className="roles-grid-pro">
        {roles.map((role) => (
          <article className="role-permission-card" key={role.id}>
            <div className="role-permission-header">
              <div>
                <h2>{role.name}</h2>
                <p>{role.accessLevel}</p>
              </div>

              <span>{role.status}</span>
            </div>

            <div className="role-permission-block">
              <h3>Modules accessibles</h3>

              <div className="role-chip-list">
                {role.modules.map((module) => (
                  <span key={module}>{module}</span>
                ))}
              </div>
            </div>

            <div className="role-permission-block">
              <h3>Permissions principales</h3>

              <ul>
                {role.permissions.map((permission) => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default RolesPermissions;