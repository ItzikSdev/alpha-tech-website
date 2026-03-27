import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
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
import TesterSignupPopup from './components/TesterSignupPopup';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
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
            <TesterSignupPopup />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
