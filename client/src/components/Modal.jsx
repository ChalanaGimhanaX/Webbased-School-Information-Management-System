import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div role="dialog" aria-modal="true" aria-label={title} className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto text-on-surface">
        <div className="flex justify-between items-center p-4 border-b border-outline-variant/30">
          <h2 className="text-lg font-bold text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface transition-colors p-1 rounded-md"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
