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

// Admin pages
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminGigs from "../pages/Admin/AdminGigs";
import AdminBids from "../pages/Admin/AdminBids";
import AdminMessages from "../pages/Admin/AdminMessages";
import AdminPayments from "../pages/Admin/AdminPayments";
import AdminReviews from "../pages/Admin/AdminReviews";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-50">
      {!isAdminRoute && <Navbar />}
      <main className="relative">
        {!isAdminRoute && (
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-emerald-50 pointer-events-none" />
        )}
        <div className="relative">
          <Routes>
            <Route path="/" element={<GigList />} />
            <Route path="/gigs/:id" element={<GigDetail />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />

            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateGig />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-gig/:id"
              element={
                <ProtectedRoute>
                  <EditGig />
                </ProtectedRoute>
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

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            >
              <Route index element={<AdminUsers />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="gigs" element={<AdminGigs />} />
              <Route path="bids" element={<AdminBids />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AppRoutes;
