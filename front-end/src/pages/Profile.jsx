import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user } = useAuth();

  const roleData = {
    citizen: {
      eyebrow: "Profil citoyen",
      title: "Mon profil citoyen",
      description:
        "Consultez vos informations personnelles, votre engagement citoyen et votre impact environnemental.",
      levelLabel: "Niveau citoyen",
      level: "Citoyen engagé",
      badge: "Eco Ambassadeur",
      stats: [
        { label: "Points", value: "1280" },
        { label: "Signalements", value: "18" },
        { label: "Classement", value: "#4" },
        { label: "CO₂ évité", value: "42 kg" },
      ],
      summary: [
        "Participation active aux signalements citoyens.",
        "Contribution positive à la propreté urbaine.",
        "Progression régulière dans les défis écologiques.",
      ],
    },

    agent: {
      eyebrow: "Profil agent",
      title: "Mon profil agent",
      description:
        "Consultez vos informations terrain, vos tournées assignées et vos indicateurs de collecte.",
      levelLabel: "Statut terrain",
      level: "Agent opérationnel",
      badge: "Collecte active",
      stats: [
        { label: "Tournées réalisées", value: "34" },
        { label: "Collectes validées", value: "420" },
        { label: "Anomalies signalées", value: "12" },
        { label: "Disponibilité", value: "Actif" },
      ],
      summary: [
        "Responsable des tournées terrain assignées.",
        "Validation des collectes effectuées sur zone.",
        "Remontée des anomalies constatées sur le terrain.",
      ],
    },

    manager: {
      eyebrow: "Profil gestionnaire",
      title: "Mon profil gestionnaire",
      description:
        "Consultez vos informations de supervision, vos indicateurs opérationnels et votre périmètre de gestion.",
      levelLabel: "Responsabilité",
      level: "Supervision opérationnelle",
      badge: "Gestionnaire Smart City",
      stats: [
        { label: "Conteneurs suivis", value: "2000" },
        { label: "Tournées supervisées", value: "84" },
        { label: "Alertes traitées", value: "126" },
        { label: "Zone", value: "Ville entière" },
      ],
      summary: [
        "Supervision des conteneurs connectés.",
        "Suivi des tournées et optimisation opérationnelle.",
        "Analyse des indicateurs et exports de performance.",
      ],
    },

    admin: {
      eyebrow: "Profil administrateur",
      title: "Mon profil administrateur",
      description:
        "Consultez vos informations d’administration, vos accès sécurité et votre périmètre de gouvernance.",
      levelLabel: "Accès",
      level: "Administration complète",
      badge: "Super administrateur",
      stats: [
        { label: "Utilisateurs", value: "68" },
        { label: "Rôles actifs", value: "4" },
        { label: "Demandes à valider", value: "3" },
        { label: "Alertes cyber", value: "3" },
      ],
      summary: [
        "Gestion des utilisateurs et des permissions.",
        "Validation des inscriptions citoyennes.",
        "Supervision sécurité, historique et paramètres plateforme.",
      ],
    },
  };

  const currentRole = roleData[user?.role] || roleData.citizen;

  return (
    <div className="dynamic-profile-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">{currentRole.eyebrow}</span>
          <h1>{currentRole.title}</h1>
          <p>{currentRole.description}</p>
        </div>
      </div>

      <div className="dynamic-profile-grid">
        <section className="dynamic-profile-card main">
          <div className="dynamic-profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <h2>{user?.name || "Utilisateur"}</h2>
          <p>{user?.email || "Email non renseigné"}</p>

          <div className="dynamic-profile-badge">{currentRole.badge}</div>

          <div className="dynamic-profile-progress">
            <span>{currentRole.levelLabel}</span>
            <strong>{currentRole.level}</strong>

            <div className="progress-bar">
              <div className="progress-fill green" style={{ width: "72%" }}></div>
            </div>

            <p>
              Ce profil est adapté automatiquement selon le rôle connecté dans
              ECOTRACK.
            </p>
          </div>
        </section>

        <section className="dynamic-profile-card">
          <h2>Informations du compte</h2>

          <div className="profile-info-list">
            <div>
              <span>Nom</span>
              <strong>{user?.name || "Non renseigné"}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{user?.email || "Non renseigné"}</strong>
            </div>

            <div>
              <span>Rôle</span>
              <strong>{user?.roleLabel || "Non défini"}</strong>
            </div>

            <div>
              <span>Zone / ville</span>
              <strong>{user?.city || "Non renseignée"}</strong>
            </div>
          </div>
        </section>

        <section className="dynamic-profile-card">
          <h2>Indicateurs du profil</h2>

          <div className="profile-stats-grid">
            {currentRole.stats.map((stat) => (
              <div key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="dynamic-profile-card">
          <h2>Résumé du rôle</h2>

          <div className="profile-summary-list">
            {currentRole.summary.map((item) => (
              <div key={item}>
                <strong>{item}</strong>
                <span>Information liée au rôle {user?.roleLabel}.</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;