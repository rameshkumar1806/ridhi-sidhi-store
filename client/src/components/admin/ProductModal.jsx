import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Upload, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { fetchCategories } from '../../redux/slices/productSlice';

const ProductModal = ({ isOpen, onClose, onSuccess, productToEdit = null }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.products);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', brand: '', category: '', price: '', mrp: '', discount: '0',
    stock: '', unitType: 'packet', qtyValue: '', qtyUnit: 'gm', lowStockAlert: '5', tags: '', 
    description: '', shortDescription: '',
    isFeatured: false, isBestSeller: false, isTrending: false,
    gst: '5', hsn: '', sku: '', isActive: true
  });
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const qtyUnits = ['gm', 'kg', 'ml', 'L', 'Piece', 'Packet', 'Box', 'Bunch'];
  const stockTypes = ['packet', 'bottle', 'bag', 'box', 'piece', 'set', 'dozen', 'kg'];

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  useEffect(() => {
    if (productToEdit) {
      const qtyMatch = productToEdit.quantity?.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
      setFormData({
        name: productToEdit.name || '',
        brand: productToEdit.brand || '',
        category: productToEdit.category?._id || '',
        price: productToEdit.price || '',
        mrp: productToEdit.mrp || '',
        discount: productToEdit.discount || '0',
        stock: productToEdit.stock || '0',
        unitType: productToEdit.unitType || 'packet',
        qtyValue: qtyMatch ? qtyMatch[1] : (productToEdit.quantity?.match(/\d+/)?.[0] || ''),
        qtyUnit: qtyMatch ? qtyMatch[2] : (productToEdit.quantity?.match(/[a-zA-Z]+/)?.[0] || 'gm'),
        lowStockAlert: productToEdit.lowStockAlert || '5',
        tags: Array.isArray(productToEdit.tags) ? productToEdit.tags.join(', ') : '',
        description: productToEdit.description || '',
        shortDescription: productToEdit.shortDescription || '',
        isFeatured: productToEdit.isFeatured || false,
        isBestSeller: productToEdit.isBestSeller || false,
        isTrending: productToEdit.isTrending || false,
        gst: productToEdit.gst || '5',
        hsn: productToEdit.hsn || '',
        sku: productToEdit.sku || '',
        isActive: productToEdit.isActive !== undefined ? productToEdit.isActive : true
      });
      setExistingImages(productToEdit.images || []);
      setFiles([]);
    } else {
      setFormData({
        name: '', brand: '', category: '', price: '', mrp: '', discount: '0',
        stock: '', unitType: 'packet', qtyValue: '', qtyUnit: 'gm', lowStockAlert: '5', tags: '', 
        description: '', shortDescription: '',
        isFeatured: false, isBestSeller: false, isTrending: false,
        gst: '5', hsn: '', sku: '', isActive: true
      });
      setExistingImages([]);
      setFiles([]);
    }
  }, [productToEdit, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.price || formData.stock === '' || !formData.qtyValue) {
      return toast.error('Please fill all required fields');
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      
      // Combine quantity
      const combinedQuantity = `${formData.qtyValue}${formData.qtyUnit}`;
      
      // Append all fields except quantity-related ones
      Object.keys(formData).forEach(key => {
        if (key !== 'qtyValue' && key !== 'qtyUnit' && key !== 'quantity') {
          // Handle boolean values and other types
          submitData.append(key, formData[key]);
        }
      });
      
      // Explicitly append the combined quantity
      submitData.append('quantity', combinedQuantity);

      // Append files
      if (files && files.length > 0) {
        files.forEach(file => {
          submitData.append('images', file);
        });
      }

      if (productToEdit) {
        await api.put(`/products/${productToEdit._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {productToEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details below to {productToEdit ? 'update' : 'create'} the product listing.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column - Main Details */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Section: Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="input-label font-bold text-gray-700">Product Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field bg-gray-50 border-gray-200 focus:bg-white" placeholder="e.g., Premium Basmati Rice" />
                  </div>
                  <div>
                    <label className="input-label font-bold text-gray-700">Brand Name</label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="input-field bg-gray-50 border-gray-200" placeholder="e.g., India Gate" />
                  </div>
                  <div>
                    <label className="input-label font-bold text-gray-700">Category *</label>
                    <select required name="category" value={formData.category} onChange={handleInputChange} className="input-field bg-gray-50 border-gray-200">
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Pricing & Stock */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">Pricing & Inventory</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="input-label font-bold text-gray-700">Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="input-field pl-8 bg-gray-50 border-gray-200" min="0" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label font-bold text-gray-700">MRP (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input type="number" name="mrp" value={formData.mrp} onChange={handleInputChange} className="input-field pl-8 bg-gray-50 border-gray-200" min="0" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label font-bold text-gray-700">Discount (%)</label>
                    <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} className="input-field bg-gray-50 border-gray-200" min="0" max="100" />
                  </div>
                  <div>
                    <label className="input-label font-bold text-gray-700">GST (%)</label>
                    <input type="number" name="gst" value={formData.gst} onChange={handleInputChange} className="input-field bg-gray-50 border-gray-200" min="0" />
                  </div>
                  <div className="col-span-2 md:col-span-2">
                    <label className="input-label font-bold text-gray-700">Product Quantity *</label>
                    <div className="flex items-center gap-2">
                      <input 
                        required 
                        type="number" 
                        name="qtyValue" 
                        value={formData.qtyValue} 
                        onChange={handleInputChange} 
                        className="input-field bg-gray-50 border-gray-200 flex-1 min-w-[100px]" 
                        min="0" 
                        step="any"
                        placeholder="0" 
                      />
                      <select 
                        name="qtyUnit" 
                        value={formData.qtyUnit} 
                        onChange={handleInputChange} 
                        className="input-field bg-gray-50 border-gray-200 w-32 flex-shrink-0"
                      >
                        {qtyUnits.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-2">
                    <label className="input-label font-bold text-gray-700">Available Stock *</label>
                    <div className="flex items-center gap-2">
                      <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="input-field bg-gray-50 border-gray-200 flex-1 min-w-[100px]" min="0" placeholder="0" />
                      <select name="unitType" value={formData.unitType} onChange={handleInputChange} className="input-field bg-gray-50 border-gray-200 w-32 flex-shrink-0">
                        {stockTypes.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="input-label font-bold text-gray-700">Low Stock Alert</label>
                    <input type="number" name="lowStockAlert" value={formData.lowStockAlert} onChange={handleInputChange} className="input-field bg-gray-50 border-gray-200 font-bold text-red-600" min="0" />
                  </div>
                  <div>
                    <label className="input-label font-bold text-gray-700">SKU Code</label>
                    <input 
                      type="text" 
                      name="sku" 
                      value={formData.sku || 'Auto-generated'} 
                      readOnly
                      className="input-field bg-gray-100 border-gray-200 text-gray-500 font-mono text-xs cursor-not-allowed" 
                      placeholder="SKU-123" 
                    />
                    <p className="text-[9px] text-gray-400 mt-1 italic">Generated automatically on save</p>
                  </div>
                </div>
                {formData.mrp && Number(formData.mrp) < Number(formData.price) && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    Warning: Price is higher than MRP
                  </div>
                )}
              </div>

              {/* Section: Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">Product Description</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="input-label font-bold text-gray-700">Short Summary</label>
                    <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} className="input-field bg-gray-50 border-gray-200" placeholder="Brief 1-line description" maxLength={150} />
                  </div>
                  <div>
                    <label className="input-label font-bold text-gray-700">Full Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="input-field bg-gray-50 border-gray-200 min-h-[120px] resize-none" placeholder="Detailed product specifications..." />
                  </div>
                  <div>
                    <label className="input-label font-bold text-gray-700">Search Tags (comma separated)</label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className="input-field bg-gray-50 border-gray-200" placeholder="e.g., organic, healthy, rice" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Media & Settings */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Section: Media */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">Product Images</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="aspect-square border border-gray-100 rounded-2xl overflow-hidden relative group bg-gray-50">
                      <img src={img.url} alt="product" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">Existing</span>
                      </div>
                    </div>
                  ))}
                  {files.map((file, idx) => (
                    <div key={idx} className="aspect-square border border-primary-100 rounded-2xl overflow-hidden relative group bg-primary-50/20">
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-contain p-2" />
                      <button 
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 text-center hover:bg-gray-50 hover:border-primary-300 transition-all group relative cursor-pointer">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 border border-gray-100 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-primary-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Add More Images</p>
                  <p className="text-[10px] text-gray-400 mt-1">Maximum 5 images per product</p>
                </div>
              </div>

              {/* Section: Status & Flags */}
              <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                  <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">Settings</h3>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 cursor-pointer hover:border-primary-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm font-bold text-gray-700">Active Status</span>
                    </div>
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 text-primary-600 rounded-lg border-gray-300 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 cursor-pointer hover:border-primary-200 transition-all">
                    <span className="text-sm font-bold text-gray-700">Featured Product</span>
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-5 h-5 text-primary-600 rounded-lg border-gray-300 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 cursor-pointer hover:border-primary-200 transition-all">
                    <span className="text-sm font-bold text-gray-700">Best Seller</span>
                    <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleInputChange} className="w-5 h-5 text-primary-600 rounded-lg border-gray-300 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 cursor-pointer hover:border-primary-200 transition-all">
                    <span className="text-sm font-bold text-gray-700">Trending</span>
                    <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleInputChange} className="w-5 h-5 text-primary-600 rounded-lg border-gray-300 focus:ring-primary-500" />
                  </label>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="px-10 py-3 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Saving Changes...' : productToEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
