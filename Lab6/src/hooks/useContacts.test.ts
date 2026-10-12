import { act, renderHook, waitFor } from '@testing-library/react';
import { useContacts } from './useContacts';
import { jsonResponse, mockFetch, setupFetchMock } from '../test/helpers';

const apiUsers = {
  users: [
    { id: 1, firstName: 'Emily', lastName: 'Johnson', phone: '+81 965-431-3024', email: 'emily@x.com' },
    { id: 2, firstName: 'Michael', lastName: 'Williams', phone: '+49 258-627-6644', email: 'michael@x.com' },
  ],
};

describe('useContacts', () => {
  beforeEach(() => setupFetchMock());

  it('carga los contactos iniciales de la API enviando el token en el header', async () => {
    mockFetch.mockReturnValueOnce(jsonResponse(apiUsers));

    const { result } = renderHook(() => useContacts(1, 'token-abc'));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.contacts).toHaveLength(2);
    expect(result.current.contacts[0].name).toBe('Emily Johnson');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/users');
    expect(options.headers.Authorization).toBe('Bearer token-abc');
  });

  it('usa los contactos guardados en localStorage sin llamar a la API', async () => {
    localStorage.setItem(
      'contacts_1',
      JSON.stringify([{ id: 'x', name: 'Guardado', phone: '70000000', email: 'g@mail.com' }]),
    );

    const { result } = renderHook(() => useContacts(1, 'token-abc'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.contacts).toHaveLength(1);
    expect(result.current.contacts[0].name).toBe('Guardado');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('agrega, edita y elimina contactos y los guarda en localStorage', async () => {
    mockFetch.mockReturnValueOnce(jsonResponse({ users: [] }));
    const { result } = renderHook(() => useContacts(1, 'token-abc'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.addContact({ name: 'Ana', phone: '70012345', email: 'ana@mail.com' });
    });
    expect(result.current.contacts).toHaveLength(1);
    const { id } = result.current.contacts[0];

    act(() => {
      result.current.updateContact(id, { name: 'Ana María', phone: '70012345', email: 'ana@mail.com' });
    });
    expect(result.current.contacts[0].name).toBe('Ana María');
    expect(JSON.parse(localStorage.getItem('contacts_1')!)[0].name).toBe('Ana María');

    act(() => {
      result.current.deleteContact(id);
    });
    expect(result.current.contacts).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem('contacts_1')!)).toEqual([]);
  });

  it('expone un error si la API falla', async () => {
    mockFetch.mockReturnValueOnce(jsonResponse({}, false, 500));

    const { result } = renderHook(() => useContacts(1, 'token-abc'));

    await waitFor(() => expect(result.current.error).toBe('No se pudieron cargar los contactos'));
    expect(result.current.contacts).toEqual([]);
  });
});
