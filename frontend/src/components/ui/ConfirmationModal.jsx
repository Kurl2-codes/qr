import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Trash2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className={clsx(
                                "p-3 rounded-xl",
                                type === 'danger' ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
                            )}>
                                {type === 'danger' ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <h3 className="text-xl font-header font-bold text-slate-900 mb-2">{title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            {message}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={clsx(
                                    "flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white transition-colors shadow-lg",
                                    type === 'danger' ? "bg-red-500 hover:bg-red-600 shadow-red-200" : "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                                )}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
