import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from './useAuth';
import { fakeUser, jsonResponse, mockFetch, setupFetchMock } from '../test/helpers';

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth', () => {
  beforeEach(() => setupFetchMock());

  it('login guarda el token y logout lo elimina', async () => {
    mockFetch.mockReturnValueOnce(
      jsonResponse({ ...fakeUser, accessToken: 'tok-1', refreshToken: 'ref-1' }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.token).toBeNull();

    await act(async () => {
      await result.current.login('emilys', 'emilyspass');
    });
    expect(result.current.token).toBe('tok-1');
    expect(result.current.user?.firstName).toBe('Emily');
    expect(localStorage.getItem('auth_token')).toBe('tok-1');

    act(() => result.current.logout());
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('restaura la sesión validando el token guardado con el header Authorization', async () => {
    localStorage.setItem('auth_token', 'tok-guardado');
    mockFetch.mockReturnValueOnce(jsonResponse(fakeUser));

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user?.username).toBe('emilys');
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.test/auth/me');
    expect(options.headers.Authorization).toBe('Bearer tok-guardado');
  });

  it('borra el token si el servidor lo rechaza (401)', async () => {
    localStorage.setItem('auth_token', 'tok-vencido');
    mockFetch.mockReturnValueOnce(jsonResponse({ message: 'Token Expired!' }, false, 401));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
