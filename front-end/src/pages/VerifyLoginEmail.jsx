import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Cette page n'est plus utilisée — la connexion appelle directement le backend.
function VerifyLoginEmail() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("ecotrack_pending_login_verification");
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
}

export default VerifyLoginEmail;
