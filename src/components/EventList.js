'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchEvents } from "@/lib/EventHandler";
import { bookEvent, deleteEvent } from "@/lib/EventManagement";
import { useAuth } from '@/context/AuthContext';
import Loading from './Loading';
import Error from './Error';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import _debounce from 'lodash/debounce';

export default function EventList() {
  const { user, isAdmin } = useAuth();
  const [searchType, setSearchType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Reference for debounce
  const debouncedSearch = useRef(
    _debounce((term, events) => {
      const filtered = term.trim()
        ? events.filter(event =>
            event.title.toLowerCase().includes(term.toLowerCase()) ||
            event.description.toLowerCase().includes(term.toLowerCase())
          )
        : events;
      setFilteredEvents(filtered);
    }, 300) // 300ms delay
  ).current;

  // Loading Events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await fetchEvents(searchType);
        setEvents(eventsData);
        setFilteredEvents(eventsData); // Initially sets loaded events as filtered
        
      } catch (error) {
        console.error('Error Loading Events:', error);
        setError('Failed to load events.');
        
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [searchType]);

  // Apply filter while typing
  useEffect(() => {
    debouncedSearch(searchTerm, events);
  }, [searchTerm, events]);

  // Booking Handler
  const handleBooking = async (eventId) => {
    try {
      if (!user) {
        toast.error('Please login to book this event');
        return;
      }

      const result = await bookEvent(eventId, user.uid);
      toast.success(result.message);

      // Updates events after booking
      const updatedEvents = await fetchEvents(searchType);
      setEvents(updatedEvents);
      setFilteredEvents(updatedEvents);
    } catch (error) {
      toast.error(error.message || 'Error booking event');
    }
  };

  // Handler to delete event
  const handleEventDelete = async (eventId) => {
    try {
      if (!isAdmin) {
        toast.error('Only administrators can delete events');
        return;
      }

      if (window.confirm('Are you sure you want to delete this event?')) {
        await deleteEvent(eventId);
        toast.success('Event Deleted Successfully!');

        const updatedEvents = await fetchEvents(searchType);
        setEvents(updatedEvents);
        setFilteredEvents(updatedEvents);
      }
    } catch (error) {
      console.error('Error Deleting Event:', error);
      toast.error(error.message || 'Erro Deleting Event');
    }
  };

  // Handler for event editing
  const handleEditEvent = (event) => {
    if (!isAdmin) {
      toast.error('Only administrators can edit events');
      return;
    }
    router.push(`/admin/edit-event/${event.id}`);
  };

  const handleCreateEvent = () => {
    if (!isAdmin) {
      toast.error('Only administrators can create events');
      return;
    }
    router.push('/admin/create-event');
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="container bg-purple-100">
      {user && (
        <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome to, {isAdmin ? (
              <span className="text-blue-600">Admin {user.displayName || user.email}</span>
            ) : (
              user.displayName || user.email
            )}
          </h2>
        </div>
      )}

      <div className="w-full flex justify-center">
        <div className="flex items-center space-x-4 my-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="p-2 border rounded bg-white"
          >
            <option value="">All Types</option>
            <option value="social">Social</option>
            <option value="coding">Coding</option>
            <option value="music">Music</option>
            <option value="day out">Day Out</option>
          </select>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded w-64 bg-white"
          />
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredEvents.map((event) => (
          <li key={event.id} className="bg-white p-4 rounded shadow">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-32 object-cover mt-2 p-2 rounded mb-2"
              width="200"
              height="300"
            />
            <h3 className="font-bold text-lg mb-2">{event.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{event.description}</p>

            
            <div className="space-y-2 mb-3">
              <p className="text-sm">
                <span className="font-semibold">Data:</span>{" "}
                {event.date ? new Date(event.date.toDate()).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Data não disponível'}
              </p>
              
              <p className="text-sm">
                <span className="font-semibold">Address:</span>{" "}
                {event.address || 'Endereço não disponível'}
              </p>

              <p className="text-sm">
                <span className="font-semibold">Type:</span>{" "}
                {event.type || 'Tipo não especificado'}
              </p>

              <p className="text-sm">
                <span className="font-semibold">Capacity:</span>{" "}
                {event.capacity}
              </p>
            </div>

            {/* Show "Book Now" button only if logged in */}
            {user ? (
              <button
                onClick={() => handleBooking(event.id)}
                className={`mt-2 p-2 rounded w-full ${
                  event.capacity > 0 ? 'bg-pink-300 hover:bg-pink-400' : 'bg-gray-400'
                } text-white`}
                disabled={event.capacity <= 0}
              >
                {event.capacity > 0 ? 'Book Now' : 'Sold Out'}
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="mt-2 p-2 rounded w-full bg-purple-400 hover:bg-purple-500 text-white"
              >
                Login to Book
              </button>
            )}

            {/* Show admin buttons only if admin */}
            {isAdmin && (
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleEditEvent(event)}
                  className="p-2 bg-purple-400 hover:bg-purple-500 text-white rounded flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleEventDelete(event.id)}
                  className="p-2 bg-purple-400 hover:bg-purple-500 text-white rounded flex-1"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
