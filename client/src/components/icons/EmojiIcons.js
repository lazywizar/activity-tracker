import React from 'react';
import { 
  BsEmojiLaughingFill, 
  BsEmojiSmileFill,
  BsEmojiNeutralFill,
  BsEmojiFrownFill 
} from 'react-icons/bs';

const getColorFromProgress = (ratio) => {
  // Create a gradient from red to yellow to green
  if (ratio >= 0.9) return '#22c55e';  // Bright green
  if (ratio >= 0.75) return '#4ade80'; // Light green
  if (ratio >= 0.6) return '#eab308';  // Yellow
  if (ratio >= 0.4) return '#f97316';  // Orange
  return '#ef4444';                    // Red
};

const getEmojiSize = (ratio) => {
  // Make emoji slightly larger when progress is better
  if (ratio >= 0.9) return 24;
  if (ratio >= 0.75) return 22;
  return 20;
};

export const SmileEmoji = ({ progress }) => {
  const ratio = progress / 100;
  const color = getColorFromProgress(ratio);
  const size = getEmojiSize(ratio);
  
  if (ratio >= 0.9) {
    return <BsEmojiLaughingFill size={size} color={color} className="transition-all duration-300" />;
  }
  return <BsEmojiSmileFill size={size} color={color} className="transition-all duration-300" />;
};

export const MehEmoji = ({ progress }) => {
  const ratio = progress / 100;
  const color = getColorFromProgress(ratio);
  const size = getEmojiSize(ratio);
  
  return <BsEmojiNeutralFill size={size} color={color} className="transition-all duration-300" />;
};

export const FrownEmoji = ({ progress }) => {
  const ratio = progress / 100;
  const color = getColorFromProgress(ratio);
  const size = getEmojiSize(ratio);
  
  return <BsEmojiFrownFill size={size} color={color} className="transition-all duration-300" />;
};
