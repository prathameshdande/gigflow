import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import GigList from "../components/GigList";
import GigDetail from "../components/GigDetail";
import CreateGig from "../components/CreateGig";
import AuthPage from "../components/AuthPage";
import MyBids from "../components/MyBids";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-emerald-50 pointer-events-none" />

        <div className="relative">
          <Routes>
            <Route
              path="/"
              element={
                <div className="animate-fade-in">
                  <GigList />
                </div>
              }
            />

            <Route
              path="/gigs/:id"
              element={
                <div className="animate-fade-in">
                  <GigDetail />
                </div>
              }
            />

            <Route
              path="/auth"
              element={
                <div className="animate-fade-in">
                  <AuthPage />
                </div>
              }
            />

            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <div className="animate-fade-in">
                    <CreateGig />
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-bids"
              element={
                <ProtectedRoute>
                  <div className="animate-fade-in">
                    <MyBids />
                  </div>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AppRoutes;
