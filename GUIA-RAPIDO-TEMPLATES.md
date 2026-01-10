# Guia Rápido: O Que Colocar em Cada Opção

## 📋 Mapeamento Direto - Opções da Tela vs Templates

### 1. **Confirm sign up** (Confirmação de Cadastro)

**Assunto:**
```
Confirme seu endereço de email
```

**Corpo (HTML):**
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

### 2. **Invite user** (Convite de Usuário)

**Assunto:**
```
Você foi convidado para acessar o sistema
```

**Corpo (HTML):**
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

### 3. **Magic link** (Link Mágico - Login sem Senha)

**Assunto:**
```
Seu link de acesso
```

**Corpo (HTML):**
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

### 4. **Change email address** (Mudança de Email) ⭐ IMPORTANTE PARA VOCÊ

**Assunto:**
```
Confirme seu novo endereço de email
```

**Corpo (HTML):**
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

### 5. **Reset password** (Redefinição de Senha) ⭐ IMPORTANTE PARA VOCÊ

**Assunto:**
```
Redefina sua senha
```

**Corpo (HTML):**
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

### 6. **Reauthentication** (Reautenticação)

**Nota:** Este template geralmente não é usado com frequência. Se você quiser configurá-lo também, use:

**Assunto:**
```
Confirme sua identidade
```

**Corpo (HTML):**
```html
<h2>Confirmação de Identidade Necessária</h2>

<p>Olá!</p>

<p>Você está tentando realizar uma ação sensível que requer confirmação de identidade. Por favor, clique no botão abaixo para confirmar:</p>

<p style="margin: 20px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirmar Identidade</a>
</p>

<p>Ou copie e cole este link no seu navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p><strong>Importante:</strong> Este link expira em 1 hora.</p>

<p>Se você não solicitou esta ação, ignore este email imediatamente.</p>

<p>Atenciosamente,<br>Equipe do Sistema</p>
```

---

## 🎯 Passo a Passo Simples

1. **Clique na opção** que você quer configurar (ex: "Change email address")
2. Você verá dois campos:
   - **Subject** (Assunto) - Cole apenas o texto do assunto
   - **Body** (Corpo) - Cole todo o HTML
3. **Copie e cole** o conteúdo correspondente acima
4. Clique em **"Save"** (Salvar)
5. Repita para as outras opções que você usa

## ⚠️ IMPORTANTE

- **NÃO remova** as variáveis como `{{ .ConfirmationURL }}` ou `{{ .Email }}` - elas são necessárias!
- Os templates estão em **português** e prontos para uso
- Os emails mais importantes para você são: **Change email address** e **Reset password**

