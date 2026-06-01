/**
 * Shared types — the single source of truth for data shapes
 * exchanged between the frontend and backend.
 */

export interface Property {
  id: string;
  title: string;
  address: string;
  priceCents: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  status: PropertyStatus;
  createdAt: string; // ISO 8601
}

export type PropertyStatus = 'available' | 'under_offer' | 'sold';

export interface CreatePropertyInput {
  title: string;
  address: string;
  priceCents: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    message: string;
    code?: string;
  };
}

export const HEALTH_OK = 'ok' as const;
