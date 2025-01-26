// pages/events/[id].js
'use client';
import EventDetails from '@/components/EventDetails';
import BookingForm from '@/components/BookingForm';
import Loading from '@/components/Loading';
import Error from '@/components/Error';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Event } from '@/types';

const fetcher = (url) => fetch(url).then((res) => res.json());

function EventPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: event, error: eventError, isLoading } = useSWR(
    id ? `/api/events/${id}` : null, 
    fetcher
  );

  if (eventError) return <div>Error Loading Events</div>;
  if (isLoading) return <Loading />;
  if (!event) return null;
  
  return (
    <div>
      <EventDetails event={event}/>
      <BookingForm 
        eventId={event.id} 
        availableSpots={event.capacity - (event.booked || 0)} 
      />
    </div>
  );
}

export default EventPage;