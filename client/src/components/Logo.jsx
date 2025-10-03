// FILE: client/src/components/Logo.jsx
import logoPng from "../assets/finico-logo.png";

/**
 * Finico Logo (fluid height via clamp).
 * You can tweak min/vw/max, but the Navbar will also cap with max-h utilities
 * so the header stays compact.
 */
export default function Logo({
  min = 180,
  vw = 6.5,
  max = 288,
  className = "",
  alt = "Finico — Finance, simplified.",
}) {
  const height = `clamp(${min}px, ${vw}vw, ${max}px)`;
  return (
    <img
      src={logoPng}
      alt={alt}
      style={{ height, width: "auto", display: "block", objectFit: "contain" }}
      className={`select-none ${className}`}
      decoding="async"
      loading="eager"
      draggable="false"
    />
  );
}
