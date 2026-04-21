/**
 * loading.tsx
 * Root loading state for the lab route group.
 */

export default function Loading() {
  return (
    <div
      style={{
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        height:          "100vh",
        background:      "#0A0F1F",
        color:           "rgba(255,255,255,0.4)",
        fontFamily:      "system-ui, sans-serif",
        fontSize:        "13px",
        letterSpacing:   "0.1em",
        textTransform:   "uppercase",
      }}
    >
      Loading lab...
    </div>
  );
}
