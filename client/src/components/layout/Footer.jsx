import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Phone, Mail, MapPin, Clock, Heart } from 'lucide-react';
import { FaFacebook as Facebook, FaInstagram as Instagram, FaTwitter as Twitter, FaYoutube as Youtube } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Thank you for subscribing to our newsletter! 🚀');
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter section */}
      <div className="bg-gradient-indian">
        <div className="container-custom py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-white">Stay Updated! 🛒</h3>
              <p className="text-orange-100 mt-1">Get the latest deals, offers and new arrivals directly in your inbox.</p>
            </div>
            <form className="flex flex-col sm:flex-row w-full md:w-auto gap-3" onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="w-full sm:w-72 px-4 py-3 rounded-xl bg-white/20 backdrop-blur text-white placeholder-orange-200 border border-white/30 focus:outline-none focus:border-white text-sm"
              />
              <button type="submit" className="w-full sm:w-auto bg-white text-primary-600 font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors text-sm whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-indian rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-base">Ridhi Sidhi</p>
                <p className="text-xs text-primary-400">General Store</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Your trusted neighborhood grocery store since 2010. Quality products at best prices, delivered fresh to your doorstep.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', path: '/' },
                { label: 'All Products', path: '/products' },
                { label: 'About Us', path: '/about' },
                { label: 'Contact Us', path: '/contact' },
                { label: 'My Orders', path: '/my-orders' },
                { label: 'Wishlist', path: '/wishlist' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:pl-1 duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-display font-semibold mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {[
                { label: '🫘 Dals & Pulses', slug: 'dals-pulses' },
                { label: '🫙 Oils & Ghee', slug: 'oils-ghee' },
                { label: '🌾 Flour & Atta', slug: 'flour-atta' },
                { label: '🍚 Rice & Grains', slug: 'rice-grains' },
                { label: '🌶️ Spices & Masalas', slug: 'spices-masalas' },
                { label: '🥜 Dry Fruits & Nuts', slug: 'dry-fruits-nuts' },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/products?category=${cat.slug}`} className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:pl-1 duration-200">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-display font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">Gali, Street Number 3, Milkman Colony, Jodhpur, Rajasthan 342003</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="tel:+916350200450" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">+91 6350 200 450</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="mailto:info@ridhisidhi.com" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">info@ridhisidhi.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">Mon-Sun: 9:00 AM – 9:00 PM</span>
              </li>
            </ul>
            <a
              href="https://wa.me/916350200450?text=Hello%20Ridhi%20Sidhi%20Store%2C%20I%20want%20to%20place%20an%20order!"
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors w-fit"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" /></svg>
              Order on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            © 2024 Ridhi Sidhi General Store. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-current" /> in India 🇮🇳
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
