import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAsRead } from "../api/notifications";

function CitizenNotifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    getNotifications({ user_id: user.id })
      .then((data) => setNotifications(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleMarkAsRead = async (id) => {
    try {
      const updated = await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, est_lu: updated?.est_lu ?? true } : n))
      );
    } catch {
      // silencieux
    }
  };

  const unread = notifications.filter((n) => !n.est_lu).length;

  return (
    <div className="citizen-notifications-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Messages citoyens</span>
          <h1>Notifications</h1>
          <p>
            Suivez les informations importantes liées à vos signalements, vos
            badges et vos défis citoyens.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total</span>
          <strong>{notifications.length}</strong>
        </div>

        <div className="overview-card warning">
          <span>Non lues</span>
          <strong>{unread}</strong>
        </div>

        <div className="overview-card success">
          <span>Lues</span>
          <strong>{notifications.length - unread}</strong>
        </div>
      </div>

      <div className="panel-pro">
        {loading ? (
          <p>Chargement…</p>
        ) : notifications.length === 0 ? (
          <p>Aucune notification pour le moment.</p>
        ) : (
          <div className="citizen-notifications-list">
            {notifications.map((notif) => (
              <article
                className={notif.est_lu ? "citizen-notification-card" : "citizen-notification-card unread"}
                key={notif.id}
              >
                <div>
                  <div className="citizen-notification-header">
                    <h3>{notif.titre}</h3>
                    {!notif.est_lu && (
                      <button
                        className="secondary-btn"
                        onClick={() => handleMarkAsRead(notif.id)}
                        style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                      >
                        Marquer comme lue
                      </button>
                    )}
                  </div>

                  <p>{notif.message}</p>

                  <div className="citizen-notification-meta">
                    <span>
                      {new Date(notif.created_at).toLocaleDateString("fr-FR")}
                    </span>
                    <strong>{notif.est_lu ? "Lu" : "Non lu"}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CitizenNotifications;
