import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

const Toaster = () => {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        style: {
          background: '#fff',
          color: '#333',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
        },
        duration: 3000,
      }}
    />
  );
};

export default Toaster; 