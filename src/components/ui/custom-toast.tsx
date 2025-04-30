
import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  return (
    <div 
      className="bg-[rgba(0,0,0,0.8)] text-gold px-5 py-3 mb-2 border-2 border-gold rounded-lg opacity-100 transition-opacity duration-500"
    >
      {message}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<string[]>([]);
  
  // Listen for toast events from the sonner toast library
  useEffect(() => {
    const originalConsoleLog = console.log;
    
    console.log = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('Toast:')) {
        const message = args[0].replace('Toast:', '').trim();
        setToasts(prev => [...prev, message]);
      }
      originalConsoleLog(...args);
    };
    
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);
  
  const handleDismiss = (index: number) => {
    setToasts(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50">
      {toasts.map((message, index) => (
        <Toast 
          key={index} 
          message={message} 
          onDismiss={() => handleDismiss(index)} 
        />
      ))}
    </div>
  );
};
