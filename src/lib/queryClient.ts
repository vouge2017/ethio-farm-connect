import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for important data
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Query keys for consistent caching
export const QUERY_KEYS = {
  // Listings
  listings: ['listings'] as const,
  listing: (id: string) => ['listings', id] as const,
  userListings: (userId: string) => ['listings', 'user', userId] as const,
  
  // Animals  
  animals: ['animals'] as const,
  animal: (id: string) => ['animals', id] as const,
  userAnimals: (userId: string) => ['animals', 'user', userId] as const,
  
  // Messages
  conversations: ['conversations'] as const,
  conversation: (id: string) => ['conversations', id] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  
  // Notifications
  notifications: ['notifications'] as const,
  
  // Profile
  profile: (userId: string) => ['profile', userId] as const,
  profiles: ['profiles'] as const,
  
  // Search
  search: (filters: Record<string, any>) => ['search', filters] as const,
  savedSearches: ['savedSearches'] as const,
  
  // Analytics
  analytics: ['analytics'] as const,
  
  // Admin
  adminUsers: ['admin', 'users'] as const,
  adminListings: ['admin', 'listings'] as const,
} as const;
