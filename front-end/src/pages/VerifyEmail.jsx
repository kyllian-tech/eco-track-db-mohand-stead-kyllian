import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Cette page n'est plus utilisée — l'inscription appelle directement le backend.
function VerifyEmail() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("ecotrack_pending_email_verification");
    navigate("/register-citizen", { replace: true });
  }, [navigate]);

  return null;
}

export default VerifyEmail;
