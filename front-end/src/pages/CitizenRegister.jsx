import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { registerApi } from "../api/auth";
import logo from "../assets/logo.png";

function CitizenRegister() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
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

    if (formData.password.length < 8) {
      showToast("Le mot de passe doit contenir au moins 8 caractères.", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Inscription via le backend
      await registerApi(formData.email.trim(), formData.password, formData.name.trim(), "citoyen");

      // Connexion automatique après inscription réussie
      await login(formData.email.trim(), formData.password);

      showToast("Compte créé avec succès. Bienvenue !", "success");
      navigate("/space/citizen", { replace: true });
    } catch (error) {
      const data = error?.response?.data;
      console.error("[Register] Erreur backend :", JSON.stringify(data, null, 2));

      // Affiche les détails de validation si disponibles
      if (data?.details?.length) {
        const detail = data.details[0];
        showToast(`Champ "${detail.field}" : ${detail.message}`, "error");
      } else if (data?.message?.toLowerCase().includes("already exists")) {
        showToast("Un compte existe déjà avec cet email.", "error");
      } else {
        showToast(data?.error || data?.message || "Erreur lors de l'inscription. Réessayez.", "error");
      }
    } finally {
      setIsLoading(false);
    }
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
          Créez votre compte pour signaler des anomalies, suivre vos
          contributions et participer aux défis environnementaux.
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
            <label>Mot de passe <span style={{ color: "#888", fontSize: "0.85em" }}>(8 caractères min.)</span></label>
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

          <button type="submit" className="primary-btn full-width" disabled={isLoading}>
            {isLoading ? "Création en cours…" : "Créer mon compte"}
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
