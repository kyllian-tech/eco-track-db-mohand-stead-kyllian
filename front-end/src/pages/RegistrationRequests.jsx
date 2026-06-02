import { useMemo, useState } from "react";
import { useToast } from "../context/ToastContext";

function RegistrationRequests() {
  const { showToast } = useToast();

  const getInitialRequests = () => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("ecotrack_registration_requests") || "[]"
      );

      if (Array.isArray(stored)) {
        return stored;
      }

      return [];
    } catch {
      return [];
    }
  };

  const [requests, setRequests] = useState(getInitialRequests);

  const saveRequests = (nextRequests) => {
    setRequests(nextRequests);
    localStorage.setItem(
      "ecotrack_registration_requests",
      JSON.stringify(nextRequests)
    );
  };

const writeAuditLog = (action, request) => {
  const previousLogs = JSON.parse(
    localStorage.getItem("ecotrack_audit_logs") || "[]"
  );

  const newLog = {
    id: `${request.id}-${action}-${previousLogs.length + 1}`,
    action,
    target: request.name,
    email: request.email,
    module: "Demandes d’inscription",
    actor: "Administrateur",
    date: "Maintenant",
  };

  localStorage.setItem(
    "ecotrack_audit_logs",
    JSON.stringify([newLog, ...previousLogs])
  );
};

  const updateRequestStatus = (id, status) => {
    const selectedRequest = requests.find((request) => request.id === id);

    if (!selectedRequest) return;

    const nextRequests = requests.map((request) =>
      request.id === id ? { ...request, status } : request
    );

    saveRequests(nextRequests);

    writeAuditLog(
      status === "Validé"
        ? "Validation inscription citoyenne"
        : "Refus inscription citoyenne",
      selectedRequest
    );

    showToast(
      status === "Validé"
        ? "Demande d’inscription validée."
        : "Demande d’inscription refusée.",
      "success"
    );
  };

  const deleteRequest = (id) => {
    const selectedRequest = requests.find((request) => request.id === id);

    if (!selectedRequest) return;

    const nextRequests = requests.filter((request) => request.id !== id);

    saveRequests(nextRequests);
    writeAuditLog("Suppression demande inscription", selectedRequest);
    showToast("Demande supprimée.", "success");
  };

  const stats = useMemo(() => {
    return {
      pending: requests.filter((request) => request.status === "En attente")
        .length,
      approved: requests.filter((request) => request.status === "Validé").length,
      refused: requests.filter((request) => request.status === "Refusé").length,
      total: requests.length,
    };
  }, [requests]);

  return (
    <div className="registration-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Validation citoyenne</span>
          <h1>Demandes d’inscription</h1>
          <p>
            Consultez et validez les demandes de création de compte citoyen
            avant l’accès à l’espace particulier.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card warning">
          <span>En attente</span>
          <strong>{stats.pending}</strong>
        </div>

        <div className="overview-card success">
          <span>Validées</span>
          <strong>{stats.approved}</strong>
        </div>

        <div className="overview-card danger">
          <span>Refusées</span>
          <strong>{stats.refused}</strong>
        </div>

        <div className="overview-card">
          <span>Total demandes</span>
          <strong>{stats.total}</strong>
        </div>
      </div>

      <section className="registration-panel">
        <h2>Demandes citoyennes</h2>

        {requests.length === 0 ? (
          <div className="empty-state-pro">
            <h3>Aucune demande</h3>
            <p>
              Les nouvelles inscriptions citoyennes apparaîtront ici après
              confirmation email.
            </p>
          </div>
        ) : (
          <div className="registration-list">
            {requests.map((request) => (
              <article className="registration-row" key={request.id}>
                <div className="user-cell">
                  <div className="user-avatar">
                    {request.name?.charAt(0).toUpperCase() || "C"}
                  </div>

                  <div>
                    <strong>{request.name}</strong>
                    <small>{request.email}</small>

                    <div className="registration-tags">
                      <span>{request.city || "Ville non renseignée"}</span>
                      <span>{request.roleLabel || "Citoyen"}</span>
                      <span>{request.createdAt || "Date inconnue"}</span>
                      {request.verified && <span>Email confirmé</span>}
                    </div>
                  </div>
                </div>

                <div className="registration-actions">
                  <span
                    className={
                      request.status === "Validé"
                        ? "status-pill active"
                        : request.status === "Refusé"
                        ? "status-pill refused"
                        : "status-pill pending"
                    }
                  >
                    {request.status || "En attente"}
                  </span>

                  {request.status === "En attente" && (
                    <>
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => updateRequestStatus(request.id, "Validé")}
                      >
                        Valider
                      </button>

                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => updateRequestStatus(request.id, "Refusé")}
                      >
                        Refuser
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => deleteRequest(request.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default RegistrationRequests;