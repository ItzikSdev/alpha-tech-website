import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/AppNavbar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import PlansPage from './pages/PlansPage';
import AccessibilityPage from './pages/AccessibilityPage';
import AccessibilityButton from './components/AccessibilityButton';
import ScrollToTop from './components/ScrollToTop';
import ChatPage from './pages/ChatPage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import MyVehiclesPage from './pages/MyVehiclesPage';
import MyVehicleDetailPage from './pages/MyVehicleDetailPage';
import PublishPage from './pages/PublishPage';

const APP_ROUTES = ['/chat', '/vehicles', '/my-vehicles', '/publish', '/vehicle/'];

function LayoutWrapper() {
  const location = useLocation();
  const isAppRoute = APP_ROUTES.some((r) => location.pathname.startsWith(r));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  if (isAppRoute) {
    return (
      <>
        <ScrollToTop />
        <div className="app-layout">
          <AppNavbar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <main className="app-main">
            <Routes>
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
              <Route path="/my-vehicles" element={<MyVehiclesPage />} />
              <Route path="/my-vehicles/:id" element={<MyVehicleDetailPage />} />
              <Route path="/publish" element={<PublishPage />} />
            </Routes>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/delete-account" element={<DeleteAccountPage />} />
        <Route path="/privacy/delete-data" element={<DeleteAccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/plans" element={<PlansPage />} />
      </Routes>
      <Footer />
      <AccessibilityButton />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <LayoutWrapper />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
