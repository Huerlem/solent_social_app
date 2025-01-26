// app/api/bookings/[id]/route.js
import { adminDb } from '@/firebase/firebaseAdmin';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function DELETE(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const bookingRef = adminDb.collection('bookings').doc(id);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return NextResponse.json({ error: 'Booking not found!' }, { status: 404 });
    }

    const bookingData = bookingDoc.data();
    if (bookingData.user.uid !== user.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    
    //Update event`s capacity
    const eventRef = adminDb.collection('events').doc(bookingData.eventId);
    await eventRef.update({
      capacity: adminDb.firestore.FieldValue.increment(1)
    });

    
    //delete a booking
    await bookingRef.delete();

    return NextResponse.json({ message: 'Booking Cancelled Successfully.' });
  } catch (error) {
    console.error('Error to cancel a booking:', error);
    return NextResponse.json({ error: 'Error to cancel a booking' }, { status: 500 });
  }
}