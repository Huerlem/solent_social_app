// src/app/register/page.js
import RegisterForm from '../../components/Auth/RegisterForm';

function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Register</h1>
      <RegisterForm />
    </div>
  );
}

export default RegisterPage;