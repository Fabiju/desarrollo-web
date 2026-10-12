import { API_BASE_URL } from '../apiConfig';
import type { LoginResponse, User } from '../types';

const TOKEN_KEY = 'auth_token';

// ---- Almacenamiento del token (localStorage) ----
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

// ---- Llamadas a la API (DummyJSON Auth) ----

// POST /auth/login -> devuelve los datos del usuario + accessToken
export async function loginRequest(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, expiresInMins: 60 }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? 'No se pudo iniciar sesión');
  }
  return data as LoginResponse;
}

// GET /auth/me -> ruta protegida: necesita el header Authorization: Bearer <token>
export async function fetchCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Sesión inválida o expirada');
  }
  return (await response.json()) as User;
}
