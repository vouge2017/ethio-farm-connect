import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.22.0'

// Standard CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// The dedicated UUID for our AI bot user
const AI_BOT_USER_ID = '00000000-0000-0000-0000-000000000001';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { questionId } = await req.json()

    if (!questionId) {
      throw new Error('Missing questionId in request body');
    }

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch the question to make the AI's response more relevant
    const { data: question, error: questionError } = await supabaseAdmin
      .from('questions')
      .select('title, content')
      .eq('id', questionId)
      .single();

    if (questionError) throw questionError;
    if (!question) throw new Error('Question not found');

    // 2. Generate a helpful, placeholder AI answer
    const aiContent = `Hello! I am FarmConnect's AI Assistant. Thank you for your question: "${question.title}".\n\nWhile I analyze your question for a more detailed response, please ensure you have provided all relevant details, such as the animal's age, breed, symptoms, and any recent changes in behavior or diet. A human expert or veterinarian from our community will also review your question and provide their insights shortly.`;

    // 3. Insert the new answer into the database
    const { error: insertError } = await supabaseAdmin
      .from('answers')
      .insert({
        question_id: questionId,
        content: aiContent,
        author_id: AI_BOT_USER_ID,
        is_vet_answer: true // Mark as true to give it a distinct appearance
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: 'AI answer posted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})