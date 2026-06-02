import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import logo from "../assets/logo.png";

function CitizenRegister() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    password: "",
    confirmPassword: "",
  });

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.city.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      showToast("Veuillez remplir tous les champs.", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Les mots de passe ne correspondent pas.", "error");
      return;
    }

    const verificationCode = generateVerificationCode();

    const pendingCitizenRegistration = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      city: formData.city,
      role: "citizen",
      roleLabel: "Citoyen",
      status: "Email à confirmer",
      verified: false,
      verificationCode,
      createdAt: new Date().toLocaleDateString("fr-FR"),
    };

    localStorage.setItem(
      "ecotrack_pending_email_verification",
      JSON.stringify(pendingCitizenRegistration)
    );

    showToast(`Code de confirmation envoyé : ${verificationCode}`, "success");

    navigate("/verify-email");
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-brand">
          <img src={logo} alt="ECOTRACK" className="auth-logo" />
        </div>

        <span className="eyebrow">Inscription citoyenne</span>

        <h1>Créer un compte citoyen</h1>

        <p>
          Créez votre compte particulier. Une confirmation par email sera
          demandée avant l’envoi de votre demande à l’administrateur.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              name="name"
              placeholder="Ex : Stead Mabiala"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Adresse email</label>
            <input
              type="email"
              name="email"
              placeholder="Ex : citoyen@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Ville / quartier</label>
            <input
              type="text"
              name="city"
              placeholder="Ex : Noisy-le-Grand"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="Créer un mot de passe"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Confirmation du mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="primary-btn full-width">
            Continuer
          </button>
        </form>

        <button
          type="button"
          className="link-btn"
          onClick={() => navigate("/login")}
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}

export default CitizenRegister;