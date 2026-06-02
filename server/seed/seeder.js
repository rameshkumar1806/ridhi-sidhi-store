import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Banner from '../models/Banner.js';
import Coupon from '../models/Coupon.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

const categories = [
  { name: 'Dals & Pulses', slug: 'dals-pulses', icon: '🫘', description: 'All types of dals and pulses', sortOrder: 1 },
  { name: 'Oils & Ghee', slug: 'oils-ghee', icon: '🫙', description: 'Cooking oils, ghee, and vanaspati', sortOrder: 2 },
  { name: 'Flour & Atta', slug: 'flour-atta', icon: '🌾', description: 'Wheat atta, maida, besan, and more', sortOrder: 3 },
  { name: 'Rice & Grains', slug: 'rice-grains', icon: '🍚', description: 'Basmati rice, other rice varieties and grains', sortOrder: 4 },
  { name: 'Spices & Masalas', slug: 'spices-masalas', icon: '🌶️', description: 'Whole and ground spices', sortOrder: 5 },
  { name: 'Dry Fruits & Nuts', slug: 'dry-fruits-nuts', icon: '🥜', description: 'Premium dry fruits and nuts', sortOrder: 6 },
  { name: 'Sugar & Salt', slug: 'sugar-salt', icon: '🧂', description: 'Sugar, jaggery, and various salts', sortOrder: 7 },
  { name: 'Household Essentials', slug: 'household-essentials', icon: '🏠', description: 'Daily household grocery needs', sortOrder: 8 },
];

const sampleProducts = (categoryMap) => [
  // Dals
  {
    name: 'Toor Dal (Arhar Dal)',
    slug: 'toor-dal-arhar-dal',
    description: 'Premium quality toor dal (pigeon peas) sourced from best farms. Rich in protein and fiber, perfect for making dal fry, sambar, and more.',
    shortDescription: 'Premium quality pigeon peas - protein rich',
    brand: 'Nature\'s Best',
    category: categoryMap['dals-pulses'],
    price: 149,
    mrp: 175,
    discount: 15,
    stock: 500,
    unit: 'kg',
    quantity: '1 kg',
    images: [{ url: '/products/prod_dal.png', alt: 'Toor Dal' }],
    tags: ['dal', 'protein', 'pulses', 'toor', 'arhar'],
    isFeatured: true, isBestSeller: true,
    rating: 4.5, numReviews: 128,
    gst: 0,
  },
  {
    name: 'Moong Dal (Yellow)',
    slug: 'moong-dal-yellow',
    description: 'Split yellow moong dal, washed and cleaned. Light on stomach, ideal for khichdi and soups.',
    shortDescription: 'Split washed yellow moong dal',
    brand: 'Nature\'s Best',
    category: categoryMap['dals-pulses'],
    price: 129,
    mrp: 150,
    discount: 14,
    stock: 400,
    unit: 'kg',
    quantity: '1 kg',
    images: [{ url: '/products/prod_dal.png', alt: 'Moong Dal' }],
    tags: ['dal', 'moong', 'yellow', 'light'],
    isFeatured: true, isBestSeller: true,
    rating: 4.3, numReviews: 96,
    gst: 0,
  },
  {
    name: 'Chana Dal',
    slug: 'chana-dal',
    description: 'Split Bengal gram dal, rich in protein and dietary fiber. Perfect for dal recipes, chana dal halwa, and pakoras.',
    shortDescription: 'Split Bengal gram - high protein',
    brand: 'Pure Gold',
    category: categoryMap['dals-pulses'],
    price: 109,
    mrp: 125,
    discount: 13,
    stock: 350,
    unit: 'kg',
    quantity: '1 kg',
    images: [{ url: '/products/prod_dal.png', alt: 'Chana Dal' }],
    tags: ['dal', 'chana', 'bengal gram'],
    isBestSeller: true,
    rating: 4.2, numReviews: 74,
    gst: 0,
  },
  {
    name: 'Masoor Dal (Red Lentils)',
    slug: 'masoor-dal-red-lentils',
    description: 'Whole red masoor dal, quick cooking and highly nutritious. Great for soups, dals and curries.',
    shortDescription: 'Whole red lentils - quick cooking',
    brand: 'Nature\'s Best',
    category: categoryMap['dals-pulses'],
    price: 119,
    mrp: 140,
    discount: 15,
    stock: 300,
    unit: 'kg',
    quantity: '1 kg',
    images: [{ url: '/products/prod_dal.png', alt: 'Masoor Dal' }],
    tags: ['dal', 'masoor', 'red lentils'],
    isTrending: true,
    rating: 4.1, numReviews: 52,
    gst: 0,
  },
  // Oils
  {
    name: 'Saffola Gold Refined Oil',
    slug: 'saffola-gold-refined-oil',
    description: 'Saffola Gold blended oil with LOSORB technology. Absorbs less oil while cooking. Ideal for a healthy lifestyle.',
    shortDescription: 'Blended oil with LOSORB technology',
    brand: 'Saffola',
    category: categoryMap['oils-ghee'],
    price: 289,
    mrp: 320,
    discount: 10,
    stock: 200,
    unit: 'L',
    quantity: '1 L',
    images: [{ url: '/products/prod_oil.png', alt: 'Saffola Gold Oil' }],
    tags: ['oil', 'refined', 'saffola', 'healthy', 'cooking oil'],
    isFeatured: true, isBestSeller: true,
    rating: 4.6, numReviews: 215,
    gst: 5,
  },
  {
    name: 'Amul Pure Ghee',
    slug: 'amul-pure-ghee',
    description: 'Amul Pure Ghee made from fresh cream. Rich aroma and authentic flavor. Suitable for cooking, tempering and traditional recipes.',
    shortDescription: 'Pure ghee from fresh cream - authentic taste',
    brand: 'Amul',
    category: categoryMap['oils-ghee'],
    price: 549,
    mrp: 600,
    discount: 8,
    stock: 150,
    unit: 'kg',
    quantity: '500 g',
    images: [{ url: '/products/prod_ghee.png', alt: 'Amul Pure Ghee' }],
    tags: ['ghee', 'amul', 'pure', 'cooking'],
    isFeatured: true, isBestSeller: true, isTrending: true,
    rating: 4.8, numReviews: 389,
    gst: 5,
  },
  {
    name: 'Fortune Sunflower Oil',
    slug: 'fortune-sunflower-oil',
    description: 'Fortune Sunflower oil - light cooking oil with natural goodness. Low in saturated fats and cholesterol free.',
    shortDescription: 'Light sunflower cooking oil',
    brand: 'Fortune',
    category: categoryMap['oils-ghee'],
    price: 199,
    mrp: 230,
    discount: 13,
    stock: 250,
    unit: 'L',
    quantity: '1 L',
    images: [{ url: '/products/prod_oil.png', alt: 'Fortune Sunflower Oil' }],
    tags: ['oil', 'sunflower', 'fortune', 'light'],
    isBestSeller: true,
    rating: 4.3, numReviews: 167,
    gst: 5,
  },
  // Flour
  {
    name: 'Aashirvaad Whole Wheat Atta',
    slug: 'aashirvaad-whole-wheat-atta',
    description: 'Aashirvaad Select Sharbati Atta made from 100% MP Sharbati wheat. Superior quality for soft rotis.',
    shortDescription: '100% MP Sharbati wheat - makes soft rotis',
    brand: 'Aashirvaad',
    category: categoryMap['flour-atta'],
    price: 279,
    mrp: 310,
    discount: 10,
    stock: 300,
    unit: 'kg',
    quantity: '5 kg',
    images: [{ url: '/products/prod_atta.png', alt: 'Aashirvaad Atta' }],
    tags: ['atta', 'wheat', 'aashirvaad', 'flour', 'roti'],
    isFeatured: true, isBestSeller: true,
    rating: 4.7, numReviews: 445,
    gst: 0,
  },
  {
    name: 'Besan (Gram Flour)',
    slug: 'besan-gram-flour',
    description: 'Fine quality gram flour (besan) for making pakoras, kadhi, cheela, and many more Indian recipes.',
    shortDescription: 'Fine quality gram flour for all Indian recipes',
    brand: 'Pure Gold',
    category: categoryMap['flour-atta'],
    price: 89,
    mrp: 105,
    discount: 15,
    stock: 250,
    unit: 'kg',
    quantity: '1 kg',
    images: [{ url: '/products/prod_atta.png', alt: 'Besan' }],
    tags: ['besan', 'gram flour', 'pakora', 'kadhi'],
    isBestSeller: true,
    rating: 4.4, numReviews: 98,
    gst: 0,
  },
  // Rice
  {
    name: 'India Gate Basmati Rice',
    slug: 'india-gate-basmati-rice',
    description: 'India Gate Classic Basmati Rice - long grain, aged, and fragrant. Perfect for biryani, pulao and everyday cooking.',
    shortDescription: 'Long grain aged basmati - biryani special',
    brand: 'India Gate',
    category: categoryMap['rice-grains'],
    price: 399,
    mrp: 450,
    discount: 11,
    stock: 200,
    unit: 'kg',
    quantity: '5 kg',
    images: [{ url: '/products/prod_rice.png', alt: 'India Gate Basmati Rice' }],
    tags: ['rice', 'basmati', 'india gate', 'biryani', 'aromatic'],
    isFeatured: true, isBestSeller: true, isTrending: true,
    rating: 4.8, numReviews: 512,
    gst: 0,
  },
  {
    name: 'Poha (Flattened Rice)',
    slug: 'poha-flattened-rice',
    description: 'Thick white poha, ideal for making poha breakfast, chivda, and other snacks.',
    shortDescription: 'Thick white flattened rice',
    brand: 'Pure Gold',
    category: categoryMap['rice-grains'],
    price: 79,
    mrp: 95,
    discount: 17,
    stock: 300,
    unit: 'kg',
    quantity: '1 kg',
    images: [{ url: '/products/prod_rice.png', alt: 'Poha' }],
    tags: ['poha', 'flattened rice', 'breakfast', 'snacks'],
    isTrending: true,
    rating: 4.2, numReviews: 63,
    gst: 0,
  },
  // Spices
  {
    name: 'MDH Kitchen King Masala',
    slug: 'mdh-kitchen-king-masala',
    description: 'MDH Kitchen King Masala - a blend of 25+ spices. The ultimate all-purpose masala for Indian cooking.',
    shortDescription: 'Blend of 25+ spices - all purpose masala',
    brand: 'MDH',
    category: categoryMap['spices-masalas'],
    price: 149,
    mrp: 180,
    discount: 17,
    stock: 400,
    unit: 'g',
    quantity: '100 g',
    images: [{ url: '/products/prod_spices.png', alt: 'MDH Kitchen King Masala' }],
    tags: ['masala', 'mdh', 'spice blend', 'kitchen king'],
    isFeatured: true, isBestSeller: true,
    rating: 4.7, numReviews: 328,
    gst: 5,
  },
  {
    name: 'Everest Garam Masala',
    slug: 'everest-garam-masala',
    description: 'Everest Garam Masala - finest quality blend of aromatic whole spices. Adds warmth and depth to all dishes.',
    shortDescription: 'Aromatic whole spice blend',
    brand: 'Everest',
    category: categoryMap['spices-masalas'],
    price: 89,
    mrp: 110,
    discount: 19,
    stock: 350,
    unit: 'g',
    quantity: '50 g',
    images: [{ url: '/products/prod_spices.png', alt: 'Everest Garam Masala' }],
    tags: ['garam masala', 'everest', 'spice', 'aromatic'],
    isBestSeller: true,
    rating: 4.5, numReviews: 185,
    gst: 5,
  },
  {
    name: 'Turmeric Powder (Haldi)',
    slug: 'turmeric-powder-haldi',
    description: 'Pure quality turmeric powder with high curcumin content. Natural color, authentic taste, no artificial coloring.',
    shortDescription: 'Pure high curcumin turmeric',
    brand: 'Pure Gold',
    category: categoryMap['spices-masalas'],
    price: 69,
    mrp: 85,
    discount: 19,
    stock: 500,
    unit: 'g',
    quantity: '200 g',
    images: [{ url: '/products/prod_spices.png', alt: 'Turmeric Powder' }],
    tags: ['turmeric', 'haldi', 'spice', 'health'],
    isBestSeller: true,
    rating: 4.4, numReviews: 142,
    gst: 5,
  },
  // Dry Fruits
  {
    name: 'Premium Cashews (Kaju)',
    slug: 'premium-cashews-kaju',
    description: 'Premium quality whole cashews, crispy and fresh. Rich in healthy fats, proteins and minerals.',
    shortDescription: 'Whole premium cashews - fresh and crispy',
    brand: 'Nutri Dry',
    category: categoryMap['dry-fruits-nuts'],
    price: 699,
    mrp: 850,
    discount: 18,
    stock: 100,
    unit: 'g',
    quantity: '500 g',
    images: [{ url: '/products/prod_dryfruits.png', alt: 'Premium Cashews' }],
    tags: ['cashew', 'kaju', 'dry fruit', 'nuts'],
    isFeatured: true, isBestSeller: true,
    rating: 4.8, numReviews: 267,
    gst: 12,
  },
  {
    name: 'California Almonds (Badam)',
    slug: 'california-almonds-badam',
    description: 'Premium California almonds, naturally dried and unprocessed. High in Vitamin E, protein and healthy fats.',
    shortDescription: 'Premium California almonds - unprocessed',
    brand: 'Nutri Dry',
    category: categoryMap['dry-fruits-nuts'],
    price: 649,
    mrp: 799,
    discount: 19,
    stock: 120,
    unit: 'g',
    quantity: '500 g',
    images: [{ url: '/products/prod_dryfruits.png', alt: 'California Almonds' }],
    tags: ['almonds', 'badam', 'dry fruit', 'california'],
    isFeatured: true, isBestSeller: true, isTrending: true,
    rating: 4.7, numReviews: 198,
    gst: 12,
  },
  {
    name: 'Premium Raisins (Kishmish)',
    slug: 'premium-raisins-kishmish',
    description: 'Golden raisins from finest grapes. Sweet and juicy, great for desserts, snacking and cooking.',
    shortDescription: 'Golden raisins - sweet and juicy',
    brand: 'Nutri Dry',
    category: categoryMap['dry-fruits-nuts'],
    price: 199,
    mrp: 249,
    discount: 20,
    stock: 200,
    unit: 'g',
    quantity: '250 g',
    images: [{ url: '/products/prod_dryfruits.png', alt: 'Premium Raisins' }],
    tags: ['raisins', 'kishmish', 'dry fruit'],
    isTrending: true,
    rating: 4.3, numReviews: 89,
    gst: 12,
  },
  // Household
  {
    name: 'Tata Salt',
    slug: 'tata-salt',
    description: 'Tata Salt - vacuum evaporated iodized salt. Trusted by Indian families for over 30 years.',
    shortDescription: 'Vacuum evaporated iodized salt',
    brand: 'Tata',
    category: categoryMap['household-essentials'],
    price: 28,
    mrp: 32,
    discount: 12,
    stock: 1000,
    unit: 'kg',
    quantity: '1 kg',
    images: [{ url: '/products/prod_salt.png', alt: 'Tata Salt' }],
    tags: ['salt', 'tata', 'iodized', 'household'],
    isBestSeller: true,
    rating: 4.6, numReviews: 432,
    gst: 0,
  },
  {
    name: 'Tata Sugar',
    slug: 'tata-sugar',
    description: 'Tata Sugar - pure refined sugar with consistent quality. Perfect for all your cooking and baking needs.',
    shortDescription: 'Pure refined sugar - consistent quality',
    brand: 'Tata',
    category: categoryMap['sugar-salt'],
    price: 55,
    mrp: 65,
    discount: 15,
    stock: 800,
    unit: 'kg',
    quantity: '1 kg',
    images: [{ url: '/products/prod_sugar.png', alt: 'Tata Sugar' }],
    tags: ['sugar', 'tata', 'refined'],
    isBestSeller: true,
    rating: 4.4, numReviews: 187,
    gst: 5,
  },
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Banner.deleteMany();
    await Coupon.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach((c) => {
      categoryMap[c.slug] = c._id;
    });
    console.log('✅ Categories created');

    // Create products
    const products = sampleProducts(categoryMap);
    await Product.insertMany(products);
    console.log('✅ Products created');

    // Create users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ridhisidhi.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9999999999',
      isActive: true,
    });

    await User.create({
      name: 'Rajesh Kumar',
      email: 'test@example.com',
      password: 'Test@123',
      phone: '9876543210',
      isActive: true,
    });

    console.log('✅ Users created');

    // Create banners
    await Banner.insertMany([
      {
        title: 'Premium Quality Atta',
        subtitle: 'Freshly milled and rich in nutrients',
        image: 'https://placehold.co/1200x500/FF6B35/white?text=Premium+Quality+Atta',
        link: '/products?category=atta-flours',
        buttonText: 'Shop Now',
        type: 'hero',
        sortOrder: 1,
        bgColor: '#FF6B35',
      },
      {
        title: 'Pure Cooking Oils',
        subtitle: 'Healthy and natural extracted oils',
        image: 'https://placehold.co/1200x500/F59E0B/white?text=Pure+Cooking+Oils',
        link: '/products?category=edible-oils',
        buttonText: 'Buy Now',
        type: 'hero',
        sortOrder: 2,
        bgColor: '#F59E0B',
      },
      {
        title: 'Fresh Pulses & Dal',
        subtitle: 'Wholesome and unpolished lentils',
        image: 'https://placehold.co/1200x500/34D399/white?text=Fresh+Pulses+And+Dal',
        link: '/products?category=dals-pulses',
        buttonText: 'Shop Now',
        type: 'hero',
        sortOrder: 3,
        bgColor: '#10B981',
      },
      {
        title: 'Premium Dry Fruits Sale',
        subtitle: 'Up to 20% off on dry fruits & nuts',
        image: 'https://placehold.co/1200x500/D4B483/white?text=Premium+Dry+Fruits+Sale',
        link: '/products?category=dry-fruits-nuts',
        buttonText: 'Explore',
        type: 'hero',
        sortOrder: 4,
        bgColor: '#92400E',
      },
    ]);
    console.log('✅ Banners created');

    // Create coupons
    await Coupon.insertMany([
      {
        code: 'WELCOME10',
        description: '10% off on first order',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 100,
        minOrderAmount: 299,
        validFrom: new Date(),
        validTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        userLimit: 1,
      },
      {
        code: 'SAVE50',
        description: '₹50 flat discount',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 499,
        validFrom: new Date(),
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'GROCERY20',
        description: '20% off upto ₹200',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscountAmount: 200,
        minOrderAmount: 599,
        validFrom: new Date(),
        validTill: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log('✅ Coupons created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Admin Login:');
    console.log('   Email   : admin@ridhisidhi.com');
    console.log('   Password: Admin@123');
    console.log('👤 Test User Login:');
    console.log('   Email   : test@example.com');
    console.log('   Password: Test@123');
    console.log('🎫 Sample Coupons: WELCOME10, SAVE50, GROCERY20');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Banner.deleteMany();
    await Coupon.deleteMany();
    console.log('🗑️  All data destroyed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Destroy failed:', error.message);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
