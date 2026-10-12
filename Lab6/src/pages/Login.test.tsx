import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import { fakeUser, jsonResponse, mockFetch, setupFetchMock } from '../test/helpers';

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/contacts" element={<h1>Pantalla de contactos</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => setupFetchMock());

  it('muestra el formulario de inicio de sesión', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('con credenciales correctas guarda el token y navega a contactos', async () => {
    const user = userEvent.setup();
    mockFetch.mockReturnValueOnce(
      jsonResponse({ ...fakeUser, accessToken: 'token-123', refreshToken: 'refresh-123' }),
    );
    renderLogin();

    await user.type(screen.getByLabelText(/usuario/i), 'emilys');
    await user.type(screen.getByLabelText(/contraseña/i), 'emilyspass');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByText(/pantalla de contactos/i)).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBe('token-123');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.test/auth/login');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject({ username: 'emilys', password: 'emilyspass' });
  });

  it('con credenciales incorrectas muestra el error y no guarda token', async () => {
    const user = userEvent.setup();
    mockFetch.mockReturnValueOnce(jsonResponse({ message: 'Invalid credentials' }, false, 400));
    renderLogin();

    await user.type(screen.getByLabelText(/usuario/i), 'emilys');
    await user.type(screen.getByLabelText(/contraseña/i), 'mala');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid credentials/i);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(screen.queryByText(/pantalla de contactos/i)).not.toBeInTheDocument();
  });
});
