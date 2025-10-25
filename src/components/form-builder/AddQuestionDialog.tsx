import { useState } from "react";
import { Question, QuestionType } from "@/types/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (question: Question) => void;
}

export const AddQuestionDialog = ({ open, onOpenChange, onAdd }: AddQuestionDialogProps) => {
  const [formData, setFormData] = useState<Partial<Question>>({
    type: "text",
    label: "",
    required: false,
    options: [],
    min: 0,
    max: 100,
    step: 1,
  });
  const [newOption, setNewOption] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label?.trim()) return;

    const question: Question = {
      id: `q-${Date.now()}`,
      type: formData.type as QuestionType,
      label: formData.label,
      placeholder: formData.placeholder,
      required: formData.required || false,
      options: formData.options,
      min: formData.min,
      max: formData.max,
      step: formData.step,
    };

    onAdd(question);
    setFormData({
      type: "text",
      label: "",
      required: false,
      options: [],
      min: 0,
      max: 100,
      step: 1,
    });
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...(formData.options || []), newOption.trim()],
      });
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options?.filter((_, i) => i !== index),
    });
  };

  const needsOptions = ["radio", "checkbox", "dropdown"].includes(formData.type || "");
  const needsRange = formData.type === "slider";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Question Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: QuestionType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="radio">Radio</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="slider">Slider</SelectItem>
                <SelectItem value="file">File Upload</SelectItem>
                <SelectItem value="image">Image Upload</SelectItem>
                <SelectItem value="yesno">Yes/No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Question Label *</Label>
            <Textarea
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="mt-2"
              required
            />
          </div>

          {formData.type === "text" && (
            <div>
              <Label>Placeholder</Label>
              <Input
                value={formData.placeholder || ""}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                className="mt-2"
              />
            </div>
          )}

          {needsOptions && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2 mt-2">
                {formData.options?.map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input value={option} disabled className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add new option..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addOption())}
                  />
                  <Button type="button" onClick={addOption} variant="outline">
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {needsRange && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Min</Label>
                <Input
                  type="number"
                  value={formData.min || 0}
                  onChange={(e) => setFormData({ ...formData, min: Number(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Max</Label>
                <Input
                  type="number"
                  value={formData.max || 100}
                  onChange={(e) => setFormData({ ...formData, max: Number(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Step</Label>
                <Input
                  type="number"
                  value={formData.step || 1}
                  onChange={(e) => setFormData({ ...formData, step: Number(e.target.value) })}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="required">Required</Label>
            <Switch
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Question</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};