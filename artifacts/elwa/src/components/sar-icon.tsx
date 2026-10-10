interface SarIconProps {
  className?: string;
  size?: number;
}

export function SarIcon({ className = "", size = 16 }: SarIconProps) {
  return (
    <img
      src="/riyal-symbol.png?v=2"
      alt="رمز الريال السعودي"
      aria-label="ريال سعودي"
      className={`inline-block select-none ${className}`}
      style={{
        height: size,
        width: "auto",
        verticalAlign: "middle",
        marginBottom: 1,
      }}
    />
  );
}

export default SarIcon;
