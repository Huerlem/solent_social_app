'use client';

import { FormProvider, useForm } from 'react-hook-form';
import LoginForm from '@/components/Auth/LoginForm';;

export default function LoginPage() {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto">
        <LoginForm />
      </div>
    </FormProvider>
  );
}