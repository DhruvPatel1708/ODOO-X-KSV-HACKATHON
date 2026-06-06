import api from '../api/axios';
import { USE_MOCK_DATA, unwrap } from './config';
import { mockStore } from './mockStore';

export const vendorService = {
  async list() {
    if (USE_MOCK_DATA) return mockStore.listVendors();
    return unwrap(await api.get('/api/vendors'));
  },
  async create(data) {
    if (USE_MOCK_DATA) return mockStore.createVendor(data);
    return unwrap(await api.post('/api/vendors', data));
  },
  async update(id, data) {
    if (USE_MOCK_DATA) return mockStore.updateVendor(id, data);
    return unwrap(await api.put(`/api/vendors/${id}`, data));
  },
  async remove(id) {
    if (USE_MOCK_DATA) return mockStore.deleteVendor(id);
    return unwrap(await api.delete(`/api/vendors/${id}`));
  },
};
