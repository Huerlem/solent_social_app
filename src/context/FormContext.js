'use client'

import React, { createContext, useContext } from 'react';
import { useForm } from 'react-hook-form';

const FormContext = createContext();

export function FormContextProvider({ children }) {
  const methods = useForm();

  return (
    <FormContext.Provider value={methods}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  return useContext(FormContext);
}