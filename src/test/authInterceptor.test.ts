import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient, dummyJsonClient } from '../api/client';
import { useAuthStore } from '../store/authStore';

describe('auth interceptor (refresh & retry)', () => {
  let apiMock: MockAdapter;
  let dummyMock: MockAdapter;

  beforeEach(() => {
    apiMock = new MockAdapter(apiClient);
    dummyMock = new MockAdapter(dummyJsonClient);
    useAuthStore.setState({
      accessToken: 'expired-token',
      refreshToken: 'valid-refresh-token',
      user: null,
      isInitializing: false,
    });
  });

  afterEach(() => {
    apiMock.reset();
    dummyMock.reset();
  });

  it('attaches the bearer token to outgoing requests', async () => {
    apiMock.onGet('/protected').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer expired-token');
      return [200, { ok: true }];
    });
    const res = await apiClient.get('/protected');
    expect(res.data.ok).toBe(true);
  });

  it('silently refreshes the token on a 401 and retries the original request', async () => {
    let callCount = 0;
    apiMock.onGet('/protected').reply((config) => {
      callCount += 1;
      if (config.headers?.Authorization === 'Bearer expired-token') {
        return [401, { message: 'jwt expired' }];
      }
      return [200, { ok: true, tokenUsed: config.headers?.Authorization }];
    });
    dummyMock.onPost('/auth/refresh').reply(200, {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const res = await apiClient.get('/protected');

    expect(res.status).toBe(200);
    expect(res.data.tokenUsed).toBe('Bearer new-access-token');
    expect(callCount).toBe(2); // original call + retried call
    expect(useAuthStore.getState().accessToken).toBe('new-access-token');
    expect(useAuthStore.getState().refreshToken).toBe('new-refresh-token');
  });

  it('logs the user out when the refresh call itself fails', async () => {
    apiMock.onGet('/protected').reply(401);
    dummyMock.onPost('/auth/refresh').reply(403, { message: 'invalid refresh token' });

    await expect(apiClient.get('/protected')).rejects.toBeTruthy();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it('does not attempt refresh when there is no refresh token', async () => {
    useAuthStore.setState({ accessToken: null, refreshToken: null });
    apiMock.onGet('/protected').reply(401);

    await expect(apiClient.get('/protected')).rejects.toBeTruthy();
    expect(dummyMock.history.post.length).toBe(0);
  });
});
