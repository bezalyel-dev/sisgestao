-- Função para atualizar email de usuário diretamente no banco
-- Isso resolve o problema quando o email atual é inválido e o Supabase bloqueia a atualização

-- Primeiro, cria uma função RPC para atualizar o email via admin
CREATE OR REPLACE FUNCTION update_user_email_safe(
  user_id UUID,
  new_email TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualiza o email diretamente na tabela auth.users
  -- Nota: Isso requer permissões de admin, então deve ser executado via Admin API
  -- ou configurado como SECURITY DEFINER com permissões adequadas
  
  UPDATE auth.users
  SET 
    email = new_email,
    email_confirmed_at = NULL, -- Marca como não confirmado para forçar confirmação
    updated_at = NOW()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
END;
$$;

-- Alternativamente, se você tiver acesso ao Admin API, pode usar uma Edge Function
-- Por enquanto, vamos melhorar o código frontend para lidar melhor com o erro

