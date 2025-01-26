// components/BookingForm.js

'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { auth } from '@/firebase/firebaseClient'; 
import { db } from '@/firebase/firebaseClient'; 
import { collection, addDoc } from 'firebase/firestore';
import { fetchBookings, setBookings } from "@/lib/EventHandler";

useEffect(() => {
  const loadBookings = async () => {
    const userBookings = await fetchBookings(userId);
    setBookings(userBookings);
  };

  loadBookings();
}, [userId]);

function BookingForm({ eventId, availableSpots }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const router = useRouter();

  const onSubmit = async (data) => {
    const user = auth.currentUser;
    if (!user) {
      setBookingError("You must be Logged in to book an event!.");
      return;
    }

    if (availableSpots <= 0) {
      setBookingError("Sorry, This event is fulled booked.");
      return;
    }

    try {
      // Create a new booking in database
      const docRef = await addDoc(collection(db, "bookings"), {
        eventId: eventId,
        userId: user.uid,
        userName: data.userName,
        
        createdAt: new Date(),
      });

      setBookingSuccess(true);
      setBookingError(null);
      
      console.log("Booking create with Id: ", docRef.id);
    } catch (error) {
      console.error("Error to add a booking: ", error);
      setBookingError("Error creating reservation. Try again.");
    }
  };

  if (bookingSuccess) {
    return <div>Booked Successfully!</div>;
  }

  return (
    <div>
      {bookingError && <p style={{ color: 'red' }}>{bookingError}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="userName">Your Name</label>
          <input
            type="text"
            id="userName"
            {...register("userName", { required: "Name is Required!" })}
          />
          {errors.userName && <p>{errors.userName.message}</p>}
        </div>
        
        <button type="submit">Book</button>
      </form>
    </div>
  );
}

export default BookingForm;