import { Question } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FormPreviewProps {
  title: string;
  description?: string;
  questions: Question[];
}

export const FormPreview = ({ title, description, questions }: FormPreviewProps) => {
  const renderQuestion = (question: Question) => {
    const baseLabel = (
      <Label className="text-sm font-medium">
        {question.label}
        {question.required && <span className="text-destructive ml-1">*</span>}
      </Label>
    );

    switch (question.type) {
      case "text":
        return (
          <div key={question.id} className="space-y-2">
            {baseLabel}
            <Input placeholder={question.placeholder || "Type your answer..."} />
          </div>
        );

      case "radio":
        return (
          <div key={question.id} className="space-y-3">
            {baseLabel}
            <RadioGroup>
              {question.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                  <Label htmlFor={`${question.id}-${idx}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "checkbox":
        return (
          <div key={question.id} className="space-y-3">
            {baseLabel}
            <div className="space-y-2">
              {question.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox id={`${question.id}-${idx}`} />
                  <Label htmlFor={`${question.id}-${idx}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case "dropdown":
        return (
          <div key={question.id} className="space-y-2">
            {baseLabel}
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={question.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option, idx) => (
                  <SelectItem key={idx} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "date":
        return (
          <div key={question.id} className="space-y-2">
            {baseLabel}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>Pick a date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        );

      case "slider":
        return (
          <div key={question.id} className="space-y-3">
            {baseLabel}
            <div className="pt-2">
              <Slider
                min={question.min || 0}
                max={question.max || 100}
                step={question.step || 1}
                defaultValue={[question.min || 0]}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{question.min || 0}</span>
                <span>{question.max || 100}</span>
              </div>
            </div>
          </div>
        );

      case "file":
      case "image":
        return (
          <div key={question.id} className="space-y-2">
            {baseLabel}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-foreground/30 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {question.type === "image" ? "Images only" : "Any file type"}
              </p>
            </div>
          </div>
        );

      case "yesno":
        return (
          <div key={question.id} className="space-y-3">
            {baseLabel}
            <RadioGroup>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`} className="font-normal cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`} className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-[var(--shadow-soft)] border border-border p-8 space-y-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold mb-2">Form Preview</h3>
        {title ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Generate questions to see a preview of your form
          </p>
        )}
      </div>

      {questions.length > 0 ? (
        <div className="space-y-6">
          {questions.map((question) => renderQuestion(question))}
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          <p>No questions yet</p>
          <p className="text-sm mt-1">Use the AI generator or add questions manually</p>
        </div>
      )}
    </div>
  );
};