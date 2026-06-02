import { useMemo, useState } from "react";
import { useToast } from "../context/ToastContext";

function Users() {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [editingUserId, setEditingUserId] = useState(null);

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Administrateur",
      email: "admin@ecotrack.com",
      role: "Administrateur",
      permissions: "Accès complet",
      status: "Actif",
    },
    {
      id: 2,
      name: "Agent A",
      email: "agent@ecotrack.com",
      role: "Agent terrain",
      permissions: "Tournées, Signalements",
      status: "Actif",
    },
    {
      id: 3,
      name: "Gestionnaire Ville",
      email: "manager@ecotrack.com",
      role: "Gestionnaire",
      permissions: "Dashboard, Conteneurs, Tournées, Analytics",
      status: "Actif",
    },
    {
      id: 4,
      name: "Citoyen Demo",
      email: "citoyen@ecotrack.com",
      role: "Citoyen",
      permissions: "Signalements, Gamification, Profil",
      status: "Actif",
    },
    {
      id: 5,
      name: "Observateur Data",
      email: "data@ecotrack.com",
      role: "Lecteur",
      permissions: "Lecture seule",
      status: "Inactif",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Citoyen",
    permissions: "Signalements, Gamification, Profil",
    status: "Actif",
  });

  const rolePermissions = {
    Administrateur: "Accès complet",
    Gestionnaire: "Dashboard, Conteneurs, Tournées, Analytics",
    "Agent terrain": "Tournées, Signalements",
    Citoyen: "Signalements, Gamification, Profil",
    Lecteur: "Lecture seule",
  };

  const writeAuditLog = (action, targetUser) => {
    const previousLogs = JSON.parse(
      localStorage.getItem("ecotrack_audit_logs") || "[]"
    );

    const newLog = {
      id: Date.now(),
      action,
      target: targetUser.name,
      email: targetUser.email,
      module: "Utilisateurs",
      actor: "Administrateur",
      date: new Date().toLocaleString("fr-FR"),
    };

    localStorage.setItem(
      "ecotrack_audit_logs",
      JSON.stringify([newLog, ...previousLogs])
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "Citoyen",
      permissions: "Signalements, Gamification, Profil",
      status: "Actif",
    });

    setEditingUserId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "role") {
      setFormData((current) => ({
        ...current,
        role: value,
        permissions: rolePermissions[value],
      }));
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      showToast("Veuillez renseigner le nom et l’email.", "error");
      return;
    }

    if (editingUserId) {
      setUsers((current) =>
        current.map((user) =>
          user.id === editingUserId ? { ...user, ...formData } : user
        )
      );

      writeAuditLog("Modification utilisateur", formData);
      showToast("Utilisateur modifié avec succès.", "success");
      resetForm();
      return;
    }

    const createdUser = {
      id: Date.now(),
      ...formData,
    };

    setUsers((current) => [createdUser, ...current]);

    writeAuditLog("Création utilisateur", createdUser);
    showToast("Utilisateur créé avec succès.", "success");
    resetForm();
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);

    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStatus = (id) => {
    setUsers((current) =>
      current.map((user) => {
        if (user.id !== id) return user;

        const updatedUser = {
          ...user,
          status: user.status === "Actif" ? "Inactif" : "Actif",
        };

        writeAuditLog(
          updatedUser.status === "Actif"
            ? "Réactivation utilisateur"
            : "Désactivation utilisateur",
          updatedUser
        );

        return updatedUser;
      })
    );

    showToast("Statut utilisateur mis à jour.", "success");
  };

  const handleDelete = (id) => {
    const userToDelete = users.find((user) => user.id === id);

    if (!userToDelete) return;

    setUsers((current) => current.filter((user) => user.id !== id));

    writeAuditLog("Suppression utilisateur", userToDelete);
    showToast("Utilisateur supprimé.", "success");
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search);

      const matchesRole = roleFilter === "Tous" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const activeCount = users.filter((user) => user.status === "Actif").length;
  const inactiveCount = users.filter((user) => user.status === "Inactif").length;
  const adminCount = users.filter(
    (user) => user.role === "Administrateur"
  ).length;

  return (
    <div className="users-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Gestion des accès</span>
          <h1>Utilisateurs</h1>
          <p>
            Créez, modifiez, désactivez et supprimez les comptes utilisateurs de
            la plateforme ECOTRACK.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total</span>
          <strong>{users.length}</strong>
        </div>

        <div className="overview-card success">
          <span>Actifs</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="overview-card warning">
          <span>Inactifs</span>
          <strong>{inactiveCount}</strong>
        </div>

        <div className="overview-card">
          <span>Administrateurs</span>
          <strong>{adminCount}</strong>
        </div>
      </div>

      <section className="user-admin-panel">
        <h2>{editingUserId ? "Modifier un utilisateur" : "Créer un utilisateur"}</h2>

        <form className="user-admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              name="name"
              placeholder="Ex : Agent Collecte"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Ex : agent@ecotrack.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Rôle</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option>Citoyen</option>
              <option>Agent terrain</option>
              <option>Gestionnaire</option>
              <option>Administrateur</option>
              <option>Lecteur</option>
            </select>
          </div>

          <div className="form-group">
            <label>Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Actif</option>
              <option>Inactif</option>
            </select>
          </div>

          <div className="form-group permissions-field">
            <label>Permissions</label>
            <input
              type="text"
              name="permissions"
              value={formData.permissions}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="primary-btn">
            {editingUserId ? "Enregistrer" : "Créer"}
          </button>

          {editingUserId && (
            <button type="button" className="secondary-btn" onClick={resetForm}>
              Annuler
            </button>
          )}
        </form>
      </section>

      <section className="user-admin-panel">
        <div className="panel-toolbar">
          <div className="search-box-pro">
            <span className="search-label">Recherche</span>
            <input
              type="text"
              placeholder="Nom, email ou rôle..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            className="select-pro"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option>Tous</option>
            <option>Citoyen</option>
            <option>Agent terrain</option>
            <option>Gestionnaire</option>
            <option>Administrateur</option>
            <option>Lecteur</option>
          </select>
        </div>

        <div className="users-table-pro">
          <div className="users-table-header">
            <span>Utilisateur</span>
            <span>Rôle</span>
            <span>Permissions</span>
            <span>Statut</span>
            <span>Actions</span>
          </div>

          {filteredUsers.map((user) => (
            <article className="users-table-row" key={user.id}>
              <div className="user-cell">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>

              <span className="role-badge">{user.role}</span>

              <span className="permissions-text">{user.permissions}</span>

              <span
                className={
                  user.status === "Actif"
                    ? "status-pill active"
                    : "status-pill inactive"
                }
              >
                {user.status}
              </span>

              <div className="users-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => handleEdit(user)}
                >
                  Modifier
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => toggleStatus(user.id)}
                >
                  {user.status === "Actif" ? "Désactiver" : "Réactiver"}
                </button>

                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => handleDelete(user.id)}
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Users;