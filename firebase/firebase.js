import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from  'firebase/database'; //import the Realtime Database service

const firebaseConfig = {

    apiKey: "AIzaSyCOFtXW4r1NhIrxeTqhCDPpDt_l6pVWwLI",
    authDomain: "meet-up-app-64da2.firebaseapp.com",
    projectId: "meet-up-app-64da2",
    storageBucket: "meet-up-app-64da2.firebasestorage.app",
    messagingSenderId: "1005874621623",
    appId: "1:1005874621623:web:201736654c020c6d28f132",
    measurementId: "G-8KDZE4FWSP",
    databaseURL: "https://meet-up-64da2-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);

if (typeof window !== 'undefined') {
     isSupported().then((supported) => {
        if (supported) {
            const analytivs = getAnalytics(app);
        }else {
            console.log('FIrebase Analytics is not supported in this area.')
        }
     });
}

export default app;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);