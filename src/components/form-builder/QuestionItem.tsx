import { Question } from "@/types/form";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { EditQuestionDialog } from "./EditQuestionDialog";

interface QuestionItemProps {
  question: Question;
  onUpdate: (id: string, updated: Partial<Question>) => void;
  onDelete: (id: string) => void;
}

export const QuestionItem = ({ question, onUpdate, onDelete }: QuestionItemProps) => {
  const [showEdit, setShowEdit] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };


  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-card rounded-lg p-4 border border-border hover:border-foreground/20 transition-[var(--transition-smooth)] group"
      >
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-sm leading-relaxed">{question.label}</h4>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEdit(true)}
                  className="h-7 w-7 p-0"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(question.id)}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs font-normal">
                {question.type}
              </Badge>
              {question.required && (
                <Badge variant="outline" className="text-xs font-normal">
                  Required
                </Badge>
              )}
              {question.options && (
                <span className="text-xs text-muted-foreground">
                  {question.options.length} options
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditQuestionDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        question={question}
        onUpdate={(updated) => {
          onUpdate(question.id, updated);
          setShowEdit(false);
        }}
      />
    </>
  );
};