import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTest } from "@/hooks/use-test";
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Brain, Clock, Sigma } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [timeLimit, setTimeLimit] = useState(60);
  const { mutate, isPending } = useCreateTest();
  const [_, setLocation] = useLocation();

  const handleStart = () => {
    mutate(
      { timeLimit: timeLimit * 60 },
      {
        onSuccess: (test) => {
          setLocation(`/test/${test.id}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              Math Challenge
              <br />
              <span className="text-primary">JEE Main Simulator</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Test your skills with our advanced mathematics practice environment. 
              Real-time feedback, detailed analysis, and exam-grade interface.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm flex flex-col gap-3">
              <Brain className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="font-bold">Adaptive Questions</h3>
                <p className="text-xs text-muted-foreground mt-1">Problems that test your true understanding.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm flex flex-col gap-3">
              <Sigma className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="font-bold">Instant Analysis</h3>
                <p className="text-xs text-muted-foreground mt-1">Get immediate feedback and performance metrics.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Start New Session</h2>
                <p className="text-muted-foreground">Configure your practice session</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Duration (minutes)
                  </Label>
                  <div className="relative">
                    <Input
                      id="duration"
                      type="number"
                      min={10}
                      max={180}
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="pl-4 h-12 text-lg font-mono bg-secondary/50 border-border/50 focus:border-primary/50 transition-all"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Standard JEE Main math section is 60 minutes.</p>
                </div>

                <Button 
                  onClick={handleStart} 
                  disabled={isPending}
                  className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02]"
                >
                  {isPending ? "Initializing..." : "Begin Test"}
                  {!isPending && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </div>
              
              <div className="pt-4 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
                <span>10 Questions</span>
                <span>Arithmetic & Algebra</span>
                <span>Mixed Difficulty</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
