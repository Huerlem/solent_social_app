'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import EventForm from '@/components/Admin/EventForm';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';
import { toast } from 'react-hot-toast';

export default function CreateEvent() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect if user is not admin
  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/');
      return;
    }
  }, [user, isAdmin, router]);

  const handleCreate = async (eventData) => {
    try {
      await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: new Date(),
      });
      toast.success('An event creatd successfully!');
      router.push('/admin');
    } catch (error) {
      console.error('Error to create an event:', error);
      toast.error('Error to create an event');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Criar Novo Evento</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Voltar
          </button>
        </div>
        <EventForm onSubmit={handleCreate} />
      </div>
    </div>
  );
}
