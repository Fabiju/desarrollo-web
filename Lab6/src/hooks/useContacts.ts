import { useCallback, useEffect, useRef, useState } from 'react';
import type { Contact, ContactInput } from '../types';
import {
  fetchInitialContacts,
  readStoredContacts,
  writeStoredContacts,
} from '../services/contacts';

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function useContacts(userId: number | null, token: string | null) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(userId !== null);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef<Contact[]>([]); 

  const commit = useCallback(
    (next: Contact[]) => {
      latest.current = next;
      setContacts(next);
      if (userId !== null) writeStoredContacts(userId, next);
    },
    [userId],
  );

  useEffect(() => {
    if (userId === null) return;
    let cancelled = false;

    const stored = readStoredContacts(userId);
    if (stored) {
      latest.current = stored;
      setContacts(stored);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    fetchInitialContacts(token)
      .then((list) => {
        if (!cancelled) commit(list);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, token, commit]);

  const addContact = useCallback(
    (input: ContactInput) => commit([...latest.current, { ...input, id: newId() }]),
    [commit],
  );

  const updateContact = useCallback(
    (id: string, input: ContactInput) =>
      commit(latest.current.map((c) => (c.id === id ? { ...c, ...input } : c))),
    [commit],
  );

  const deleteContact = useCallback(
    (id: string) => commit(latest.current.filter((c) => c.id !== id)),
    [commit],
  );

  return { contacts, isLoading, error, addContact, updateContact, deleteContact };
}
