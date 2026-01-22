# Templates de Email do Supabase em Português - Prontos para Copiar

## ⚠️ IMPORTANTE: Como Aplicar

1. Acesse: https://supabase.com/dashboard
2. Seu Projeto → Authentication → Email Templates
3. Para cada template abaixo, copie o conteúdo e cole no campo correspondente
4. Clique em "Save" (Salvar)

---

## 1. ✅ Confirm Signup (Confirmação de Cadastro)

### Subject (Assunto):
```
Confirme seu endereço de email
```

### Body (Corpo):
```html
<h2>Confirme seu endereço de email</h2>

<p>Olá!</p>

<p>Obrigado por se cadastrar em nosso sistema. Para completar seu cadastro, por favor confirme seu endereço de email clicando no botão abaixo:</p>

<p style="margin: 20px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirmar Email</a>
</p>

<p>Ou copie e cole este link no seu navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p>Se você não criou esta conta, pode ignorar este email com segurança.</p>

<p>Atenciosamente,<br>Equipe do Sistema</p>
```

---

## 2. 📧 Change Email Address (Mudança de Email)

### Subject (Assunto):
```
Confirme seu novo endereço de email
```

### Body (Corpo):
```html
<h2>Confirme seu novo endereço de email</h2>

<p>Olá!</p>

<p>Você solicitou uma alteração do seu endereço de email. Para confirmar o novo endereço ({{ .Email }}), clique no botão abaixo:</p>

<p style="margin: 20px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirmar Novo Email</a>
</p>

<p>Ou copie e cole este link no seu navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p><strong>Importante:</strong> Este link expira em 24 horas.</p>

<p>Se você não solicitou esta mudança, por favor ignore este email ou entre em contato conosco imediatamente.</p>

<p>Atenciosamente,<br>Equipe do Sistema</p>
```

---

## 3. 🔑 Reset Password (Redefinição de Senha)

### Subject (Assunto):
```
Redefina sua senha
```

### Body (Corpo):
```html
<h2>Redefinição de Senha</h2>

<p>Olá!</p>

<p>Você solicitou a redefinição da senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>

<p style="margin: 20px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Redefinir Senha</a>
</p>

<p>Ou copie e cole este link no seu navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p><strong>Importante:</strong></p>
<ul>
  <li>Este link expira em 1 hora por motivos de segurança</li>
  <li>Use uma senha forte com pelo menos 6 caracteres</li>
  <li>Se você não solicitou a redefinição de senha, ignore este email ou entre em contato conosco imediatamente</li>
</ul>

<p>Atenciosamente,<br>Equipe do Sistema</p>
```

---

## 4. ✨ Magic Link (Link Mágico - Login sem Senha)

### Subject (Assunto):
```
Seu link de acesso
```

### Body (Corpo):
```html
<h2>Acesse sua conta</h2>

<p>Olá!</p>

<p>Você solicitou um link de acesso. Clique no botão abaixo para fazer login na sua conta:</p>

<p style="margin: 20px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Fazer Login</a>
</p>

<p>Ou copie e cole este link no seu navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p><strong>Atenção:</strong> Este link expira em 1 hora.</p>

<p>Se você não solicitou este acesso, por favor ignore este email.</p>

<p>Atenciosamente,<br>Equipe do Sistema</p>
```

---

## 5. 👥 Invite User (Convite de Usuário)

### Subject (Assunto):
```
Você foi convidado para acessar o sistema
```

### Body (Corpo):
```html
<h2>Convite para Acessar o Sistema</h2>

<p>Olá!</p>

<p>Você foi convidado para acessar nosso sistema. Clique no botão abaixo para criar sua conta:</p>

<p style="margin: 20px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Aceitar Convite e Criar Conta</a>
</p>

<p>Ou copie e cole este link no seu navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p>Após clicar no link, você poderá definir sua senha e começar a usar o sistema imediatamente.</p>

<p>Atenciosamente,<br>Equipe do Sistema</p>
```

---

## 📝 Notas Finais

- **Nunca remova as variáveis**: `{{ .ConfirmationURL }}`, `{{ .Email }}`, etc. são necessárias para o funcionamento
- **Teste após configurar**: Envie emails de teste para verificar se está tudo correto
- **Personalize**: Você pode adicionar cores, logos ou outras informações da sua marca
- **HTML suportado**: Todos os templates acima usam HTML básico para melhor formatação

## 🎨 Personalização Adicional (Opcional)

Se quiser adicionar estilos mais avançados, você pode envolver o conteúdo em uma div com estilos inline:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <!-- Conteúdo do email aqui -->
</div>
```

