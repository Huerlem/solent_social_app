'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { login } from '@/lib/auth';
import Cookies from 'js-cookie';
import { useFormContext } from '@/context/FormContext';
import Link from 'next/link';

export default function LoginForm() {
  // Extracts functions and state from the form context
  const { register, handleSubmit, formState: { errors } } = useFormContext();
  const [error, setError] = useState(''); // State to manage login errors
  const router = useRouter();

  // Form submission function
  const onSubmit = async (data) => {
    const { email, password } = data; // Gets form values
    try {
      // Call the login function
      const response = await login(email, password);
      Cookies.set('token', response.token); // Saves token in cookies
      router.push('/dashboard'); // Redirects to the dashboard
    } catch (err) {
      setError(err.message || 'Error to Login'); // Define error message
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white rounded-lg shadow-md">
      {/* Displays login errors */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Email area */}
      <div className="mb-4">
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
        <input
          type="email"
          id="email"
          {...register('email', { required: 'Email is Required!' })}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      {/* Password Area */}
      <div className="mb-4">
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Senha</label>
        <input
          type="password"
          id="password"
          {...register('password', { required: 'Senha is Required!' })}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      {/* Login button */}
      <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
        Login
      </button>

      {/* Link para registro */}
      <p className="mt-4 text-center">
        Don`t You have An Account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
