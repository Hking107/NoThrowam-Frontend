import React, { createContext, useContext, ReactNode } from "react";
import type Lenis from "lenis";

interface LenisContextType {
  lenis: Lenis | null;
  isEnabled: boolean;
  enableLenis: () => void;
  disableLenis: () => void;
}

const LenisContext = createContext<LenisContextType | undefined>(undefined);

export const LenisProvider: React.FC<{
  children: ReactNode;
  lenisInstance: Lenis | null;
}> = ({ children, lenisInstance }) => {
  const [isEnabled, setIsEnabled] = React.useState(true);

  const enableLenis = React.useCallback(() => {
    if (lenisInstance) {
      lenisInstance.start();
      setIsEnabled(true);
    }
  }, [lenisInstance]);

  const disableLenis = React.useCallback(() => {
    if (lenisInstance) {
      lenisInstance.stop();
      setIsEnabled(false);
    }
  }, [lenisInstance]);

  return (
    <LenisContext.Provider
      value={{
        lenis: lenisInstance,
        isEnabled,
        enableLenis,
        disableLenis,
      }}
    >
      {children}
    </LenisContext.Provider>
  );
};

export const useLenis = (): LenisContextType => {
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error("useLenis must be used within a LenisProvider");
  }
  return context;
};
