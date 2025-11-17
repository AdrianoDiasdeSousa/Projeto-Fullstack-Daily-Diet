// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import type { ReactNode } from "react"; // 👈 importa o tipo

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MealNew from "./pages/MealNew";
import MealEdit from "./pages/MealEdit";
import MealShow from "./pages/MealShow";
import Metrics from "./pages/Metrics";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <div>Carregando...</div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* privadas */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/meals/new"
          element={
            <RequireAuth>
              <MealNew />
            </RequireAuth>
          }
        />
        <Route
          path="/meals/:id"
          element={
            <RequireAuth>
              <MealShow />
            </RequireAuth>
          }
        />
        <Route
          path="/meals/:id/edit"
          element={
            <RequireAuth>
              <MealEdit />
            </RequireAuth>
          }
        />
        <Route
          path="/metrics"
          element={
            <RequireAuth>
              <Metrics />
            </RequireAuth>
          }
        />

        {/* públicas */}
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
