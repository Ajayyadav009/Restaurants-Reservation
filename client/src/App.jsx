import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RegisterAdmin from "./pages/auth/RegisterAdmin";
import MyReservations from "./pages/customer/MyReservations";
import NewReservation from "./pages/customer/NewReservation";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminTables from "./pages/admin/AdminTables";

const RootRedirect = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? "/admin/reservations" : "/reservations"} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {}
          <Route
            path="/login"
            element={
              <div className="app-shell">
                <Navbar />
                <main className="app-main"><Login /></main>
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="app-shell">
                <Navbar />
                <main className="app-main"><Register /></main>
              </div>
            }
          />
          <Route
            path="/register-admin"
            element={
              <div className="app-shell">
                <Navbar />
                <main className="app-main"><RegisterAdmin /></main>
              </div>
            }
          />

          {/* ── Root redirect ── */}
          <Route path="/" element={<RootRedirect />} />

          {/* ── Customer routes (top Navbar layout) ── */}
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <div className="app-shell">
                  <Navbar />
                  <main className="app-main"><MyReservations /></main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/new"
            element={
              <ProtectedRoute>
                <div className="app-shell">
                  <Navbar />
                  <main className="app-main"><NewReservation /></main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* ── Admin routes (sidebar AdminLayout — NO customer navbar) ── */}
          <Route
            path="/admin/reservations"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminReservations />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tables"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminTables />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Error pages ── */}
          <Route
            path="/403"
            element={
              <div className="page-container error-page">
                <h1>403 — Access Denied</h1>
                <p>You don&apos;t have permission to view this page.</p>
              </div>
            }
          />
          <Route
            path="*"
            element={
              <div className="page-container error-page">
                <h1>404 — Page Not Found</h1>
                <p>The page you&apos;re looking for doesn&apos;t exist.</p>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
