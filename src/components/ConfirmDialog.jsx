import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', onConfirm, onClose, destructive = false }) => {
    useEffect(() => {
        if (!open) return undefined;
        const handleKeyDown = event => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div className="dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
            <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
                <button className="dialog-close" type="button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
                <span className={`dialog-icon${destructive ? ' dialog-icon-danger' : ''}`}><AlertTriangle size={20} /></span>
                <h2 id="confirm-title">{title}</h2>
                <p id="confirm-message">{message}</p>
                <div className="dialog-actions">
                    <button className="button button-secondary" type="button" onClick={onClose}>Cancel</button>
                    <button className={`button ${destructive ? 'button-danger' : 'button-primary'}`} type="button" onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </section>
        </div>
    );
};

export default ConfirmDialog;