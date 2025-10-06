import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import type { AnimalType, AnimalGender } from '@/lib/animalHelpers';

type Animal = Database['public']['Tables']['animals']['Row'];
type AnimalInsert = Database['public']['Tables']['animals']['Insert'];
type AnimalUpdate = Database['public']['Tables']['animals']['Update'];

export interface AnimalFormData {
  name: string;
  type: AnimalType;
  breed?: string;
  gender: AnimalGender;
  birth_date?: string;
  acquisition_date?: string;
  notes?: string;
}

// Fetch animals for the current user
export const useAnimals = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.userAnimals(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Animal[];
    },
    enabled: !!user?.id,
  });
};

// Create a new animal
export const useCreateAnimal = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AnimalFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Generate animal ID
      const { data: animalId, error: idError } = await supabase.rpc('generate_animal_id', {
        owner_name: profile?.display_name || 'User',
        animal_type_param: formData.type
      });

      if (idError) throw idError;

      const animalData: AnimalInsert = {
        animal_id: animalId,
        owner_id: user.id,
        name: formData.name,
        type: formData.type,
        breed: formData.breed || null,
        gender: formData.gender,
        birth_date: formData.birth_date || null,
        acquisition_date: formData.acquisition_date || null,
        notes: formData.notes || null,
      };

      const { data, error } = await supabase
        .from('animals')
        .insert(animalData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userAnimals(user?.id || '') });
      toast({
        title: 'Success',
        description: 'Animal registered successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Update an existing animal
export const useUpdateAnimal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AnimalFormData> }) => {
      const updateData: AnimalUpdate = {
        name: data.name,
        type: data.type,
        breed: data.breed || null,
        gender: data.gender,
        birth_date: data.birth_date || null,
        acquisition_date: data.acquisition_date || null,
        notes: data.notes || null,
      };

      const { data: result, error } = await supabase
        .from('animals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userAnimals(user?.id || '') });
      toast({
        title: 'Success',
        description: 'Animal updated successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Delete (soft delete) an animal
export const useDeleteAnimal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (animalId: string) => {
      const { error } = await supabase
        .from('animals')
        .update({ is_active: false })
        .eq('id', animalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userAnimals(user?.id || '') });
      toast({
        title: 'Success',
        description: 'Animal removed successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Update animal photos
export const useUpdateAnimalPhotos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ animalId, photos }: { animalId: string; photos: string[] }) => {
      const { data, error } = await supabase
        .from('animals')
        .update({ photos })
        .eq('id', animalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userAnimals(user?.id || '') });
      toast({
        title: 'Success',
        description: 'Photos uploaded successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
