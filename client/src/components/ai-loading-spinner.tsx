import { motion } from "framer-motion";

interface AILoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function AILoadingSpinner({ size = "md", message }: AILoadingSpinnerProps) {
  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const dotSizeMap = {
    sm: 2,
    md: 3,
    lg: 4,
  };

  const dotSize = dotSizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${sizeMap[size]}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl animate-pulse" />
        
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="particleGradient1" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3" />
            </radialGradient>
            <radialGradient id="particleGradient2" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
            </radialGradient>
          </defs>
          
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * Math.PI * 2;
            const radius = 35 + Math.sin(i * 0.5) * 5;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r={dotSize}
                fill={i % 2 === 0 ? "url(#particleGradient1)" : "url(#particleGradient2)"}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                  x: [0, Math.cos(angle + Math.PI / 4) * 3, 0],
                  y: [0, Math.sin(angle + Math.PI / 4) * 3, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 1,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: "easeInOut",
                }}
              />
            );
          })}
          
          {Array.from({ length: 30 }).map((_, i) => {
            const angle = (i / 30) * Math.PI * 2;
            const radius = 20 + Math.cos(i * 0.7) * 3;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            
            return (
              <motion.circle
                key={`inner-${i}`}
                cx={x}
                cy={y}
                r={dotSize * 0.7}
                fill="url(#particleGradient2)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{
                  duration: 1.8 + Math.random() * 0.8,
                  repeat: Infinity,
                  delay: i * 0.04,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </svg>
        
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-400/30"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-400/30"
          animate={{
            scale: [1.15, 1, 1.15],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      
      {message && (
        <motion.p
          className="text-sm text-muted-foreground text-center max-w-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
