import { useCallback, useState } from 'react';
import ContactForm from '../components/ContactForm';
import ContactList from '../components/ContactList';
import { useAuth } from '../hooks/useAuth';
import { useContacts } from '../hooks/useContacts';
import type { Contact, ContactInput } from '../types';

export default function ContactsPage() {
  const { user, token, logout } = useAuth();
  const { contacts, isLoading, error, addContact, updateContact, deleteContact } = useContacts(
    user?.id ?? null,
    token,
  );
  const [editing, setEditing] = useState<Contact | null>(null);

  const handleEdit = useCallback((contact: Contact) => setEditing(contact), []);

  const handleSave = (values: ContactInput) => {
    if (editing) {
      updateContact(editing.id, values);
      setEditing(null);
    } else {
      addContact(values);
    }
  };

  return (
    <main className="container">
      <header className="topbar">
        <h1>Mis contactos</h1>
        <div>
          <span>Hola, {user?.firstName}</span>
          <button type="button" className="secondary" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <h2>{editing ? `Editando a ${editing.name}` : 'Agregar contacto'}</h2>
      <ContactForm
        key={editing?.id ?? 'new'}
        initialValues={editing ? { name: editing.name, phone: editing.phone, email: editing.email } : undefined}
        submitLabel={editing ? 'Actualizar contacto' : 'Guardar contacto'}
        onSubmit={handleSave}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      <h2>Lista</h2>
      {isLoading && <p>Cargando contactos...</p>}
      {error && <p role="alert" className="error">{error}</p>}
      {!isLoading && (
        <ContactList contacts={contacts} onEdit={handleEdit} onDelete={deleteContact} />
      )}
    </main>
  );
}
