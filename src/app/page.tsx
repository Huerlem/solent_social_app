
'use client';

import EventList from '@/components/EventList';
import EventDetails from '@/components/EventDetails';
import Map from '@/components/Map';
import useSWR from 'swr';
import Loading from '@/components/Loading';
import Error from '@/components/Error';

const fetcher = (url: string | URL | Request) => fetch(url).then((res) => res.json());

function Home() {
    const { data: events, error } = useSWR('/api/events', fetcher);
  
    if (error) return <Error message="Failed to load events" />;
    if (!events) return <Loading />;
  
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Solent Social</h1>
        <Map events={events} />
        <EventList />
        <EventDetails />
      </div>
    );
}

export default Home;