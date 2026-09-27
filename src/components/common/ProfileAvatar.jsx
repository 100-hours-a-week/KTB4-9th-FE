import { useState } from "react";

export default function ProfileAvatar({ src, name = "사용자", alt, className = "" }) {
  const [failedSource, setFailedSource] = useState(null);
  const displayName = typeof name === "string" && name.trim() ? name.trim() : "사용자";
  const initial = Array.from(displayName)[0] ?? "?";

  if (!src || failedSource === src) {
    return <span aria-label={`${displayName} 프로필`}>{initial}</span>;
  }

  return (
    <img
      src={src}
      alt={alt ?? `${displayName} 프로필`}
      className={className}
      onError={() => setFailedSource(src)}
    />
  );
}
