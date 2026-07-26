import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Navbar";
import GigList from "../components/GigList";
import GigDetail from "../components/GigDetail";
import CreateGig from "../components/CreateGig";
import AuthPage from "../components/AuthPage";
import MyBids from "../components/MyBids";

import ProfilePage from "../pages/ProfilePage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import EditGig from "../pages/EditGig";
import MyPayments from "../pages/MyPayments";

// Admin
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminOverview from "../pages/Admin/AdminOverview";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminGigs from "../pages/Admin/AdminGigs";
import AdminBids from "../pages/Admin/AdminBids";
import AdminMessages from "../pages/Admin/AdminMessages";
import AdminPayments from "../pages/Admin/AdminPayments";
import AdminReviews from "../pages/Admin/AdminReviews";

const Loader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Gig creation/editing is a client action - freelancers get redirected home.
const ClientRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== "client" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function AppRoutes() {
  const location = useLocation();

  const hideNavbar =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/auth" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password");

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-slate-900 transition-colors duration-300 dark:text-white">
      {!hideNavbar && <Navbar />}

      <main className={`${!hideNavbar ? "pt-28" : ""} relative min-h-screen`}>
        {!hideNavbar && (
          <>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[130px]" />

              <div className="absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[130px]" />

              <div className="absolute bottom-0 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_70%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_70%)]" />
          </>
        )}

        <div className="relative z-10">
          <Routes>
            {/* Public */}

            <Route path="/" element={<GigList />} />

            <Route path="/gigs/:id" element={<GigDetail />} />

            <Route path="/auth" element={<AuthPage />} />

            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />

            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />

            {/* Protected */}

            <Route
              path="/create"
              element={
                <ClientRoute>
                  <CreateGig />
                </ClientRoute>
              }
            />

            <Route
              path="/edit-gig/:id"
              element={
                <ClientRoute>
                  <EditGig />
                </ClientRoute>
              }
            />

            <Route
              path="/my-bids"
              element={
                <ProtectedRoute>
                  <MyBids />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-payments"
              element={
                <ProtectedRoute>
                  <MyPayments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin */}

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            >
              <Route index element={<AdminOverview />} />

              <Route path="users" element={<AdminUsers />} />

              <Route path="gigs" element={<AdminGigs />} />

              <Route path="bids" element={<AdminBids />} />

              <Route path="messages" element={<AdminMessages />} />

              <Route path="payments" element={<AdminPayments />} />

              <Route path="reviews" element={<AdminReviews />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}