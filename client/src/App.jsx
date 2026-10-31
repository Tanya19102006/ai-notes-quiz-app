import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute, { PublicOnly } from "./components/ProtectedRoute.jsx";
import AuthPage from "./pages/AuthPage.jsx";

// React.lazy: these pages are downloaded only when first opened
const Home = lazy(() => import("./pages/Home.jsx"));
const History = lazy(() => import("./pages/History.jsx"));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<p className="muted page-loading">Loading...</p>}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<PublicOnly><AuthPage mode="login" /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><AuthPage mode="signup" /></PublicOnly>} />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/history" element={<History />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
