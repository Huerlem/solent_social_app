
import { db } from '@/firebase/firebaseClient';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { getAuth } from 'firebase/auth';
import { orderBy } from "firebase/firestore";

// Function to book an event
export const bookEvent = async (eventId, userId) => {
  try {
    //Checks if event exists
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Event not Found!');
    }

    const eventData = eventDoc.data();
    // Removed capacity check to allow multiple reservations

    // Create the booking with more information
    const bookingData = {
      eventId: eventId,
      status: 'confirmed',
      user: {
        uid: userId
      },
      eventTitle: eventData.title, 
      createdAt: serverTimestamp()
    };

    // Add booking
    const booking = await addDoc(collection(db, 'bookings'), bookingData);

    // Updates event capacity
    await updateDoc(eventRef, {
      capacity: increment(-1)
    });

    return { 
      success: true, 
      message: `Booking for ${eventData.title} successfully completed! 🎉`, 
      bookingId: booking.id 
    };
  } catch (error) {
    console.error('Error booking:', error);
    
    if (error.message.includes('already have a booking')) {
      throw new Error('You already have a reservation for this event, but feel free to make another one! 😊');
    }
    throw error;
  }
};

// Function to search for a user's bookings
export const getUserBookings = async (userId) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where("user.uid", "==", userId)
    );
    const querySnapshot = await getDocs(q);

    const bookings = await Promise.all(
      querySnapshot.docs.map(async (bookingDoc) => {
        const bookingData = bookingDoc.data();
        const eventDoc = await getDoc(doc(db, 'events', bookingData.eventId));
        
        return {
          id: bookingDoc.id,
          eventId: bookingData.eventId,
          status: bookingData.status,
          createdAt: bookingData.createdAt,
          eventTitle: bookingData.eventTitle,
          user: bookingData.user,
          event: eventDoc.exists() ? {
            id: eventDoc.id,
            ...eventDoc.data()
          } : null
        };
      })
    );

    return bookings;
  } catch (error) {
    console.error('Error searching a booking:', error);
    throw new Error('We were unable to load your reservations. Please try again..');
  }
};

// Function to cancel a reservation
export const cancelBooking = async (bookingId, userId) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
      throw new Error('Booking not Found');
    }

    const bookingData = bookingDoc.data();
    if (bookingData.user.uid !== userId) {
      throw new Error('You are not allowed to cancel this reservation.');
    }

    // Increases event capacity
    const eventRef = doc(db, 'events', bookingData.eventId);
    await updateDoc(eventRef, {
      capacity: increment(1)
    });

    // Delete a booking
    await deleteDoc(bookingRef);

    return { 
      success: true, 
      message: `Booking for ${bookingData.eventTitle || 'event'} successfully cancelled! 👋` 
    };
  } catch (error) {
    console.error('Error cancelling a booking:', error);
    throw new Error('Unable to cancel reservation. Please try again..');
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Event not Found!');
    }

    let updatedImage = eventData.image;

    // If there is a new image
    if (imageUpload) {
      const storage = getStorage();
      
      // Delete the old image if it exists
      const oldData = eventDoc.data();
      if (oldData.image) {
        try {
          const oldImageRef = ref(storage, oldData.image);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.warn('Error deleting old image:', error);
        }
      }

      // Upload new image
      const imagePath = `event-images/${Date.now()}-${imageUpload.name}`;
      const newImageRef = ref(storage, imagePath);
      await uploadBytes(newImageRef, imageUpload);
      updatedImage = await getDownloadURL(newImageRef);
    }

    // Updates the document with the new image URL
    const updateData = {
      ...eventData,
      image: updatedImage,
      updatedAt: serverTimestamp()
    };

    await updateDoc(eventRef, updateData);

    return {
      success: true, 
      message: 'Event updated successfully!',
      image: updatedImage
    };
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Unauthenticated user');
      return;
    }

    // Checks if event exists
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }
      

    // If there is an image, delete it first.
    const eventData = eventDoc.data();
    if (eventData.image) {
      try {
        const storage = getStorage();
        const imageRef = ref(storage, eventData.image);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('Error deleting image:', error);
      }
    }

    // Delete associated bookings
    const bookingsRef = collection(db, 'bookings');
    const bookingsQuery = query(bookingsRef, where('eventId', '==', eventId));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    
    const deleteBookingPromises = bookingsSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(deleteBookingPromises);

    // Delete the event
    await deleteDoc(eventRef);

    return { success: true, message: 'Event deleted successfully!' };
  } catch (error) {
    console.error('Error deleting event:', error);
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to delete this event.');
    }
    throw error;
  }
};