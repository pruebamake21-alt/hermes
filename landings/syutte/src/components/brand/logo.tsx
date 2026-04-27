interface LogoProps {
  className?: string;
  height?: number;
}

export function Logo({ className, height = 40 }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="Suytte"
      height={height}
      style={{ height, width: "auto" }}
      className={className}
    />
  );
}
