// src/app/admin/page.js
'use client';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import { useState, useEffect } from 'react';
import { auth } from '@/firebase/firebaseClient';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth'; 
function Admin() {
  const [user, loading, error] = useAuthState(auth); 
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminStatus = async () => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        setIsAdmin(!!idTokenResult.claims.admin);
      } else {
        setIsAdmin(false);
      }
    };

    fetchAdminStatus();
  }, [user]);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        router.push('/login'); // Redirect to login if not authenticated
      } else {
        const idTokenResult = await authUser.getIdTokenResult();
        if (!idTokenResult.claims.admin) {
          router.push('/'); // Redirect to home if not admin
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <div>Loading...</div>; 
  }

  return (
    <div>
      <AdminDashboard />
    </div>
  );
}

export default Admin;