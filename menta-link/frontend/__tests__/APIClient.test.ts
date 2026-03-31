import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../lib/api';

describe('APIClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch = vi.fn();
    // Mock console.error to avoid noise in test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('handles 204 No Content correctly (returns null)', async () => {
    // Mock fetch to return 204
    (global.fetch as any).mockResolvedValue({
      status: 204,
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const result = await apiClient.deleteUser('123');
    expect(result).toBeNull();
  });

  it('handles 200 with JSON correctly', async () => {
    const mockData = { id: 1, full_name: 'Test' };
    (global.fetch as any).mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(mockData),
    });

    const result = await apiClient.getMe();
    expect(result).toEqual(mockData);
  });

  it('handles 400 errors with details correctly', async () => {
    (global.fetch as any).mockResolvedValue({
      status: 400,
      ok: false,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ detail: 'Custom error message' }),
    });

    await expect(apiClient.getMe()).rejects.toThrow('Custom error message');
  });

  it('handles FastAPI validation errors (array details) correctly', async () => {
    const validationError = {
      detail: [
        { loc: ['body', 'email'], msg: 'Invalid email', type: 'value_error.email' },
        {
          loc: ['body', 'password'],
          msg: 'Password too short',
          type: 'value_error.any_str.min_length',
        },
      ],
    };

    (global.fetch as any).mockResolvedValue({
      status: 422,
      ok: false,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(validationError),
    });

    await expect(apiClient.login('bad', 'bad')).rejects.toThrow(
      'Invalid email, Password too short'
    );
  });

  it('handles network failures (Failed to fetch)', async () => {
    (global.fetch as any).mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiClient.getMe()).rejects.toThrow('No se pudo conectar con el servidor');
  });
});
