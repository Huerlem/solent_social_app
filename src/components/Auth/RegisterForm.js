'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { auth, db } from '@/firebase/firebaseClient';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [registrationError, setRegistrationError] = useState(null);

  const onSubmit = async (data) => {
    setRegistrationError(null);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Update User Profile
      await updateProfile(user, { 
        displayName: data.name 
      });

      
      //Create a doc to user in firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: data.name,
        email: data.email,
        isAdmin: false, // By default, user are not admin
        createdAt: new Date().toISOString()
      });

      router.push('/'); // Redirects to home page

    } catch (error) {
      console.error('Error to sign in user:', error);
      setRegistrationError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white rounded-lg shadow-md">
      {registrationError && <p className="text-red-500 mb-4">{registrationError}</p>}

      <div className="mb-4">
        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Name</label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is Required!' })}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
        <input
          type="email"
          id="email"
          {...register('email', {
            required: 'Email is Required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              message: 'Invalid Email!',
            },
          })}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
        <input
          type="password"
          id="password"
          {...register('password', {
            required: 'Password is Required!',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters long!',
            },
          })}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
        Register
      </button>
    </form>
  );
}

export default RegisterForm;