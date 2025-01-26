'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserBookings, cancelBooking } from '@/lib/EventManagement';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const userBookings = await getUserBookings(user.uid);
      setBookings(userBookings);
    } catch (error) {
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadBookings();
  }, [user, router]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId, user.uid);
      toast.success('Booking Cancelled Successfully!');
      loadBookings(); // loading booking
    } catch (error) {
      toast.error(error.message || 'Error to cancel booking');
    }
  };

  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">You do not have any bookings yet!</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Explore Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {booking.event?.image && (
                <img 
                  src={booking.event.image}
                  alt={booking.event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{booking.event?.title}</h3>
                <p className="text-gray-600 mb-2">{booking.event?.description}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    Status: <span className="font-semibold">{booking.status}</span>
                  </p>
                  {booking.event?.address && (
                    <p className="text-sm text-gray-500">
                      Local: {booking.event.address}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Cancell Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}