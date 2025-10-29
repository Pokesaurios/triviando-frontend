// hooks/useClipboard.ts
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseClipboardReturn {
  copied: boolean;
  copyToClipboard: (text: string, successMessage?: string) => Promise<void>;
}

export const useClipboard = (resetDelay: number = 2000): UseClipboardReturn => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string, successMessage = 'Copiado al portapapeles') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), resetDelay);
    } catch (error) {
      toast.error('Error al copiar');
      console.error('Error copying to clipboard:', error);
    }
  }, [resetDelay]);

  return {
    copied,
    copyToClipboard
  };
};