"use client";
/**
 * error.tsx
 * Root error boundary.
 * "use client" required by Next.js error boundary convention.
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        height:         "100vh",
        background:     "#0A0F1F",
        color:          "rgba(255,255,255,0.7)",
        fontFamily:     "system-ui, sans-serif",
        gap:            "16px",
        padding:        "24px",
        textAlign:      "center",
      }}
    >
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Lab error
      </p>
      <p style={{ fontSize: "15px", maxWidth: "480px" }}>{error.message}</p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding:      "10px 24px",
          background:   "#FED607",
          color:        "#0A0F1F",
          border:       "none",
          borderRadius: "6px",
          fontWeight:   600,
          cursor:       "pointer",
          fontSize:     "13px",
        }}
      >
        Try again
      </button>
    </div>
  );
}
