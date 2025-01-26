import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firebaseClient";

export const fetchEvents = async (type = "") => {
  try {
    const eventsCollection = collection(db, "events");
    const q = type.trim() 
      ? query(eventsCollection, where("type", "==", type)) 
      : eventsCollection;

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.warn("No events found.");
      return []; // Returns empty array in case of no event
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        location: data.location ? {
          latitude: data.location.latitude,
          longitude: data.location.longitude
        } : null
      };
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};


// Fetch bookings for a specific user
export const fetchBookings = async (userId) => {
  try {
    const bookingsQuery = query(collection(db, "bookings"), where("userId", "==", userId));
    const querySnapshot = await getDocs(bookingsQuery);
    return Promise.all(
      querySnapshot.docs.map(async (bookingDoc) => {
        const booking = bookingDoc.data();
        const eventSnap = await getDoc(doc(db, "events", booking.eventId));
        return { id: bookingDoc.id, ...booking, event: eventSnap.data() };
      })
    );
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Failed to fetch bookings.");
  }
};

// Fetch details of a single event
export const fetchEventDetails = async (eventId) => {
  try {
    if (!eventId) {
      throw new Error("Event ID is required.");
    }

    const eventDoc = await getDoc(doc(db, "events", eventId));
    if (!eventDoc.exists()) {
      throw new Error("Event not found.");
    }

    return { id: eventDoc.id, ...eventDoc.data() };
  } catch (error) {
    console.error("Error fetching event details:", error);
    throw new Error("Failed to fetch event details.");
  }
};

export const setBookings = async (bookings) => {
  try {
    const bookingsCollection = collection(db, "bookings");
    const batch = db.batch();

    bookings.forEach(booking => {
      const bookingRef = doc(bookingsCollection);
      batch.set(bookingRef, {
        ...booking,
        createdAt: new Date()
      });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error setting bookings:", error);
    throw new Error("Failed to set bookings.");
  }
};