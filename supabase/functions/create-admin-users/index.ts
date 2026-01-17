// @ts-ignore deno import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const adminUsers = [
      { email: 'samandar@alsamos.com', password: 'Alsamos2024!' },
      { email: 'alsamos@alsamos.com', password: 'Alsamos2024!' }
    ]

    const results = []

    for (const admin of adminUsers) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find((u: { email?: string }) => u.email === admin.email)

      let userId: string

      if (existingUser) {
        userId = existingUser.id
        results.push({ email: admin.email, status: 'already exists', userId })
      } else {
        // Create the user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true
        })

        if (createError) {
          results.push({ email: admin.email, status: 'error', error: createError.message })
          continue
        }

        userId = newUser.user.id
        results.push({ email: admin.email, status: 'created', userId })
      }

      // Check if admin role already exists
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle()

      if (!existingRole) {
        // Assign admin role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' })

        if (roleError) {
          results.push({ email: admin.email, roleStatus: 'error', error: roleError.message })
        } else {
          results.push({ email: admin.email, roleStatus: 'admin role assigned' })
        }
      } else {
        results.push({ email: admin.email, roleStatus: 'admin role already exists' })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
