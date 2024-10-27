import React from 'react';

const BrandText = ({ size = 'default', className = '' }) => {
  const sizes = {
    default: 'text-xl',
    large: 'text-2xl',
    small: 'text-l'
  };

  return (
    <span className={`
      ${sizes[size]}
      font-bold
      bg-gradient-to-r
      from-purple-600
      to-purple-500
      bg-clip-text
      text-transparent
      ${className}
    `}>
      M
      <span className="font-medium">ō</span>
      mentum
    </span>
  );
};

export default BrandText;