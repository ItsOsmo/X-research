import { supabase } from "@/integrations/supabase/client";

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'yes_no' | 'text' | 'number' | 'checkbox';
  options?: string[];
  disqualifying_answers?: string[];
  required: boolean;
}

export interface GenerateQuestionsParams {
  apiKey: string;
  studyDescription: string;
  category?: string;
  requirements?: string[];
}

export interface GenerateQuestionsResponse {
  questions: ScreeningQuestion[];
}

export class AIService {
  static async generateScreeningQuestions(
    params: GenerateQuestionsParams
  ): Promise<ScreeningQuestion[]> {
    try {
      const { data, error } = await supabase.functions.invoke(
        'generate-screening-questions',
        {
          body: params,
        }
      );
      console.log(data)
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate screening questions');
      }

      if (!data?.questions) {
        throw new Error('Invalid response format from AI service');
      }

      return data.questions;
    } catch (error) {
      console.error('Error generating screening questions:', error);
      throw error;
    }
  }
}