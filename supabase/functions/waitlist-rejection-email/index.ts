import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders, verifyAuth, unauthorizedResponse, forbiddenResponse, validateEmail, validateLength, validationErrorResponse, errorResponse, requireAAL2 } from '../_shared/security.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    // Require authenticated user
    const authResult = await verifyAuth(req);
    if (!authResult.user || !authResult.supabaseClient) {
      return unauthorizedResponse();
    }

    // Require admin role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const { data: isAdmin } = await supabaseAdmin.rpc('has_role', {
      _user_id: authResult.user.id,
      _role: 'admin'
    });
    if (!isAdmin) {
      return forbiddenResponse('Admin access required');
    }

    // Require MFA (aal2) for admin operations
    const mfaResponse = requireAAL2(req);
    if (mfaResponse) return mfaResponse;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return validationErrorResponse(['Invalid request body']);
    }

    const { email, firstName, city } = body as { email?: string; firstName?: string; city?: string };

    // Validate inputs
    const errors: string[] = [];
    const emailError = validateEmail(email);
    if (emailError) errors.push(emailError);
    const nameError = validateLength(firstName, 'firstName', 1, 100);
    if (nameError) errors.push(nameError);
    if (city) {
      const cityError = validateLength(city, 'city', 0, 200);
      if (cityError) errors.push(cityError);
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Verify email exists in waitlist_submissions
    const { data: submission } = await supabaseAdmin
      .from('waitlist_submissions')
      .select('id')
      .eq('email', (email as string).toLowerCase())
      .single();

    if (!submission) {
      return validationErrorResponse(['Email not found in waitlist submissions']);
    }

    // Sanitize inputs for use in HTML
    const safeName = (firstName as string).replace(/[<>"'&]/g, '');
    const safeCity = city ? city.replace(/[<>"'&]/g, '') : null;

    // Customize message based on city
    const isChicago = safeCity?.toLowerCase().includes('chicago');
    const cityMessage = isChicago 
      ? "We're currently at capacity but will reach out when spots open up."
      : `Right now we're only launching in Chicago, but we'll expand to ${safeCity || 'your area'} soon. We'll reach out when we're ready for ${safeCity || 'your area'} users.`;

    const emailResponse = await resend.emails.send({
      from: "MonArk <onboarding@resend.dev>",
      to: [email as string],
      subject: "MonArk Waitlist Update",
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
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #3a3a3a;">
                      <h1 style="margin: 0; color: #D4AF37; font-size: 32px; font-weight: 300; letter-spacing: 2px;">MonArk</h1>
                      <p style="margin: 8px 0 0; color: #8a8a8a; font-size: 14px;">Where Chemistry Meets Clarity</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 24px; font-weight: 400;">Hi ${safeName},</h2>
                      <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                        Thanks for your interest in MonArk!
                      </p>
                      <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                        ${cityMessage}
                      </p>
                      <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                        We appreciate your patience as we build something special.
                      </p>
                      <p style="margin: 0; color: #8a8a8a; font-size: 14px; line-height: 1.6;">
                        Questions? Just reply to this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px 40px; background-color: #232323; border-top: 1px solid #3a3a3a;">
                      <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                        Thanks,<br>
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

    console.log("Rejection email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    return errorResponse(error, 'Failed to send rejection email');
  }
};

serve(handler);
