import React from 'react';
import { useNavigate } from 'react-router-dom';

const BrandText = ({ size = 'default', className = '' }) => {
  const navigate = useNavigate();

  const sizes = {
    default: 'text-xl',
    large: 'text-2xl',
    small: 'text-l'
  };

  const handleClick = () => {
    navigate('/');
    // If you want to also force a refresh, you can uncomment the next line
    // window.location.reload();
  };

  return (
    <span
      onClick={handleClick}
      className={`
        ${sizes[size]}
        font-bold
        bg-gradient-to-r
        from-purple-600
        to-purple-500
        bg-clip-text
        text-transparent
        cursor-pointer
        hover:opacity-80
        transition-opacity
        ${className}
      `}
    >
      M
      <span className="font-medium">ō</span>
      mentum
    </span>
  );
};

export default BrandText;