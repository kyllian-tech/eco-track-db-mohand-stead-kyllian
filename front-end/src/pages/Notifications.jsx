import { useEffect, useState } from "react";
import { getNotifications, markAsRead, deleteNotification } from "../api/notifications";
import { useToast } from "../context/ToastContext";

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Hier";
  return `Il y a ${d} jours`;
}

function Notifications() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unread | read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    getNotifications()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => showToast("Impossible de charger les notifications.", "error"))
      .finally(() => setLoading(false));
  };

  const handleMarkAsRead = async (id) => {
    try {
      const updated = await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, est_lu: updated.est_lu } : n))
      );
    } catch {
      showToast("Erreur lors de la mise à jour.", "error");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.est_lu);
    try {
      await Promise.all(unread.map((n) => markAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, est_lu: true })));
      showToast("Toutes les notifications marquées comme lues.", "success");
    } catch {
      showToast("Erreur lors de la mise à jour.", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast("Notification supprimée.", "success");
    } catch {
      showToast("Erreur lors de la suppression.", "error");
    }
  };

  const unreadCount = notifications.filter((n) => !n.est_lu).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.est_lu;
    if (filter === "read") return n.est_lu;
    return true;
  });

  return (
    <div className="notifications-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Centre d'alertes</span>
          <h1>Notifications</h1>
          <p>
            Toutes les notifications de la plateforme — conteneurs, tournées,
            signalements et activité utilisateurs.
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-primary" onClick={handleMarkAllRead}>
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total</span>
          <strong>{notifications.length}</strong>
        </div>
        <div className="overview-card warning">
          <span>Non lues</span>
          <strong>{unreadCount}</strong>
        </div>
        <div className="overview-card success">
          <span>Lues</span>
          <strong>{notifications.length - unreadCount}</strong>
        </div>
        <div className="overview-card">
          <span>État système</span>
          <strong>OK</strong>
        </div>
      </div>

      <div className="panel-pro">
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {[
            { key: "all", label: "Toutes" },
            { key: "unread", label: `Non lues (${unreadCount})` },
            { key: "read", label: "Lues" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={filter === key ? "btn-primary" : "btn-secondary"}
              style={{ fontSize: "0.85rem", padding: "0.3rem 0.8rem" }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ padding: "2rem", opacity: 0.5 }}>Chargement…</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: "2rem", opacity: 0.5, textAlign: "center" }}>
            Aucune notification{filter !== "all" ? " dans cette catégorie" : ""}.
          </p>
        ) : (
          <div className="notifications-list-pro">
            {filtered.map((notif) => (
              <article
                key={notif.id}
                className={`notification-card-pro ${!notif.est_lu ? "unread" : ""}`}
              >
                <div className="notification-main">
                  <div className={`notification-indicator ${!notif.est_lu ? "critique" : ""}`} />

                  <div style={{ flex: 1 }}>
                    <div className="notification-title-row">
                      <h3>{notif.titre}</h3>
                      {!notif.est_lu && (
                        <span className="notification-type" style={{ background: "#fef3c7", color: "#92400e" }}>
                          Non lu
                        </span>
                      )}
                    </div>

                    <p>{notif.message}</p>

                    <div className="notification-meta">
                      <span>{timeAgo(notif.created_at)}</span>
                      {notif.user_id && (
                        <span style={{ opacity: 0.5, fontSize: "0.75rem" }}>
                          user: {notif.user_id.slice(0, 8)}…
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  {!notif.est_lu && (
                    <button
                      className="secondary-btn notification-action"
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      Marquer lu
                    </button>
                  )}
                  <button
                    className="secondary-btn notification-action"
                    style={{ color: "#ef4444" }}
                    onClick={() => handleDelete(notif.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
