import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    buttonText: { type: String, default: 'Shop Now' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    bgColor: { type: String, default: '#FF6B35' },
    textColor: { type: String, default: '#FFFFFF' },
    type: { type: String, enum: ['hero', 'offer', 'category'], default: 'hero' },
  },
  { timestamps: true }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
