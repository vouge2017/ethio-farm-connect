import type { Database } from '@/integrations/supabase/types';

export type AnimalType = Database['public']['Enums']['animal_type'];
export type AnimalGender = Database['public']['Enums']['animal_gender'];

export const animalTypes: { value: AnimalType; label: string }[] = [
  { value: 'ox', label: 'Ox' },
  { value: 'cow', label: 'Cow' },
  { value: 'calf', label: 'Calf' },
  { value: 'goat', label: 'Goat' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'camel', label: 'Camel' },
  { value: 'donkey', label: 'Donkey' },
  { value: 'horse', label: 'Horse' },
  { value: 'cattle', label: 'Cattle (General)' },
  { value: 'other', label: 'Other' }
];

export const getAnimalIcon = (type: string): string => {
  switch (type) {
    case 'cattle':
    case 'ox':
    case 'cow':
    case 'calf':
      return '🐄';
    case 'goat':
      return '🐐';
    case 'sheep':
      return '🐑';
    case 'chicken':
      return '🐔';
    case 'camel':
      return '🐪';
    case 'donkey':
      return '🫏';
    case 'horse':
      return '🐎';
    default:
      return '🐾';
  }
};

export const calculateAge = (birthDate: string): string => {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  
  if (months < 12) {
    return `${months} months`;
  }
  return `${Math.floor(months / 12)} years`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};
