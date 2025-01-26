// pages/bookings/[id].js
import BookingDetails from '@/components/BookingDetails';
import Loading from '@/components/Loading'; 
import { Suspense } from 'react';

function BookingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BookingDetails />
    </Suspense>
  );
}

export default BookingPage;