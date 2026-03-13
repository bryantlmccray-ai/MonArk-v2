import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders, verifyAuth, unauthorizedResponse, errorResponse, requireAAL2 } from '../_shared/security.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NotificationEmailRequest {
  to: string;
  type: 'match' | 'message' | 'date_proposal' | 'date_reminder' | 'weekly_ready' | 'after_date' | 'safety' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

const getEmailTemplate = (type: string, title: string, message: string, actionUrl?: string) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'match': return '&#10084;';
      case 'message': return '&#128172;';
      case 'date_proposal': return '&#128197;';
      case 'date_reminder': return '&#9200;';
      case 'weekly_ready': return '&#10024;';
      case 'after_date': return '&#128221;';
      case 'safety': return '&#128737;';
      default: return '&#128276;';
    }
  };

  const getSubtitle = (type: string) => {
    switch (type) {
      case 'match': return 'A new connection awaits';
      case 'message': return 'Someone is thinking of you';
      case 'date_proposal': return 'An exciting plan is brewing';
      case 'date_reminder': return 'Your date is coming up';
      case 'weekly_ready': return 'Your personalized options are here';
      case 'after_date': return 'How did it go?';
      case 'safety': return 'Important safety update';
      default: return 'Update from MonArk';
    }
  };

  // Sanitize title and message for HTML injection
  const safeTitle = title.replace(/[<>"'&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c] || c));
  const safeMessage = message.replace(/[<>"'&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c] || c));

  // Validate actionUrl to prevent javascript: injection
  let safeActionUrl: string | undefined;
  if (actionUrl) {
    try {
      const url = new URL(actionUrl);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        safeActionUrl = actionUrl;
      }
    } catch {
      safeActionUrl = undefined;
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${safeTitle}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: #D4AF37; padding: 30px 20px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">${getIcon(type)}</div>
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">MonArk</h1>
          <h2 style="margin: 10px 0 0; font-size: 18px; font-weight: normal; color: #fff;">${getSubtitle(type)}</h2>
        </div>
        <div style="background: #ffffff; padding: 40px 30px;">
          <p style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0 0 15px; line-height: 1.7;">${safeTitle}</p>
          <p style="font-size: 16px; line-height: 1.7; color: #333; margin: 0 0 20px;">${safeMessage}</p>
          ${safeActionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${safeActionUrl}" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #B8962E 100%); color: #1a1a1a; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Open MonArk</a>
            </div>
          ` : ''}
        </div>
        <div style="background: #1a1a1a; color: #999; padding: 30px 20px; text-align: center; font-size: 12px;">
          <p style="margin-bottom: 15px;">&copy; 2025 MonArk. Designed for meaningful connections.</p>
          <p style="margin-top: 15px; font-size: 11px; color: #666;">
            You're receiving this because you have email notifications enabled.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY FIX: Require authentication — prevent arbitrary email sending
    const authResult = await verifyAuth(req);
    if (!authResult.user || !authResult.supabaseClient) {
      return unauthorizedResponse();
    }

    const { to, type, title, message, actionUrl }: NotificationEmailRequest = await req.json();

    // Validate required fields
    if (!to || !type || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, type, title, message' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // SECURITY: Validate email format
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(to) || to.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Invalid recipient email' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // SECURITY: Only allow sending to the authenticated user's own email,
    // OR require admin role for sending to arbitrary addresses
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const isOwnEmail = authResult.user.email === to;
    if (!isOwnEmail) {
      const { data: isAdmin } = await supabaseAdmin.rpc('has_role', {
        _user_id: authResult.user.id,
        _role: 'admin'
      });
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Cannot send notifications to other users' }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Require MFA (aal2) for admin email operations
      const mfaResponse = requireAAL2(req);
      if (mfaResponse) return mfaResponse;
    }

    // Validate type against allowed values
    const allowedTypes = ['match', 'message', 'date_proposal', 'date_reminder', 'weekly_ready', 'after_date', 'safety', 'system'];
    if (!allowedTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid notification type' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending ${type} notification to ${to}: ${title}`);

    const emailHTML = getEmailTemplate(type, title, message, actionUrl);

    const emailResponse = await resend.emails.send({
      from: "MonArk <notifications@resend.dev>",
      to: [to],
      subject: `${title} - MonArk`,
      html: emailHTML,
    });

    console.log("Notification email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    return errorResponse(error, 'Failed to send notification email');
  }
};

serve(handler);
