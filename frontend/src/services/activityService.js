import api from '../api/axios';
import { USE_MOCK_DATA, unwrap } from './config';
import { mockStore } from './mockStore';

export const activityService = {
  async list() {
    if (USE_MOCK_DATA) return mockStore.listActivities();
    return unwrap(await api.get('/api/activity-logs'));
  },
};
