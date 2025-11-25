import React from 'react';
import { Icons } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl flex flex-col max-h-[90dvh] animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
            <Icons.Close size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};