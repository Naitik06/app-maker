import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Question } from "@shared/schema";

interface QuestionPaletteProps {
  questions: Question[];
  currentQuestionId: number;
  onSelectQuestion: (index: number) => void;
}

export function QuestionPalette({ questions, currentQuestionId, onSelectQuestion }: QuestionPaletteProps) {
  const getStatusColor = (q: Question, isCurrent: boolean) => {
    if (isCurrent) return "bg-primary text-primary-foreground ring-4 ring-primary/20 border-primary";
    if (q.userAnswer) return "bg-green-600 text-white border-green-700 shadow-green-900/20";
    if (q.isMarkedForReview) return "bg-amber-500 text-black border-amber-600";
    // Visited logic would typically be here if we tracked "visited" state separately
    // For now, assume if no answer and not current, it's just "not answered"
    return "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent";
  };

  const answeredCount = questions.filter(q => !!q.userAnswer).length;
  const markedCount = questions.filter(q => q.isMarkedForReview).length;
  const notAnsweredCount = questions.length - answeredCount;

  return (
    <div className="h-full flex flex-col bg-card border-l border-border/50">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          Question Palette
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-muted-foreground">Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Marked ({markedCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary border border-border" />
            <span className="text-muted-foreground">Not Answered ({notAnsweredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Current</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-3 place-items-center">
          {questions.map((q, idx) => {
            const isCurrent = q.id === currentQuestionId;
            return (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(idx)}
                className={cn(
                  "palette-btn",
                  getStatusColor(q, isCurrent)
                )}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-border/50 bg-secondary/10">
        <p className="text-xs text-muted-foreground text-center">
          Click a number to navigate directly to that question.
        </p>
      </div>
    </div>
  );
}
