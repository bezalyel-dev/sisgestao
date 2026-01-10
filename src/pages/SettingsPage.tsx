import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { User, Mail, Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email('Email inválido'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      email: user?.email || '',
      displayName: user?.user_metadata?.display_name || user?.user_metadata?.full_name || '',
    },
  });

  // Atualiza valores padrão quando user mudar
  useEffect(() => {
    if (user) {
      resetProfile({
        email: user.email || '',
        displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || '',
      });
    }
  }, [user, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onUpdateProfile = async (data: UpdateProfileFormData) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const currentDisplayName = user.user_metadata?.display_name || user.user_metadata?.full_name || '';
      const newDisplayName = data.displayName?.trim() || '';
      const currentEmail = user.email || '';
      const newEmail = data.email?.trim() || '';

      const emailChanged = newEmail && newEmail !== currentEmail;
      const displayNameChanged = newDisplayName !== currentDisplayName;

      if (!emailChanged && !displayNameChanged) {
        setError('Nenhuma alteração foi feita.');
        setLoading(false);
        return;
      }

      // Valida email antes de tentar atualizar
      if (emailChanged) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
          setError('Email inválido. Por favor, verifique o formato do email.');
          setLoading(false);
          return;
        }
      }

      // Atualiza apenas o nome se apenas ele mudou
      if (displayNameChanged && !emailChanged) {
        const { error: updateError, data: updatedUser } = await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            display_name: newDisplayName,
            full_name: newDisplayName,
          },
        });

        if (updateError) {
          throw new Error(updateError.message || 'Erro ao atualizar nome');
        }

        setSuccess('Nome atualizado com sucesso!');
        setTimeout(() => {
          resetProfile({
            email: updatedUser.user?.email || currentEmail,
            displayName: updatedUser.user?.user_metadata?.display_name || updatedUser.user?.user_metadata?.full_name || newDisplayName,
          });
        }, 500);
        return;
      }

      // Atualiza email (e nome se necessário)
      if (emailChanged) {
        console.log('Tentando atualizar email de', currentEmail, 'para', newEmail);
        
        // Estratégia: Tenta atualizar APENAS o email primeiro (sem metadata)
        // Isso evita problemas com validação do email atual quando há metadata
        let updateResult = await supabase.auth.updateUser({
          email: newEmail,
        });

        // Se falhou, tenta novamente com uma abordagem diferente
        if (updateResult.error) {
          const errorMsg = updateResult.error.message.toLowerCase();
          console.error('Erro ao atualizar email (tentativa 1):', updateResult.error);

          // Se o erro menciona que o email atual é inválido, pode ser problema de validação do Supabase
          // Nesse caso, mostramos uma mensagem mais útil
          if (errorMsg.includes('invalid')) {
            // Verifica se é o email antigo ou novo que é inválido
            if (errorMsg.includes(currentEmail.toLowerCase()) || errorMsg.includes('current')) {
              // Email atual é inválido - tenta forçar a atualização
              console.log('Email atual parece ser inválido, tentando atualização forçada...');
              
              // Tenta novamente, mas desta vez com data vazia para ver se passa
              updateResult = await supabase.auth.updateUser({
                email: newEmail,
                data: {},
              });

              if (updateResult.error) {
                console.error('Erro ao atualizar email (tentativa 2):', updateResult.error);
                // Se ainda falhar, mostra o erro original do Supabase
                throw new Error(`Não foi possível atualizar o email. O sistema detectou que o email atual (${currentEmail}) pode estar inválido. Erro detalhado: ${updateResult.error.message}. Por favor, tente fazer logout, criar uma nova conta com o email bezalyelsilva@gmail.com, ou entre em contato com o suporte técnico.`);
              }
            } else if (errorMsg.includes(newEmail.toLowerCase())) {
              throw new Error('O novo email fornecido (bezalyelsilva@gmail.com) é inválido. Por favor, verifique o formato e tente novamente.');
            } else {
              throw new Error(`Email inválido: ${updateResult.error.message}`);
            }
          } else if (errorMsg.includes('already') || errorMsg.includes('exists') || errorMsg.includes('registered') || errorMsg.includes('taken')) {
            throw new Error('Este email (bezalyelsilva@gmail.com) já está sendo usado por outra conta. Por favor, use outro email ou faça login com a conta que usa esse email.');
          } else {
            // Outro tipo de erro - mostra mensagem detalhada
            throw new Error(`Erro ao atualizar email: ${updateResult.error.message}. Por favor, verifique se o email está correto e tente novamente.`);
          }
        }

        // Se chegou aqui, o email foi atualizado com sucesso
        console.log('Email atualizado com sucesso!');
        
        // Agora atualiza o nome se necessário
        if (displayNameChanged && updateResult.data?.user) {
          const nameUpdateResult = await supabase.auth.updateUser({
            data: {
              ...updateResult.data.user.user_metadata,
              display_name: newDisplayName,
              full_name: newDisplayName,
            },
          });

          if (nameUpdateResult.error) {
            console.warn('Email atualizado mas falhou ao atualizar nome:', nameUpdateResult.error);
            // Não falha se só o nome não atualizou, pois o email já foi atualizado com sucesso
          }
        }

        // Sucesso!
        const finalUser = updateResult.data?.user;
        setSuccess(`Email atualizado com sucesso! Um email de confirmação foi enviado para ${newEmail}. Verifique sua caixa de entrada (incluindo spam) e clique no link de confirmação para finalizar a atualização.`);
        
        setTimeout(() => {
          resetProfile({
            email: finalUser?.email || newEmail,
            displayName: finalUser?.user_metadata?.display_name || finalUser?.user_metadata?.full_name || newDisplayName || currentDisplayName,
          });
        }, 500);
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil. Verifique os dados e tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Primeiro, verifica a senha atual fazendo login
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: data.currentPassword,
      });

      if (verifyError) {
        throw new Error('Senha atual incorreta');
      }

      // Atualiza a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message || 'Erro ao atualizar senha');
      }

      setSuccess('Senha alterada com sucesso!');
      resetPassword();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e segurança da conta</p>
      </div>

      {/* Informações do Usuário Logado */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-full">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email || 'Usuário'}
            </h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Conta criada em: {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Mensagens de Sucesso/Erro */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Sucesso</p>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Erro</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Perfil
              </div>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'password'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Alterar Senha
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Perfil */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-6 max-w-2xl">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...registerProfile('displayName', {
                      validate: (value) => {
                        if (value && value.trim() && value.trim().length < 2) {
                          return 'Nome deve ter no mínimo 2 caracteres';
                        }
                        return true;
                      },
                    })}
                    type="text"
                    id="displayName"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Seu nome completo"
                    disabled={loading}
                  />
                </div>
                {profileErrors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.displayName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...registerProfile('email', {
                      validate: (value) => {
                        if (!value || !value.trim()) {
                          return 'Email é obrigatório';
                        }
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value.trim())) {
                          return 'Email inválido';
                        }
                        return true;
                      },
                    })}
                    type="email"
                    id="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="seu@email.com"
                    disabled={loading}
                  />
                </div>
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Ao alterar o email, um link de confirmação será enviado para o novo endereço
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => resetProfile()}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Tab Senha */}
          {activeTab === 'password' && (
            <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-6 max-w-2xl">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha Atual
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...registerPassword('currentPassword')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Digite sua senha atual"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...registerPassword('newPassword')}
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...registerPassword('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Confirme a nova senha"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => resetPassword()}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Alterar Senha
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
