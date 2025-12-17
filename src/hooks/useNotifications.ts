import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * MVP Email Notification Service
 * Simple utility to send email notifications - no in-app notification center
 */
export const useNotifications = () => {
  const { user } = useAuth();

  const sendEmailNotification = async (
    type: 'match' | 'message' | 'date_proposal' | 'system' | 'safety',
    title: string,
    message: string,
    toEmail?: string,
    actionUrl?: string
  ): Promise<boolean> => {
    try {
      let email = toEmail;
      
      // If no email provided, get current user's email
      if (!email && user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();
        email = profile?.email || undefined;
      }

      if (!email) {
        console.warn('No email address available for notification');
        return false;
      }

      const { error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: email,
          type,
          title,
          message,
          actionUrl
        }
      });

      if (error) {
        console.error('Error sending notification email:', error);
        return false;
      }

      console.log('Email notification sent:', title);
      return true;
    } catch (error) {
      console.error('Error in sendEmailNotification:', error);
      return false;
    }
  };

  return {
    sendEmailNotification
  };
};
