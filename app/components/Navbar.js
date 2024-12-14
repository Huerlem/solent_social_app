"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { logoutUser } from '../../firebase/firebaseFunctions';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase/firebase'; 
import { doc, getDoc } from 'firebase/firestore'; 1 

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            const fetchUserData = async () => {
              const userDocRef = doc(db, 'users', user.uid);
              getDoc(userDocRef)
                .then((userDoc) => {
                  if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUser({ ...user, name: userData.name, isAdmin: userData.role === 'admin' });
                  } else {
                    // Corrigido: usar setDoc para criar um novo documento
                    getDoc(userDocRef, { 
                      name: user.displayName || 'new user',
                      email: user.email,
                      role: 'user',
                      isAdmin: false,
                    })
                    .then(() => {
                      setUser({ ...user, name: user.displayName || 'new user', isAdmin: false});
                    })
                    .catch((error) => {
                      console.error("Erro ao criar documento do usuário:", error);
                    });
                  }
                  setIsLoading(false);
                })
                .catch((error) => {
                  console.error("Erro ao buscar dados do usuário:", error);
                  setIsLoading(false);
                });
            };
            fetchUserData();
          } else {
            setUser(null);
            setIsLoading(false);
          }
        });
    
        return () => unsubscribe();
      }, []);

    const handleLogout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <nav className="bg-purple-400 p-4">
          <div className="container-navbar flex justify-between items-center">
            <Link href="/">
              <Image src="/image/solent.png" width={80} height={80} alt="Solent" />
            </Link>
            <h1 className="text-center mb-4 block text-[72px] font-extrabold tracking-wider leading-tight text-gray-900 bg-gradient-to-r from-gray-500 to-gray-700 bg-clip-text text-transparent text-shadow-lg">Solent Social</h1>
            <div>
              {isLoading ? ( // Conditionally render loading indicator
                <span className="text-white">Loading...</span>
              ) : (
                user ? ( // Check if user is logged in
                  <div className="flex items-center space-x-4">
                    <span className="text-white">Welcome, {user.name}! ({user.role})</span>
                    <button
                      onClick={handleLogout}
                      className="bg-white text-purple-500 px-4 py-2 rounded-md hover:bg-purple-100"
                    >
                      Logout
                    </button>
                  </div>
                ) : ( // If not logged in, show Login/SignIn link
                  <Link 
                    href="/login" 
                    className="bg-white text-purple-500 px-4 py-2 rounded-md hover:bg-purple-100"
                  >
                    Login/SignIn
                  </Link>
                )
              )}
            </div>
          </div>
        </nav>
      );

}