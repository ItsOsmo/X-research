import { useState } from "react";
import { Question } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuestionList } from "./QuestionList";
import { FormPreview } from "./FormPreview";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";

export const FormBuilder = () => {
  const {id: study_id} = useParams();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questionCount, setQuestionCount] = useState("5");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate()

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a study title");
      return;
    }

    const count = parseInt(questionCount);
    if (isNaN(count) || count < 1 || count > 20) {
      toast.error("Question count must be between 1 and 20");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-form', {
        body: { title, description, questionCount: count }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        toast.success(`Generated ${data.questions.length} questions!`);
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error: any) {
      console.error('Error generating form:', error);
      toast.error(error.message || 'Failed to generate form');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a form title");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setIsSaving(true);
    try {
      if (!user) {
        toast.error("Please sign in to save forms");
        return;
      }

      const { error } = await supabase.from('forms').insert({
        study_id: study_id,
        title,
        description,
        questions: questions as any
      });

      if (error) throw error;

      toast.success("Form saved successfully!");
    } catch (error: any) {
      console.error('Error saving form:', error);
      toast.error(error.message || 'Failed to save form');
    } finally {
      setIsSaving(false);
      navigate('/dashboard');
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Panel - Form Builder */}
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-[var(--shadow-soft)] border border-border p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              AI Form Generator
            </h2>
            <p className="text-muted-foreground text-sm">
              Describe your research study and let AI generate relevant questions
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Study Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Customer Satisfaction Survey"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Study Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose and context of your research..."
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="count">Number of Questions</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        </div>

        {questions.length > 0 && (
          <QuestionList questions={questions} setQuestions={setQuestions} />
        )}

        {questions.length > 0 && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="default"
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Form"
            )}
          </Button>
        )}
      </div>

      {/* Right Panel - Preview */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <FormPreview title={title} description={description} questions={questions} />
      </div>
    </div>
  );
};