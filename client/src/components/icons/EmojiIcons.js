import React from 'react';

export const SmileEmoji = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="2"/>
    <path d="M6.5 12.5C6.5 12.5 7.5 14 10 14C12.5 14 13.5 12.5 13.5 12.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="7" cy="8" r="1" fill={color}/>
    <circle cx="13" cy="8" r="1" fill={color}/>
  </svg>
);

export const MehEmoji = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="2"/>
    <line x1="7" y1="12" x2="13" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="7" cy="8" r="1" fill={color}/>
    <circle cx="13" cy="8" r="1" fill={color}/>
  </svg>
);

export const FrownEmoji = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="2"/>
    <path d="M6.5 13.5C6.5 13.5 7.5 12 10 12C12.5 12 13.5 13.5 13.5 13.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="7" cy="8" r="1" fill={color}/>
    <circle cx="13" cy="8" r="1" fill={color}/>
  </svg>
);
