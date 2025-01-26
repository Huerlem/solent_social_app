import { useForm } from 'react-hook-form';

export function useCustomForm() {
  return useForm({
    mode: 'onBlur', // Valid when leaving the field
    reValidateMode: 'onChange', // Revalidates with each change
  });
}