import { Database } from "@/integrations/supabase/types";
import { ScreeningQuestion } from "@/services/aiService";


type StudyRow = Database["public"]["Tables"]["studies"]["Row"];

export interface Study extends Omit<StudyRow, "requirements" | "screening_questions"> {
  requirements?: string[] | null;
  screening_questions?: ScreeningQuestion[] | null;
}

export type QuestionType = 
  | 'text' 
  | 'radio' 
  | 'checkbox' 
  | 'dropdown' 
  | 'date' 
  | 'slider' 
  | 'file' 
  | 'image' 
  | 'yesno';

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  created_at: string;
  updated_at: string;
}