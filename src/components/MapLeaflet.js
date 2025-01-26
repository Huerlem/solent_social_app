'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/context/AuthContext';
import { bookEvent } from '@/lib/EventManagement';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';


const MapLeaflet = ({ events = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const { user } = useAuth();
  const router = useRouter();

  console.log('Booking Received:', events);

  // Function to handle booking
  const handleBookEvent = async (eventId) => {
    try {
      if (!user) {
        toast.error('Please, login to book!');
        router.push('/login');
        return;
      }

      await bookEvent(eventId, user.uid);
      toast.success('Event Booked Successefully!');
    } catch (error) {
      console.error('Error Booking:', error);
      toast.error(error.message || 'Error Booking');
    }
  };

  useEffect(() => {
    // Add listener for booking event
    window.addEventListener('bookEvent', (e) => handleBookEvent(e.detail));

    return () => {
      window.removeEventListener('bookEvent', (e) => handleBookEvent(e.detail));
    };
  }, [user]); // It depends on the user to have access to the current uid

  useEffect(() => {
    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        
        if (mapInstanceRef.current || !mapRef.current) return;
        
        mapInstanceRef.current = L.map(mapRef.current).setView([51.509865, -0.118092], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        const customIcon = L.icon({
          iconUrl: '/image/location.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        events.forEach(event => {
          const location = event.location;
          if (location) {
            const lat = parseFloat(location.latitude);
            const lng = parseFloat(location.longitude);

            if (!isNaN(lat) && !isNaN(lng)) {
              const marker = L.marker([lat, lng], { icon: customIcon })
                .addTo(mapInstanceRef.current);

              // Popup content based on authentication state
              const popupContent = `
                <div class="p-3">
                  <h3 class="font-bold">${event.title}</h3>
                  <p class="my-2">${event.description || ''}</p>
                  <p class="mb-2">${event.address || ''}</p>
                  <p class="mb-2">Capacidade: ${event.capacity || 0}</p>
                  ${
                    user 
                      ? `<button 
                          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full ${event.capacity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                          onclick="window.dispatchEvent(new CustomEvent('bookEvent', {detail: '${event.id}'}))"
                          ${event.capacity <= 0 ? 'disabled' : ''}
                        >
                          ${event.capacity > 0 ? 'Book Now' : 'Sold Out'}
                        </button>`
                      : `<button 
                          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                          onclick="window.location.href='/login'"
                        >
                          Login to Book
                        </button>`
                  }
                </div>
              `;

              marker.bindPopup(popupContent);
              markersRef.current.push(marker);
            }
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events, user]); // Added user as dependency

  return (
    <div 
      ref={mapRef} 
      style={{ height: '400px', width: '100%', position: 'relative' }}
      className="rounded-lg shadow-lg" 
    />
  );
};

export default MapLeaflet;