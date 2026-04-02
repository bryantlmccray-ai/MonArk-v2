import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface EditBackButtonProps {
  onClick: () => void;
  label?: string;
}

export const EditBackButton: React.FC<EditBackButtonProps> = ({ onClick, label = 'Cancel' }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
    aria-label={label}
  >
    <ArrowLeft size={16} />
    <span>{label}</span>
  </button>
);
