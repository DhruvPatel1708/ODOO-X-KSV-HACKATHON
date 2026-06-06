import api from '../api/axios';
import { USE_MOCK_DATA, unwrap } from './config';
import { mockStore } from './mockStore';

export const poService = {
  async list() {
    if (USE_MOCK_DATA) return mockStore.listPOs();
    return unwrap(await api.get('/api/purchase-orders'));
  },
  async generate(quotationId) {
    if (USE_MOCK_DATA) return mockStore.generatePO(quotationId);
    return unwrap(await api.post(`/api/purchase-orders/generate/${quotationId}`));
  },
};
