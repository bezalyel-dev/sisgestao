import { useLocation } from 'react-router-dom';

const pageTitles: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/import': 'Importar CSV',
  '/reports': 'Relatórios',
  '/settings': 'Configurações',
};

export function Header() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 lg:ml-0 ml-14 lg:ml-0">
          <h1 className="text-lg lg:text-2xl font-semibold text-gray-900 truncate pr-2">{pageTitle}</h1>
        </div>
      </div>
    </header>
  );
}
