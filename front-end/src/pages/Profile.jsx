import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getProfileById, updateProfile } from "../api/profiles";

const ROLE_LABELS = {
  citizen: "Citoyen",
  agent: "Agent terrain",
  manager: "Gestionnaire",
  admin: "Administrateur",
  analyst: "Analyste",
};

const ROLE_META = {
  citizen: {
    eyebrow: "Profil citoyen",
    title: "Mon profil citoyen",
    description:
      "Consultez vos informations personnelles, votre engagement citoyen et votre impact environnemental.",
    levelLabel: "Niveau citoyen",
    level: "Citoyen engagé",
    badge: "Eco Ambassadeur",
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
      "Consultez vos informations d'administration, vos accès sécurité et votre périmètre de gouvernance.",
    levelLabel: "Accès",
    level: "Administration complète",
    badge: "Super administrateur",
    summary: [
      "Gestion des utilisateurs et des permissions.",
      "Validation des inscriptions citoyennes.",
      "Supervision sécurité, historique et paramètres plateforme.",
    ],
  },
};

function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarInput, setAvatarInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getProfileById(user.id)
      .then((data) => {
        setProfile(data);
        setAvatarInput(data.avatar_url || "");
      })
      .catch(() => showToast("Impossible de charger le profil.", "error"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(user.id, { avatar_url: avatarInput || null });
      setProfile(updated);
      setEditing(false);
      showToast("Profil mis à jour.", "success");
    } catch {
      showToast("Erreur lors de la mise à jour.", "error");
    } finally {
      setSaving(false);
    }
  };

  const meta = ROLE_META[user?.role] || ROLE_META.citizen;
  const displayName = user?.full_name || user?.name || "Utilisateur";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const points = profile?.points ?? 0;

  const citizenStats = [
    { label: "Points", value: points },
    { label: "Signalements", value: "—" },
    { label: "Classement", value: "—" },
    { label: "CO₂ évité", value: "—" },
  ];

  const staticStats = {
    agent: [
      { label: "Tournées réalisées", value: "—" },
      { label: "Collectes validées", value: "—" },
      { label: "Anomalies signalées", value: "—" },
      { label: "Disponibilité", value: "Actif" },
    ],
    manager: [
      { label: "Conteneurs suivis", value: "—" },
      { label: "Tournées supervisées", value: "—" },
      { label: "Alertes traitées", value: "—" },
      { label: "Zone", value: "Ville entière" },
    ],
    admin: [
      { label: "Utilisateurs", value: "—" },
      { label: "Rôles actifs", value: "4" },
      { label: "Demandes à valider", value: "—" },
      { label: "Alertes cyber", value: "—" },
    ],
  };

  const stats = user?.role === "citizen" ? citizenStats : (staticStats[user?.role] || citizenStats);

  if (loading) {
    return (
      <div className="dynamic-profile-page-pro">
        <p style={{ padding: "2rem", opacity: 0.6 }}>Chargement du profil…</p>
      </div>
    );
  }

  return (
    <div className="dynamic-profile-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">{meta.eyebrow}</span>
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </div>
      </div>

      <div className="dynamic-profile-grid">
        <section className="dynamic-profile-card main">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="dynamic-profile-avatar"
              style={{ objectFit: "cover" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div className="dynamic-profile-avatar">{avatarLetter}</div>
          )}

          <h2>{displayName}</h2>
          <p>{user?.email}</p>

          <div className="dynamic-profile-badge">{meta.badge}</div>

          <div className="dynamic-profile-progress">
            <span>{meta.levelLabel}</span>
            <strong>{meta.level}</strong>
            <div className="progress-bar">
              <div className="progress-fill green" style={{ width: "72%" }} />
            </div>
            <p>Ce profil est adapté automatiquement selon le rôle connecté dans ECOTRACK.</p>
          </div>

          <div style={{ marginTop: "1rem" }}>
            {!editing ? (
              <button className="btn-secondary" onClick={() => setEditing(true)}>
                Modifier l'avatar
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input
                  type="url"
                  placeholder="URL de l'image"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </button>
                  <button className="btn-secondary" onClick={() => { setEditing(false); setAvatarInput(profile?.avatar_url || ""); }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="dynamic-profile-card">
          <h2>Informations du compte</h2>
          <div className="profile-info-list">
            <div>
              <span>Nom complet</span>
              <strong>{displayName}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user?.email || "—"}</strong>
            </div>
            <div>
              <span>Rôle</span>
              <strong>{ROLE_LABELS[user?.role] || user?.role || "—"}</strong>
            </div>
            {user?.role === "citizen" && (
              <div>
                <span>Points</span>
                <strong>{points}</strong>
              </div>
            )}
          </div>
        </section>

        <section className="dynamic-profile-card">
          <h2>Indicateurs du profil</h2>
          <div className="profile-stats-grid">
            {stats.map((stat) => (
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
            {meta.summary.map((item) => (
              <div key={item}>
                <strong>{item}</strong>
                <span>Information liée au rôle {ROLE_LABELS[user?.role]}.</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;
