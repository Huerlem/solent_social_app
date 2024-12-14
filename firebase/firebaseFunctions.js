import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  increment,

} from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, update } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth';


export const monitorAuthState = (callback) => {
    onAuthStateChanged(auth, callback);
};

// Using storageRef
const storage = getStorage();
const fileRef = storageRef(storage, 'some/path/to/file');

// Using dbRef
const database = getDatabase();  
const userRef = dbRef(database, 'users/userID');

//Events functions:

export async function fetchEvents () {
    try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error cathing the event: ', error);
        throw error;
    }
};

export const addEvent = async (eventData) => {
    try {
        const docRef = await addDoc(collection(db, 'events'), eventData);
        console.log('Event added with ID: ', docRef.id);
    } catch (error) {
        console.log('Error adding event: ', error);
    }
};

export const editEvent = async (id, updatedData) => {
    try {
      const eventRef = doc(db, 'events', id);
      await updateDoc(eventRef, updatedData);
      console.log('Event Updated!');
    } catch (error) {
      console.error('Failed to update this event:', error);
      throw error;
    }
};

export const deleteEvent = async (id) => {
    try {
      const eventRef = doc(db, 'events', id);
      await deleteDoc(eventRef);
      console.log('Evento removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover evento:', error);
      throw error;
    }
};

export const bookEvent = async (userId, eventId) => {
    try {
        //refer a event`s doc
        const eventRef = doc(db, 'events', eventId);

        //get event`s data
        const eventSnap = await getDoc(eventRef);
        if(!eventSnap.exists()) {
            throw new Error('Event not Found!');
        }

        const eventData = eventSnap.data();
        if (eventData.capacity <= 0) {
            throw new Error('No more spots available');
        }
        
        //update the capacity
        const newCapacity = eventData.capacity - 1;
        await updateDoc(eventRef, { capacity: increment(-1)});

        //add bookings
        const bookingRef = collection(db, 'bookings');
        await addDoc(bookingRef, {
            eventId,
            userId,
            status: 'confirmed',
            timestamp: new Date().toISOString(),
        });
        
        console.log('Booking Successful!');
        return { success: true, newCapacity};
    } catch (error) {
        console.error('Booking error: ', error.message);
        return { success: false, message: error.message};
    }
};

export const cancelBooking = async (bookingId) => {
    try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);
        const bookingData = bookingSnap.data();
        const eventId = bookingData.eventId;

        // Incrementa a capacidade do evento
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, { capacity: increment(1) });

        // Remove a reserva
        await deleteDoc(bookingRef);
        console.log('Booking Cancelled Successfully!');
    } catch (error) {
        console.error('Failed to cancel a booking:', error);
    }
};


//authentications:
export const loginUser = async(email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('User Credential:', userCredential);
        console.log('User UID:', user.uid);

        //get the user`s role from firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if(userDoc.exists())
        {
            const userData = userDoc.data();

            console.log('User Document Data:', userData);
            console.log('User Role:', userData.role);

            user.role = userData.role;
            console.log('User logged in: ', user.email, 'role: ', userData.role, 'Name: ', userData.name);
            return { ... user, role: userData.role, name: userData.name}

            
        } else {
            console.log('User document not found');
            await setDoc(userDocRef, {
                name: user.displayName || 'New User',
                email: user.email,
                role: 'user',
                
            });
            console.log('User document created for new user.');
            return { ...user, role: 'user', name: 'New User' };
        }
       
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    
        if (error.code === 'auth/invalid-email') {
          alert('Invalid email format.');
        } else if (error.code === 'auth/user-not-found') {
          alert('No user found with that email.');
        } else if (error.code === 'auth/wrong-password') {
          alert('Incorrect password.');
        } else {
          // For other errors, display a generic message or the Firebase error message
          alert('Login failed: ' + error.message); 
        }
    
        throw error; // Re-throw for further handling if needed
      }
    };

const handleLogin = (email, password) => {
    loginUser(email, password);
};


onAuthStateChanged(auth, (user) => {
    if(user) {
        console.log('User logged in: ', user.email);
    } else {
        console.log('User is not logged in!')
    }
});

export const registerUser = async (email, password, name) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            name,
            email,
            role: 'user',
        });

        console.log('User registered: ', user);
    } catch (error) {
        console.error('Error registering user: ', error);
    }
};

const handlePasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log('Password reset email sent!');
    } catch (error) {
        console.log('Error sending password reset email: ', error);
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log('User logged out');
    } catch (error) {
        console.error('Error during logout: ', error);
    }
};

//imageUrl
export const upload = async (file) => {
    const storage = getStorage();
    const storageRef = ref(storage, `eventes/${file.name}`);

    //upload the file
    await uploadBytes(storageRef, fiel);

    //get the file`s URL
    const url = await getDownloadURL(storageRef);
    return url;
};

export const saveImageUrlaToEvent = async (eventId, image) => {
    try {
        const db = getDatabase();
        const eventRef = ref(db, `events/${eventId}`);
        await update(eventRef, {image});
        console.log('Image saved successfully.');
    } catch (error) {
        console.log('Failed to save the image: ', error);
    }
    
};