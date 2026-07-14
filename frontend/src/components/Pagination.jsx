import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-white/60">
      <span>Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1} onClick={() => onChange(page - 1)}
          className="p-2 rounded-lg bg-white/10 disabled:opacity-30 hover:bg-white/20"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          disabled={page >= totalPages} onClick={() => onChange(page + 1)}
          className="p-2 rounded-lg bg-white/10 disabled:opacity-30 hover:bg-white/20"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
