import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import logo from "../assets/logo.png";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  const redirectByRole = (role) => {
    if (role === "citizen") navigate("/space/citizen");
    else if (role === "agent") navigate("/space/agent");
    else if (role === "manager") navigate("/space/manager");
    else if (role === "admin") navigate("/space/admin");
    else navigate("/login");
  };

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

  const handleSpaceChoice = (type) => {
    setSpaceType(type);

    if (type === "citizen") {
      setSelectedRole("citizen");
    } else {
      setSelectedRole("agent");
    }
  };

  const startEmailVerification = (selectedUser) => {
    const verificationCode = generateVerificationCode();

    localStorage.setItem(
      "ecotrack_pending_login_verification",
      JSON.stringify({
        user: selectedUser,
        verificationCode,
        createdAt: new Date().toISOString(),
      })
    );

    showToast(`Code de connexion envoyé : ${verificationCode}`, "success");
    navigate("/verify-login-email");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      showToast("Veuillez renseigner votre email et votre mot de passe.", "error");
      return;
    }

    const selectedUser = users[selectedRole];
    startEmailVerification(selectedUser);
  };

  const handleDemoAccess = () => {
    const selectedUser = users[selectedRole];

    login(selectedUser);
    showToast("Accès démo activé.", "success");
    redirectByRole(selectedUser.role);
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

          <button type="submit" className="primary-btn full-width">
            Continuer avec vérification email
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