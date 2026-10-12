import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactList from './ContactList';
import type { Contact } from '../types';

const contacts: Contact[] = [
  { id: '1', name: 'Ana Pérez', phone: '70012345', email: 'ana@mail.com' },
  { id: '2', name: 'Luis Gómez', phone: '71198765', email: 'luis@mail.com' },
];

describe('ContactList', () => {
  it('muestra el nombre, teléfono y correo de cada contacto', () => {
    render(<ContactList contacts={contacts} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('70012345')).toBeInTheDocument();
    expect(screen.getByText('luis@mail.com')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('muestra un mensaje cuando no hay contactos', () => {
    render(<ContactList contacts={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText(/no hay contactos/i)).toBeInTheDocument();
  });

  it('filtra los contactos al escribir en el buscador', async () => {
    const user = userEvent.setup();
    render(<ContactList contacts={contacts} onEdit={jest.fn()} onDelete={jest.fn()} />);

    await user.type(screen.getByLabelText(/buscar contactos/i), 'luis');

    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
    expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument();
  });

  it('llama a onEdit con el contacto al hacer clic en Editar', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    render(<ContactList contacts={contacts} onEdit={onEdit} onDelete={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /editar ana pérez/i }));

    expect(onEdit).toHaveBeenCalledWith(contacts[0]);
  });

  it('llama a onDelete con el id al hacer clic en Eliminar', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(<ContactList contacts={contacts} onEdit={jest.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /eliminar luis gómez/i }));

    expect(onDelete).toHaveBeenCalledWith('2');
  });
});
