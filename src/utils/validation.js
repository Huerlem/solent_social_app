import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid Email').required('Email é obrigatório'),
  password: yup.string().min(6, 'Password must be at least 6 characters long').required('Password is required'),
});