import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function PublicForm() {
  const { id: studyId, formId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mockFormFields = [
    { id: "name", type: "text", label: "Name", required: true },
    { id: "email", type: "email", label: "Email", required: true },
    { id: "age", type: "number", label: "Age", required: true },
    { id: "occupation", type: "text", label: "Occupation", required: false },
    { id: "experience", type: "textarea", label: "Relevant Experience", required: false },
    { id: "availability", type: "text", label: "Availability", required: false },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!studyId) {
        throw new Error('Study ID is required');
      }

      const participantEmail = formData.email || '';
      const participantName = formData.name || '';

      const responseData: Record<string, any> = {};
      Object.keys(formData).forEach(key => {
        if (key !== 'email' && key !== 'name') {
          responseData[key] = formData[key];
        }
      });

      const { error } = await supabase
        .from('form_responses')
        .insert({
          study_id: studyId,
          participant_email: participantEmail,
          participant_name: participantName,
          response_data: responseData,
        });

      if (error) throw error;

      toast({
        title: 'Form submitted successfully',
        description: 'Thank you for your participation!'
      });

      navigate(`/study/${studyId}/form/${formId}/thank-you`);
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Participant Screening Form</CardTitle>
          <CardDescription>Please fill out all required fields to participate in this study</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {mockFormFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.id}
                    required={field.required}
                    value={formData[field.id] || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                  />
                ) : (
                  <Input
                    id={field.id}
                    type={field.type}
                    required={field.required}
                    value={formData[field.id] || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
