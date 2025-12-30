// src/components/ui/sonner.jsx
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        style: {
          backgroundColor: '#25c964',
          color: 'white',
          border: 'none',
          borderRadius: '0.75rem',
        },
        descriptionStyle: { 
          color: 'white' 
        },
        duration: 3000,
        closeButton: true,
      }}
      className="z-50"
    />
  );
}