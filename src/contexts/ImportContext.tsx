import { createContext, useContext, useState, ReactNode } from 'react';

interface ImportContextType {
  isImporting: boolean;
  setIsImporting: (value: boolean) => void;
}

const ImportContext = createContext<ImportContextType | undefined>(undefined);

export function ImportProvider({ children }: { children: ReactNode }) {
  const [isImporting, setIsImporting] = useState(false);

  return (
    <ImportContext.Provider value={{ isImporting, setIsImporting }}>
      {children}
    </ImportContext.Provider>
  );
}

export function useImport() {
  const context = useContext(ImportContext);
  if (context === undefined) {
    throw new Error('useImport deve ser usado dentro de ImportProvider');
  }
  return context;
}

