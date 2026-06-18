"use client";

/** Last-resort boundary that also catches errors in the root layout. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#F6F3EE", color: "#1A1714" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "12px 0 6px" }}>Something went wrong</h1>
          <p style={{ color: "#8C8478", fontSize: 14 }}>Mira hit an unexpected error. Your data is saved locally.</p>
          <button
            onClick={reset}
            style={{
              marginTop: 20, padding: "10px 22px", borderRadius: 999, border: "none",
              background: "#1A1714", color: "#F6F3EE", fontSize: 14, cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
