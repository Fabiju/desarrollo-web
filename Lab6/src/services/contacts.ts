import { API_BASE_URL } from '../apiConfig';
import type { Contact } from '../types';

interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

// Pide a la API (con el token en el header) unos contactos iniciales para
// que la lista no empiece vacía la primera vez que entra un usuario.
export async function fetchInitialContacts(token: string | null): Promise<Contact[]> {
  const response = await fetch(
    `${API_BASE_URL}/users?limit=5&select=firstName,lastName,phone,email`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!response.ok) {
    throw new Error('No se pudieron cargar los contactos');
  }
  const data = (await response.json()) as { users: ApiUser[] };
  return data.users.map((u) => ({
    id: `seed-${u.id}`,
    name: `${u.firstName} ${u.lastName}`,
    phone: u.phone,
    email: u.email,
  }));
}

// ---- Persistencia local (cada usuario tiene su propia lista) ----
const storageKey = (userId: number) => `contacts_${userId}`;

export function readStoredContacts(userId: number): Contact[] | null {
  const raw = localStorage.getItem(storageKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Contact[];
  } catch {
    return null;
  }
}

export function writeStoredContacts(userId: number, contacts: Contact[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(contacts));
}
