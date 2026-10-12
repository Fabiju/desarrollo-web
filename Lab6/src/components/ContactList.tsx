import { memo, useMemo, useState } from 'react';
import type { Contact } from '../types';

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

function ContactList({ contacts, onEdit, onDelete }: ContactListProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.includes(term),
    );
  }, [contacts, search]);

  return (
    <section>
      <div className="field">
        <label htmlFor="search">Buscar contactos</label>
        <input
          id="search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nombre, correo o teléfono"
        />
      </div>

      {filtered.length === 0 ? (
        <p>No hay contactos para mostrar.</p>
      ) : (
        <ul className="contact-list">
          {filtered.map((contact) => (
            <li key={contact.id} className="card">
              <div>
                <strong>{contact.name}</strong>
                <div>{contact.phone}</div>
                <div>{contact.email}</div>
              </div>
              <div className="actions">
                <button
                  type="button"
                  aria-label={`Editar ${contact.name}`}
                  onClick={() => onEdit(contact)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="danger"
                  aria-label={`Eliminar ${contact.name}`}
                  onClick={() => onDelete(contact.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default memo(ContactList);
