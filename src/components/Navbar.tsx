import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function Navbar() {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const isLoggedIn = !!token;

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img src="/images/logo.png" alt="AlphaCar" />
          <span>AlphaCar</span>
        </Link>

        <ul className={`nav-links ${menuOpen ? 'show' : ''}`}>
          <li><a href="/#features" onClick={() => setMenuOpen(false)}>{t('nav.features')}</a></li>
          <li><a href="/#ai" onClick={() => setMenuOpen(false)}>{t('nav.ai')}</a></li>
          <li><a href="/#showcase" onClick={() => setMenuOpen(false)}>{t('nav.gallery')}</a></li>
          <li><Link to="/plans" onClick={() => setMenuOpen(false)}>{t('nav.plans')}</Link></li>
          <li><a href="/#download" className="nav-cta" onClick={() => setMenuOpen(false)}>{t('nav.download')}</a></li>
          <li>
            {isLoggedIn ? (
              <Link to="/settings" className="nav-user-btn" onClick={() => setMenuOpen(false)}>
                <UserIcon />
                <span>{user?.displayName?.split(' ')[0] || t('nav.account')}</span>
              </Link>
            ) : (
              <Link to="/login" className="nav-login-btn" onClick={() => setMenuOpen(false)}>
                <UserIcon />
                <span>{t('nav.login')}</span>
              </Link>
            )}
          </li>
          <li>
            <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </li>
          <li><LanguageSwitcher variant="full" /></li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isMobile && (
            isLoggedIn ? (
              <Link to="/settings" className="nav-user-btn-mobile">
                <UserIcon />
              </Link>
            ) : (
              <Link to="/login" className="nav-login-btn-mobile">
                <UserIcon />
              </Link>
            )
          )}
          {isMobile && (
            <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          )}
          {isMobile && <LanguageSwitcher variant="short" />}
          <div className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </div>
        </div>
      </div>
    </nav>
  );
}
