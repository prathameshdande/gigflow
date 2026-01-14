import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import GigList from "../components/GigList";
import GigDetail from "../components/GigDetail";
import AuthPage from "../components/AuthPage";
import CreateGig from "../components/CreateGig";
import MyBids from "../components/MyBids";
import { useAuth } from "../context/AuthContext";

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<GigList />} />
        <Route path="/gigs/:id" element={<GigDetail />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/create"
          element={user ? <CreateGig /> : <Navigate to="/auth" />}
        />

        <Route
          path="/my-bids"
          element={user ? <MyBids /> : <Navigate to="/auth" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default AppContent;
