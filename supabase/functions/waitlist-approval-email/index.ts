import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  email: string;
  firstName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName }: ApprovalEmailRequest = await req.json();

    if (!email || !firstName) {
      return new Response(
        JSON.stringify({ error: "Email and firstName are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // TODO: Replace with actual app URL when deployed
    const appUrl = Deno.env.get("APP_URL") || "https://your-app-url.lovable.app";

    const emailResponse = await resend.emails.send({
      from: "MonArk <onboarding@resend.dev>",
      to: [email],
      subject: "You're in! Welcome to MonArk 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #1a1a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #2a2a2a; border-radius: 12px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #3a3a3a;">
                      <h1 style="margin: 0; color: #D4AF37; font-size: 32px; font-weight: 300; letter-spacing: 2px;">MonArk</h1>
                      <p style="margin: 8px 0 0; color: #8a8a8a; font-size: 14px;">Where Chemistry Meets Clarity</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 24px; font-weight: 400;">Welcome, ${firstName}! 🎉</h2>
                      
                      <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                        Great news – your application has been <strong style="color: #D4AF37;">approved</strong>! You're now part of the MonArk community.
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                        You're joining a small, curated group of people in Chicago who are ready for something different in dating. No endless swiping, no games – just intentional connections.
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${appUrl}" style="display: inline-block; background-color: #D4AF37; color: #1a1a1a; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Get Started
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="margin: 0 0 12px; color: #D4AF37; font-size: 16px; font-weight: 500;">What's next?</h3>
                        <ol style="margin: 0; padding: 0 0 0 20px; color: #cccccc; font-size: 14px; line-height: 1.8;">
                          <li>Create your profile (takes about 5 minutes)</li>
                          <li>Tell us about your dating style</li>
                          <li>Get your first curated matches each week</li>
                        </ol>
                      </div>
                      
                      <p style="margin: 0; color: #8a8a8a; font-size: 14px; line-height: 1.6;">
                        Questions? Just reply to this email – we're here to help.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #232323; border-top: 1px solid #3a3a3a;">
                      <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                        Welcome to the future of dating,<br>
                        <strong style="color: #8a8a8a;">The MonArk Team</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Approval email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in waitlist-approval-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
