import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'error' | 'warning' | 'success';
}

export function Modal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Anuluj',
  type = 'info',
}: ModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'error',
          iconColor: 'text-error',
          bg: 'bg-error/10',
          border: 'border-error/20',
          btnClass: 'bg-error text-error-container hover:bg-error/80',
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: 'text-tertiary',
          bg: 'bg-tertiary/10',
          border: 'border-tertiary/20',
          btnClass: 'bg-tertiary text-on-tertiary hover:bg-tertiary/80',
        };
      case 'success':
        return {
          icon: 'check_circle',
          iconColor: 'text-primary',
          bg: 'bg-primary/10',
          border: 'border-primary/20',
          btnClass: 'bg-primary text-on-primary hover:bg-primary/80',
        };
      default:
        return {
          icon: 'info',
          iconColor: 'text-primary',
          bg: 'bg-surface-container-high',
          border: 'border-outline-variant/20',
          btnClass: 'bg-primary text-on-primary hover:bg-primary/80',
        };
    }
  };

  const styles = getTypeStyles();

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`max-w-md w-full bg-surface shadow-2xl rounded-3xl border ${styles.border} overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className={`p-6 ${styles.bg} flex flex-col items-center text-center space-y-4`}>
          <span className={`material-symbols-outlined text-5xl ${styles.iconColor}`}>
            {styles.icon}
          </span>
          <h2 className="text-2xl font-bold headline-font">{title}</h2>
          <p className="text-on-surface-variant font-body">{message}</p>
        </div>
        
        <div className="p-6 bg-surface flex items-center justify-center gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-full font-bold font-label uppercase tracking-wider text-sm transition-all text-on-surface-variant hover:bg-surface-container active:scale-95 border border-outline-variant/20"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-8 py-3 rounded-full font-bold font-label uppercase tracking-wider text-sm transition-all shadow-lg active:scale-95 ${styles.btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
