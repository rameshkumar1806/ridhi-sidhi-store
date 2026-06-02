import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ArrowRight, Truck, ShieldCheck, Clock, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchFeaturedProducts, fetchCategories } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { CategorySkeleton, ProductGridSkeleton } from '../components/common/Skeletons';
import api from '../services/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Home = () => {
  const dispatch = useDispatch();
  const { featured, bestSellers, trending, categories, loading } = useSelector((state) => state.products);

  const [heroBanners, setHeroBanners] = useState([
    {
      image: '/images/banner_atta.png',
      title: 'Quality Atta & Flours',
      subtitle: 'Premium quality wheat flour for soft & healthy rotis',
      link: '/products?category=flour-atta',
    },
    {
      image: '/images/banner_oils.png',
      title: 'Pure Cooking Oils',
      subtitle: 'Healthy and natural extracted cooking oils',
      link: '/products?category=oils-ghee',
    },
    {
      image: '/images/dry_fruits_banner.png',
      title: 'Fresh Dry Fruits',
      subtitle: 'Premium quality healthy nuts & dry fruits',
      link: '/products?category=dry-fruits-nuts',
    },
    {
      image: '/images/banner_dal.png',
      title: 'Premium Dal Collection',
      subtitle: 'Wholesome and unpolished nutritious pulses',
      link: '/products?category=dals-pulses',
    },
  ]);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());

    const loadBanners = async () => {
      try {
        const { data } = await api.get('/banners');
        if (data?.success && data.data?.length > 0) {
          // Frontend validation: Prevent duplicate banners from being displayed
          const seen = new Set();
          const uniqueBanners = [];
          for (const banner of data.data) {
            const key = (banner.title || '').trim().toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);

              // Map placeholder/database images to high-quality local assets
              let displayImage = banner.image;
              if (key.includes('atta') || key.includes('flour')) {
                displayImage = '/images/banner_atta.png';
              } else if (key.includes('dry fruits') || key.includes('nuts')) {
                displayImage = '/images/dry_fruits_banner.png';
              } else if (key.includes('ghee') || key.includes('oil') || key.includes('cooking oils')) {
                displayImage = '/images/banner_oils.png';
              } else if (key.includes('dal') || key.includes('pulses')) {
                displayImage = '/images/banner_dal.png';
              }

              uniqueBanners.push({
                ...banner,
                image: displayImage,
              });
            }
          }
          if (uniqueBanners.length > 0) {
            setHeroBanners(uniqueBanners);
          }
        }
      } catch (err) {
        console.error('Failed to load database banners:', err);
      }
    };
    loadBanners();
  }, [dispatch]);

  const features = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹499' },
    { icon: ShieldCheck, title: '100% Secure', desc: 'Verified products only' },
    { icon: Clock, title: 'Fast Delivery', desc: 'Within 24-48 hours' },
    { icon: CreditCard, title: 'Secure Payment', desc: 'Multiple payment options' },
  ];

  return (
    <div className="pb-12">
      {/* Hero Slider */}
      <section className="bg-gray-100">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          className="h-[300px] md:h-[400px] lg:h-[500px] w-full group/slider relative"
        >
          {heroBanners.map((banner, idx) => (
            <SwiperSlide key={idx}>
              <div className="block w-full h-full relative">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover pointer-events-none select-none" />
                <div className="absolute inset-0 bg-black/20 flex flex-col justify-center px-8 md:px-24">
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 animate-slide-up">{banner.title}</h2>
                  <p className="text-lg text-white/90 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>{banner.subtitle}</p>
                  <Link to={banner.link} className="btn-primary w-fit animate-slide-up" style={{ animationDelay: '0.2s' }}>Shop Now</Link>
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Custom Navigation Buttons (Modern E-commerce Style - Desktop Only) */}
          <button className="swiper-button-prev-custom absolute hidden md:flex left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white text-gray-800 rounded-full items-center justify-center shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 cursor-pointer md:opacity-0 md:-translate-x-4 md:group-hover/slider:opacity-100 md:group-hover/slider:translate-x-0">
            <ChevronLeft className="w-6 h-6 text-gray-700 hover:text-primary-600 transition-colors" />
          </button>
          <button className="swiper-button-next-custom absolute hidden md:flex right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white text-gray-800 rounded-full items-center justify-center shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 cursor-pointer md:opacity-0 md:translate-x-4 md:group-hover/slider:opacity-100 md:group-hover/slider:translate-x-0">
            <ChevronRight className="w-6 h-6 text-gray-700 hover:text-primary-600 transition-colors" />
          </button>
        </Swiper>
      </section>

      {/* Features */}
      <section className="container-custom py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Shop by Categories */}
      <section className="container-custom py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-heading">Shop by Categories</h2>
          <Link to="/products" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading && !categories.length ? (
          <CategorySkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat._id} to={`/products?category=${cat.slug}`} className="group text-center">
                <div className="w-full aspect-square bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-4xl shadow-sm group-hover:shadow-md group-hover:border-primary-200 transition-all group-hover:-translate-y-1 mb-3">
                  {cat.icon}
                </div>
                <h3 className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors">{cat.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers */}
      {(loading || bestSellers?.length > 0) && (
        <section className="container-custom py-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-heading">Best Sellers</h2>
          </div>
          {loading && !bestSellers.length ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellers.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Promo Banner */}
      <section className="container-custom py-10">
        <div className="bg-gradient-indian rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between shadow-lg">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl font-display font-bold text-white mb-2">Get 10% Off Your First Order!</h2>
            <p className="text-orange-100 text-lg">Use code <span className="font-bold text-white bg-black/20 px-2 py-1 rounded">WELCOME10</span> at checkout.</p>
          </div>
          <Link to="/products" className="bg-white text-primary-600 font-bold py-3 px-8 rounded-xl shadow-md hover:bg-orange-50 transition-colors">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      {(loading || featured?.length > 0) && (
        <section className="container-custom py-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-heading">Featured Products</h2>
          </div>
          {loading && !featured.length ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
