import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { MapPin, Search, Crosshair } from 'lucide-react';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '0.75rem' };
const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi

export default function GoogleMapAddress({ onAddressSelect }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const mapRef = useRef(null);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'in' },
    },
    debounce: 300,
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setMarkerPosition({ lat, lng });
      setMapCenter({ lat, lng });
      extractAddressComponents(results[0], { lat, lng });
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const handleMarkerDragEnd = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });

    try {
      const results = await getGeocode({ location: { lat, lng } });
      if (results[0]) {
        setValue(results[0].formatted_address, false);
        extractAddressComponents(results[0], { lat, lng });
      }
    } catch (error) {
      console.error('Error reverse geocoding: ', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setMarkerPosition({ lat, lng });
          setMapCenter({ lat, lng });
          try {
            const results = await getGeocode({ location: { lat, lng } });
            if (results[0]) {
              setValue(results[0].formatted_address, false);
              extractAddressComponents(results[0], { lat, lng });
            }
          } catch (err) {
            console.error(err);
          }
        },
        (err) => console.error(err)
      );
    }
  };

  const extractAddressComponents = (geocodeResult, coords) => {
    const addressDetails = {
      formattedAddress: geocodeResult.formatted_address,
      latitude: coords.lat,
      longitude: coords.lng,
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    };

    geocodeResult.address_components.forEach((comp) => {
      const types = comp.types;
      if (types.includes('street_number') || types.includes('premise')) addressDetails.houseNo = comp.long_name;
      if (types.includes('route') || types.includes('sublocality')) addressDetails.street = comp.long_name;
      if (types.includes('locality')) addressDetails.city = comp.long_name;
      if (types.includes('administrative_area_level_1')) addressDetails.state = comp.long_name;
      if (types.includes('postal_code')) addressDetails.pincode = comp.long_name;
      if (types.includes('country')) addressDetails.country = comp.long_name;
    });

    onAddressSelect(addressDetails);
  };

  if (loadError) return <div className="p-4 bg-red-50 text-red-600 rounded-xl">Error loading Google Maps. Please check your API key in .env file (VITE_GOOGLE_MAPS_API_KEY).</div>;
  if (!isLoaded) return <div className="p-4 bg-gray-50 rounded-xl animate-pulse h-[300px]"></div>;

  return (
    <div className="space-y-4">
      <div className="relative z-10">
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-gray-400 w-5 h-5" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!ready}
            placeholder="Search for your area, street, or landmark"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <button 
            type="button"
            onClick={getCurrentLocation}
            className="absolute right-2 p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            title="Use Current Location"
          >
            <Crosshair className="w-5 h-5" />
          </button>
        </div>
        {status === 'OK' && (
          <ul className="absolute w-full bg-white mt-1 border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-auto">
            {data.map(({ place_id, description }) => (
              <li
                key={place_id}
                onClick={() => handleSelect(description)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3 border-b border-gray-50 last:border-0"
              >
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700">{description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          <Marker 
            position={markerPosition} 
            draggable={true} 
            onDragEnd={handleMarkerDragEnd} 
          />
        </GoogleMap>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md text-xs font-semibold text-gray-700 flex items-center gap-2 pointer-events-none">
          <MapPin className="w-4 h-4 text-primary-500" /> Drag pin to exact location
        </div>
      </div>
    </div>
  );
}
