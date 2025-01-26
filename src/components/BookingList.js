// components/BookingList.js
'use client'
import useSWR from 'swr';
import { auth } from '../firebase/firebaseClient';
import { useState, useEffect } from 'react';
import Link from 'next/link';


const fetcher = (url) => fetch(url).then((res) => res.json());

function BookingList() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const { data: bookings, error } = useSWR(
    user ? `/api/bookings?userId=${user.uid}` : null,
    fetcher
  );

  if (error) return <div>Error Loading Booking</div>;
  if (!bookings) return <div>Loading...</div>;

  const [errorMessage, setErrorMessage] = useState(null);
  
  const handleCancelBooking = async (bookingId) => {
    setErrorMessage(null); // Clean error message
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error Cancelling Booking');
      }

     
      //Update Booking`s List after cancelled
      mutate(`/api/bookings?userId=${user.uid}`); //Update SWR

    } catch (error) {
      console.error(error);
      setErrorMessage(error.message); // Definy error message
    }
  };

  return (
    <div>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            <Link href={`/bookings/${booking.id}`}>
              Booking to event {booking.eventId}
            </Link>
            <button onClick={() => handleCancelBooking(booking.id)}>
              Cancel Booking
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookingList;