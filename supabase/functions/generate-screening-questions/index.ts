import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, questionCount } = await req.json();

    console.log('Generating form with Gemini:', { title, description, questionCount });

    const systemPrompt = `You are an expert research form designer. Generate ${questionCount} relevant, well-structured research questions based on the study title and description provided.

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "questions": [
    {
      "id": "unique-id",
      "type": "text" | "radio" | "checkbox" | "dropdown" | "date" | "slider" | "file" | "image" | "yesno",
      "label": "Question text",
      "placeholder": "Optional placeholder text",
      "required": true or false,
      "options": ["Option 1", "Option 2"] (only for radio, checkbox, dropdown),
      "min": 0 (only for slider),
      "max": 100 (only for slider),
      "step": 1 (only for slider)
    }
  ]
}

Make questions diverse and appropriate for the study type. Use different question types strategically.`;

    const userPrompt = `Study Title: ${title}
Study Description: ${description || 'No description provided'}

Generate ${questionCount} research questions that are relevant, clear, and use varied question types appropriately.`;

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();

    // Gemini returns text under candidates[0].content.parts[0].text
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error('No content in AI response:', data);
      throw new Error('No content in AI response');
    }

    console.log('Raw AI response:', content);

    // Parse the JSON response
    let parsedContent;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, content);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
      console.error('Invalid response structure:', parsedContent);
      throw new Error('Invalid response structure from AI');
    }

    console.log('Successfully generated questions:', parsedContent.questions.length);

    return new Response(
      JSON.stringify({ questions: parsedContent.questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-form function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});