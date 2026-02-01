import { Button } from "@/components/ui/button";
import { Delete, Eraser } from "lucide-react";
import { motion } from "framer-motion";

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export function Keypad({ onKeyPress, onBackspace, onClear, disabled }: KeypadProps) {
  const keys = [
    "1", "2", "3", "+",
    "4", "5", "6", "-",
    "7", "8", "9", "*",
    ".", "0", "=", "/",
    "x", "y", "z", ","
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02
      }
    }
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-card/50 p-4 rounded-xl border border-border/50">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Virtual Keypad</span>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-4 gap-2"
      >
        {keys.map((key) => (
          <motion.button
            key={key}
            variants={item}
            onClick={() => onKeyPress(key)}
            disabled={disabled}
            className="keypad-btn active:scale-95"
          >
            {key}
          </motion.button>
        ))}
        
        <motion.button
          variants={item}
          onClick={onBackspace}
          disabled={disabled}
          className="keypad-btn col-span-2 bg-secondary/80 hover:bg-destructive/20 hover:text-destructive active:scale-95"
        >
          <Delete className="w-5 h-5 mr-2" />
          Del
        </motion.button>

        <motion.button
          variants={item}
          onClick={onClear}
          disabled={disabled}
          className="keypad-btn col-span-2 bg-secondary/80 hover:bg-primary/20 hover:text-primary active:scale-95"
        >
          <Eraser className="w-5 h-5 mr-2" />
          Clear All
        </motion.button>
      </motion.div>
    </div>
  );
}
