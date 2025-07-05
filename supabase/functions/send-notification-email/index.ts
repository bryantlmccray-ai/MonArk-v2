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
  type: 'match' | 'message' | 'date_proposal' | 'safety' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

const getEmailTemplate = (type: string, title: string, message: string, actionUrl?: string) => {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #1a1a1a; color: #D4AF37; padding: 20px; text-align: center; }
      .content { background: #f9f9f9; padding: 30px; }
      .button { 
        display: inline-block; 
        background: #D4AF37; 
        color: #1a1a1a; 
        padding: 12px 24px; 
        text-decoration: none; 
        border-radius: 6px;
        font-weight: bold;
        margin: 20px 0;
      }
      .footer { background: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px; }
    </style>
  `;

  const getIcon = (type: string) => {
    switch (type) {
      case 'match': return '💖';
      case 'message': return '💬';
      case 'date_proposal': return '📅';
      case 'safety': return '🛡️';
      default: return '🔔';
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
          <h1>${getIcon(type)} MonArk</h1>
          <h2>${title}</h2>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">${message}</p>
          
          ${actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionUrl}" class="button">Open MonArk</a>
            </div>
          ` : ''}
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This notification was sent because you have email notifications enabled in your MonArk settings.
          </p>
        </div>
        
        <div class="footer">
          <p>© 2024 MonArk. All rights reserved.</p>
          <p>
            <a href="${actionUrl || 'https://monark.app'}" style="color: #D4AF37;">Open App</a> | 
            <a href="${actionUrl || 'https://monark.app'}/settings" style="color: #D4AF37;">Notification Settings</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, title, message, actionUrl }: NotificationEmailRequest = await req.json();

    // Validate required fields
    if (!to || !type || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailHTML = getEmailTemplate(type, title, message, actionUrl);

    const emailResponse = await resend.emails.send({
      from: "MonArk <notifications@resend.dev>",
      to: [to],
      subject: title,
      html: emailHTML,
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
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