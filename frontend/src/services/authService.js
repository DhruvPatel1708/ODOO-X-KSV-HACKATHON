import api from '../api/axios';
import { USE_MOCK_DATA, unwrap } from './config';
import { mockStore } from './mockStore';

export const authService = {
  async login(email, password) {
    if (USE_MOCK_DATA) return mockStore.login(email, password);
    return unwrap(await api.post('/api/auth/login', { email, password }));
  },
  async signup(name, email, password, role) {
    if (USE_MOCK_DATA) return mockStore.signup({ name, email, password, role });
    return unwrap(await api.post('/api/auth/signup', { name, email, password, role }));
  },
  async me() {
    if (USE_MOCK_DATA) return null;
    return unwrap(await api.get('/api/auth/me'));
  },
};
