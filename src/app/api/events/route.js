import { adminDb } from '@/firebase/firebaseAdmin';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import cors from 'cors';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET() {
  try {
    console.log('Firebase Admin apps:', admin.apps.length); // Debug
    const eventsSnapshot = await adminDb.collection('events').get();
    const events = eventsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(event => event && event.title && event.location);

    return new Response(JSON.stringify(events), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error details:', error); // Debug
    return new Response(JSON.stringify({ 
      error: 'Error fetching events',
      details: error.message 
    }), { 
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { 
    status: 204,
    headers: corsHeaders
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, description, type, capacity, location, address, date, image } = body;

    
    //Authenticate user as admin
    const user = await authenticateAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    // Additional validation, if required
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
    }

    const docRef = await adminDb.collection('events').add({
      title,
      description,
      type,
      capacity,
      location,
      address,
      date: new Date(date),
      image,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ message: "An event created successfully" }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error to create an event", details: error.message }), {
      status: 500,
    });
  }
}


//function to authenticate admin
async function authenticateAdmin(req) {
  try {
    const idToken = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return { error: 'Unauthorized' };
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decodedToken.uid);

    if (!user.customClaims?.admin) {
      return { error: 'Access Declined' };
    }

    return { user };
  } catch (error) {
    console.error('Error to authenticate admin:', error);
    return { error: 'Internal Server Error' };
  }
}