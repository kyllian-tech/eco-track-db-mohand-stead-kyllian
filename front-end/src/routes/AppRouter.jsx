import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import CitizenLayout from "../layouts/CitizenLayout";
import AgentLayout from "../layouts/AgentLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import AdminLayout from "../layouts/AdminLayout";

import Landing from "../pages/Landing";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import CitizenRegister from "../pages/CitizenRegister";
import VerifyEmail from "../pages/VerifyEmail";
import VerifyLoginEmail from "../pages/VerifyLoginEmail";

import CitizenSpace from "../pages/CitizenSpace";
import CitizenMap from "../pages/CitizenMap";
import CitizenHistory from "../pages/CitizenHistory";
import CitizenNotifications from "../pages/CitizenNotifications";
import CitizenSettings from "../pages/CitizenSettings";

import AgentSpace from "../pages/AgentSpace";
import AgentMap from "../pages/AgentMap";

import ManagerSpace from "../pages/ManagerSpace";
import AdminSpace from "../pages/AdminSpace";

import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Notifications from "../pages/Notifications";
import Users from "../pages/Users";
import History from "../pages/History";
import Exports from "../pages/Exports";
import CitizenReport from "../pages/CitizenReport";
import Gamification from "../pages/Gamification";
import SecurityMonitoring from "../pages/SecurityMonitoring";
import RegistrationRequests from "../pages/RegistrationRequests";
import RolesPermissions from "../pages/RolesPermissions";

import Containers from "../pages/Containers";
import MapView from "../pages/MapView";
import RoutesPage from "../pages/Routes";
import Reports from "../pages/Reports";
import Analytics from "../pages/Analytics";

import RoleRoute from "./RoleRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-citizen" element={<CitizenRegister />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-login-email" element={<VerifyLoginEmail />} />
        </Route>

        <Route
          path="/space/citizen"
          element={
            <RoleRoute allowedRole="citizen">
              <CitizenLayout />
            </RoleRoute>
          }
        >
          <Route index element={<CitizenSpace />} />
          <Route path="map" element={<CitizenMap />} />
          <Route path="report" element={<CitizenReport />} />
          <Route path="gamification" element={<Gamification />} />
          <Route path="history" element={<CitizenHistory />} />
          <Route path="notifications" element={<CitizenNotifications />} />
          <Route path="settings" element={<CitizenSettings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/space/agent"
          element={
            <RoleRoute allowedRole="agent">
              <AgentLayout />
            </RoleRoute>
          }
        >
          <Route index element={<AgentSpace />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="map" element={<AgentMap />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/space/manager"
          element={
            <RoleRoute allowedRole="manager">
              <ManagerLayout />
            </RoleRoute>
          }
        >
          <Route index element={<ManagerSpace />} />
          <Route path="containers" element={<Containers />} />
          <Route path="map" element={<MapView />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="exports" element={<Exports />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/space/admin"
          element={
            <RoleRoute allowedRole="admin">
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route index element={<AdminSpace />} />
          <Route path="users" element={<Users />} />
          <Route path="registration-requests" element={<RegistrationRequests />} />
          <Route path="roles" element={<RolesPermissions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="history" element={<History />} />
          <Route path="security" element={<SecurityMonitoring />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/app" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;