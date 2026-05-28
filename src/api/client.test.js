import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest, tokenKey } from './client';

describe('client apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gửi request với headers đúng và trả về dữ liệu khi thành công', async () => {
    const mockData = { id: 1, name: 'Test' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await apiRequest('/api/test');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({
        headers: {
          'content-type': 'application/json'
        }
      })
    );
    expect(result).toEqual(mockData);
  });

  it('gửi kèm bearer token khi đã đăng nhập', async () => {
    localStorage.setItem(tokenKey, 'test-token-value');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    await apiRequest('/api/test');

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer test-token-value'
        }
      })
    );
  });

  it('ném lỗi khi response.ok = false', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Lỗi kiểm thử' }),
    });

    await expect(apiRequest('/api/test')).rejects.toThrow('Lỗi kiểm thử');
  });
});
