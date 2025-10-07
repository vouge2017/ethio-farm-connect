import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Type definitions
type QuestionRow = Database['public']['Tables']['questions']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type AnswerRow = Database['public']['Tables']['answers']['Row'];

export interface Question extends QuestionRow {
  profiles?: Pick<ProfileRow, 'display_name'>;
  answers?: { count: number }[];
}

export interface Answer extends AnswerRow {
  profiles?: Pick<ProfileRow, 'display_name'> & { user_roles: { role: string }[] };
}

export interface QuestionFormData {
  title: string;
  content: string;
  animal_type?: 'cattle' | 'goat' | 'sheep' | 'chicken' | 'camel' | 'donkey' | 'horse' | '';
  photos: string[];
}

// Hook to fetch all questions
export const useQuestions = () => {
  return useQuery<Question[]>({
    queryKey: QUERY_KEYS.questions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles!questions_author_id_fkey(display_name),
          answers(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook to trigger the AI answer bot
export const usePostAiAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase.functions.invoke('ai-answer-bot', {
        body: { questionId },
      });

      if (error) {
        // This is a background task, so we'll log the error
        // but not show a disruptive toast to the user.
        console.error('Failed to trigger AI answer bot:', error);
      }
    },
    onSuccess: (_, questionId) => {
      // Invalidate the answers query to refetch the new AI answer
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.answers(questionId) });
    }
  });
};

// Hook to fetch answers for a specific question
export const useAnswers = (questionId: string | null) => {
  return useQuery<Answer[]>({
    queryKey: QUERY_KEYS.answers(questionId!),
    queryFn: async () => {
      if (!questionId) return [];

      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          profiles!answers_author_id_fkey(
            display_name,
            user_roles(role)
          )
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!questionId,
  });
};

// Hook to create a new question
export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: QuestionFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('questions')
        .insert({
          ...formData,
          animal_type: formData.animal_type || null,
          photos: formData.photos.length > 0 ? formData.photos : null,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.questions });
      toast({
        title: 'Success',
        description: 'Your question has been posted!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to post question: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

// Hook to create a new answer
export const useCreateAnswer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ questionId, content }: { questionId: string; content: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('answers')
        .insert({
          question_id: questionId,
          content: content,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.answers(variables.questionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.questions });
      toast({
        title: 'Success',
        description: 'Your answer has been posted!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to post answer: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

// Hook to increment question view count
export const useIncrementViewCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      // Note: This relies on a database function that needs to be created via migration.
      const { error } = await supabase.rpc('increment_view_count', { question_id_param: questionId });
      if (error) {
        console.error("Failed to increment view count:", error);
      }
    },
    onSuccess: (_, questionId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.question(questionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.questions });
    },
  });
};