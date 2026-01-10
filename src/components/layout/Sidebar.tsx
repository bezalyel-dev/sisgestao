import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, LogOut, Settings, X, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useImport } from '../../contexts/ImportContext';
import { useState } from 'react';
import { Modal } from '../common/Modal';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/import', label: 'Importar CSV', icon: Upload },
  { path: '/reports', label: 'Relatórios', icon: FileText },
  { path: '/settings', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { isImporting } = useImport();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const handleSignOut = async () => {
    if (isImporting) {
      setPendingNavigation('/logout'); // Usa um valor especial para logout
      setShowNavigationModal(true);
      return;
    }
    await performSignOut();
  };

  const performSignOut = async () => {
    await signOut();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // Se está na mesma página, apenas fecha o menu mobile
    if (location.pathname === path) {
      setIsMobileMenuOpen(false);
      return;
    }

    // Se há importação em andamento, mostra modal
    if (isImporting) {
      e.preventDefault();
      setPendingNavigation(path);
      setShowNavigationModal(true);
      return;
    }

    setIsMobileMenuOpen(false);
  };

  const handleConfirmNavigation = async () => {
    if (pendingNavigation === '/logout') {
      await performSignOut();
    } else if (pendingNavigation) {
      navigate(pendingNavigation);
      setIsMobileMenuOpen(false);
    }
    setPendingNavigation(null);
  };

  const handleCancelNavigation = () => {
    setPendingNavigation(null);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col shadow-2xl`}
      >
        {/* Close Button (Mobile only) */}
        <div className="lg:hidden flex justify-end p-4 border-b border-purple-700/50">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-purple-800/50 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Logo/Title */}
        <div className="p-6 border-b border-purple-700/30">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
            Gestão de Transações
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={(e) => handleLinkClick(e, item.path)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105 font-semibold'
                        : 'text-purple-100 hover:bg-purple-800/40 hover:text-white hover:translate-x-1'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-purple-700/30">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-purple-100 bg-purple-800/30 hover:bg-red-600 hover:text-white transition-all duration-200 hover:shadow-lg hover:scale-105 font-medium border border-purple-700/50 hover:border-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Modal de Aviso de Navegação */}
      <Modal
        isOpen={showNavigationModal}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
        title="⚠️ Importação em Andamento"
        message={
          pendingNavigation === '/logout'
            ? `Uma importação está em andamento. Se você sair do sistema agora, a importação será interrompida e os dados não serão salvos.\n\nDeseja realmente continuar e cancelar a importação?`
            : `Uma importação está em andamento. Se você sair desta página agora, a importação será interrompida e os dados não serão salvos.\n\nDeseja realmente continuar e cancelar a importação?`
        }
        confirmText="Sim, Continuar"
        cancelText="Cancelar"
        variant="warning"
      />
    </>
  );
}
