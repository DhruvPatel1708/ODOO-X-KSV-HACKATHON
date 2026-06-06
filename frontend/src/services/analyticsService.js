import api from '../api/axios';
import { USE_MOCK_DATA, unwrap } from './config';
import { mockStore } from './mockStore';

export const analyticsService = {
  async summary() {
    if (USE_MOCK_DATA) return mockStore.analytics();
    return unwrap(await api.get('/api/analytics'));
  },
};
