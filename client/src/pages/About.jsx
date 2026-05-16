import { Store, ShieldCheck, Truck, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    {
      icon: ShieldCheck,
      title: 'Quality Assured',
      desc: 'We source only the highest quality products directly from trusted farmers and brands.',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      desc: 'Your groceries delivered to your doorstep within 24 hours, ensuring freshness.',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Heart,
      title: 'Customer First',
      desc: 'Your satisfaction is our priority. Easy returns and dedicated customer support.',
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ];

  return (
    <div className="bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-indian py-20 px-4 text-center">
        <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
          <Store className="w-10 h-10 text-primary-500 transform -rotate-12 hover:rotate-0 transition-transform duration-300" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4">About Ridhi Sidhi</h1>
        <p className="text-orange-100 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          Your neighborhood's most trusted general store, now at your fingertips. We bring quality, convenience, and care straight to your home.
        </p>
      </div>

      {/* Story Section */}
      <div className="container-custom py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-4xl mx-auto -mt-24 relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
            <p>
              Established in 2010, Ridhi Sidhi General Store began as a humble neighborhood shop with a simple mission: to provide the community with fresh, high-quality groceries at fair prices.
            </p>
            <p>
              Over the years, we've grown alongside our neighborhood, learning exactly what our customers need. From the finest Basmati rice and purest ghee to everyday household essentials, our shelves have always reflected the demands of the families we serve.
            </p>
            <p>
              Today, we are taking a leap forward by bringing our store online. This platform is our promise to maintain the trust and quality you've known us for, while offering the convenience of modern home delivery. 
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container-custom py-12">
        <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-12">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-16 h-16 ${val.bg} ${val.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{val.title}</h3>
                <p className="text-gray-600 leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="container-custom mt-12">
        <div className="bg-gray-900 rounded-3xl p-10 md:p-16 text-center text-white">
          <Clock className="w-12 h-12 text-primary-500 mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold mb-4">Ready to start shopping?</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Experience the finest quality groceries delivered straight to your door. Freshness guaranteed.
          </p>
          <Link to="/products" className="btn-primary text-lg px-8 py-4">
            Explore Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
