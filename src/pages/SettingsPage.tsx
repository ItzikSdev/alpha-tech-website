import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { t } = useLanguage();
  const { user, token, loading, logout, deleteAccount } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // Redirect to login if not authenticated
  if (!token && !loading) {
    return <Navigate to="/login" replace />;
  }

  // Loading state
  if (loading && !user) {
    return (
      <div className="page-container">
        <div className="auth-card">
          <div className="settings-loading">{t('settings.loading')}</div>
        </div>
      </div>
    );
  }

  // After successful deletion
  if (deleted) {
    return (
      <div className="page-container">
        <div className="auth-card">
          <div className="settings-deleted">
            <div className="settings-deleted-icon">&#10003;</div>
            <h2>{t('settings.deletedTitle')}</h2>
            <p>{t('settings.deletedText')}</p>
            <Link to="/" className="auth-submit" style={{ textDecoration: 'none', textAlign: 'center', display: 'block', marginTop: 24 }}>
              {t('page.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      setDeleted(true);
    } catch {
      setDeleting(false);
    }
  };

  const createdDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : '—';

  return (
    <div className="page-container">
      <div className="auth-card settings-card">
        <Link to="/" className="auth-back-link">
          &larr; {t('page.backHome')}
        </Link>

        <div className="auth-header">
          <h2>{t('settings.title')}</h2>
        </div>

        {/* User Profile */}
        <div className="settings-profile">
          <div className="settings-avatar">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.displayName} />
            ) : (
              <span>{user?.displayName?.[0]?.toUpperCase() || '?'}</span>
            )}
          </div>
          <div className="settings-name">{user?.displayName || '—'}</div>
          <div className="settings-role">{user?.role || 'user'}</div>
        </div>

        {/* User Details */}
        <div className="settings-details">
          <div className="settings-row">
            <span className="settings-label">{t('settings.email')}</span>
            <span className="settings-value" dir="ltr">{user?.email || '—'}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">{t('settings.phone')}</span>
            <span className="settings-value" dir="ltr">{user?.phone || '—'}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">{t('settings.memberSince')}</span>
            <span className="settings-value">{createdDate}</span>
          </div>
        </div>

        {/* Logout */}
        <button className="settings-logout" onClick={logout}>
          {t('settings.logout')}
        </button>

        {/* Danger Zone */}
        <div className="settings-danger">
          <h3>{t('settings.dangerZone')}</h3>
          <p>{t('settings.dangerText')}</p>

          {!showDeleteConfirm ? (
            <button className="settings-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
              {t('settings.deleteAccount')}
            </button>
          ) : (
            <div className="settings-confirm-box">
              <p className="settings-confirm-text">{t('settings.confirmDelete')}</p>
              <div className="settings-confirm-actions">
                <button
                  className="settings-confirm-yes"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? t('settings.deleting') : t('settings.confirmYes')}
                </button>
                <button
                  className="settings-confirm-no"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  {t('settings.confirmNo')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
