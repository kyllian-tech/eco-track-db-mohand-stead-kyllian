import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ allowedRole, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    if (user.role === "citizen") return <Navigate to="/space/citizen" replace />;
    if (user.role === "agent") return <Navigate to="/space/agent" replace />;
    if (user.role === "manager") return <Navigate to="/space/manager" replace />;
    if (user.role === "admin") return <Navigate to="/space/admin" replace />;

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RoleRoute;