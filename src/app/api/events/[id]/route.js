import { adminDb } from '@/firebase/firebaseAdmin';
import admin from 'firebase-admin';
import { getStorage, ref, deleteObject } from 'firebase/storage';

// Handler to an API
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const doc = await adminDb.collection('events').doc(id).get();
    if (!doc.exists) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ id: doc.id, ...doc.data() }), { status: 200 });
  } catch (error) {
    console.error('Error to search an event:', error);
    return new Response(JSON.stringify({ error: 'Error to search an event' }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;

  try {
    const user = await authenticateAdmin(request);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const body = await request.json();
    const { title, description, address, type, capacity, location, image } = body;

    await adminDb.collection('events').doc(id).update({
      title,
      description,
      address,
      type,
      capacity,
      location,
      image,
      updatedAt: new Date(),
    });

    return new Response(JSON.stringify({ message: 'Event updated successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Error to update an event:', error);
    return new Response(JSON.stringify({ error: 'Error to update an event' }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const user = await authenticateAdmin(request);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  
    //delete associated image 
    const eventRef = adminDb.collection('events').doc(id);
    const eventDoc = await eventRef.get();

    if (eventDoc.exists) {
      const eventData = eventDoc.data();
      if (eventData.imageUrl) {
        const storage = getStorage();
        const imageRef = ref(storage, eventData.imageUrl);

        try {
          await deleteObject(imageRef);
          console.log('Event`s image deleted successfully.');
        } catch (error) {
          console.error('Error to delete event`s image:', error);
        }
      }
    }

    //delete an event
    await adminDb.collection('events').doc(id).delete();
    return new Response(JSON.stringify({ message: 'Event deleted successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Error to delete an event:', error);
    return new Response(JSON.stringify({ error: 'Error to delete an event' }), { status: 500 });
  }
}


//function to authenticate admin
async function authenticateAdmin(request) {
  try {
    const idToken = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return null;
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decodedToken.uid);

    if (!user.customClaims?.admin) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error to authenticate admin:', error);
    return null;
  }
}
