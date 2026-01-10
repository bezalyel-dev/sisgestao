# Como Traduzir os Emails do Supabase para Português

## Passo a Passo

### 1. Acessar as Configurações de Email

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, vá em **Authentication** (Autenticação)
4. Clique na aba **Email Templates** (Templates de Email)

### 2. Templates que Precisam ser Traduzidos

Os principais templates que precisam de tradução são:

- **Confirm signup** (Confirmação de cadastro)
- **Magic Link** (Link mágico)
- **Change Email Address** (Mudança de email)
- **Reset Password** (Redefinição de senha)
- **Invite user** (Convite de usuário)

## Templates Traduzidos para Português

### 1. Confirm Signup (Confirmação de Cadastro)

**Assunto:**
```
Confirme seu endereço de email
```

**Corpo do Email:**
```html
<h2>Confirme seu endereço de email</h2>

<p>Obrigado por se cadastrar! Por favor, confirme seu endereço de email clicando no link abaixo:</p>

<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>

<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Se você não solicitou este cadastro, pode ignorar este email.</p>

<p>Atenciosamente,<br>Equipe do Sistema</p>
```

### 2. Change Email Address (Mudança de Email)

**Assunto:**
```
Confirme seu novo endereço de email
```

**Corpo do Email:**
```html
<h2>Confirme seu novo endereço de email</h2>

<p>Você solicitou uma alteração do seu endereço de email. Para confirmar o novo email, clique no link abaixo:</p>

<p><a href="{{ .ConfirmationURL }}">Confirmar Novo Email</a></p>

<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Se você não solicitou esta mudança, por favor ignore este email ou entre em contato conosco.</p>

<p>Este link expira em 24 horas.</p>

<p>Atenciosamente,<br>Equipe do Sistema</p>
```

### 3. Reset Password (Redefinição de Senha)

**Assunto:**
```
Redefina sua senha
```

**Corpo do Email:**
```html
<h2>Redefinição de Senha</h2>

<p>Você solicitou a redefinição da sua senha. Clique no link abaixo para criar uma nova senha:</p>

<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>

<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Se você não solicitou a redefinição de senha, por favor ignore este email ou entre em contato conosco imediatamente.</p>

<p>Este link expira em 1 hora por motivos de segurança.</p>

<p>Atenciosamente,<br>Equipe do Sistema</p>
```

### 4. Magic Link (Link Mágico - Login sem Senha)

**Assunto:**
```
Seu link de acesso
```

**Corpo do Email:**
```html
<h2>Acesse sua conta</h2>

<p>Clique no link abaixo para fazer login na sua conta:</p>

<p><a href="{{ .ConfirmationURL }}">Fazer Login</a></p>

<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Este link expira em 1 hora.</p>

<p>Se você não solicitou este acesso, por favor ignore este email.</p>

<p>Atenciosamente,<br>Equipe do Sistema</p>
```

### 5. Invite User (Convite de Usuário)

**Assunto:**
```
Você foi convidado para acessar o sistema
```

**Corpo do Email:**
```html
<h2>Convite para Acessar o Sistema</h2>

<p>Você foi convidado para acessar o sistema. Clique no link abaixo para criar sua conta:</p>

<p><a href="{{ .ConfirmationURL }}">Aceitar Convite</a></p>

<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Após clicar no link, você poderá definir sua senha e começar a usar o sistema.</p>

<p>Atenciosamente,<br>Equipe do Sistema</p>
```

## Variáveis Disponíveis

O Supabase fornece algumas variáveis que você pode usar nos templates:

- `{{ .ConfirmationURL }}` - URL de confirmação/atualização
- `{{ .Email }}` - Endereço de email do usuário
- `{{ .Token }}` - Token de confirmação (geralmente usado em redirecionamentos customizados)
- `{{ .TokenHash }}` - Hash do token (para verificação adicional)
- `{{ .SiteURL }}` - URL base do seu site

## Dicas Importantes

1. **Sempre mantenha as variáveis**: Não remova as variáveis como `{{ .ConfirmationURL }}`, elas são essenciais para o funcionamento.

2. **Teste os emails**: Após configurar, teste enviando emails de teste para verificar se tudo está funcionando.

3. **Personalize conforme necessário**: Você pode personalizar ainda mais os templates adicionando logos, cores da sua marca, etc.

4. **HTML é suportado**: Você pode usar HTML para formatar os emails e torná-los mais bonitos.

## Como Aplicar as Traduções

1. Para cada template acima:
   - Clique no template correspondente no dashboard do Supabase
   - Substitua o conteúdo "Subject" (Assunto) pelo texto traduzido
   - Substitua o conteúdo "Body" (Corpo) pelo HTML traduzido
   - Clique em "Save" (Salvar)

2. Os emails enviados a partir de agora estarão em português!

