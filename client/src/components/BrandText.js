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
  };

  return (
    <span
      onClick={handleClick}
      className={`font-medium cursor-pointer bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text ${sizes[size]} ${className}`}
    >
      Mōmentum
    </span>
  );
};

export default BrandText;