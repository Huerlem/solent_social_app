import { admin } from '@/firebase/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Authenticate of user
    const user = await authenticateUser(req, res);
    if (!user) return;

    try {
      //Return user Date, includin admin role, if available
      const customClaims = user.customClaims || {}; //Verify if there is a customClaims
      res.status(200).json({
        uid: user.uid,
        email: user.email,
        admin: customClaims.admin || false, //Use customClaims safely
      });
    } catch (error) {
      console.error('Error to get a user`s data:', error);
      res.status(500).json({ error: 'Error to get a user`s data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} denied>`);
  }
}

async function authenticateUser(req, res) {
  try {
    // Get the authentication token from the request header
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      res.status(401).json({ error: 'Missing or invalid authentication token.' });
      return null;
    }

    // Verify token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decodedToken.uid);

    return user;
  } catch (error) {
    console.error('Error to authenticate user:', error);
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
    return null;
  }
}
