"use client";


import { useState, useEffect, SetStateAction, useRef } from "react";
import {db, auth} from '../../firebase/firebase';
import { onAuthStateChanged, signOut, getAuth, getIdTokenResult } from 'firebase/auth';
import { collection, query, where, getDocs, getDoc, getFirestore} from 'firebase/firestore';
import * as firebaseFunctions from '../../firebase/firebaseFunctions';
import { doc } from 'firebase/firestore';
import AdminForm from '../components/AdminForm';
import L from 'leaflet';
import markerIcon from './marker-icon.png';
import "leaflet/dist/leaflet.css";
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

export default function Body() {
  const [events, setEvents] = useState([]); // Lista de eventos
  const [searchType, setSearchType] = useState(''); // Termo de busca
  const [user, setUser] =useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] =useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const pageRef = useRef(null);
  const [showAdminEventForm, setShowAdminEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth();


  // Função para buscar os eventos
  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
  
        // 1. Verificar claims personalizadas
        const tokenResult = await getIdTokenResult(user);
        if (tokenResult.claims.role === 'admin') {
          setIsAdmin(true);
          return;
        }
  
        // 2. Se não houver claims, verificar no Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
  
    return () => unsubscribe(); 
  }, []);

useEffect(() => {
  const fetchEvents = async () => {
    let q = query(collection(db, 'events'));
  if (searchType) {
    q = query(q, where('type', '==', searchType));
  }
  const querySnapshot = await getDocs(q);
  const eventsData = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data() }));
  setEvents(eventsData);
  };
  fetchEvents();
}, [searchType]);

const fetchBookings = async (userId) => {
  const bookingRef = collection(db, 'bookings')
  const q = query(bookingRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const bookingsData = await Promise.all(querySnapshot.docs.map(async (bookingDoc) => { // Renomeado para bookingDoc
    const booking = bookingDoc.data();
    
    const eventRef = doc(db, 'events', booking.eventId);
    const eventSnap = await getDoc(eventRef); 

    return { id: bookingDoc.id, ...booking, event: eventSnap.data() };
  }));
  setBookings(bookingsData);
};

const handleSearchTypeChange = (customEvent: { target: { value: SetStateAction<string>; }; }) => {
  setSearchType(customEvent.target.value);
};

const filteredEvents = events.filter((event) => 
  event.type.toLowerCase().includes(searchType.toLowerCase())
);

const handleBooking = async (eventId) => {
  try {
    const result = await firebaseFunctions.bookEvent(user.uid, eventId);
    if(result.success) {
      setEvents(events.map(event => event.id === eventId ? { ...event, capacity: result.newCapacity } : event ));
      fetchBookings(user.uid);
    } else {
      alert(result.message);
    }
  }catch (error) {
    console.error('Failed to booking na event: ', error);
    alert('Faile to booking an event')
  }
};

useEffect(() => {
  let map;
  const customIcon = L.icon({
    iconUrl: '/image/marker-icon.png', // Path to your custom icon
    iconSize: [32, 32], // Adjust icon size as needed
    iconAnchor: [16, 32], // Adjust icon anchor as needed
  });

  if (events.length && mapRef.current) {
    if (!map) {
      map = L.map(mapRef.current).setView([51.509865, -0.118092], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      setMap(map);
    } else {
      // Remove existing markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
    }

    // Add new markers based on the updated events array
    events.forEach((event) => {
      if (event.location) {
        const marker = L.marker([event.location?.latitude, event.location?.longitude], { icon: customIcon }).addTo(map);

      const bookButton = document.createElement('button');
      bookButton.textContent = 'Book Now';

      bookButton.addEventListener('click', () => handleBooking(event.id));

      const bookingWindow = document.createElement('div');
      bookingWindow.innerHTML = `
            <div>
              <h3>${event.title}</h3>
              <p>${event.description}</p>
            </div>
          `;

      bookingWindow.appendChild(bookButton);
      marker.bindPopup(bookingWindow);
      } else {
        console.warn(`Event ${event.title} is missing location data`);
      }
    });
  }
      

  return () => {
    if (map) {
      map.remove();
      map = null;
    }
  };
}, [events]);

const handleSearchTermChange = (event) => {
  setSearchTerm(event.target.value);
};

const handleSearch = () => {
  const filtered = events.filter(event => {
    const search = searchTerm.toLowerCase();
    return (
      event.title?.toLowerCase().includes(search) || 
      event.description?.toLowerCase().includes(search) ||
      event.date?.toDate().toLocaleDateString().includes(search) 
    );
  });

  if (filtered.length > 0) {
    setEvents(filtered);

    // Check if map is initialized AND first event has location
    if (map && filtered[0] && filtered[0].location) { 
      const firstEvent = filtered[0];
      // Ensure map is fully initialized before calling setView
      setTimeout(() => {
        map.setView([firstEvent.location.latitude, firstEvent.location.longitude], 13);
      }, 0); 
    } else {
      // Handle cases where the map is not initialized or the first event has no location data
      if (!map) {
        console.warn("Map is not yet initialized.");
      } else if (!filtered[0] || !filtered[0].location) {
        console.warn("First event is missing location data.");
      }
    }
  } else {
    alert('No events found matching your search.')
  }
}
   
const handleCancelBooking = async (bookingId) => {
  try {
    await firebaseFunctions.cancelBooking(bookingId);
    fetchBookings(user.uid);
    setSelectedBooking(null);
  } catch (error) {
    console.error('failed to cancel booking: ', error);
    alert('Failed to cancel a Booking.');
  }
};

const handleEventEdit = async (eventId, updatedData) => {
  try {
    await firebaseFunctions.editEvent(event.id, event);
    const updatedEvents = await fetchEvents();
    setEvents(updatedEvents);
    setEditingEvent(null); // Reset editing state
  } catch (error) {
    console.error('Error editing an event: ', error);
    alert('Error editing event.');
  }
};

const handleEventDelete = async (eventId) => {
  try {
    await firebaseFunctions.deleteEvent(eventId);
    const updatedEvents = await fetchEvents();
    setEvents(updatedEvents);
  } catch (error) {
    console.error('Failed to delete an event: ', error);
    alert('Failed to delete an event.');
  }
};

const handleBookingSelect = (booking) => {
  setSelectedBooking(booking);
};

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('Logged in User:', user);  // Adicione este log
    setUser(user);
    if(user) {
      fetchBookings(user.uid);
    } else {
      setBookings([]);
    }
  });
return () => unsubscribe();
}, [])

return (
  <div className="container bg-purple-100" ref={pageRef}>
    <div className="flex flex-col items-center">
        <div ref={mapRef} className="h-[400px] w-full" />
        <select className="w-48 border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-4 mt-8" value={searchType} onChange={handleSearchTypeChange}>
          <option value="">All types</option>
          <option value="social">Social</option>
          <option value="coding">Coding</option>
          <option value="music">Music</option>
          <option value="day out">Day Out</option>
        </select>
        <div className="flex items-center">
          <input type='text' placeholder='Seach by title, description, or date...' value={searchTerm} onChange={handleSearchTermChange} className="w-96 flex-grow border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mr-2 mb-4"/>
          <button onClick={handleSearch} className="px-3 py-2 text-indigo-500 hover:text-indigo-700 rounded-md bg-gray-200 hover:bg-gray-300 shadow-sm mb-4 ">Search</button>
        </div>
        <ul className="grid grid-cols-4 gap-4 px-4 mb-4">
          {events.map(event => (
            <li key={event.id} className="bg-white shadow-xl rounded-2xl p-8 hover:shadow-2xl transition-shadow duration-300">
            {/* Access event properties correctly */}
            <p className="text-sm">{event.image}</p>  
            <h2 className="text-lg font-semibold">{event.title}</h2>  
            <h3>{event.type}</h3>
            <p>{event.description}</p> 
            <p>{event.address}</p> 
            {/* Access other event properties like date, time, location, etc. */}
            <p>Data: {event.date.toDate().toLocaleDateString()} - Time: {event.date.toDate().toLocaleTimeString()}</p> 
            <p>Availability: {event.capacity}</p> 
            
            {user && (
              <button disabled={event.capacity === 0} onClick={() => handleBooking(event.id)} className="px-3 py-2 text-white bg-indigo-500 hover:bg-indigo-700 rounded-md shadow-sm disabled:bg-gray-400"> 
                Booking
              </button>
            )}
            
            {user && user.role === 'admin' && (
              <div className="flex space-x-2 mt-2">
                <button 
                  onClick={() => setEditingEvent(event)}
                  className="px-3 py-2 text-white bg-green-500 hover:bg-green-700 rounded-md shadow-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleEventDelete(event.id)}
                  className="px-3 py-2 text-white bg-red-500 hover:bg-red-700 rounded-md shadow-sm"
                >
                  Delete
                </button>
              </div>
            )}
        </li>
      ))}
    </ul>
    </div>

    {user && (
    <div className="container bg-purple-100" ref={pageRef}>
      <h2 className="text-center mb-4 block text-9x1 text-gray-1000 font-bold">My Bookings</h2>
      <div className="grid grid-cols-4 gap-4 px-4 mb-4">
        {bookings.map(booking => (
          <div key={booking.id} className="bg-white shadow-xl rounded-2xl p-8 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-lg font-semibold">{booking.event.title}</h2>
            <p className="text-gray-600 text-sm">{booking.event.type}</p>
            <p className="text-gray-600 text-sm">
            {booking.event.date.toDate().toLocaleDateString()} - {booking.event.date.toDate().toLocaleTimeString()}</p> {/* Date and time */}
          <p className="text-gray-600 text-sm">{booking.event.address}</p>
            {/* Adicione mais detalhes aqui, se necessário, como data e hora */}
            <button
              onClick={() => handleCancelBooking(booking.id)}
              className="px-3 py-2 text-white bg-purple-200 hover:bg-purple-400 rounded-md shadow-sm mt-2">
              Cancelar Reserva
            </button>
          </div>
        ))}
      </div>
    </div>
    )}

    {/* Admin Event Form */}
    {user && user.role === 'admin' && (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <button 
            onClick={() => setShowAdminEventForm(!showAdminEventForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showAdminEventForm ? 'Hide Event Form' : 'Add New Event'}
          </button>
        </div>

        {showAdminEventForm && (
          <AdminEventForm 
            user={user} 
            onEventAdded={() => {
              fetchEvents();
              setShowAdminEventForm(false);
            }} 
          />
        )}
      </div>
    )}

    {/* Edit Event Form */}
    {editingEvent && (
      <AdminEventEditForm 
        event={editingEvent}
        onEventUpdated={() => {
          fetchEvents();
          setEditingEvent(null);
        }}
        onCancel={() => setEditingEvent(null)}
      />
    )}
  </div>
);
}