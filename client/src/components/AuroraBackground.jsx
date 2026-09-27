import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const blobs = [
  {
    size: 420,
    top: "-10%",
    left: "-10%",
    duration: 16,
    delay: 0,
    light: "from-blue-400/40 to-cyan-300/10",
    dark: "from-blue-500/30 to-cyan-400/10",
  },
  {
    size: 360,
    top: "15%",
    right: "-8%",
    duration: 18,
    delay: 2,
    light: "from-violet-400/40 to-pink-300/10",
    dark: "from-violet-500/30 to-fuchsia-500/10",
  },
  {
    size: 320,
    bottom: "-5%",
    left: "25%",
    duration: 20,
    delay: 1,
    light: "from-cyan-300/40 to-blue-300/10",
    dark: "from-cyan-500/25 to-blue-500/10",
  },
  {
    size: 280,
    bottom: "5%",
    right: "15%",
    duration: 22,
    delay: 3,
    light: "from-indigo-300/35 to-violet-300/10",
    dark: "from-indigo-500/30 to-violet-500/10",
  },
];

const AuroraBackground = () => {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden">
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          theme === "dark" ? "bg-[#05060B]" : "bg-[#F7F9FC]"
        }`}
      />

      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          animate={shouldReduceMotion ? undefined : {
            x: [0, 35, -25, 0],
            y: [0, -25, 25, 0],
          }}
          transition={shouldReduceMotion ? undefined : {
            repeat: Infinity,
            ease: "linear",
            duration: blob.duration,
            delay: blob.delay,
          }}
          className={`absolute rounded-full blur-[80px] bg-gradient-to-br ${
            theme === "dark" ? blob.dark : blob.light
          }`}
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            right: blob.right,
            bottom: blob.bottom,
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
