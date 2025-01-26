'use client';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { auth } from '@/firebase/firebaseClient';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';

export default function Header() {
    const [user, loading, error] = useAuthState(auth);
    const [isAdmin, setIsAdmin] = useState(false);
    const { user: contextUser, isAdmin: contextIsAdmin, loading: contextLoading } = useAuth(); // Using the authentication context
    
    useEffect(() => {
        // Fallback to check admin if context is not used directly
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

    const handleLogout = async () => {
        try {
            await auth.signOut();
            Cookies.remove('token'); // Remove cookie on logout
        } catch (error) {
            console.error('Error Logging Out', error);
        }
    };

    if (loading || contextLoading) {
        return null; // Return nothing while loading authentication state
    }

    return (
        <header className="w-full">
            {/* Image Container */}
            <div className="relative w-full h-[400px]">
                <Image
                    src="/image/meetup.png" 
                    alt="Header banner"
                    fill
                    className="object-cover"
                    priority // Load the image with priority
                />
            </div>

            {/* navbar */}
            <nav className="bg-purple-400 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
                    <Link href="/" className="bg-white text-purple-500 px-4 py-2 rounded-md hover:bg-purple-100 transition-colors">
                        Solent Social
                    </Link>
                    <ul className="flex items-center space-x-4 md:space-x-6">
                        {contextUser && (
                            <li>
                                <Link href="/bookings" className="bg-white text-purple-500 px-4 py-2 rounded-md hover:bg-purple-100 transition-colors">
                                    My Bookings
                                </Link>
                            </li>
                        )}

                        {contextIsAdmin && (
                            <>
                                <li>
                                    <Link href="/admin" className="bg-white text-purple-500 px-4 py-2 rounded-md hover:bg-purple-100 transition-colors">
                                        Admin Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/admin/create-event" className="bg-white text-purple-500 px-4 py-2 rounded-md hover:bg-purple-100 transition-colors">
                                        Create Event
                                    </Link>
                                </li>
                            </>
                        )}

                        {!contextUser && (
                            <li>
                                <Link href="/login" className="bg-white text-purple-500 px-4 py-2 rounded-md hover:bg-purple-100 transition-colors">
                                    Login
                                </Link>
                            </li>
                        )}
                        {contextUser && (
                            <li>
                                <button onClick={handleLogout} className="bg-white text-purple-500 px-4 py-2 rounded-md hover:bg-purple-100 transition-colors inline-flex items-center gap-2">
                                <LogOut size={18} />
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
}
