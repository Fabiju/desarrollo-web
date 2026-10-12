import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from './ContactForm';

describe('ContactForm', () => {
  it('muestra errores y no envía si los campos están vacíos o son inválidos', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<ContactForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /guardar contacto/i }));

    expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/teléfono válido/i)).toBeInTheDocument();
    expect(screen.getByText(/correo válido/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envía los datos cuando el formulario es válido y se limpia', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<ContactForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/nombre/i), 'Ana Pérez');
    await user.type(screen.getByLabelText(/teléfono/i), '70012345');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@mail.com');
    await user.click(screen.getByRole('button', { name: /guardar contacto/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana Pérez',
      phone: '70012345',
      email: 'ana@mail.com',
    });
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('');
  });

  it('en modo edición muestra los valores iniciales y permite cancelar', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(
      <ContactForm
        initialValues={{ name: 'Luis Gómez', phone: '71198765', email: 'luis@mail.com' }}
        submitLabel="Actualizar contacto"
        onSubmit={jest.fn()}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Luis Gómez');
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('luis@mail.com');
    expect(screen.getByRole('button', { name: /actualizar contacto/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
