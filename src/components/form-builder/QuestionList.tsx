import { Question } from "@/types/form";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { QuestionItem } from "./QuestionItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddQuestionDialog } from "./AddQuestionDialog";

interface QuestionListProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
}

export const QuestionList = ({ questions, setQuestions }: QuestionListProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      setQuestions(arrayMove(questions, oldIndex, newIndex));
    }
  };

  const handleUpdate = (id: string, updated: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updated } : q)));
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleAdd = (newQuestion: Question) => {
    setQuestions([...questions, newQuestion]);
    setShowAddDialog(false);
  };

  return (
    <div className="bg-card rounded-lg shadow-[var(--shadow-soft)] border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Questions ({questions.length})</h3>
        <Button
          onClick={() => setShowAddDialog(true)}
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {questions.map((question) => (
              <QuestionItem
                key={question.id}
                question={question}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AddQuestionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAdd}
      />
    </div>
  );
};