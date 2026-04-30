import React, { createContext, useContext, ReactNode } from "react";
import type Lenis from "lenis";

interface LenisContextType {
  lenis: Lenis | null;
  isEnabled: boolean;
  enableLenis: () => void;
  disableLenis: () => void;
}

const LenisContext = createContext<LenisContextType | undefined>(undefined);

// Reference-counted lock so nested modals don't race each other.
// The body scroll is only re-enabled when ALL modals have released their lock.
let scrollLockCount = 0;

export const LenisProvider: React.FC<{
  children: ReactNode;
  lenisInstance: Lenis | null;
}> = ({ children, lenisInstance }) => {
  const [isEnabled, setIsEnabled] = React.useState(true);

  const disableLenis = React.useCallback(() => {
    scrollLockCount++;
    if (scrollLockCount === 1) {
      // First caller — actually lock scroll
      if (lenisInstance) {
        lenisInstance.stop();
        setIsEnabled(false);
      }
      document.body.style.overflow = "hidden";
    }
  }, [lenisInstance]);

  const enableLenis = React.useCallback(() => {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      // Last modal released — unlock scroll
      if (lenisInstance) {
        lenisInstance.start();
        setIsEnabled(true);
      }
      document.body.style.overflow = "";
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
