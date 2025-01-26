'use client';

import dynamic from 'next/dynamic';

// Dynamically import MapLeaflet
const MapLeaflet = dynamic(() => import('./MapLeaflet'), { ssr: false,
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <p>Loading Map...</p>
    </div>
  ) 

 });

export default function Map({ events }) {

  console.log('Events received on Map:', events);
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="h-[400px] w-full">
          <MapLeaflet events={events} />
        </div>
      </div>
  );
  
}
