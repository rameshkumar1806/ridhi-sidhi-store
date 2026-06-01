import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, getProfile, logout } from '../redux/slices/authSlice';
import { User, Mail, Phone, MapPin, Save, Plus, Trash2, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { FullPageLoader } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../services/api';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    oldPassword: '',
    newPassword: '',
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '', phone: '', address: '', city: '', state: '', pincode: '', isDefault: false
  });

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        oldPassword: '',
        newPassword: '',
      });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const updateData = { name: formData.name, phone: formData.phone };
    if (formData.newPassword) {
      if (!formData.oldPassword) {
        toast.error('Please enter old password');
        return;
      }
      updateData.oldPassword = formData.oldPassword;
      updateData.password = formData.newPassword;
    }

    const result = await dispatch(updateProfile(updateData));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully');
      setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '' }));
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/addresses', addressForm);
      setAddresses(data.data);
      setShowAddressForm(false);
      setAddressForm({ name: '', phone: '', address: '', city: '', state: '', pincode: '', isDefault: false });
      toast.success('Address added successfully');
      dispatch(getProfile());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await api.delete(`/auth/addresses/${id}`);
      setAddresses(data.data);
      toast.success('Address deleted');
      dispatch(getProfile());
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  if (loading && !user) return <FullPageLoader />;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom max-w-5xl">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-3xl mx-auto mb-4 border-4 border-white shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                {user?.role === 'admin' ? 'Admin Account' : 'Customer Account'}
              </div>

              {/* Quick Action Navigation / Logout */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-2.5">
                {user?.role === 'admin' ? (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary-600 text-sm font-semibold rounded-xl transition-colors border border-primary-100 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary-600 text-sm font-semibold rounded-xl transition-colors border border-primary-100 cursor-pointer"
                  >
                    <Package className="w-4 h-4" /> My Orders
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-colors border border-red-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" /> Personal Information
              </h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="input-label"><User className="w-4 h-4 inline mr-1" /> Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      className="input-field" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="input-label"><Mail className="w-4 h-4 inline mr-1" /> Email Address</label>
                    <input type="email" value={user?.email || ''} className="input-field bg-gray-50 cursor-not-allowed" disabled />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="input-label"><Phone className="w-4 h-4 inline mr-1" /> Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      className="input-field" 
                      pattern="[0-9]{10}"
                      maxLength="10"
                    />
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="input-label">Current Password</label>
                      <input 
                        type="password" 
                        value={formData.oldPassword} 
                        onChange={(e) => setFormData({...formData, oldPassword: e.target.value})} 
                        className="input-field" 
                        placeholder="Leave blank to keep same"
                      />
                    </div>
                    <div>
                      <label className="input-label">New Password</label>
                      <input 
                        type="password" 
                        value={formData.newPassword} 
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})} 
                        className="input-field" 
                        placeholder="Leave blank to keep same"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Address Book */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" /> Saved Addresses
                </h2>
                <button 
                  onClick={() => setShowAddressForm(!showAddressForm)} 
                  className="btn-outline btn-sm flex items-center gap-1 text-primary-600 border-primary-200 hover:bg-orange-50"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in">
                  <h3 className="font-semibold text-gray-900 mb-4">Add New Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="input-label">Full Address</label>
                      <textarea required value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} className="input-field h-20 resize-none" placeholder="House No, Street, Area"></textarea>
                    </div>
                    <div>
                      <label className="input-label">City</label>
                      <input type="text" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">State</label>
                      <input type="text" required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">Pincode</label>
                      <input type="text" required pattern="[0-9]{6}" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">Phone</label>
                      <input type="text" required pattern="[0-9]{10}" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="input-field" />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2 mt-2">
                      <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded" />
                      <label htmlFor="isDefault" className="text-sm text-gray-700 font-medium">Set as default address</label>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3 justify-end">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn-outline py-2 text-sm">Cancel</button>
                    <button type="submit" className="btn-primary py-2 text-sm">Save Address</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.length === 0 && !showAddressForm ? (
                  <div className="col-span-2 text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                    No addresses saved yet. Add one for faster checkout.
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div key={address._id} className="border border-gray-200 rounded-xl p-4 relative group hover:border-primary-300 transition-colors">
                      {address.isDefault && <span className="absolute top-4 right-4 bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded font-bold">Default</span>}
                      <h4 className="font-semibold text-gray-900">{address.name || user?.name}</h4>
                      <p className="text-sm text-gray-600 mt-1 max-w-[85%]">{address.address}</p>
                      <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                      <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                      
                      <button 
                        onClick={() => handleDeleteAddress(address._id)}
                        className="absolute bottom-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
