// components/Auth/SignUpForm.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { signup } from '@/lib/auth';

function SignUpForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [signupError, setSignupError] = useState(null);

  const onSubmit = async (data) => {
    try {
      await signup(data.email, data.password);
      router.push('/login'); // Redirect to login page after registration
    } catch (error) {
      setSignupError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {signupError && <p>{signupError}</p>}
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          {...register("email", { required: "Email is Required!" })}
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          {...register("password", { required: "Password is Required!", minLength: { value: 6, message: "Password must be at least 6 characters long!" } })}
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      <button type="submit">Register</button>
    </form>
  );
}

export default SignUpForm;