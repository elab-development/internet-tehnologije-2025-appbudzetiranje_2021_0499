// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import TrackExpenses from "./pages/TrackExpenses";
import SavingsReports from "./pages/SavingsReports";

function RequireAuth({ children }) {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages (public) */}
        <Route path="/" element={<Auth />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Auth />} />

        {/* App pages (protected) */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />

        <Route
          path="/expenses"
          element={
            <RequireAuth>
              <TrackExpenses />
            </RequireAuth>
          }
        />

        <Route
          path="/reports"
          element={
            <RequireAuth>
              <SavingsReports />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
