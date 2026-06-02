import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import logo from "../assets/logo.png";

function VerifyLoginEmail() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [code, setCode] = useState("");

  const pendingLogin = (() => {
    const stored = localStorage.getItem("ecotrack_pending_login_verification");

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  })();

  if (!pendingLogin) {
    navigate("/login", { replace: true });
    return null;
  }

  const getRedirectPath = (role) => {
    if (role === "citizen") return "/space/citizen";
    if (role === "agent") return "/space/agent";
    if (role === "manager") return "/space/manager";
    if (role === "admin") return "/space/admin";
    return "/login";
  };

  const handleVerify = (event) => {
    event.preventDefault();

    if (code.trim() !== String(pendingLogin.verificationCode).trim()) {
      showToast("Code de confirmation incorrect.", "error");
      return;
    }

    login(pendingLogin.user);

    localStorage.removeItem("ecotrack_pending_login_verification");

    showToast("Connexion confirmée avec succès.", "success");

    navigate(getRedirectPath(pendingLogin.user.role), { replace: true });
  };

  const resendCode = () => {
    showToast(`Code renvoyé : ${pendingLogin.verificationCode}`, "success");
  };

  return (
    <div className="auth-page">
      <div className="auth-card verify-card">
        <div className="auth-brand">
          <img src={logo} alt="ECOTRACK" className="auth-logo" />
        </div>

        <span className="eyebrow">Vérification de connexion</span>

        <h1>Confirmez votre connexion</h1>

        <p>
          Un code de confirmation a été envoyé à{" "}
          <strong>{pendingLogin.user.email}</strong>. Saisissez ce code pour
          accéder à votre espace.
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
            Confirmer la connexion
          </button>
        </form>

        <button type="button" className="link-btn" onClick={resendCode}>
          Renvoyer le code
        </button>
      </div>
    </div>
  );
}

export default VerifyLoginEmail;