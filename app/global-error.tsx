"use client";

// Outermost error boundary — only fires when the root layout itself
// crashes (e.g. SessionProvider blows up on malformed cookie). Must
// render its own <html> + <body> because `app/layout.tsx` never ran.

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#0b0b14",
          color: "#fff",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>
            memacta hit an unexpected error
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>
            Refresh the page to try again. If this keeps happening, email
            hello@memacta.app.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "0.75rem",
              background:
                "linear-gradient(135deg, #FE2C55 0%, #ff9f40 100%)",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
