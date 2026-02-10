import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import TrackExpenses from "./pages/TrackExpenses";
import SavingsReports from "./pages/SavingsReports";

import NavigationMenu from "./components/NavigationMenu";
import Footer from "./components/Footer";

function RequireAuth({ children }) {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const withLayout = (Page) => (
    <RequireAuth>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <NavigationMenu />

        <Box sx={{ flex: 1 }}>
          <Page />
        </Box>

        <Footer />
      </Box>
    </RequireAuth>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />

        {/* protected (with layout) */}
        <Route path="/home" element={withLayout(Home)} />
        <Route path="/expenses/*" element={withLayout(TrackExpenses)} />
        <Route path="/reports/*" element={withLayout(SavingsReports)} />

        {/* default */}
        <Route
          path="/"
          element={
            <Navigate
              to={sessionStorage.getItem("token") ? "/home" : "/login"}
              replace
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

