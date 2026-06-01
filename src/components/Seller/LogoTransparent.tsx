interface LogoProps {
  color?: string;
  size?: number;
  width?: number;
  className?: string;
  src?: string;
  alt?: string;
  hideText?: boolean;
}

export function LogoTransparent({
  color = "text-brand-green",
  size = 64,
  width = 64,
  className = "",
  src,
  alt = "NoThrowam logo",
  hideText = true,
}: LogoProps) {
//   const colorClass = color.startsWith("text-") ? color : "";
  const colorStyle = !color.startsWith("text-") ? { color } : {};
  const logoSrc = src ?? "/Logo%20transparent.png";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoSrc}
        alt={alt}
        width={width}
        height={size}
        className="object-contain"
        style={{ maxHeight: size, maxWidth: width }}
      />
      {!hideText && (
        <span
          className="text-2xl font-bold tracking-tight"
          style={{
            ...colorStyle,
            fontSize: size * 0.75 > 16 ? size * 0.75 : 16,
          }}
        >
          NoThrowam
        </span>
      )}
    </div>
  );
}
