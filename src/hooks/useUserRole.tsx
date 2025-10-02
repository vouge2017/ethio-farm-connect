import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type AppRole = 'admin' | 'moderator' | 'vet' | 'farmer';

interface UserRole {
  id: string;
  role: AppRole;
  assigned_at: string;
}

/**
 * Hook to check user roles using the secure user_roles table
 * @returns Object with role checking functions and role data
 */
export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    fetchUserRoles();
  }, [user]);

  const fetchUserRoles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: AppRole): boolean => {
    return roles.some(r => r.role === role);
  };

  /**
   * Check if user has ANY of the provided roles
   */
  const hasAnyRole = (...roleList: AppRole[]): boolean => {
    return roles.some(r => roleList.includes(r.role));
  };

  /**
   * Check if user has ALL of the provided roles
   */
  const hasAllRoles = (...roleList: AppRole[]): boolean => {
    return roleList.every(role => hasRole(role));
  };

  /**
   * Get all user roles as an array
   */
  const getUserRoles = (): AppRole[] => {
    return roles.map(r => r.role);
  };

  return {
    roles,
    loading,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getUserRoles,
    isAdmin: hasRole('admin'),
    isModerator: hasRole('moderator'),
    isVet: hasRole('vet'),
    isFarmer: hasRole('farmer'),
    refetch: fetchUserRoles
  };
}
