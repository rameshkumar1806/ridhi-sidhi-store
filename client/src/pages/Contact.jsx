import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Have a question, feedback, or need help with your order? We're here for you. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Our Store</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Gali, Street Number 3, Milkman Colony,<br/>
                  Jodhpur, Rajasthan<br/>
                  India - 342003
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600 text-sm mb-1">Mon-Sun: 9:00 AM – 9:00 PM</p>
                <a href="tel:+916350200450" className="text-primary-600 font-semibold hover:underline">+91 6350 200 450</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600 text-sm mb-1">We typically reply within 24 hours.</p>
                <a href="mailto:info@ridhisidhi.com" className="text-primary-600 font-semibold hover:underline">info@ridhisidhi.com</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-6 h-6 text-primary-500" />
                <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="input-label">Your Name</label>
                    <input 
                      type="text" required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="input-field" placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="input-label">Email Address</label>
                    <input 
                      type="email" required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="input-field" placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Subject</label>
                  <input 
                    type="text" required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="input-field" placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label className="input-label">Message</label>
                  <textarea 
                    required rows="5"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="input-field resize-none" placeholder="Type your message here..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30"
                >
                  <Send className="w-5 h-5" /> 
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[400px]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112000.123456789!2d77.123456789!3d28.123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDA3JzI0LjQiTiA3N8KwMDcnMjQuNEl!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0, borderRadius: '1.25rem' }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Store Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
