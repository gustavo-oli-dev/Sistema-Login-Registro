import React from 'react';
import './Toast.css';

function Toast({ mensagem, tipo, onClose }) {
  return (
    <div className={`toast toast-${tipo}`} role="alert">
      <span className="toast-msg">{mensagem}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Fechar">
        ×
      </button>
    </div>
  );
}

export default Toast;
