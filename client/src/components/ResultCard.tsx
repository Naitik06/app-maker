import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface ResultCardProps {
  score: number;
  total: number;
  questions: Question[];
}

export function ResultCard({ score, total, questions }: ResultCardProps) {
  const percentage = Math.round((score / total) * 100);
  
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center p-8 rounded-full bg-card border-4 border-primary/20 shadow-2xl mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
          <div className="text-center relative z-10">
            <span className="block text-5xl font-bold text-foreground">{score}</span>
            <span className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">out of {total}</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold">Test Completed!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {percentage >= 70 ? "Excellent work! You've mastered these concepts." : 
           percentage >= 40 ? "Good effort. Review the incorrect answers to improve." :
           "Keep practicing. Consistent effort yields the best results."}
        </p>
      </motion.div>

      <div className="grid gap-4">
        <h3 className="font-semibold text-lg ml-1">Detailed Analysis</h3>
        <ScrollArea className="h-[500px] rounded-xl border border-border bg-card/50 shadow-inner p-4">
          <div className="space-y-4">
            {questions.map((q, i) => {
              const isCorrect = q.userAnswer === q.correctAnswer;
              const isSkipped = !q.userAnswer;
              
              return (
                <motion.div 
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "p-4 rounded-lg border flex items-start gap-4 transition-colors hover:bg-secondary/30",
                    isCorrect ? "border-green-500/20 bg-green-500/5" : 
                    isSkipped ? "border-border bg-card" : 
                    "border-red-500/20 bg-red-500/5"
                  )}
                >
                  <div className="mt-1">
                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                     isSkipped ? <AlertCircle className="w-5 h-5 text-muted-foreground" /> :
                     <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-sm text-muted-foreground">Q{i + 1}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium border",
                        q.difficulty === 'Easy' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        q.difficulty === 'Medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {q.difficulty}
                      </span>
                    </div>
                    
                    <p className="font-medium text-foreground">{q.questionText}</p>
                    
                    <div className="flex items-center gap-6 text-sm pt-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Your Answer</span>
                        <span className={cn(
                          "font-mono font-medium",
                          isCorrect ? "text-green-500" : isSkipped ? "text-muted-foreground italic" : "text-red-500"
                        )}>
                          {q.userAnswer || "Skipped"}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Correct Answer</span>
                        <span className="font-mono font-medium text-primary">
                          {q.correctAnswer}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
