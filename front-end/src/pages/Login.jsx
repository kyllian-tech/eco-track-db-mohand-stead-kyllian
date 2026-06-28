import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import logo from "../assets/logo.png";

const REDIRECT_BY_ROLE = {
  citizen: "/space/citizen",
  agent: "/space/agent",
  manager: "/space/manager",
  admin: "/space/admin",
};

function Login() {
  const navigate = useNavigate();
  const { login, loginDemo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const [spaceType, setSpaceType] = useState(null);
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const users = {
    citizen: {
      name: "Citoyen Demo",
      email: "citoyen@ecotrack.com",
      role: "citizen",
      roleLabel: "Citoyen",
    },
    agent: {
      name: "Agent Collecte",
      email: "agent@ecotrack.com",
      role: "agent",
      roleLabel: "Agent de collecte",
    },
    manager: {
      name: "Gestionnaire Ville",
      email: "manager@ecotrack.com",
      role: "manager",
      roleLabel: "Gestionnaire",
    },
    admin: {
      name: "Administrateur",
      email: "admin@ecotrack.com",
      role: "admin",
      roleLabel: "Administrateur",
    },
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSpaceChoice = (type) => {
    setSpaceType(type);
    setSelectedRole(type === "citizen" ? "citizen" : "agent");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      showToast("Veuillez renseigner votre email et votre mot de passe.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const userData = await login(formData.email.trim(), formData.password);
      showToast("Connexion réussie.", "success");
      navigate(REDIRECT_BY_ROLE[userData.role] ?? "/login");
    } catch {
      showToast("Email ou mot de passe incorrect.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    const selectedUser = users[selectedRole];
    loginDemo(selectedUser);
    showToast("Accès démo activé.", "success");
    navigate(REDIRECT_BY_ROLE[selectedUser.role] ?? "/login");
  };

  if (!spaceType) {
    return (
      <div className="auth-page">
        <div className="auth-card login-choice-card">
          <div className="auth-brand">
            <img src={logo} alt="ECOTRACK" className="auth-logo" />
          </div>

          <span className="eyebrow">Accès sécurisé</span>

          <h1>Choisissez votre espace</h1>

          <p>
            Sélectionnez le type de connexion correspondant à votre profil
            utilisateur.
          </p>

          <div className="login-choice-grid">
            <button type="button" onClick={() => handleSpaceChoice("citizen")}>
              <strong>Espace particulier</strong>
              <span>Citoyen</span>
              <p>
                Déclarez un problème, suivez vos signalements, participez aux
                défis et consultez votre impact environnemental.
              </p>
            </button>

            <button type="button" onClick={() => handleSpaceChoice("pro")}>
              <strong>Espace professionnel</strong>
              <span>Agent, Gestionnaire ou Administrateur</span>
              <p>
                Accédez aux tournées, aux conteneurs, aux analytics, à la
                supervision et à l’administration de la plateforme.
              </p>
            </button>
          </div>

          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/register-citizen")}
          >
            Créer un compte citoyen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card login-card">
        <div className="auth-brand">
          <img src={logo} alt="ECOTRACK" className="auth-logo" />
        </div>

        <span className="eyebrow">
          {spaceType === "citizen" ? "Espace particulier" : "Espace professionnel"}
        </span>

        <h1>Connexion</h1>

        <p>
          Connectez-vous à votre espace ECOTRACK. Une confirmation par email sera
          demandée avant l’accès.
        </p>

        {spaceType === "pro" && (
          <div className="form-group">
            <label>Profil professionnel</label>
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
            >
              <option value="agent">Agent de collecte</option>
              <option value="manager">Gestionnaire</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Adresse email</label>
            <input
              type="email"
              name="email"
              placeholder={
                spaceType === "citizen"
                  ? "citoyen@ecotrack.com"
                  : users[selectedRole].email
              }
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="primary-btn full-width" disabled={isLoading}>
            {isLoading ? "Connexion en cours…" : "Se connecter"}
          </button>
        </form>

        <button type="button" className="secondary-btn full-width" onClick={handleDemoAccess}>
          Accès démo sans vérification
        </button>

        <button type="button" className="link-btn" onClick={() => setSpaceType(null)}>
          Retour au choix de l’espace
        </button>
      </div>
    </div>
  );
}

export default Login;