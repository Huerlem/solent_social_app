import { Timestamp } from "firebase/firestore";

// src/types.ts
export interface Event {
    id: string;
    title: string;
    description: string;
    type: string;
    capacity: number;
    address: string;
    date: Timestamp;
    location: {
      latitude: number;
      longitude: number;
    };
    image: string;
    createdAt: Date; // Ou string
    updatedAt?: Date;
  }
  
  // Adicione a definição de ErrorInfo aqui
  export interface ErrorInfo extends Error {
      info?: any;
      status?: number;
  }