export const mockFetch = jest.fn();

export function setupFetchMock() {
  globalThis.fetch = mockFetch as unknown as typeof fetch;
}

export function jsonResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

export const fakeUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@x.com',
  firstName: 'Emily',
  lastName: 'Johnson',
};
