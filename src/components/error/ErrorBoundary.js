"use client";
import React from "react";

/**
 * React Error Boundary component.
 * Catches JavaScript errors in child component tree and renders a fallback UI.
 *
 * @class ErrorBoundary
 * @extends React.Component
 *
 * @prop {React.ReactNode} children - Child components to monitor for errors.
 * @prop {React.ComponentType<{error: Error, resetError: Function}>} [FallbackComponent] - Custom fallback component.
 * @prop {Function} [onError] - Optional callback when an error is caught.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.FallbackComponent;

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
          />
        );
      }

      return <DefaultFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * Minimal default fallback when MUI context may not be available (e.g. root-level errors).
 */
function DefaultFallback({ error, resetError }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)",
        color: "#e0e0e0",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
          padding: "3rem 2rem",
          borderRadius: 20,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
        }}
      >
        {/* Animated icon */}
        <div
          style={{
            fontSize: 64,
            marginBottom: 16,
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          💥
        </div>

        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            margin: "0 0 8px",
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            fontSize: "0.95rem",
            color: "#9ca3af",
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          An unexpected error occurred. Don&apos;t worry — your data is safe.
        </p>

        {/* Error message box */}
        {error?.message && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <code
              style={{
                fontSize: "0.8rem",
                color: "#fca5a5",
                wordBreak: "break-word",
              }}
            >
              {error.message}
            </code>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={resetError}
            style={{
              padding: "12px 28px",
              fontSize: "0.9rem",
              fontWeight: 600,
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(99,102,241,0.5)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 14px rgba(99,102,241,0.4)";
            }}
          >
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "12px 28px",
              fontSize: "0.9rem",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              cursor: "pointer",
              background: "rgba(255,255,255,0.06)",
              color: "#d1d5db",
              transition: "transform 0.2s, background 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.background = "rgba(255,255,255,0.06)";
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default ErrorBoundary;
