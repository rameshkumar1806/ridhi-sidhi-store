import React from 'react';

export const CategorySkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="w-full aspect-square bg-gray-200/80 rounded-2xl border border-gray-100 skeleton mb-3"></div>
          <div className="h-4 w-16 bg-gray-200 skeleton rounded"></div>
        </div>
      ))}
    </div>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="card flex flex-col h-full relative border border-gray-100 overflow-hidden bg-white">
      {/* Image Area */}
      <div className="aspect-square w-full bg-gray-200/50 skeleton p-6"></div>
      
      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 border-t border-gray-50 bg-gray-50/50 space-y-3">
        {/* Brand */}
        <div className="h-3 w-1/4 bg-gray-200 skeleton rounded"></div>
        {/* Title */}
        <div className="space-y-1">
          <div className="h-4 w-full bg-gray-200 skeleton rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 skeleton rounded"></div>
        </div>
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-12 bg-gray-200 skeleton rounded"></div>
          <div className="h-3 w-8 bg-gray-200 skeleton rounded"></div>
        </div>
        {/* Quantity/Stock */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-14 bg-gray-200 skeleton rounded"></div>
          <div className="h-4 w-16 bg-gray-200 skeleton rounded"></div>
        </div>
        {/* Price & Cart button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="space-y-1 w-1/3">
            <div className="h-5 bg-gray-200 skeleton rounded"></div>
            <div className="h-3 bg-gray-200 skeleton rounded w-3/4"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 skeleton rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};
