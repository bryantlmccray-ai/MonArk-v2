import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WaitlistConfirmationRequest {
  email: string;
  firstName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName }: WaitlistConfirmationRequest = await req.json();

    if (!email || !firstName) {
      return new Response(
        JSON.stringify({ error: "Email and firstName are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "MonArk <onboarding@resend.dev>",
      to: [email],
      subject: "You're on the MonArk waitlist!",
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
                      <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 24px; font-weight: 400;">Hi ${firstName},</h2>
                      
                      <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                        Thanks for signing up! We're reviewing applications now and will let you know within <strong style="color: #D4AF37;">1-2 days</strong>.
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                        We're launching with a small group in Chicago to make sure everyone gets great matches. Quality over quantity – that's the MonArk way.
                      </p>
                      
                      <div style="background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="margin: 0 0 12px; color: #D4AF37; font-size: 16px; font-weight: 500;">What happens next?</h3>
                        <ul style="margin: 0; padding: 0 0 0 20px; color: #cccccc; font-size: 14px; line-height: 1.8;">
                          <li>We'll review your application</li>
                          <li>If approved, you'll get an invite email with next steps</li>
                          <li>You'll complete your profile and start getting curated matches</li>
                        </ul>
                      </div>
                      
                      <p style="margin: 0; color: #8a8a8a; font-size: 14px; line-height: 1.6;">
                        Questions? Just reply to this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #232323; border-top: 1px solid #3a3a3a;">
                      <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                        Talk soon,<br>
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

    console.log("Waitlist confirmation email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in waitlist-confirmation-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
