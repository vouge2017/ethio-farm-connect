import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft, User, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
  message_type: string;
}

interface Conversation {
  id: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string;
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
}

interface MessageThreadProps {
  conversation: Conversation;
  onBack: () => void;
}

export const MessageThread = ({ conversation, onBack }: MessageThreadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUser = conversation.buyer_id === user?.id 
    ? conversation.seller_profile 
    : conversation.buyer_profile;

  const userRole = conversation.buyer_id === user?.id ? 'buyer' : 'seller';

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    
    // Subscribe to real-time message updates
    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', user?.id)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

      setNewMessage('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickReplies = userRole === 'seller' 
    ? [
        "Is the item still available?",
        "What's the best price?", 
        "Can I see more photos?",
        "When can I view it?"
      ]
    : [
        "Yes, it's still available",
        "Price is negotiable",
        "I can send more photos", 
        "You can view it anytime"
      ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Avatar>
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-lg">{otherUser.display_name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              About: {conversation.listings.title}
            </p>
          </div>
          
          <Button size="sm" variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[70%] rounded-lg px-3 py-2 text-sm
                    ${isOwn 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                    }
                  `}
                >
                  <p className="mb-1">{message.content}</p>
                  <p className={`
                    text-xs opacity-70
                    ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}
                  `}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    {isOwn && message.read_at && ' • Read'}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 flex-wrap">
            {quickReplies.map((reply, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => setNewMessage(reply)}
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              className="resize-none"
            />
            <Button 
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};