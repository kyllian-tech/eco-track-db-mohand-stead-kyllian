import { useMemo, useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { getProfiles } from "../api/profiles";
import { adminCreateUserApi } from "../api/auth";

const ROLE_LABEL = {
  admin: "Administrateur",
  gestionnaire: "Gestionnaire",
  agent: "Agent terrain",
  citoyen: "Citoyen",
  analyste: "Analyste",
};

const EMPTY_FORM = { email: "", password: "", full_name: "", role: "agent" };

function CreateUserModal({ onClose, onCreated }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setSaving(true);
    try {
      const newUser = await adminCreateUserApi(form);
      showToast(`Compte créé : ${newUser.email}`, "success");
      onCreated(newUser);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de la création.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: "12px", padding: "2rem",
        width: "100%", maxWidth: "440px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}>
        <h2 style={{ marginBottom: "1.25rem" }}>Créer un utilisateur</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.3rem", fontWeight: 500 }}>
              Nom complet
            </label>
            <input
              type="text"
              placeholder="Jean Dupont"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.95rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.3rem", fontWeight: 500 }}>
              Email <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="email"
              required
              placeholder="nom@ecotrack.fr"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.95rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.3rem", fontWeight: 500 }}>
              Mot de passe <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="password"
              required
              placeholder="8 caractères minimum"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.95rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.3rem", fontWeight: 500 }}>
              Rôle <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.95rem" }}
            >
              <option value="agent">Agent terrain</option>
              <option value="gestionnaire">Gestionnaire</option>
              <option value="analyste">Analyste</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          {error && (
            <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              {saving ? "Création…" : "Créer le compte"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Users() {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getProfiles()
      .then((data) => setUsers(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => showToast("Erreur lors du chargement des utilisateurs.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleUserCreated = (newUser) => {
    setUsers((prev) => [{ ...newUser, points: 0 }, ...prev]);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        (u.full_name ?? u.email ?? "").toLowerCase().includes(search) ||
        (u.email ?? "").toLowerCase().includes(search) ||
        (u.role ?? "").toLowerCase().includes(search);
      const matchesRole = roleFilter === "Tous" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="users-page-pro">
      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onCreated={handleUserCreated}
        />
      )}

      <div className="page-title-row">
        <div>
          <span className="eyebrow">Gestion des accès</span>
          <h1>Utilisateurs</h1>
          <p>Consultez et gérez les comptes utilisateurs de la plateforme ECOTRACK.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Créer un utilisateur
        </button>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total</span>
          <strong>{users.length}</strong>
        </div>
        <div className="overview-card success">
          <span>Citoyens</span>
          <strong>{users.filter((u) => u.role === "citoyen").length}</strong>
        </div>
        <div className="overview-card warning">
          <span>Agents</span>
          <strong>{users.filter((u) => u.role === "agent").length}</strong>
        </div>
        <div className="overview-card">
          <span>Admins</span>
          <strong>{users.filter((u) => u.role === "admin").length}</strong>
        </div>
      </div>

      <section className="user-admin-panel">
        <div className="panel-toolbar">
          <div className="search-box-pro">
            <span className="search-label">Recherche</span>
            <input
              type="text"
              placeholder="Nom, email ou rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="select-pro"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="Tous">Tous</option>
            <option value="citoyen">Citoyen</option>
            <option value="agent">Agent terrain</option>
            <option value="gestionnaire">Gestionnaire</option>
            <option value="admin">Administrateur</option>
            <option value="analyste">Analyste</option>
          </select>
        </div>

        {loading ? (
          <p>Chargement…</p>
        ) : filteredUsers.length === 0 ? (
          <p>Aucun utilisateur trouvé.</p>
        ) : (
          <div className="users-table-pro">
            <div className="users-table-header">
              <span>Utilisateur</span>
              <span>Rôle</span>
              <span>Points</span>
              <span>ID</span>
            </div>

            {filteredUsers.map((u) => (
              <article className="users-table-row" key={u.id}>
                <div className="user-cell">
                  <div className="user-avatar">
                    {(u.full_name ?? u.email ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{u.full_name ?? "—"}</strong>
                    <small>{u.email}</small>
                  </div>
                </div>

                <span className="role-badge">
                  {ROLE_LABEL[u.role] ?? u.role ?? "—"}
                </span>

                <span>{u.points ?? 0} pts</span>

                <small style={{ color: "var(--text-muted, #888)", fontSize: "0.7rem" }}>
                  {u.id?.slice(0, 8)}…
                </small>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Users;
