'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Trash2, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${
                  variant === 'danger' ? 'bg-red-50 text-red-600' :
                  variant === 'warning' ? 'bg-orange-50 text-orange-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {variant === 'danger' ? <Trash2 size={24} /> :
                   variant === 'warning' ? <AlertCircle size={24} /> :
                   <HelpCircle size={24} />}
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900 leading-none">{title}</h3>
                <p className="text-sm font-medium text-gray-400 leading-relaxed">{description}</p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${
                    variant === 'danger' ? 'bg-red-600 shadow-red-200 hover:bg-red-700' :
                    variant === 'warning' ? 'bg-orange-600 shadow-orange-200 hover:bg-orange-700' :
                    'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
