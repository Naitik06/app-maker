import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  timeLeft?: number; // in seconds
  totalTime?: number;
  onTimeUp?: () => void;
}

export function Header({ title = "Math Challenge", timeLeft = 0, totalTime = 3600, onTimeUp }: HeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const isUrgent = timeLeft < 300; // Last 5 mins

  return (
    <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <span className="font-bold text-primary text-xl">∑</span>
        </div>
        <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
      </div>

      <div className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-full border transition-colors duration-500",
        isUrgent 
          ? "bg-destructive/10 border-destructive/50 text-destructive animate-pulse" 
          : "bg-secondary/50 border-border text-foreground"
      )}>
        <Clock className="w-4 h-4" />
        <span className="font-mono text-xl font-bold tabular-nums">
          {formatTime(timeLeft)}
        </span>
      </div>
      
      {/* Progress bar at the bottom of header */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-1000 ease-linear"
        style={{ width: `${progress}%`, backgroundColor: isUrgent ? 'hsl(var(--destructive))' : undefined }}
      />
    </header>
  );
}
