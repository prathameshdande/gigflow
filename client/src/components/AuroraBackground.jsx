import { useTheme } from "../context/ThemeContext";

const blobs = [
  {
    size: 420,
    top: "-10%",
    left: "-10%",
    light: "rgba(59, 130, 246, 0.24)",
    dark: "rgba(59, 130, 246, 0.2)",
  },
  {
    size: 360,
    top: "20%",
    right: "-8%",
    light: "rgba(139, 92, 246, 0.2)",
    dark: "rgba(139, 92, 246, 0.18)",
  },
  {
    size: 320,
    bottom: "-5%",
    left: "25%",
    light: "rgba(6, 182, 212, 0.18)",
    dark: "rgba(6, 182, 212, 0.16)",
  },
];

const AuroraBackground = () => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden">
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          theme === "dark" ? "bg-[#05060B]" : "bg-[#F7F9FC]"
        }`}
      />

      {blobs.map((blob) => (
        <div
          key={`${blob.size}-${blob.left || blob.right}`}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            right: blob.right,
            bottom: blob.bottom,
            background: `radial-gradient(circle, ${theme === "dark" ? blob.dark : blob.light} 0%, transparent 70%)`,
          }}
        />
      ))}

      <div
        className={`absolute inset-0 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,transparent_0%,#05060B_95%)]"
            : "bg-[radial-gradient(circle_at_center,transparent_0%,#F7F9FC_95%)]"
        }`}
      />
    </div>
  );
};

export default AuroraBackground;
