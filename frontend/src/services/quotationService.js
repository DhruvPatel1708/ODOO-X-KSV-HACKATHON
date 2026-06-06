import api from '../api/axios';
import { USE_MOCK_DATA, unwrap } from './config';
import { mockStore } from './mockStore';

export const quotationService = {
  async list() {
    if (USE_MOCK_DATA) return mockStore.listQuotations();
    return unwrap(await api.get('/api/quotations'));
  },
  async create(data) {
    if (USE_MOCK_DATA) return mockStore.createQuotation(data);
    return unwrap(await api.post('/api/quotations', data));
  },
  async update(id, data) {
    if (USE_MOCK_DATA) return mockStore.updateQuotation(id, data);
    return unwrap(await api.put(`/api/quotations/${id}`, data));
  },
  async compareByRFQ(rfqId) {
    if (USE_MOCK_DATA) return mockStore.compareRFQ(rfqId);
    return unwrap(await api.get(`/api/comparison/rfq/${rfqId}`));
  },
};
