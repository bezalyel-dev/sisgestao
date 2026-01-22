# Instruções para Atualizar Email quando Email Atual é Inválido

Se você está tendo problemas para atualizar o email quando o email atual (lucas@gmail.com) é inválido ou não existe mais, você tem algumas opções:

## Opção 1: Atualizar via Dashboard do Supabase (Recomendado)

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** > **Users**
4. Encontre o usuário com email `lucas@gmail.com`
5. Clique no usuário e edite o campo **Email** para `bezalyelsilva@gmail.com`
6. Salve as alterações

## Opção 2: Criar uma Edge Function no Supabase

Se você precisar fazer isso programaticamente, pode criar uma Edge Function que usa o Admin API:

### 1. Crie uma Edge Function no Supabase

No dashboard do Supabase, vá em **Edge Functions** e crie uma nova função chamada `update-email`.

### 2. Use este código:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, newEmail } = await req.json()
    
    // Cria cliente admin (usa service role key)
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

    // Atualiza o email diretamente
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email: newEmail }
    )

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
```

### 3. Chame a função do frontend:

```typescript
const { data, error } = await supabase.functions.invoke('update-email', {
  body: { 
    userId: user.id, 
    newEmail: 'bezalyelsilva@gmail.com' 
  }
})
```

## Opção 3: Usar SQL Direto (Apenas para Desenvolvimento)

⚠️ **CUIDADO: Use apenas em desenvolvimento. Nunca exponha a service role key no frontend!**

Se você tiver acesso direto ao banco de dados, pode executar:

```sql
UPDATE auth.users
SET email = 'bezalyelsilva@gmail.com',
    email_confirmed_at = NULL
WHERE email = 'lucas@gmail.com';
```

## Solução Temporária no Código

Atualizei o código em `src/pages/SettingsPage.tsx` para tentar diferentes estratégias quando o email atual é inválido. Se ainda não funcionar, use uma das opções acima.

