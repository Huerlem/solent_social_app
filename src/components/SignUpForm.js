// components/SignUpForm.js
'use client'

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { signup } from '@/lib/auth';

function SignUpForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState(null);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await signup(data.email, data.password);
      router.push('/login'); 
    } catch (error) {
      setSignupError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="bg-white w-[300px] p-6 rounded shadow">
        <h2 className="text-center text-xl mb-6">REGISTER</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              {...register('name', { required: true })}
              className="w-full h-8 px-2 bg-purple-50 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              {...register('email', { required: true })}
              className="w-full h-8 px-2 bg-purple-50 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: true })}
              className="w-full h-8 px-2 bg-purple-50 rounded"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded h-8 mt-2"
          >
            {isLoading ? "Loading..." : "Register"}
          </button>

          <p className="text-center text-sm">
            Already have an Account?{" "}
            <Link href="/login" className="text-purple-600">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUpForm;