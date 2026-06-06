import api from '../api/axios';
import { USE_MOCK_DATA, unwrap } from './config';
import { mockStore } from './mockStore';

export const rfqService = {
  async list() {
    if (USE_MOCK_DATA) return mockStore.listRFQs();
    return unwrap(await api.get('/api/rfqs'));
  },
  async create(data) {
    if (USE_MOCK_DATA) return mockStore.createRFQ(data);
    return unwrap(await api.post('/api/rfqs', data));
  },
  async update(id, data) {
    if (USE_MOCK_DATA) return mockStore.updateRFQ(id, data);
    return unwrap(await api.put(`/api/rfqs/${id}`, data));
  },
  async remove(id) {
    if (USE_MOCK_DATA) return mockStore.deleteRFQ(id);
    return unwrap(await api.delete(`/api/rfqs/${id}`));
  },
};
