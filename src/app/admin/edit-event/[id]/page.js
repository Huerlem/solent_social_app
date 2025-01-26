'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import EventForm from '@/components/Admin/EventForm';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';
import Loading from '@/components/Loading';

export default function EditEvent({ params }) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState(null);


  // Checks if the user has administrator permissions
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        if (resolvedParams.id) {
          setEventId(resolvedParams.id);
        } else {
          console.error('Event`s id not found in parameter');
          router.push('/admin');
        }
      } catch (error) {
        console.error('Error resolving parameters:', error);
        router.push('/admin');
      }
    };
    resolveParams();
  }, [params, router]);

  // Fetching event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        } else {
          console.error('Event not found.');
        }
      } catch (error) {
        console.error('Error to fetch an event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Check permission to admin
  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, router]);

  if (loading) return <Loading />;
  if (!event) return <div>Event not found!</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Event</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go back
          </button>
        </div>
        <EventForm event={event} />
      </div>
    </div>
  );
}
