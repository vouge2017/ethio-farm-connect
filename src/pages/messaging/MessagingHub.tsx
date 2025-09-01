import { useState } from 'react';
import { MessageList } from '@/components/messaging/MessageList';
import { MessageThread } from '@/components/messaging/MessageThread';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

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

export default function MessagingHub() {
  const { user, loading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with buyers and sellers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message List */}
        <div className={`${selectedConversation ? 'hidden lg:block' : ''}`}>
          <MessageList
            onConversationSelect={setSelectedConversation}
          />
        </div>

        {/* Message Thread */}
        <div className={`${selectedConversation ? 'block' : 'hidden lg:block'}`}>
          {selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-[600px] border rounded-lg bg-muted/50">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Select a conversation to start messaging</p>
                <p className="text-sm text-muted-foreground">
                  Your conversations will appear on the left
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}