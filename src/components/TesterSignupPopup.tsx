import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";

const API_URL = "https://alphacar-backend-5vdk2gfd6a-ew.a.run.app/api/v1";

export default function TesterSignupPopup() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [city, setCity] = useState("unknown");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const cityParam = params.get("city");
    setShow(true);
    if (ref === "qr") {
      if (cityParam) setCity(cityParam);
      const dismissed = localStorage.getItem("tester_popup_dismissed");
      if (!dismissed) {
        setShow(true);
      }

      // Try to get location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => { },
          () => { },
          { timeout: 5000 },
        );
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      setError(t("tester.invalidEmail"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/testers/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: "qr",
          city,
          userAgent: navigator.userAgent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || t("tester.error"));
      }
    } catch {
      setError(t("tester.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("tester_popup_dismissed", "true");
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 32,
          maxWidth: 400,
          width: "100%",
          position: "relative",
          textAlign: "center",
        }}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        {success ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h2 style={{ color: "var(--text)", fontSize: 22, marginBottom: 8 }}>
              {t("tester.successTitle")}
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {t("tester.successMessage")}
            </p>
            <button
              onClick={handleClose}
              style={{
                marginTop: 20,
                padding: "12px 32px",
                borderRadius: 12,
                border: "none",
                backgroundColor: "var(--accent)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {t("tester.close")}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 12, display: "flex", justifyContent: "center" }}>
              {" "}
              <Link to="/" className="nav-logo">
                <img src="/images/logo.png" alt="AlphaCar" />
                <span>AlphaCar</span>
              </Link>{" "}
            </div>
            <h2 style={{ color: "var(--text)", fontSize: 22, marginBottom: 8 }}>
              {t("tester.title")}
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              {t("tester.subtitle")}
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("tester.emailPlaceholder")}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text)",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
                direction: "ltr",
                textAlign: "center",
              }}
            />

            {error && (
              <p style={{ color: "#EF4444", fontSize: 13, marginTop: 8 }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "14px 0",
                borderRadius: 12,
                border: "none",
                backgroundColor: "var(--accent)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "..." : t("tester.submit")}
            </button>

            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 11,
                marginTop: 12,
                opacity: 0.7,
              }}
            >
              {t("tester.privacy")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
