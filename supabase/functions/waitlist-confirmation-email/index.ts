import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders, validateEmail, validateLength, validationErrorResponse, errorResponse } from '../_shared/security.ts'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return validationErrorResponse(['Invalid request body'])
    }

    const { email, firstName } = body as { email?: string; firstName?: string }

    // Validate inputs
    const errors: string[] = []
    const emailError = validateEmail(email)
    if (emailError) errors.push(emailError)
    const nameError = validateLength(firstName, 'firstName', 1, 100)
    if (nameError) errors.push(nameError)

    if (errors.length > 0) {
      return validationErrorResponse(errors)
    }

    // Sanitize firstName for use in HTML (prevent XSS in emails)
    const safeName = (firstName as string).replace(/[<>"'&]/g, '')

    const emailResponse = await resend.emails.send({
      from: "MonArk <onboarding@resend.dev>",
      to: [email as string],
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

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    return errorResponse(error, 'Failed to send confirmation email')
  }
};

serve(handler);
