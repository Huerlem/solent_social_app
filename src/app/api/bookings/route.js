// app/api/bookings/route.js
import { adminDb } from '@/firebase/firebaseAdmin';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingsSnapshot = await adminDb
      .collection('bookings')
      .where('user.uid', '==', user.uid)
      .get();

    const bookings = await Promise.all(
      bookingsSnapshot.docs.map(async (doc) => {
        const bookingData = doc.data();
        const eventDoc = await adminDb.collection('events').doc(bookingData.eventId).get();
        
        return {
          id: doc.id,
          ...bookingData,
          event: eventDoc.exists ? { id: eventDoc.id, ...eventDoc.data() } : null
        };
      })
    );

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error to search a booking:', error);
    return NextResponse.json({ error: 'Error to search a booking' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId } = body;

    // Check an event
    const eventRef = adminDb.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventData = eventDoc.data();
    if (eventData.capacity <= 0) {
      return NextResponse.json({ error: 'Event full booked' }, { status: 400 });
    }

    // Create a booking
    const bookingRef = await adminDb.collection('bookings').add({
      eventId,
      user: {
        uid: user.uid,
        email: user.email
      },
      status: 'confirmed',
      createdAt: new Date()
    });

   
    //Update Event`s capacity
    await eventRef.update({
      capacity: eventData.capacity - 1
    });

    return NextResponse.json({ 
      id: bookingRef.id, 
      message: 'Booked Successfully.' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error to create a booking:', error);
    return NextResponse.json({ error: 'Error to create a booking' }, { status: 500 });
  }
}