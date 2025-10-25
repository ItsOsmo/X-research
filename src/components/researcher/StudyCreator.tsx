import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus, 
  X, 
  Clock, 
  DollarSign, 
  Users, 
  MapPin,
  Calendar,
  Settings,
  AlertCircle,
  Copy
} from 'lucide-react';
import { FormBuilder } from '@/components/form-builder/FormBuilder';
import { type ScreeningQuestion } from '@/services/aiService';
import { Study } from '@/types/form';

const getDefaultStudy = (): Study => ({
  id: '',
  researcher_id: '',
  title: '',
  description: '',
  category: '',
  compensation: 0,
  duration: 0,
  location: 'remote',
  participants_needed: 0,
  deadline: '',
  requirements: [],
  screening_questions: [],
  auto_approve: false,
  payment_schedule: 'immediate',
  status: 'draft',
  created_at: '',
  updated_at: ''
});

export const StudyCreator = () => {
  const { user, loading } = useAuth();
  const {id: study_id} = useParams();
  const [studyData, setStudyData] = useState<Study>(getDefaultStudy());
  const [studyType, setStudyType] = useState<'paid' | 'free' | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [newRequirement, setNewRequirement] = useState('');
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!study_id || !user?.id) return;

    const loadOrCreateStudy = async () => {
      try {
        const { data: existingStudy } = await supabase
          .from("studies")
          .select("*")
          .eq("id", study_id)
          .eq("researcher_id", user.id)
          .single();

        if (existingStudy) {
          const parsedStudy: Study = {
            ...existingStudy,
            requirements: (existingStudy.requirements as unknown as string[]) ?? [],
            screening_questions: (existingStudy.screening_questions as unknown as ScreeningQuestion[]) ?? []
          };

          setStudyData(parsedStudy);
          setStudyType(parsedStudy.compensation && parsedStudy.compensation > 0 ? 'paid' : 'free');
        } else {
          const { data: newStudy, error } = await supabase
            .from("studies")
            .insert({
              researcher_id: user.id,
              title: "Untitled Study",
              status: "draft"
            })
            .select()
            .single();
          
          if (error) throw error;

          const parsedStudy: Study = {
            ...getDefaultStudy(),
            ...newStudy,
            requirements: (newStudy.requirements as unknown as string[]) ?? [],
            screening_questions: (newStudy.screening_questions as unknown as ScreeningQuestion[]) ?? []
          };
          setStudyData(parsedStudy);
          setStudyType('free');
        }
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Could not load or create study",
          variant: "destructive",
        });
      }
    };

    loadOrCreateStudy();
  }, [study_id, user?.id, toast]);

  useEffect(() => {
    if (studyType && currentStep === 0) setCurrentStep(1);
  }, [studyType, currentStep]);

  const categories = [
    'UX Research',
    'Market Research', 
    'Healthcare',
    'Finance',
    'Technology',
    'Education',
    'Psychology',
    'Product Testing'
  ];

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setStudyData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setStudyData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (studyType === 'paid') {
      switch (step) {
        case 1:
          if (!studyData.title?.trim()) errors.title = 'Study title is required';
          if (!studyData.description?.trim()) errors.description = 'Study description is required';
          if (!studyData.category) errors.category = 'Category is required';
          if (!studyData.compensation || studyData.compensation <= 0) {
            errors.compensation = 'Valid compensation amount is required';
          }
          if (!studyData.duration || studyData.duration <= 0) {
            errors.duration = 'Valid duration is required';
          }
          if (!studyData.participants_needed || studyData.participants_needed <= 0) {
            errors.participants_needed = 'Valid number of participants is required';
          }
          if (!studyData.deadline) errors.deadline = 'Application deadline is required';
          break;
        case 2:
          if (studyData.screening_questions?.length === 0) {
            errors.screening_questions = 'At least one screening question is required';
          }
          break;
      }
    } else {
      switch (step) {
        case 1:
          if (!studyData.title?.trim()) errors.title = 'Study title is required';
          if (!studyData.description?.trim()) errors.description = 'Study description is required';
          if (!studyData.category) errors.category = 'Category is required';
          if (!studyData.duration || studyData.duration <= 0) {
            errors.duration = 'Valid duration is required';
          }
          if (!studyData.participants_needed || studyData.participants_needed <= 0) {
            errors.participants_needed = 'Valid number of participants is required';
          }
          if (!studyData.deadline) errors.deadline = 'Application deadline is required';
          break;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveDraft = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save drafts",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const studyPayload = {
        researcher_id: user.id,
        title: studyData.title || 'Untitled Study',
        description: studyData.description,
        category: studyData.category,
        compensation: studyData.compensation || null,
        duration: studyData.duration || null,
        location: studyData.location,
        participants_needed: studyData.participants_needed || null,
        deadline: studyData.deadline || null,
        requirements: studyData.requirements as any,
        screening_questions: studyData.screening_questions as any,
        auto_approve: studyData.auto_approve,
        payment_schedule: studyData.payment_schedule,
        status: 'draft'
      };

      let result;
      if (studyData.id) {
        result = await supabase
          .from('studies')
          .update(studyPayload)
          .eq('id', studyData.id)
          .eq('researcher_id', user.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('studies')
          .insert(studyPayload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      if (!studyData.id && result.data) {
        setStudyData(prev => ({ ...prev, id: result.data.id }));
      }

      toast({
        title: "Draft saved successfully",
        description: "Your study has been saved as a draft",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error saving draft",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const publishStudy = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to publish studies",
        variant: "destructive"
      });
      return;
    }

    const maxStep = studyType === 'paid' ? 4 : 2;
    for (let i = 1; i <= maxStep; i++) {
      if (!validateStep(i)) {
        toast({
          title: "Validation Error",
          description: "Please complete all required fields before publishing",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      const studyPayload = {
        researcher_id: user.id,
        title: studyData.title,
        description: studyData.description,
        category: studyData.category,
        compensation: studyType === 'paid' ? studyData.compensation : 0,
        duration: studyData.duration,
        location: studyData.location,
        participants_needed: studyData.participants_needed,
        deadline: studyData.deadline,
        requirements: studyData.requirements as any,
        screening_questions: studyType === 'paid' ? studyData.screening_questions as any : [],
        auto_approve: studyData.auto_approve,
        payment_schedule: studyType === 'paid' ? studyData.payment_schedule : null,
        status: 'active'
      };

      let result;
      if (studyData.id) {
        result = await supabase
          .from('studies')
          .update(studyPayload)
          .eq('id', studyData.id)
          .eq('researcher_id', user.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('studies')
          .insert(studyPayload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Study published successfully",
        description: "Your study is now live and accepting participants",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error publishing study:', error);
      toast({
        title: "Error publishing study",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const maxStep = studyType === 'paid' ? 4 : 2;
      setCurrentStep(Math.min(maxStep, currentStep + 1));
    } else {
      toast({
        title: "Please fix validation errors",
        description: "Complete all required fields before proceeding",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (studyType === 'paid' && studyData.screening_questions?.length === 0) {
      const defaultQuestions: ScreeningQuestion[] = [
        {
          id: `default_${Date.now()}`,
          question: "Untitled question",
          type: "text",
          required: false
        }
      ];
      setStudyData(prev => ({ ...prev, screening_questions: defaultQuestions }));
    }
  }, [studyType, studyData.screening_questions?.length]);

  const addScreeningQuestion = () => {
    const newQuestion: ScreeningQuestion = {
      id: `question_${Date.now()}`,
      question: "Untitled question",
      type: "text",
      required: false
    };
    setStudyData(prev => ({
      ...prev,
      screening_questions: [...(prev.screening_questions || []), newQuestion]
    }));
  };

  const updateScreeningQuestion = (questionId: string, updates: Partial<ScreeningQuestion>) => {
    setStudyData(prev => ({
      ...prev,
      screening_questions: (prev.screening_questions || []).map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteScreeningQuestion = (questionId: string) => {
    setStudyData(prev => ({
      ...prev,
      screening_questions: (prev.screening_questions || []).filter(q => q.id !== questionId)
    }));
  };

  const duplicateScreeningQuestion = (questionId: string) => {
    const questionToDuplicate = studyData.screening_questions?.find(q => q.id === questionId);
    if (questionToDuplicate) {
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: `question_${Date.now()}`,
        question: `${questionToDuplicate.question} (Copy)`
      };
      setStudyData(prev => ({
        ...prev,
        screening_questions: [...(prev.screening_questions || []), duplicatedQuestion]
      }));
    }
  };

  const getSteps = () => {
    if (studyType === 'paid') {
      return [
        { id: 1, title: 'Basic Information', description: 'Study details and requirements' },
        { id: 2, title: 'Screening Questions', description: 'Participant qualification criteria' },
        { id: 3, title: 'Payment & Schedule', description: 'Compensation and timeline' },
        { id: 4, title: 'Review & Publish', description: 'Final review and publication' }
      ];
    } else {
      return [
        { id: 1, title: 'Basic Information', description: 'Study details and requirements' },
        { id: 2, title: 'Review & Publish', description: 'Final review and publication' }
      ];
    }
  };

  const steps = getSteps();

  const renderStepContent = () => {
    if (currentStep === 0) {
      // Study type selection
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Choose Study Type</h2>
            <p className="text-muted-foreground">Select whether you want to offer compensation to participants</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${studyType === 'paid' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                setStudyType('paid');
                setCurrentStep(1);
              }}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Paid Study</CardTitle>
                </div>
                <CardDescription>
                  Compensate participants for their time and responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5">•</div>
                    <span>Set compensation amount</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5">•</div>
                    <span>Include screening questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5">•</div>
                    <span>Configure payment schedule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5">•</div>
                    <span>Attract more qualified participants</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${studyType === 'free' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                setStudyType('free');
                setStudyData(prev => ({ ...prev, compensation: 0 }));
                setCurrentStep(1);
              }}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <CardTitle>Free Study</CardTitle>
                </div>
                <CardDescription>
                  Gather responses without offering compensation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5">•</div>
                    <span>No compensation required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5">•</div>
                    <span>Simpler setup process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5">•</div>
                    <span>Quick to publish</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5">•</div>
                    <span>Ideal for community feedback</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Map step numbers for paid vs free studies
    const getMappedStep = () => {
      if (studyType === 'paid') {
        return currentStep;
      } else {
        // For free studies: step 1 = basic info, step 2 = publish
        return currentStep === 1 ? 1 : 4;
      }
    };

    switch (getMappedStep()) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Study Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Mobile App Usability Study"
                  value={studyData.title}
                  onChange={(e) => setStudyData(prev => ({ ...prev, title: e.target.value }))}
                  className={validationErrors.title ? 'border-destructive' : ''}
                />
                {validationErrors.title && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.title}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={studyData.category} onValueChange={(value) => setStudyData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className={validationErrors.category ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.category && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.category}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Study Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your study goals, methodology, and what participants will be asked to do..."
                value={studyData.description}
                onChange={(e) => setStudyData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={validationErrors.description ? 'border-destructive' : ''}
              />
              {validationErrors.description && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.description}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {studyType === 'paid' && (
                <div className="space-y-2">
                  <Label htmlFor="compensation">Compensation ($) *</Label>
                  <Input
                    id="compensation"
                    type="number"
                    placeholder="75"
                    value={studyData.compensation}
                    onChange={(e) => setStudyData(prev => ({ ...prev, compensation: e.target.value ? Number(e.target.value) : 0 }))}
                    className={validationErrors.compensation ? 'border-destructive' : ''}
                  />
                  {validationErrors.compensation && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.compensation}
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  value={studyData.duration}
                  onChange={(e) => setStudyData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  className={validationErrors.duration ? 'border-destructive' : ''}
                />
                {validationErrors.duration && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.duration}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="participants">Participants Needed *</Label>
                <Input
                  id="participants"
                  type="number"
                  placeholder="20"
                  value={studyData.participants_needed}
                  onChange={(e) => setStudyData(prev => ({ ...prev, participants_needed: Number(e.target.value) }))}
                  className={validationErrors.participants_needed ? 'border-destructive' : ''}
                />
                {validationErrors.participants_needed && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.participants_needed}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Study Format</Label>
                <Select value={studyData.location} onValueChange={(value) => setStudyData(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote (Online)</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={studyData.deadline}
                  onChange={(e) => setStudyData(prev => ({ ...prev, deadline: e.target.value }))}
                  className={validationErrors.deadline ? 'border-destructive' : ''}
                />
                {validationErrors.deadline && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.deadline}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Participant Requirements</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Age 18-65, Regular mobile app users"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                />
                <Button type="button" onClick={addRequirement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {studyData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {req}
                    <button onClick={() => removeRequirement(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Screening Questions *</h3>
                <p className="text-sm text-muted-foreground">
                  Customize the questions below or add your own to qualify participants
                </p>
                {validationErrors.screening_questions && (
                  <div className="flex items-center gap-1 text-sm text-destructive mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.screening_questions}
                  </div>
                )}
              </div>
              <Button onClick={addScreeningQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            <div className="space-y-4">
              {(studyData.screening_questions || []).map((question, index) => (
                <Card key={question.id} className="border border-border">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label>Question Text *</Label>
                          <Input
                            value={question.question}
                            onChange={(e) => updateScreeningQuestion(question.id, { question: e.target.value })}
                            placeholder="Enter your question"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Question Type</Label>
                            <Select
                              value={question.type}
                              onValueChange={(value: any) => updateScreeningQuestion(question.id, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                <SelectItem value="yes_no">Yes/No</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="slider">Slider</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2 pt-8">
                            <Switch
                              checked={question.required}
                              onCheckedChange={(checked) => updateScreeningQuestion(question.id, { required: checked })}
                            />
                            <Label>Required</Label>
                          </div>
                        </div>

                        {(question.type === 'multiple_choice' || question.type === 'checkbox') && (
                          <div className="space-y-2">
                            <Label>Options (comma separated)</Label>
                            <Input
                              value={question.options?.join(', ') || ''}
                              onChange={(e) => updateScreeningQuestion(question.id, { 
                                options: e.target.value.split(',').map(o => o.trim()).filter(o => o) 
                              })}
                              placeholder="Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateScreeningQuestion(question.id)}
                          className="hover:bg-muted"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteScreeningQuestion(question.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(studyData.screening_questions || []).length === 0 && (
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Screening Questions</h3>
                    <p className="text-muted-foreground mb-4">
                      Click "Add Question" above to create your first screening question.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment & Schedule Settings</h3>
            </div>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Schedule</Label>
                    <Select value={studyData.payment_schedule} onValueChange={(value) => setStudyData(prev => ({ ...prev, payment_schedule: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (After completion)</SelectItem>
                        <SelectItem value="weekly">Weekly batch</SelectItem>
                        <SelectItem value="monthly">Monthly batch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="auto-approve"
                      checked={studyData.auto_approve}
                      onCheckedChange={(checked) => setStudyData(prev => ({ ...prev, auto_approve: checked }))}
                    />
                    <Label htmlFor="auto-approve" className="text-sm">
                      Auto-approve qualified participants
                    </Label>
                  </div>
                </div>

                <div className="rounded-lg bg-warning/10 p-4 border border-warning/20">
                  <div className="flex items-start gap-3">
                    <Settings className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <h4 className="font-medium text-warning-foreground mb-1">
                        Payment Processing Setup Required
                      </h4>
                      <p className="text-sm text-warning-foreground/80">
                        To process participant payments, you'll need to set up Stripe integration. 
                        This enables secure, automated payouts based on your schedule.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Study Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Study Start Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated End Date</Label>
                    <Input type="date" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review & Publish Study</h3>
              <p className="text-muted-foreground">
                Review all details before publishing your study to potential participants.
              </p>
            </div>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle>{studyData.title || 'Untitled Study'}</CardTitle>
                <CardDescription>{studyData.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {studyType === 'paid' && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${studyData.compensation} compensation</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{studyData.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{studyData.participants_needed} participants</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {studyData.requirements.length > 0 ? (
                      studyData.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary">{req}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific requirements</p>
                    )}
                  </div>
                </div>

                {studyType === 'paid' && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Screening Questions:</h4>
                    <p className="text-sm text-muted-foreground">
                      {(studyData.screening_questions || []).length} question(s) configured
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="rounded-lg bg-conditional/30 p-4 border border-conditional">
              <h4 className="font-medium mb-2">Attach Form</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Attach a custom form to collect the data from participants during the study.
              </p>
              <Button 
                onClick={() => navigate(`/study/${studyData.id}/form`)}
                disabled={isSaving}
                className="bg-gradient-success hover:opacity-90"
              >
                Attach Form
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showFormBuilder) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setShowFormBuilder(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Study Creator
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Add Screening Question</h1>
                <p className="text-muted-foreground">Create custom screening questions for participants</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <FormBuilder />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create New Study</h1>
              <p className="text-muted-foreground">Set up your research study and recruit participants</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-8 h-0.5 w-16 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-form border-0">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={saveDraft}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            {currentStep === 2 && (
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
          </div>

          <Button 
            onClick={() => {
              const isLastStep = (studyType === 'paid' && currentStep === 4) || (studyType === 'free' && currentStep === 2);
              if (isLastStep) {
                publishStudy();
              } else {
                handleNext();
              }
            }}
            disabled={isSaving}
            className="bg-gradient-primary hover:opacity-90"
          >
            {((studyType === 'paid' && currentStep === 4) || (studyType === 'free' && currentStep === 2)) 
              ? (isSaving ? 'Publishing...' : 'Publish Study') 
              : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};