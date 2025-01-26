// components/BookingDetails.js
'use client'
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

const fetcher = (url) => fetch(url).then((res) => res.json());

function BookingDetails() {
  const router = useRouter();
  const { id } = router.query; //Booking id

  const { data: booking, error } = useSWR(
    id ? `/api/bookings/${id}` : null,
    fetcher
  );

  if (error) return <div>Error Loading Booking Details!</div>;
  if (!booking) return <div>Loading...</div>;

  return (
    <div>
      <h1>Booking Details</h1>
      <p>Booking Id: {booking.id}</p>
      <p>Event Id: {booking.eventId}</p>
      <p>User Name: {booking.userName}</p>
      {/* Adicione outros detalhes da reserva aqui, se houver */}
      <p>Booking date: {new Date(booking.createdAt).toLocaleString()}</p>
    </div>
  );
}

export default BookingDetails;