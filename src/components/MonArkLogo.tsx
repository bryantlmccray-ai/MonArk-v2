
import React from 'react';

interface MonArkLogoProps {
  className?: string;
}

export const MonArkLogo: React.FC<MonArkLogoProps> = ({ className = "h-24 w-24" }) => {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 85V25L50 15L85 25V85H75V35L50 28L25 35V85H15Z"
          fill="#FFC700"
          className="drop-shadow-lg"
        />
        <path
          d="M35 85V55L50 45L65 55V85H55V60L50 55L45 60V85H35Z"
          fill="#FFD700"
        />
      </svg>
    </div>
  );
};
