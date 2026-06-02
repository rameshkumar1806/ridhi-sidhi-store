import mongoose from 'mongoose';
import { generateSKU } from '../utils/skuHelper.js';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: [true, 'Description is required'] },
    shortDescription: { type: String },
    brand: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    mrp: { type: Number }, // Maximum Retail Price
    discount: { type: Number, default: 0 }, // Percentage
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
        alt: { type: String },
      },
    ],
    stock: { type: Number, required: true, default: 0, min: 0 },
    quantity: { type: String, required: [true, 'Quantity/Weight is required'] }, // e.g., 500gm, 1kg, 1L
    unitType: { type: String, required: true, default: 'packet' }, // e.g., packet, bottle, bag, box
    soldCount: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 5 },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    gst: { type: Number, default: 5 }, // GST percentage
    hsn: { type: String }, // HSN code for GST
    sku: { type: String, unique: true, sparse: true },
    recentlyViewedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Calculate average rating before save and generate SKU
productSchema.pre('save', function (next) {
  if (this.reviews && this.reviews.length > 0) {
    this.rating =
      this.reviews.reduce((acc, rev) => acc + rev.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }

  // Generate SKU if not provided
  if (!this.sku) {
    this.sku = generateSKU(this.name, this.quantity);
  }
  
  next();
});

// Virtual for discounted price
productSchema.virtual('finalPrice').get(function () {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount) / 100;
  }
  return this.price;
});

// Compound indexes for landing page queries
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isBestSeller: 1, isActive: 1 });
productSchema.index({ isTrending: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
