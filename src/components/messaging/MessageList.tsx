import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string;
  last_message_at: string;
  created_at: string;
  listings: {
    title: string;
    price: number;
  };
  buyer_profile: {
    display_name: string;
    phone_number: string;
  };
  seller_profile: {
    display_name: string;
    phone_number: string;
  };
  latest_message: {
    content: string;
    sender_id: string;
    read_at: string | null;
  } | null;
  unread_count: number;
}

interface MessageListProps {
  onConversationSelect: (conversation: Conversation) => void;
}

export const MessageList = ({ onConversationSelect }: MessageListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('conversations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `buyer_id=eq.${user.id},seller_id=eq.${user.id}`
          },
          () => {
            fetchConversations();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public', 
            table: 'messages'
          },
          () => {
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch conversations with related data
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listings!inner(title, price),
          buyer_profile:profiles!conversations_buyer_id_fkey(display_name, phone_number),
          seller_profile:profiles!conversations_seller_id_fkey(display_name, phone_number)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch latest message and unread count for each conversation
      const conversationsWithMessages = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          // Get latest message
          const { data: latestMessage } = await supabase
            .from('messages')
            .select('content, sender_id, read_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...conv,
            latest_message: latestMessage?.[0] || null,
            unread_count: unreadCount || 0
          };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    return conversation.buyer_id === user?.id 
      ? conversation.seller_profile 
      : conversation.buyer_profile;
  };

  const getUserRole = (conversation: Conversation) => {
    return conversation.buyer_id === user?.id ? 'buyer' : 'seller';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messages ({conversations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No messages yet. Start a conversation by contacting a seller!
          </p>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const userRole = getUserRole(conversation);
              
              return (
                <div
                  key={conversation.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onConversationSelect(conversation)}
                >
                  <Avatar>
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {otherUser.display_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {userRole}
                        </Badge>
                        {conversation.unread_count > 0 && (
                          <Badge variant="default" className="text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-primary mb-1">
                      {conversation.listings.title}
                    </p>
                    
                    {conversation.latest_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.latest_message.sender_id === user?.id ? 'You: ' : ''}
                        {conversation.latest_message.content}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};