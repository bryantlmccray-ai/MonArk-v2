-- Create blocked_users table for user blocking functionality
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_user_id UUID NOT NULL,
  blocked_user_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_user_id, blocked_user_id)
);

-- Create user_reports table for reporting system
CREATE TABLE public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_user_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  conversation_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_safety_settings table for privacy controls
CREATE TABLE public.user_safety_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  location_sharing_enabled BOOLEAN NOT NULL DEFAULT true,
  show_online_status BOOLEAN NOT NULL DEFAULT true,
  allow_messages_from_strangers BOOLEAN NOT NULL DEFAULT true,
  require_mutual_match_for_messaging BOOLEAN NOT NULL DEFAULT false,
  auto_decline_inappropriate_content BOOLEAN NOT NULL DEFAULT true,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_safety_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_users
CREATE POLICY "Users can manage their own blocks" 
ON public.blocked_users 
FOR ALL 
USING (auth.uid() = blocker_user_id);

CREATE POLICY "Users can view blocks against them" 
ON public.blocked_users 
FOR SELECT 
USING (auth.uid() = blocked_user_id);

-- RLS Policies for user_reports
CREATE POLICY "Users can create reports" 
ON public.user_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view their own reports" 
ON public.user_reports 
FOR SELECT 
USING (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view reports about them" 
ON public.user_reports 
FOR SELECT 
USING (auth.uid() = reported_user_id);

-- RLS Policies for user_safety_settings
CREATE POLICY "Users can manage their own safety settings" 
ON public.user_safety_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_blocked_users_blocker ON public.blocked_users(blocker_user_id);
CREATE INDEX idx_blocked_users_blocked ON public.blocked_users(blocked_user_id);
CREATE INDEX idx_user_reports_reporter ON public.user_reports(reporter_user_id);
CREATE INDEX idx_user_reports_reported ON public.user_reports(reported_user_id);
CREATE INDEX idx_user_reports_status ON public.user_reports(status);

-- Create triggers for updating timestamps
CREATE TRIGGER update_blocked_users_updated_at
BEFORE UPDATE ON public.blocked_users
FOR EACH ROW
EXECUTE FUNCTION public.update_user_profile_timestamp();

CREATE TRIGGER update_user_reports_updated_at
BEFORE UPDATE ON public.user_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_user_profile_timestamp();

CREATE TRIGGER update_user_safety_settings_updated_at
BEFORE UPDATE ON public.user_safety_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_user_profile_timestamp();