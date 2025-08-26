import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface TrialUser {
  id: string;
  email: string;
  created_at: string;
  full_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[TRIAL-REMINDER] Function started');

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('[TRIAL-REMINDER] Supabase client initialized');

    // Calculate the date 11 days ago (users who have 3 days left in their 14-day trial)
    const elevenDaysAgo = new Date();
    elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);
    elevenDaysAgo.setHours(0, 0, 0, 0);

    const elevenDaysAgoEnd = new Date(elevenDaysAgo);
    elevenDaysAgoEnd.setHours(23, 59, 59, 999);

    console.log('[TRIAL-REMINDER] Looking for users created between:', elevenDaysAgo.toISOString(), 'and', elevenDaysAgoEnd.toISOString());

    // Get users from auth.users who signed up exactly 11 days ago
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    if (authError) {
      console.error('[TRIAL-REMINDER] Error fetching auth users:', authError);
      throw authError;
    }

    // Filter users who signed up 11 days ago (3 days before trial ends)
    const eligibleUsers = authUsers.users.filter(user => {
      if (!user.created_at || !user.email) return false;
      
      const userCreatedAt = new Date(user.created_at);
      return userCreatedAt >= elevenDaysAgo && userCreatedAt <= elevenDaysAgoEnd;
    });

    console.log('[TRIAL-REMINDER] Found', eligibleUsers.length, 'users eligible for trial reminder');

    if (eligibleUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No users eligible for trial reminder today',
          count: 0 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Check which users don't have an active subscription
    const emailsSent = [];
    const errors = [];

    for (const user of eligibleUsers) {
      try {
        // Check if user has an active subscription
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_tier, subscription_type')
          .eq('user_id', user.id)
          .eq('subscribed', true)
          .single();

        // Skip if user already has an active subscription
        if (subscriber) {
          console.log('[TRIAL-REMINDER] User', user.email, 'already has active subscription, skipping');
          continue;
        }

        // Get user profile for personalization
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const userName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cher utilisateur';

        // Send trial reminder email
        const emailResult = await resend.emails.send({
          from: "UniSubHub <tom.lifert@gmail.com>",
          to: [user.email!],
          subject: "⏰ Plus que 3 jours pour profiter d'UniSubHub !",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Votre essai gratuit se termine bientôt</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Votre essai se termine bientôt !</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 18px; margin-bottom: 20px;">Bonjour ${userName},</p>
                
                <p>Votre période d'essai gratuite de <strong>14 jours</strong> sur UniSubHub se termine dans <strong style="color: #e74c3c;">3 jours</strong> !</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <h3 style="margin-top: 0; color: #667eea;">🚀 Ne perdez pas vos avantages :</h3>
                  <ul style="padding-left: 20px;">
                    <li>✅ Gestion illimitée de vos abonnements</li>
                    <li>✅ Alertes de facturation personnalisées</li>
                    <li>✅ Analyse détaillée de vos dépenses</li>
                    <li>✅ Notifications d'offres exclusives</li>
                    <li>✅ Support prioritaire</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://c6cdb938-7790-42f1-abd3-9729bbdbc721.lovableproject.com/" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                    🎯 Continuer avec Premium
                  </a>
                </div>
                
                <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold; color: #2c5aa0;">💝 Offre spéciale : -20% sur votre premier mois !</p>
                  <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Code promo automatiquement appliqué</p>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Vous recevez cet email car votre période d'essai gratuite se termine bientôt. 
                  Si vous ne souhaitez plus continuer, aucune action n'est requise de votre part.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="margin: 0; color: #999; font-size: 12px;">
                    UniSubHub - Simplifiez la gestion de vos abonnements
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        if (emailResult.error) {
          console.error('[TRIAL-REMINDER] Email error for', user.email, ':', emailResult.error);
          errors.push({ email: user.email, error: emailResult.error });
        } else {
          console.log('[TRIAL-REMINDER] Email sent successfully to:', user.email);
          emailsSent.push(user.email);
        }

      } catch (error) {
        console.error('[TRIAL-REMINDER] Error processing user', user.email, ':', error);
        errors.push({ email: user.email, error: error.message });
      }
    }

    console.log('[TRIAL-REMINDER] Process completed. Emails sent:', emailsSent.length, 'Errors:', errors.length);

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        errors: errors.length,
        details: {
          sent: emailsSent,
          errors: errors
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('[TRIAL-REMINDER] Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);