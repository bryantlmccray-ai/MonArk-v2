import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  to: string;
  type: 'match' | 'message' | 'date_proposal' | 'date_reminder' | 'weekly_ready' | 'after_date' | 'safety' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

const getEmailTemplate = (type: string, title: string, message: string, actionUrl?: string) => {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; }
      .header { background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: #D4AF37; padding: 30px 20px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; }
      .header h2 { margin: 10px 0 0; font-size: 18px; font-weight: normal; color: #fff; }
      .content { background: #ffffff; padding: 40px 30px; }
      .content p { font-size: 16px; line-height: 1.7; color: #333; margin: 0 0 20px; }
      .button { 
        display: inline-block; 
        background: linear-gradient(135deg, #D4AF37 0%, #B8962E 100%);
        color: #1a1a1a; 
        padding: 14px 32px; 
        text-decoration: none; 
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        margin: 20px 0;
        box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
      }
      .button:hover { background: #B8962E; }
      .footer { background: #1a1a1a; color: #999; padding: 30px 20px; text-align: center; font-size: 12px; }
      .footer a { color: #D4AF37; text-decoration: none; }
      .icon { font-size: 48px; margin-bottom: 10px; }
    </style>
  `;

  const getIcon = (type: string) => {
    switch (type) {
      case 'match': return '💖';
      case 'message': return '💬';
      case 'date_proposal': return '📅';
      case 'date_reminder': return '⏰';
      case 'weekly_ready': return '✨';
      case 'after_date': return '📝';
      case 'safety': return '🛡️';
      default: return '🔔';
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title}</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">${getIcon(type)}</div>
          <h1>MonArk</h1>
          <h2>${getSubtitle(type)}</h2>
        </div>
        
        <div class="content">
          <p style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 15px;">${title}</p>
          <p>${message}</p>
          
          ${actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionUrl}" class="button">Open MonArk</a>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p style="margin-bottom: 15px;">© 2024 MonArk. Designed for meaningful connections.</p>
          <p>
            <a href="https://monark.app">Visit MonArk</a>
          </p>
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
    const { to, type, title, message, actionUrl }: NotificationEmailRequest = await req.json();

    // Validate required fields
    if (!to || !type || !title || !message) {
      console.error('Missing required fields:', { to: !!to, type: !!type, title: !!title, message: !!message });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, type, title, message' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
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

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
