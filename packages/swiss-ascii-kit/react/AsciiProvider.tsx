import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AsciiContextType {
  ascii: boolean;
  setAscii: (enabled: boolean) => void;
  toggleAscii: () => void;
}

const AsciiContext = createContext<AsciiContextType>({
  ascii: false,
  setAscii: () => {},
  toggleAscii: () => {}
});

export const useAscii = () => {
  const context = useContext(AsciiContext);
  if (!context) {
    throw new Error('useAscii must be used within an AsciiProvider');
  }
  return context;
};

interface AsciiProviderProps {
  children: React.ReactNode;
  defaultAscii?: boolean;
  persistKey?: string; // localStorage key for persistence
}

export default function AsciiProvider({ 
  children, 
  defaultAscii = false,
  persistKey = 'swiss-ascii-mode'
}: AsciiProviderProps) {
  // Initialize state with persistence support
  const [ascii, setAsciiState] = useState(() => {
    if (typeof window === 'undefined') return defaultAscii;
    
    try {
      const stored = localStorage.getItem(persistKey);
      return stored !== null ? JSON.parse(stored) : defaultAscii;
    } catch {
      return defaultAscii;
    }
  });

  const setAscii = useCallback((enabled: boolean) => {
    setAsciiState(enabled);
    
    // Persist to localStorage
    if (typeof window !== 'undefined' && persistKey) {
      try {
        localStorage.setItem(persistKey, JSON.stringify(enabled));
      } catch (error) {
        console.warn('Failed to persist ASCII mode preference:', error);
      }
    }
  }, [persistKey]);

  const toggleAscii = useCallback(() => {
    setAscii(!ascii);
  }, [ascii, setAscii]);

  // Apply data-mode attribute to document
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    if (ascii) {
      document.documentElement.setAttribute('data-mode', 'ascii');
    } else {
      document.documentElement.removeAttribute('data-mode');
    }
    
    // Dispatch custom event for other components to listen to
    const event = new CustomEvent('ascii-mode-change', { 
      detail: { ascii } 
    });
    window.dispatchEvent(event);
  }, [ascii]);

  // Handle system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === persistKey && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          if (typeof newValue === 'boolean' && newValue !== ascii) {
            setAsciiState(newValue);
          }
        } catch {
          // Ignore invalid values
        }
      }
    };

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [ascii, persistKey]);

  // Handle keyboard shortcuts (Ctrl/Cmd + Shift + A)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        toggleAscii();
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    
    return () => {
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [toggleAscii]);

  const contextValue: AsciiContextType = {
    ascii,
    setAscii,
    toggleAscii
  };

  return (
    <AsciiContext.Provider value={contextValue}>
      {children}
    </AsciiContext.Provider>
  );
}