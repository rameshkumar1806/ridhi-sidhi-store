const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-gray-200 border-t-primary-500 rounded-full animate-spin`} />
    </div>
  );
};

export const FullPageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
    <LoadingSpinner size="xl" />
    <p className="text-gray-500 font-medium animate-pulse">{message}</p>
  </div>
);

export const InlineLoader = () => (
  <div className="flex items-center justify-center py-20">
    <LoadingSpinner size="lg" />
  </div>
);

export default LoadingSpinner;
