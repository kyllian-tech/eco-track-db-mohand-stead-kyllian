import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import logo from "../assets/logo.png";

function VerifyEmail() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [code, setCode] = useState("");

  const pendingRegistration = (() => {
    const stored = localStorage.getItem("ecotrack_pending_email_verification");

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  })();

  if (!pendingRegistration) {
    navigate("/register-citizen", { replace: true });
    return null;
  }

  const handleVerify = (event) => {
    event.preventDefault();

    if (code.trim() !== String(pendingRegistration.verificationCode).trim()) {
      showToast("Code de confirmation incorrect.", "error");
      return;
    }

    const verifiedRequest = {
      ...pendingRegistration,
      status: "En attente",
      verified: true,
    };

    const existingRequests = JSON.parse(
      localStorage.getItem("ecotrack_registration_requests") || "[]"
    );

    localStorage.setItem(
      "ecotrack_registration_requests",
      JSON.stringify([verifiedRequest, ...existingRequests])
    );

    localStorage.removeItem("ecotrack_pending_email_verification");

    showToast(
      "Email confirmé. Votre demande est maintenant en attente de validation administrateur.",
      "success"
    );

    navigate("/login", { replace: true });
  };

  const resendCode = () => {
    showToast(`Code renvoyé : ${pendingRegistration.verificationCode}`, "success");
  };

  return (
    <div className="auth-page">
      <div className="auth-card verify-card">
        <div className="auth-brand">
          <img src={logo} alt="ECOTRACK" className="auth-logo" />
        </div>

        <span className="eyebrow">Confirmation email</span>

        <h1>Vérifiez votre adresse email</h1>

        <p>
          Un code de confirmation a été envoyé à{" "}
          <strong>{pendingRegistration.email}</strong>. Saisissez ce code pour
          finaliser votre demande d’inscription citoyenne.
        </p>

        <form className="auth-form" onSubmit={handleVerify}>
          <div className="form-group">
            <label>Code de confirmation</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="Ex : 123456"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>

          <button type="submit" className="primary-btn full-width">
            Confirmer mon email
          </button>
        </form>

        <button type="button" className="link-btn" onClick={resendCode}>
          Renvoyer le code
        </button>
      </div>
    </div>
  );
}

export default VerifyEmail;