import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Lobby from "./pages/Lobby.jsx";
import Officer from "./pages/Officer.jsx";
import Phase1 from "./pages/Phase1.jsx";
import QRArticle from "./pages/QRArticle.jsx";
import NewsArticle from "./pages/NewsArticle.jsx";
import FakeArticle from "./pages/FakeArticle.jsx";
import RouteChallenge from "./pages/RouteChallenge.jsx";
import RouteFail from "./pages/RouteFail.jsx";
import YearReveal from "./pages/YearReveal.jsx";
import DbLogin from "./pages/DbLogin.jsx";
import Phase2 from "./pages/Phase2.jsx";
import CaseSubmit from "./pages/CaseSubmit.jsx";
import Completion from "./pages/Completion.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import RoomManagement from "./pages/admin/RoomManagement.jsx";
import OfficerManagement from "./pages/admin/OfficerManagement.jsx";
import StoryManagement from "./pages/admin/StoryManagement.jsx";
import Analytics from "./pages/admin/Analytics.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
      <Route path="/officer" element={<ProtectedRoute><Officer /></ProtectedRoute>} />
      <Route path="/phase1" element={<ProtectedRoute><Phase1 /></ProtectedRoute>} />
      <Route path="/qr-article" element={<ProtectedRoute><QRArticle /></ProtectedRoute>} />
      <Route path="/db-login" element={<ProtectedRoute><DbLogin /></ProtectedRoute>} />
      <Route path="/phase2" element={<ProtectedRoute><Phase2 /></ProtectedRoute>} />
      <Route path="/case" element={<ProtectedRoute><CaseSubmit /></ProtectedRoute>} />
      <Route path="/complete" element={<ProtectedRoute><Completion /></ProtectedRoute>} />

      {/* Public QR Code Pages */}
      <Route path="/news-article/event" element={<NewsArticle />} />
      <Route path="/news-article/fake" element={<FakeArticle />} />

      {/* Route Challenge Pages (Sub-phase 3) */}
      <Route path="/route-challenge" element={<RouteChallenge />} />
      <Route path="/route-fail" element={<RouteFail />} />
      <Route path="/year-reveal" element={<YearReveal />} />

      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/rooms" element={<AdminRoute><RoomManagement /></AdminRoute>} />
      <Route path="/admin/officers" element={<AdminRoute><OfficerManagement /></AdminRoute>} />
      <Route path="/admin/stories" element={<AdminRoute><StoryManagement /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
