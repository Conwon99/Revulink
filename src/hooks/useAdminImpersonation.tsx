import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminImpersonationContextType {
  impersonatedUserId: string | null;
  impersonatedUserName: string | null;
  setImpersonation: (userId: string | null, userName?: string | null) => void;
  clearImpersonation: () => void;
  isImpersonating: boolean;
}

const AdminImpersonationContext = createContext<AdminImpersonationContextType | undefined>(undefined);

export const AdminImpersonationProvider = ({ children }: { children: ReactNode }) => {
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);
  const [impersonatedUserName, setImpersonatedUserName] = useState<string | null>(null);

  const setImpersonation = (userId: string | null, userName?: string | null) => {
    setImpersonatedUserId(userId);
    setImpersonatedUserName(userName || null);
  };

  const clearImpersonation = () => {
    setImpersonatedUserId(null);
    setImpersonatedUserName(null);
  };

  const isImpersonating = impersonatedUserId !== null;

  return (
    <AdminImpersonationContext.Provider value={{
      impersonatedUserId,
      impersonatedUserName,
      setImpersonation,
      clearImpersonation,
      isImpersonating
    }}>
      {children}
    </AdminImpersonationContext.Provider>
  );
};

export const useAdminImpersonation = () => {
  const context = useContext(AdminImpersonationContext);
  if (context === undefined) {
    throw new Error('useAdminImpersonation must be used within an AdminImpersonationProvider');
  }
  return context;
};