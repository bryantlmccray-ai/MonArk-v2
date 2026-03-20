import React, { useState } from 'react';
import { WaitlistModal } from '@/components/demo/WaitlistModal';
import { useNavigate } from 'react-router-dom';

const Waitlist = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <WaitlistModal isOpen={isOpen} onClose={handleClose} sourcePage="direct-link" />
    </div>
  );
};

export default Waitlist;
