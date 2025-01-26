'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchEventDetails } from '@/lib/EventHandler';
import Loading from '@/components/Loading';
import Error from '@/components/Error';

export default function EventDetails() {
  const router = useRouter();
  const [id, setId] = useState(null); // Manage event ID in state
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the event ID from the URL once the router is available
  useEffect(() => {
    const { id: queryId } = router.query || {}; // Check if `router.query` is available
    if (queryId) {
      setId(queryId);
    }
  }, [router.query]);

  // Load event details when ID is available
  useEffect(() => {
    if (!id) return;

    const loadEventDetails = async () => {
      try {
        const eventDetails = await fetchEventDetails(id);
        setEvent(eventDetails);
      } catch (err) {
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    loadEventDetails();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p>{event.description}</p>
      <p>Type: {event.type}</p>
      <p>Date: {new Date(event.date._seconds * 1000).toLocaleDateString()}</p>
      <p>Location: {event.address}</p>
      <img src={event.image} alt={event.title} className="w-full h-auto mt-4" />
    </div>
  );
}
