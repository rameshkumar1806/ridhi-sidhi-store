import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-4">
      <div className="text-center max-w-lg mx-auto">
        {/* Animated Graphic */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <div className="absolute inset-0 bg-orange-100 rounded-full animate-pulse opacity-50"></div>
          <div className="absolute inset-4 bg-orange-200 rounded-full animate-pulse opacity-50" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-9xl font-display font-black text-primary-500 drop-shadow-md">
              404
            </h1>
          </div>
          
          {/* Decorative floating elements */}
          <div className="absolute top-10 left-0 text-3xl animate-bounce-subtle">🛒</div>
          <div className="absolute bottom-10 right-10 text-3xl animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>🍎</div>
          <div className="absolute top-1/2 -right-5 text-4xl animate-bounce-subtle" style={{ animationDelay: '1s' }}>🍞</div>
        </div>

        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Looks like you've wandered into an empty aisle. The page you're looking for has been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto btn-outline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>
          
          <Link 
            to="/"
            className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> Back to Home
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-4">Popular Categories:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Dals & Pulses', slug: 'dals-pulses' },
              { name: 'Oils & Ghee', slug: 'oils-ghee' },
              { name: 'Spices', slug: 'spices-masalas' },
              { name: 'Dry Fruits', slug: 'dry-fruits-nuts' }
            ].map(cat => (
              <Link 
                key={cat.slug} 
                to={`/products?category=${cat.slug}`}
                className="px-4 py-2 bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-600 rounded-full text-sm font-medium transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
