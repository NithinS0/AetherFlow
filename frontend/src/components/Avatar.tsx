import { useState } from "react";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const sizes = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-12 h-12 text-sm",
  };

  const getInitials = (n: string) => {
    const parts = n.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border border-border shrink-0 ${sizes[size]} ${className}`}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-zinc-800 border border-zinc-700/60 text-zinc-300 font-bold flex items-center justify-center shrink-0 uppercase tracking-wider select-none ${sizes[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
