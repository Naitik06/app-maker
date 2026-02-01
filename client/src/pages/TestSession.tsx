import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useTest, useAnswerQuestion, useSubmitTest, useClearAnswer } from "@/hooks/use-test";
import { Header } from "@/components/Header";
import { Keypad } from "@/components/Keypad";
import { QuestionPalette } from "@/components/QuestionPalette";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Save, Trash2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TestSession() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: testData, isLoading, error, refetch } = useTest(id);
  const { mutate: submitAnswer, isPending: isSaving } = useAnswerQuestion();
  const { mutate: clearAnswer, isPending: isClearing } = useClearAnswer();
  const { mutate: submitTest, isPending: isSubmitting } = useSubmitTest();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  // Ref to track if timer interval is running
  const timerRef = useRef<NodeJS.Timeout>();

  // Initialize state when data loads
  useEffect(() => {
    if (testData?.test && !testData.test.isCompleted) {
      if (timeLeft === 0) {
        // Calculate remaining time based on server start time if needed, 
        // but for simplicity using the duration from DB or local countdown
        // Assuming test just started or we resume. 
        // Ideally: endTime - now. If no endTime, startTime + limit - now.
        const now = new Date();
        const start = new Date(testData.test.startTime!);
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        const remaining = Math.max(0, testData.test.timeLimit - elapsed);
        setTimeLeft(remaining);
      }
    }
  }, [testData]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !testData?.test.isCompleted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, testData?.test.isCompleted]);

  // Sync input with current question's saved answer when switching questions
  useEffect(() => {
    if (testData?.questions && testData.questions[currentQuestionIndex]) {
      const savedAnswer = testData.questions[currentQuestionIndex].userAnswer || "";
      setCurrentInput(savedAnswer);
    }
  }, [currentQuestionIndex, testData]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="h-16 border-b border-border/50 bg-card/80 p-6 flex justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="flex-1 flex gap-4 p-6">
            <div className="flex-1 space-y-6">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="w-80 space-y-4">
                <Skeleton className="h-full w-full rounded-xl" />
            </div>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-destructive">Error loading test</h2>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // If test is completed, show results
  if (testData.test.isCompleted) {
    return (
      <div className="min-h-screen bg-background pb-12">
        <Header 
            title="Test Results" 
            timeLeft={0} 
            totalTime={testData.test.timeLimit} 
        />
        <main className="container mx-auto mt-8">
            <ResultCard 
                score={testData.test.score || 0} 
                total={testData.test.totalQuestions}
                questions={testData.questions}
            />
            <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={() => setLocation("/")}>Back to Home</Button>
            </div>
        </main>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];

  const handleKeyPress = (key: string) => {
    setCurrentInput((prev) => prev + key);
  };

  const handleBackspace = () => {
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCurrentInput("");
  };

  const handleSaveAndNext = () => {
    if (currentInput.trim()) {
      submitAnswer({
        id: currentQuestion.id,
        answer: currentInput
      }, {
        onSuccess: () => {
          if (currentQuestionIndex < testData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
          } else {
            toast({
              title: "Answer Saved",
              description: "You have reached the last question.",
            });
          }
        }
      });
    } else {
        // If empty, just move next (skip)
        if (currentQuestionIndex < testData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }
  };

  const handleClearResponse = () => {
    handleClear();
    clearAnswer(currentQuestion.id);
  };

  const handleSubmitTest = () => {
    // If there's an unsaved input for the current question, save it first
    if (currentInput && currentInput !== currentQuestion.userAnswer) {
        submitAnswer({ id: currentQuestion.id, answer: currentInput });
    }
    
    submitTest(testData.test.id, {
        onSuccess: () => {
            toast({
                title: "Test Submitted",
                description: "Your results are ready.",
            });
            // Refetch triggers the result view because isCompleted will be true
            refetch();
        }
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background font-sans">
      <Header 
        timeLeft={timeLeft} 
        totalTime={testData.test.timeLimit} 
        onTimeUp={handleSubmitTest}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto relative">
          
          {/* Question Area */}
          <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                    Question {currentQuestionIndex + 1} of {testData.questions.length}
                </span>
                <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    currentQuestion.difficulty === 'Easy' ? "border-green-500/30 text-green-500 bg-green-500/10" :
                    currentQuestion.difficulty === 'Medium' ? "border-amber-500/30 text-amber-500 bg-amber-500/10" :
                    "border-red-500/30 text-red-500 bg-red-500/10"
                )}>
                    {currentQuestion.difficulty}
                </span>
            </div>

            <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-lg"
            >
                <h2 className="text-xl md:text-2xl font-medium leading-relaxed font-serif">
                    {currentQuestion.questionText}
                </h2>
            </motion.div>

            {/* Answer Input Area */}
            <div className="space-y-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-primary font-mono text-lg font-bold">Ans:</span>
                    </div>
                    <input
                        readOnly
                        value={currentInput}
                        className="w-full h-16 pl-16 pr-4 bg-secondary/30 border-2 border-border/50 rounded-xl text-2xl font-mono text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-text group-hover:bg-secondary/40"
                        placeholder="Use keypad below..."
                    />
                    {currentInput && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Keypad */}
                <Keypad 
                    onKeyPress={handleKeyPress}
                    onBackspace={handleBackspace}
                    onClear={handleClear}
                    disabled={isSaving}
                />
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="sticky bottom-0 mt-6 pt-4 border-t border-border/50 bg-background/95 backdrop-blur-sm flex justify-between items-center gap-4 max-w-4xl mx-auto w-full">
            <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="h-11 px-6 border-border/50 hover:bg-secondary"
            >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Prev
            </Button>
            
            <div className="flex gap-3">
                <Button
                    variant="ghost"
                    onClick={handleClearResponse}
                    disabled={!currentInput && !currentQuestion.userAnswer}
                    className="h-11 px-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                </Button>
                
                <Button
                    onClick={handleSaveAndNext}
                    disabled={isSaving}
                    className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20"
                >
                    {currentQuestionIndex === testData.questions.length - 1 ? "Save" : "Save & Next"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
          </div>
        </main>

        {/* Right Sidebar (Palette) */}
        <aside className="w-full md:w-80 h-[30vh] md:h-auto border-t md:border-t-0 md:border-l border-border/50 bg-card z-10 shrink-0 flex flex-col">
            <QuestionPalette 
                questions={testData.questions}
                currentQuestionId={currentQuestion.id}
                onSelectQuestion={setCurrentQuestionIndex}
            />
            
            <div className="p-6 mt-auto border-t border-border/50 bg-secondary/5">
                <Button 
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-900/20"
                >
                    {isSubmitting ? "Submitting..." : "Submit Test"}
                    {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
                </Button>
            </div>
        </aside>
      </div>
    </div>
  );
}
