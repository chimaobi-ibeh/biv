'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX, FiInfo } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode }> = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      icon: <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      icon: <FiAlertCircle className="text-red-500 text-xl flex-shrink-0" />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      icon: <FiInfo className="text-blue-500 text-xl flex-shrink-0" />,
    },
  };

  const { bg, border, icon } = styles[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${bg} border ${border} rounded-xl shadow-lg p-4 flex items-start gap-3`}>
        {icon}
        <p className="text-sm text-gray-800 flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <FiX />
        </button>
      </div>
    </div>
  );
}

// ── Hook for managing toasts ──

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ marginTop: index * 4 }}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );

  return { addToast, ToastContainer };
}