import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Search, Crosshair, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix for default leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter = [28.6139, 77.2090]; // New Delhi

function DraggableMarker({ position, setPosition, onDragEnd }) {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        setPosition([lat, lng]);
        onDragEnd(lat, lng);
      }
    },
  };

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onDragEnd(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    ></Marker>
  );
}

export default function OpenStreetMapAddress({ onAddressSelect }) {
  const [position, setPosition] = useState(defaultCenter);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapRef, setMapRef] = useState(null);

  useEffect(() => {
    // Initial position fetch
    getCurrentLocation(true);
  }, []);

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
      const data = await res.json();
      if (data && data.address) {
        extractAddress(data);
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    }
  };

  const extractAddress = (data) => {
    const addr = data.address;
    const addressDetails = {
      formattedAddress: data.display_name,
      latitude: data.lat,
      longitude: data.lon,
      houseNo: addr.house_number || addr.building || '',
      street: addr.road || addr.street || addr.suburb || addr.neighbourhood || '',
      landmark: addr.suburb || addr.neighbourhood || '',
      city: addr.city || addr.town || addr.village || addr.county || '',
      state: addr.state || '',
      pincode: addr.postcode || '',
      country: addr.country || 'India',
    };
    onAddressSelect(addressDetails);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 3) {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1&countrycodes=in`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectPlace = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    setPosition([lat, lon]);
    setSearchQuery(place.display_name);
    setSuggestions([]);
    
    if (mapRef) {
      mapRef.setView([lat, lon], 16);
    }
    
    extractAddress(place);
  };

  const getCurrentLocation = (silent = false) => {
    if (navigator.geolocation) {
      if (!silent) toast.loading('Locating you...', { id: 'gps' });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setPosition([lat, lon]);
          if (mapRef) mapRef.setView([lat, lon], 16);
          reverseGeocode(lat, lon);
          if (!silent) toast.success('Location found!', { id: 'gps' });
        },
        (err) => {
          if (!silent) toast.error('Failed to get location. Please enable GPS.', { id: 'gps' });
        }
      );
    } else {
      if (!silent) toast.error('Geolocation not supported.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative z-20">
        <div className="relative flex items-center">
          {isSearching ? (
            <Loader className="absolute left-3 text-primary-500 w-5 h-5 animate-spin" />
          ) : (
            <Search className="absolute left-3 text-gray-400 w-5 h-5" />
          )}
          <input
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for area, street name..."
            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <button 
            type="button"
            onClick={() => getCurrentLocation(false)}
            className="absolute right-2 p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            title="Use Current Location"
          >
            <Crosshair className="w-5 h-5" />
          </button>
        </div>
        
        {suggestions.length > 0 && (
          <ul className="absolute w-full bg-white mt-1 border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-auto">
            {suggestions.map((place, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectPlace(place)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3 border-b border-gray-50 last:border-0"
              >
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{place.display_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Interactive Map */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm relative z-10 h-[300px]">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={false} 
          style={{ height: '100%', width: '100%' }}
          ref={setMapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker position={position} setPosition={setPosition} onDragEnd={reverseGeocode} />
        </MapContainer>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md text-xs font-semibold text-gray-700 flex items-center gap-2 pointer-events-none" style={{ zIndex: 1000 }}>
          <MapPin className="w-4 h-4 text-primary-500" /> Click or drag pin to exact location
        </div>
      </div>
    </div>
  );
}
