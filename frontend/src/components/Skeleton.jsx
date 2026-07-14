import React from 'react';

export const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/10 rounded-xl ${className}`} />
);

export const SkeletonStatGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonBlock key={i} className="h-24" />
    ))}
  </div>
);

export const SkeletonRows = ({ rows = 6 }) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonBlock key={i} className="h-14 w-full" />
    ))}
  </div>
);
