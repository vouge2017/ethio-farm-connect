-- Create notifications table for real-time user notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'listing_update', 'system', 'verification', 'booking', 'payment')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications for users
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create verification requests table
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  tier verification_tier NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_review')),
  documents JSONB,
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification requests
CREATE POLICY "Users can view their own verification requests"
ON public.verification_requests
FOR SELECT
USING (auth.uid() = requester_id);

-- Users can create verification requests for their listings
CREATE POLICY "Users can create verification requests"
ON public.verification_requests
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update verification requests
CREATE POLICY "Admins can update verification requests"
ON public.verification_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index
CREATE INDEX idx_verification_requests_listing ON public.verification_requests(listing_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);

-- Create listing analytics table
CREATE TABLE public.listing_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  contact_clicks INTEGER DEFAULT 0,
  message_starts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, date)
);

-- Enable RLS
ALTER TABLE public.listing_analytics ENABLE ROW LEVEL SECURITY;

-- Listing owners can view analytics for their listings
CREATE POLICY "Users can view analytics for their listings"
ON public.listing_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.listings 
    WHERE id = listing_analytics.listing_id 
    AND seller_id = auth.uid()
  )
);

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics"
ON public.listing_analytics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert/update analytics (authenticated users only)
CREATE POLICY "Authenticated users can track analytics"
ON public.listing_analytics
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update analytics"
ON public.listing_analytics
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_listing_analytics_listing ON public.listing_analytics(listing_id);
CREATE INDEX idx_listing_analytics_date ON public.listing_analytics(date DESC);

-- Create trigger for verification_requests updated_at
CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to increment listing view count and track analytics
CREATE OR REPLACE FUNCTION public.track_listing_view(
  p_listing_id UUID,
  p_viewer_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update listing view count
  UPDATE public.listings
  SET view_count = view_count + 1
  WHERE id = p_listing_id;
  
  -- Track daily analytics
  INSERT INTO public.listing_analytics (listing_id, views_count, unique_viewers)
  VALUES (p_listing_id, 1, CASE WHEN p_viewer_id IS NOT NULL THEN 1 ELSE 0 END)
  ON CONFLICT (listing_id, date)
  DO UPDATE SET
    views_count = listing_analytics.views_count + 1,
    unique_viewers = CASE 
      WHEN p_viewer_id IS NOT NULL THEN listing_analytics.unique_viewers + 1
      ELSE listing_analytics.unique_viewers
    END;
END;
$$;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;