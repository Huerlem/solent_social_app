// src/lib/adminAuth.js
import { adminAuth } from '@/firebase/firebaseAdmin';

export async function verifyAdminAuth(req) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) return null;
    
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error in auth admin verification:', error);
    return null;
  }
}

export async function isUserAdmin(userId) {
  try {
    const user = await adminAuth.getUser(userId);
    const customClaims = user.customClaims || {};
    return customClaims.admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}